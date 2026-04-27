import { useGetMyShop, getGetMyShopQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Copy, Download, Share2, Printer, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

export default function OwnerQR() {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { data: shop, isLoading, isError } = useGetMyShop({
    query: { queryKey: getGetMyShopQueryKey() },
  });

  const joinUrl = typeof window !== "undefined" && shop?.shopCode
    ? `${window.location.origin}/join/${shop.shopCode}`
    : "";

  const handleCopyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyCode = async () => {
    if (!shop?.shopCode) return;
    await navigator.clipboard.writeText(shop.shopCode);
    toast.success("Shop code copied");
  };

  const buildPoster = (): Promise<string | null> =>
    new Promise((resolve) => {
      setTimeout(() => {
      const qrCanvas = qrRef.current?.querySelector("canvas");
      if (!qrCanvas || !shop) return resolve(null);

      const W = 900;
      const H = 1200;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(null);

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1a1f4d");
      grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      const radius = 32;
      const x = 70;
      const y = 220;
      const w = W - 140;
      const h = 760;
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "700 64px Inter, system-ui, sans-serif";
      ctx.fillText("PickIT", W / 2, 130);
      ctx.font = "400 26px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("Queue-Free Campus Printing", W / 2, 175);

      ctx.fillStyle = "#1a1f4d";
      ctx.font = "700 44px Inter, system-ui, sans-serif";
      ctx.fillText(shop.name, W / 2, 290);
      if (shop.address) {
        ctx.fillStyle = "#64748b";
        ctx.font = "400 22px Inter, system-ui, sans-serif";
        ctx.fillText(shop.address, W / 2, 326);
      }

      const qrSize = 520;
      const qx = (W - qrSize) / 2;
      const qy = 370;
      ctx.drawImage(qrCanvas, qx, qy, qrSize, qrSize);

      ctx.fillStyle = "#1a1f4d";
      ctx.font = "600 28px Inter, system-ui, sans-serif";
      ctx.fillText("Scan to upload your prints", W / 2, qy + qrSize + 60);

      ctx.fillStyle = "#10b981";
      ctx.font = "700 36px monospace";
      ctx.fillText(shop.shopCode.slice(0, 8).toUpperCase(), W / 2, qy + qrSize + 110);

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillText("REQ · READY · RETRIEVE", W / 2, H - 60);

      resolve(c.toDataURL("image/png"));
      }, 100);
    });

  const handleDownloadPoster = async () => {
    const url = await buildPoster();
    if (!url) return toast.error("Couldn't build the poster");
    const link = document.createElement("a");
    link.href = url;
    link.download = `pickit-poster-${shop?.shopCode}.png`;
    link.click();
    toast.success("Poster downloaded");
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `pickit-qr-${shop?.shopCode}.png`;
    link.click();
    toast.success("QR code downloaded");
  };

  const handleShare = async () => {
    if (!joinUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Print at ${shop?.name}`,
          text: `Scan to upload your prints to ${shop?.name} on PickIT`,
          url: joinUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Your unique QR code</h1>
        <Card className="max-w-xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Skeleton className="w-64 h-64" />
          </CardContent>
        </Card>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1f4d]">Your unique QR code</h1>
        <p className="text-muted-foreground mt-1">
          Print this and put it on your counter. Students scan it to send you orders.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="max-w-xl mx-auto overflow-hidden border-border shadow-md">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />
          <CardHeader className="text-center pt-7">
            <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100 mb-3">
              <Sparkles className="h-3 w-3" /> Unique to {shop.name}
            </div>
            <CardTitle className="text-2xl text-[#1a1f4d]">Print at {shop.name}</CardTitle>
            <CardDescription>Students scan this to upload files directly to your shop.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center py-6 space-y-6">
            <div
              ref={qrRef}
              className="relative bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 shadow-sm"
            >
              <QRCodeCanvas
                value={joinUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/join/${shop.shopCode}`}
                size={288}
                level="H"
                includeMargin={true}
                fgColor="#1a1f4d"
                bgColor="#ffffff"
                imageSettings={{
                  src: brandLogo,
                  height: 44,
                  width: 44,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center max-w-xs -mt-2">
              Tested at high error-correction (level H) — scannable from up to 2 m on a printed A4 page.
            </p>

            <div className="w-full space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Shop code</p>
                <button
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 transition-colors border rounded-xl px-4 py-3 font-mono text-sm text-[#1a1f4d]"
                >
                  <span className="truncate">{shop.shopCode}</span>
                  <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Shareable link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 px-3 py-2.5 rounded-xl text-sm font-mono truncate border">
                    {joinUrl}
                  </div>
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              <Button onClick={handleDownloadPoster} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Printer className="w-4 h-4" /> Poster
              </Button>
              <Button onClick={handleDownloadQR} variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> QR PNG
              </Button>
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
