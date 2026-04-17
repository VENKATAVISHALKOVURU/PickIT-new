import { useGetShopByCode, getGetShopByCodeQueryKey, useJoinShop } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Store, MapPin, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function JoinShop() {
  const { shopCode } = useParams<{ shopCode: string }>();
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  
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
            {shop.address && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/50 py-3 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{shop.address}</span>
              </div>
            )}
            
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
