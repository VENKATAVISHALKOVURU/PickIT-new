import { useEffect, useMemo, useRef, useState } from "react";
import { useGetShopByCode, getGetShopByCodeQueryKey, useJoinShop } from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Store, MapPin, Printer, Camera, LocateFixed, Search, X, ScanLine, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";

const SCAN_SENTINEL = "SCAN";

type Permission = "idle" | "prompting" | "granted" | "denied";

function extractShopCode(value: string): string | null {
  try {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes("/join/")) {
      const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, window.location.origin);
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("join");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    if (/^[A-Za-z0-9_-]{3,32}$/.test(trimmed)) return trimmed;
    return null;
  } catch {
    return null;
  }
}

type NearbyShop = {
  id: number;
  name: string;
  shopCode: string;
  address: string | null;
  isOpen: boolean;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
};

function formatDistance(m: number | null): string {
  if (m == null) return "—";
  if (m < 950) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 9500 ? 1 : 0)} km`;
}

function ScanInterface() {
  const [, setLocation] = useLocation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [camera, setCamera] = useState<Permission>("idle");
  const [geo, setGeo] = useState<Permission>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [manual, setManual] = useState("");
  const [search, setSearch] = useState("");
  const [nearbyShops, setNearbyShops] = useState<NearbyShop[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Fetch real nearby shops whenever coords change (only when geo granted)
  useEffect(() => {
    if (geo !== "granted" || !coords) return;
    let cancelled = false;
    const ctrl = new AbortController();
    setNearbyLoading(true);
    fetch(`/api/shop/nearby?lat=${coords.lat}&lng=${coords.lng}&limit=15`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setNearbyShops(Array.isArray(data?.shops) ? data.shops : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setNearbyLoading(false));
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [geo, coords?.lat, coords?.lng]);

  const filteredNearby = useMemo(() => {
    if (!search.trim()) return nearbyShops;
    const q = search.toLowerCase();
    return nearbyShops.filter((s) => `${s.name} ${s.address ?? ""}`.toLowerCase().includes(q));
  }, [search, nearbyShops]);

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const requestCamera = async () => {
    setCamera("prompting");
    try {
      // Actually request permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(t => t.stop()); // Stop immediately, just wanted permission
      setCamera("granted");
    } catch (err) {
      console.error("Camera permission denied:", err);
      setCamera("denied");
      toast.error("Camera permission denied. Please enable it in browser settings.");
    }
  };

  const startWatch = () => {
    if (watchIdRef.current != null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        /* silent — we already have a fix */
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeo("denied");
      toast.error("Location not supported on this device");
      return;
    }
    setGeo("prompting");

    let settled = false;
    const handleSuccess = (pos: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setGeo("granted");
      startWatch();
      const acc = Math.round(pos.coords.accuracy);
      if (acc > 100) {
        toast.message(`Location set (~${acc}m accuracy)`, {
          description: "Move outdoors or near a window for a tighter fix.",
        });
      }
    };
    const handleError = (err: GeolocationPositionError) => {
      if (settled) return;
      settled = true;
      setGeo("denied");
      toast.error(
        err.code === err.PERMISSION_DENIED
          ? "Location permission denied"
          : err.code === err.TIMEOUT
            ? "Couldn't get a location fix — please try again outdoors"
            : "Location unavailable"
      );
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      () => {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        });
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  };

  // Stop watching on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Handle Scanner Lifecycle
  useEffect(() => {
    if (camera !== "granted") return;

    const startScanner = async () => {
      try {
        // Html5Qrcode needs a container ID
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => handleDetectedValue(decodedText),
          () => {} // Optional: handle silent failure
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setCamera("denied");
        toast.error("Could not start camera. It may be in use by another app.");
      }
    };

    // Small delay to ensure the DOM element is ready
    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [camera]);

  const handleDetectedValue = (value: string) => {
    const code = extractShopCode(value);
    if (!code) {
      // Don't toast error on every frame if it's just a random QR
      return;
    }
    stopCamera();
    toast.success(`Found shop ${code}`);
    setLocation(`/join/${code}`);
  };


  useEffect(() => {
    return () => stopCamera();
  }, []);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractShopCode(manual);
    if (!code) {
      toast.error("Enter a valid shop code or PickIT link");
      return;
    }
    setLocation(`/join/${code}`);
  };

  const supportsScanning = typeof window !== "undefined" && "BarcodeDetector" in window;

  return (
    <div className="min-h-screen bg-[#f7f8fb] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="border-border shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ScanLine className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Connect to a print shop</CardTitle>
                  <CardDescription>Scan the shop's QR or pick one nearby</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <PermissionRow
                  icon={<Camera className="h-4 w-4" />}
                  label="Camera"
                  status={camera}
                  onAllow={requestCamera}
                />
                <PermissionRow
                  icon={<LocateFixed className="h-4 w-4" />}
                  label="Location"
                  status={geo}
                  onAllow={requestGeo}
                />
              </div>

              <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                  {camera === "granted" ? (
                    <>
                      <div id="qr-reader" className="w-full h-full" />
                      <ScannerOverlay />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/80 p-6 gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Camera className="h-7 w-7 text-white/70" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-white">
                          {camera === "denied" ? "Camera blocked" : "Camera preview"}
                        </p>
                        <p className="text-sm text-white/60 max-w-xs">
                          {camera === "denied"
                            ? "Enable camera in your browser settings to scan a QR code."
                            : "Allow camera access, then point at a PickIT QR code."}
                        </p>
                      </div>
                      {camera !== "granted" && camera !== "denied" && (
                        <Button onClick={requestCamera} className="bg-blue-600 hover:bg-blue-700">
                          <Camera className="h-4 w-4 mr-2" />
                          Turn on camera
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Professional QR scanner active — Point at any PickIT QR code
                  </span>
                  {camera === "granted" && (
                    <button onClick={() => { stopCamera(); setCamera("idle"); }} className="inline-flex items-center gap-1 hover:text-foreground">
                      <X className="h-3.5 w-3.5" /> Stop
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={submitManual} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Enter shop code manually
                </label>
                <div className="flex gap-2">
                  <Input
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="e.g. CPH123 or pickit link"
                    autoCapitalize="characters"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Connect</Button>
                </div>
              </form>

              {geo === "granted" ? (
                <div className="rounded-2xl border bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Nearby shops</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    {coords && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ±{Math.round(coords.accuracy)}m
                      </span>
                    )}
                  </div>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shop name or address" />
                  <div className="space-y-2" data-testid="nearby-shops-list">
                    {nearbyLoading && filteredNearby.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Finding shops near you…</p>
                    ) : filteredNearby.length === 0 ? (
                      <div className="text-center py-6 space-y-1">
                        <p className="text-sm font-medium text-slate-700">No shops in your area yet</p>
                        <p className="text-xs text-muted-foreground">Use the QR or shop code from your print shop above.</p>
                      </div>
                    ) : (
                      filteredNearby.map((s) => (
                        <button
                          key={s.shopCode}
                          onClick={() => setLocation(`/join/${s.shopCode}`)}
                          className="w-full rounded-xl border p-3 text-left hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                          data-testid={`nearby-${s.shopCode}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground flex items-center gap-1.5">
                                {s.name}
                                <span className={`h-1.5 w-1.5 rounded-full ${s.isOpen ? "bg-emerald-500" : "bg-red-400"}`} />
                              </p>
                              {s.address && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 shrink-0" /> {s.address}
                                </p>
                              )}
                            </div>
                            <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 font-medium shrink-0">
                              {formatDistance(s.distanceMeters)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-white p-5 text-center space-y-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <LocateFixed className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Share your location to see nearby shops</p>
                  <p className="text-xs text-muted-foreground">
                    We'll only show shops that are physically close to you — no fake or placeholder list.
                  </p>
                  <Button
                    size="sm"
                    onClick={requestGeo}
                    disabled={geo === "prompting"}
                    className="bg-blue-600 hover:bg-blue-700 mt-1"
                  >
                    <LocateFixed className="h-4 w-4 mr-2" />
                    {geo === "prompting" ? "Locating…" : geo === "denied" ? "Try again" : "Use my location"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function PermissionRow({ icon, label, status, onAllow }: { icon: React.ReactNode; label: string; status: Permission; onAllow: () => void }) {
  const config = {
    idle: { text: "Not requested", color: "text-muted-foreground", btn: "Allow" },
    prompting: { text: "Waiting…", color: "text-amber-600", btn: "Waiting" },
    granted: { text: "Granted", color: "text-emerald-600", btn: "Allowed" },
    denied: { text: "Denied", color: "text-red-600", btn: "Retry" },
  }[status];
  return (
    <div className="rounded-xl border bg-white p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">{icon}</div>
        <div>
          <p className="text-sm font-medium leading-tight">{label}</p>
          <p className={`text-xs ${config.color}`}>{config.text}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant={status === "granted" ? "outline" : "default"}
        className={status === "granted" ? "" : "bg-blue-600 hover:bg-blue-700"}
        onClick={onAllow}
        disabled={status === "granted" || status === "prompting"}
      >
        {config.btn}
      </Button>
    </div>
  );
}

function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-2/3 max-w-xs aspect-square">
        <div className="absolute inset-0 rounded-2xl border-2 border-white/30" />
        <span className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
        <span className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
        <span className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
        <span className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />
        <motion.span
          className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgba(16,185,129,0.7)] rounded-full"
          animate={{ top: ["10%", "85%", "10%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function JoinExistingShop({ shopCode }: { shopCode: string }) {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  if (!shopCode || shopCode.toUpperCase() === "SCAN") {
    return null;
  }

  const { data: shop, isLoading, isError } = useGetShopByCode(shopCode, {
    query: {
      enabled: !!shopCode,
      queryKey: getGetShopByCodeQueryKey(shopCode),
    },
  });

  const joinMutation = useJoinShop({
    mutation: {
      onSuccess: () => {
        toast.success(`Joined ${shop?.name} successfully!`);
        setLocation("/student/upload");
      },
      onError: (err) => toast.error(err.message || "Failed to join shop"),
    },
  });

  const handleJoin = () => {
    if (!user) {
      setLocation(`/auth/login?redirect=/join/${shopCode}`);
      return;
    }
    if (user.role === "owner") {
      toast.error("Shop owners can't join other shops as students");
      return;
    }
    joinMutation.mutate({ shopCode });
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb] p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Shop not found</CardTitle>
            <CardDescription>The QR code or link you used might be invalid.</CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={() => setLocation("/join/SCAN")}>
              <ScanLine className="h-4 w-4 mr-2" /> Scan again
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/")}>Go home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Printer className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{shop.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-2">
              <Store className="w-4 h-4" /> Print Shop · {shop.shopCode}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-5 text-center">
            {shop.address && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground bg-slate-50 py-3 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{shop.address}</span>
              </div>
            )}
            <div>
              {shop.isOpen ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Currently Open
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Currently Closed
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
              onClick={handleJoin}
              disabled={joinMutation.isPending || (!shop.isOpen && user?.role !== "owner")}
            >
              {joinMutation.isPending ? "Connecting..." : user ? "Start Printing" : "Log in to Print"}
            </Button>
            {user?.role === "owner" && (
              <p className="text-sm text-destructive">You're logged in as a shop owner.</p>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setLocation("/join/SCAN")}>
              <ScanLine className="h-4 w-4 mr-2" /> Scan a different shop
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function JoinShop() {
  const { shopCode } = useParams<{ shopCode: string }>();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      const path = window.location.pathname;
      setLocation(`/auth/register?redirect=${encodeURIComponent(path)}`);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shopCode || shopCode.toUpperCase() === SCAN_SENTINEL) {
    return <ScanInterface />;
  }
  return <JoinExistingShop shopCode={shopCode} />;
}
