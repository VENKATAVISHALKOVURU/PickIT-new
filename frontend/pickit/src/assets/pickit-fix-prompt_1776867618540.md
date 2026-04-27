# PickIT — Bug Fix Prompt for Replit Agent

Fix the following 4 bugs in the existing PickIT codebase. Do NOT rebuild or restructure anything. Make surgical, minimal changes only to the files listed.

---

## BUG 1 — Student sees "No Shop Linked" after login even when they have joined a shop

**Root cause:**
`artifacts/pickit/src/pages/student/upload.tsx` calls `useGetMyShopPricing` which hits `GET /api/shop/my/pricing`. That endpoint has `requireRole("owner")` middleware — it returns 403 for students. So `pricing` is always undefined and more importantly `user.shopId` is already populated in the auth context, but the upload page treats this as "no shop" because the pricing fetch fails and the loading state masks the shopId check incorrectly.

Additionally, `GET /api/shop/my/pricing` is owner-only. There is no endpoint for a student to fetch the pricing of their linked shop by shopId. The student upload page uses `useGetMyShopPricing` — which is wrong for students.

**Fix — Backend: add a new student pricing endpoint in `artifacts/api-server/src/routes/shop.ts`:**

Add this route BEFORE the existing `router.post("/shop/join/:shopCode", ...)` line:

```typescript
// Student: get pricing for their linked shop
router.get("/shop/pricing/:shopId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.shopId) ? req.params.shopId[0] : req.params.shopId;
  const shopId = parseInt(raw, 10);
  if (isNaN(shopId)) {
    res.status(400).json({ error: "Invalid shopId" });
    return;
  }

  const [pricing] = await db.select().from(pricingConfigTable).where(eq(pricingConfigTable.shopId, shopId));
  if (!pricing) {
    // Return sensible defaults if not configured yet
    res.json({ id: 0, shopId, bwPerPage: 2, colorPerPage: 5, minimumOrder: 10 });
    return;
  }

  res.json({
    id: pricing.id,
    shopId: pricing.shopId,
    bwPerPage: pricing.bwPerPage,
    colorPerPage: pricing.colorPerPage,
    minimumOrder: pricing.minimumOrder,
  });
});
```

**Fix — Frontend: update `artifacts/pickit/src/pages/student/upload.tsx`:**

Replace the pricing fetch block. Find this code:
```typescript
const { data: pricing, isLoading: isPricingLoading } = useGetMyShopPricing({
  query: {
    queryKey: ["student-shop-pricing", user?.shopId],
    enabled: !!user?.shopId,
  }
});
```

