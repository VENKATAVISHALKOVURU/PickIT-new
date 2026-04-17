import { useEffect, useMemo, useRef, useState } from "react";
import { useGetShopByCode, getGetShopByCodeQueryKey, useJoinShop } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Store, MapPin, Printer, Camera, LocateFixed, ScanLine, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";

export default function JoinShop() {
  const { shopCode } = useParams<{ shopCode: string }>();
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannerRef = useRef<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<Array<{ name: string; address: string; shopCode: string }>>([]);
  
  const { data: shop, isLoading, isError } = useGetShopByCode(shopCode || "", {
    query: {
      enabled: !!shopCode,
      queryKey: getGetShopByCodeQueryKey(shopCode || "")
    }
  });

  const joinMutation = useJoinShop({
    mutation: {
      onSuccess: () => {
        toast.success(`Joined ${shop?.name} successfully!`);
        setLocation("/student/upload");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to join shop");
      }
    }
  });

  const nearbyShops = useMemo(() => {
    const base = [
      { name: "Campus Print Hub", address: "Main Road, Block A", shopCode: "CPH123" },
      { name: "Student Xerox Point", address: "Library Street, Gate 2", shopCode: "SXP456" },
      { name: "QuickPrint Corner", address: "Hostel Lane, Near Canteen", shopCode: "QPC789" },
    ];
    if (!search.trim()) return base;
    return base.filter((item) => `${item.name} ${item.address}`.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const stopCamera = async () => {
    if (scannerRef.current) window.cancelAnimationFrame(scannerRef.current);
    scannerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOpen(true);
      toast.success("Camera access granted");
    } catch {
      toast.error("Camera access denied");
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      scannerRef.current = window.requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if ("BarcodeDetector" in window) {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      detector.detect(image).then((codes) => {
        if (codes[0]?.rawValue) {
          const value = codes[0].rawValue;
          if (value.includes("/join/")) {
            setLocation(value.includes("http") ? new URL(value).pathname : value.replace(/^.*\/join\//, "/join/"));
            stopCamera();
          }
        }
      }).catch(() => {});
    }
    scannerRef.current = window.requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (cameraOpen) scannerRef.current = window.requestAnimationFrame(scanFrame);
    return () => {
      if (scannerRef.current) window.cancelAnimationFrame(scannerRef.current);
    };
  }, [cameraOpen]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location access is not supported");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setNearby(nearbyShops);
        setLocationLoading(false);
        toast.success("Nearby shops loaded");
      },
      () => {
        setLocationLoading(false);
        toast.error("Location access denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleJoin = () => {
    if (!user) {
      setLocation(`/auth/login?redirect=/join/${shopCode}`);
      return;
    }
    
    if (user.role === "owner") {
      toast.error("Shop owners cannot join other shops as students");
      return;
    }

    if (shopCode) {
      joinMutation.mutate({ shopCode });
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Shop Not Found</CardTitle>
            <CardDescription>The QR code or link you used might be invalid.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 shadow-xl overflow-hidden relative">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Printer className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{shop.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-2">
              <Store className="w-4 h-4" />
              Print Shop
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8 space-y-6 text-center">
            <div className="grid gap-3">
              <Button className="w-full" onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Scan QR with camera
              </Button>
              <Button variant="outline" className="w-full" onClick={requestLocation} disabled={locationLoading}>
                <LocateFixed className="mr-2 h-4 w-4" />
                {locationLoading ? "Getting location..." : "Find nearby shops"}
              </Button>
            </div>

            {cameraOpen && (
              <div className="rounded-xl border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanner</span>
                  <Button size="sm" variant="ghost" onClick={stopCamera}><X className="h-4 w-4" /></Button>
                </div>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
                <canvas ref={canvasRef} className="hidden" />
                <p className="text-xs text-muted-foreground">Point the camera at a PickIT QR code.</p>
              </div>
            )}

            <div className="rounded-xl border p-4 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nearby shops</span>
              </div>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by shop name or address" />
              <div className="space-y-2">
                {nearbyShops.map((item) => (
                  <button
                    key={item.shopCode}
                    className="w-full rounded-lg border p-3 text-left hover:border-primary transition-colors"
                    onClick={() => setLocation(`/join/${item.shopCode}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.address}</p>
                      </div>
                      <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-1">Join</span>
                    </div>
                  </button>
                ))}
              </div>
              {coords && <p className="text-xs text-muted-foreground">Your location: {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}</p>}
            </div>

            {shop.address && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/50 py-3 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{shop.address}</span>
              </div>
            )}
            <div className="hidden">
              <QRCodeCanvas value={shop.shopCode} />
            </div>
            
            <div className="pt-2">
              {shop.isOpen ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Currently Open
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  Currently Closed
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 text-lg" 
              onClick={handleJoin}
              disabled={joinMutation.isPending || (!shop.isOpen && user?.role !== 'owner')}
            >
              {joinMutation.isPending ? "Connecting..." : 
                user ? "Start Printing" : "Log in to Print"}
            </Button>
            
            {user?.role === "owner" && (
              <p className="text-sm text-destructive mt-2">
                Note: You are logged in as a shop owner.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
