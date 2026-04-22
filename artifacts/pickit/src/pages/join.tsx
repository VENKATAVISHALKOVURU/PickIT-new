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

function ScanInterface() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [camera, setCamera] = useState<Permission>("idle");
  const [geo, setGeo] = useState<Permission>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manual, setManual] = useState("");
  const [search, setSearch] = useState("");

  const nearby = useMemo(() => {
    const base = [
      { name: "Campus Print Hub", address: "Main Road, Block A", shopCode: "CPH123", distance: "120 m" },
      { name: "Student Xerox Point", address: "Library Street, Gate 2", shopCode: "SXP456", distance: "340 m" },
      { name: "QuickPrint Corner", address: "Hostel Lane, Near Canteen", shopCode: "QPC789", distance: "510 m" },
    ];
    if (!search.trim()) return base;
    return base.filter((s) => `${s.name} ${s.address}`.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const requestCamera = async () => {
    setCamera("prompting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamera("granted");
    } catch {
      setCamera("denied");
      toast.error("Camera permission denied");
    }
  };

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeo("denied");
      toast.error("Location not supported on this device");
      return;
    }
    setGeo("prompting");

    // Try a high-accuracy fix first; fall back to a low-accuracy fix if it
    // takes too long (handles indoor/no-GPS situations on phones reliably).
    let settled = false;
    const handleSuccess = (pos: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeo("granted");
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

    navigator.geolocation.getCurrentPosition(handleSuccess, () => {
      // High-accuracy failed/timed out — retry with low accuracy
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      });
    }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
  };

  const handleDetectedValue = (value: string) => {
    const code = extractShopCode(value);
    if (!code) {
      toast.error("That QR code isn't a PickIT shop code");
      return;
    }
    stopCamera();
    toast.success(`Found shop ${code}`);
    setLocation(`/join/${code}`);
  };

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
                <div className="relative aspect-[4/3] bg-slate-950">
                  {camera === "granted" ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
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
                    {supportsScanning
                      ? "Auto-detecting QR codes (Chrome/Edge)"
                      : "Use manual code entry below — QR scanning requires Chrome/Edge on HTTPS"}
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

              <div className="rounded-2xl border bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Nearby shops</span>
                  </div>
                  {coords && (
                    <span className="text-xs text-muted-foreground">
                      {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                    </span>
                  )}
                </div>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shop name or address" />
                {geo !== "granted" ? (
                  <p className="text-sm text-muted-foreground">
                    Share your location to see real distances. Showing campus shops by default.
                  </p>
                ) : null}
                <div className="space-y-2">
                  {nearby.map((s) => (
                    <button
                      key={s.shopCode}
                      onClick={() => setLocation(`/join/${s.shopCode}`)}
                      className="w-full rounded-xl border p-3 text-left hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {s.address}
                          </p>
                        </div>
                        <span className="text-xs rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1">
                          {geo === "granted" ? s.distance : "Connect"}
                        </span>
                      </div>
                    </button>
                  ))}
                  {nearby.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No shops match your search.</p>
                  )}
                </div>
              </div>
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
  if (!shopCode || shopCode.toUpperCase() === SCAN_SENTINEL) {
    return <ScanInterface />;
  }
  return <JoinExistingShop shopCode={shopCode} />;
}