Replace it with a direct fetch using TanStack Query (no need to use the generated hook since this is a new endpoint):
```typescript
import { useQuery } from "@tanstack/react-query";

const { data: pricing, isLoading: isPricingLoading } = useQuery({
  queryKey: ["student-shop-pricing", user?.shopId],
  enabled: !!user?.shopId,
  queryFn: async () => {
    const token = localStorage.getItem("pickit_token");
    const res = await fetch(`/api/shop/pricing/${user!.shopId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { bwPerPage: 2, colorPerPage: 5, minimumOrder: 10 };
    return res.json();
  },
});
```

Also make sure the loading gate does NOT block rendering when user has a shopId but pricing is loading. Change:
```typescript
if (isUserLoading || isPricingLoading) {
```
To:
```typescript
if (isUserLoading) {
```
This ensures the "No Shop Linked" screen shows immediately if there's no shopId, without waiting for pricing.

---

## BUG 2 — "Scan & Join" from sidebar shows "Shop Not Found"

**Root cause:**
In `artifacts/pickit/src/components/layout.tsx`, the student sidebar has:
```typescript
{ href: "/join/SCAN", label: "Scan & Join", icon: ScanLine },
```

In `artifacts/pickit/src/pages/join.tsx`, the `JoinShop` component correctly checks:
```typescript
if (!shopCode || shopCode.toUpperCase() === SCAN_SENTINEL) {
  return <ScanInterface />;
}
```
Where `SCAN_SENTINEL = "SCAN"`.

This logic is correct. The bug is that when clicking "Scan & Join" from the sidebar after already being on another page, Wouter navigates to `/join/SCAN`. BUT the `useGetShopByCode("SCAN")` call inside `JoinExistingShop` fires first before the sentinel check is evaluated — because React renders the component tree before the conditional return.

Wait — re-reading the code, the sentinel check IS at the top of the `JoinShop` default export, so it should work. The actual bug is more subtle: **the sidebar link is `/join/SCAN` but if the user is already on `/join/SCAN` and clicks again, Wouter doesn't re-render**, so nothing happens visually. More critically, some users land on `/join/SCAN` from outside when they scanned a real QR that returned an invalid code — this shows "Shop not found" because `SCAN` is looked up as a real shopCode via `useGetShopByCode("SCAN")`.

**Fix — `artifacts/pickit/src/pages/join.tsx`:**

The `SCAN_SENTINEL` check is already at line 1 of `JoinShop()`. Confirm the export default looks exactly like this — if it doesn't, make it so:

```typescript
export default function JoinShop() {
  const { shopCode } = useParams<{ shopCode: string }>();
  if (!shopCode || shopCode.toUpperCase() === SCAN_SENTINEL) {
    return <ScanInterface />;
  }
  return <JoinExistingShop shopCode={shopCode} />;
}
```

Additionally, inside `JoinExistingShop`, add a safety guard at the very top to prevent the `useGetShopByCode` hook from firing with "SCAN":

```typescript
function JoinExistingShop({ shopCode }: { shopCode: string }) {
  const [, setLocation] = useLocation();
  
  // Safety guard - should never happen but prevents "SCAN" being treated as a real code
  if (!shopCode || shopCode.toUpperCase() === "SCAN") {
    return null;
  }
  
  // ... rest of the component unchanged
```

**Fix — `artifacts/pickit/src/components/layout.tsx`:**

The "Scan & Join" sidebar link currently points to `/join/SCAN`. This works correctly but confirm it is exactly:
```typescript
{ href: "/join/SCAN", label: "Scan & Join", icon: ScanLine },
```
Do not change this. The SCAN sentinel routing is correct.

---

## BUG 3 — QR Camera scan doesn't work (BarcodeDetector not available or scan doesn't navigate)

**Root cause:**
In `artifacts/pickit/src/pages/join.tsx`, the `ScanInterface` component uses `BarcodeDetector` (Web API). This API is only available in Chrome/Edge on HTTPS or localhost. On HTTP or Safari/Firefox it won't work.

Additionally, the camera detection loop calls `detector.detect(video)` passing the video element directly — this is correct for `BarcodeDetector` — but the video element must have `readyState >= 2` (HAVE_CURRENT_DATA) for this to work. The current code checks `!video.videoWidth` but this can still be 0 even when the stream is attached.

**Fix — `artifacts/pickit/src/pages/join.tsx`, inside the `useEffect` for the scan tick:**

Replace the tick function inside the camera useEffect:

```typescript
useEffect(() => {
  if (camera !== "granted") return;
  let detector: any = null;
  let stopped = false;

  const init = async () => {
    if ("BarcodeDetector" in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        detector = null;
      }
    }

    const tick = async () => {
      if (stopped) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (detector) {
        try {
          const codes = await detector.detect(video);
          if (codes && codes.length > 0 && codes[0]?.rawValue) {
            handleDetectedValue(codes[0].rawValue);
            return;
          }
        } catch {
          /* ignore detection errors */
        }
      }
      if (!stopped) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  init();

  return () => {
    stopped = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, [camera]);
```

Also, when the camera is not supported, show a clear message and fall back gracefully. In `ScanInterface`, find the `supportsScanning` constant and the status text shown in the camera box footer, and update the message to:

```typescript
const supportsScanning = typeof window !== "undefined" && "BarcodeDetector" in window;
```

And in the camera footer span:
```tsx
<span className="inline-flex items-center gap-1.5">
  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
  {supportsScanning
    ? "Auto-detecting QR codes (Chrome/Edge)"
    : "Use manual code entry below — QR scanning requires Chrome/Edge on HTTPS"}
</span>
```

---

## BUG 4 — Owner QR page fails to generate / shows loading forever

**Root cause:**
`artifacts/pickit/src/pages/owner/qr.tsx` has:
```typescript
if (isLoading || !shop) {
  return ( /* skeleton */ );
}
```

The `useGetMyShop` hook calls `GET /api/shop/my` which requires `requireRole("owner")`. If the JWT token has expired or is malformed, this returns 401, causing `isLoading` to stay false but `shop` to be undefined — the component stays on the skeleton forever, OR the `isError` state is not checked so it shows nothing.

Additionally, the QR canvas renders `<QRCodeCanvas value={joinUrl} ... />` where `joinUrl` is built from `window.location.origin`. On Replit, the origin may include a port or subdomain that changes between deploys. The QR is built correctly, but the `buildPoster` function reads `qrRef.current?.querySelector("canvas")` — if the QR hasn't fully rendered yet when the button is clicked, it returns null.

**Fix 1 — `artifacts/pickit/src/pages/owner/qr.tsx`: handle error state:**

Change:
```typescript
if (isLoading || !shop) {
```
To:
```typescript
const { data: shop, isLoading, isError } = useGetMyShop({
  query: { queryKey: getGetMyShopQueryKey() },
});

// ...

if (isLoading) {
  return ( /* existing skeleton JSX */ );
}

if (isError || !shop) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-destructive">Failed to load shop</h1>
      <p className="text-muted-foreground">
        Could not load your shop details. Please refresh the page or log out and back in.
      </p>
    </div>
  );
}
```

**Fix 2 — `artifacts/pickit/src/pages/owner/qr.tsx`: fix the poster download race condition:**

In `buildPoster`, add a small wait for the canvas to be ready:

```typescript
const buildPoster = (): Promise<string | null> =>
  new Promise((resolve) => {
    // Give the QR canvas a moment to paint if it just rendered
    setTimeout(() => {
      const qrCanvas = qrRef.current?.querySelector("canvas");
      if (!qrCanvas || !shop) return resolve(null);
      // ... rest of existing buildPoster code unchanged
    }, 100);
  });
```

**Fix 3 — `artifacts/api-server/src/routes/shop.ts`: make sure GET /shop/my also returns isError info properly:**

The existing route is correct. No backend change needed for this bug.

---

## SUMMARY OF ALL FILES TO CHANGE

| File | Change |
|------|--------|
| `artifacts/api-server/src/routes/shop.ts` | Add `GET /shop/pricing/:shopId` route (Bug 1) |
| `artifacts/pickit/src/pages/student/upload.tsx` | Replace `useGetMyShopPricing` with direct fetch hook; fix loading gate (Bug 1) |
| `artifacts/pickit/src/pages/join.tsx` | Add safety guard in `JoinExistingShop`; fix tick loop to check `readyState >= 2`; improve no-scanner message (Bugs 2 & 3) |
| `artifacts/pickit/src/pages/owner/qr.tsx` | Add `isError` check; add 100ms setTimeout in `buildPoster` (Bug 4) |

---

## IMPORTANT: DO NOT CHANGE

- Do NOT touch any database schema files
- Do NOT touch `lib/api-client-react/src/generated/` (generated files)
- Do NOT touch `lib/api-spec/openapi.yaml` 
- Do NOT change any auth logic
- Do NOT change any routing in `App.tsx`
- Do NOT change the shop code generation logic in `auth.ts`
- Do NOT add mock data anywhere
- Keep all existing UI/styling exactly as-is
