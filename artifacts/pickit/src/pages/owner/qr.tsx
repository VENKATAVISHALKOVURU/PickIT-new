import { useGetMyShop, getGetMyShopQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

export default function OwnerQR() {
  const qrRef = useRef<HTMLDivElement>(null);
  
  const { data: shop, isLoading } = useGetMyShop({
    query: {
      queryKey: getGetMyShopQueryKey()
    }
  });

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${shop?.shopCode}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Link copied to clipboard");
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `pickit-qr-${shop?.shopCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Shop QR Code</h1>
        <Card className="max-w-md mx-auto">
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Shop QR Code</h1>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-md mx-auto overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="text-center">
            <CardTitle>Print at {shop?.name}</CardTitle>
            <CardDescription>Students scan this to upload their files directly to your shop.</CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center py-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border" ref={qrRef}>
              <QRCodeCanvas 
                value={joinUrl} 
                size={256}
                level="H"
                includeMargin={false}
                fgColor="#000000"
              />
            </div>
            
            <div className="w-full">
              <p className="text-sm font-medium mb-2 text-muted-foreground text-center">Shop Link</p>
              <div className="flex w-full items-center space-x-2">
                <div className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono truncate border">
                  {joinUrl}
                </div>
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/30 border-t flex justify-center gap-4 py-4">
            <Button onClick={handleDownload} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
