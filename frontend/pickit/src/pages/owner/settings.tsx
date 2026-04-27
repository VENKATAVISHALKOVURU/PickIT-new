import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMyShop, getGetMyShopQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LocateFixed, MapPin, Trash2 } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(2, "Shop name is required"),
  address: z.string().optional(),
  isOpen: z.boolean(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export default function OwnerSettings() {
  const queryClient = useQueryClient();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: shop, isLoading } = useGetMyShop({
    query: {
      queryKey: getGetMyShopQueryKey()
    }
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      address: "",
      isOpen: false,
      latitude: null,
      longitude: null,
    }
  });

  const lat = form.watch("latitude");
  const lng = form.watch("longitude");

  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name,
        address: shop.address || "",
        isOpen: shop.isOpen,
        latitude: (shop as any).latitude ?? null,
        longitude: (shop as any).longitude ?? null,
      });
    }
  }, [shop, form]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", pos.coords.latitude, { shouldDirty: true });
        form.setValue("longitude", pos.coords.longitude, { shouldDirty: true });
        toast.success(`Pinned location (±${Math.round(pos.coords.accuracy)}m)`);
        setLocating(false);
      },
      () => {
        toast.error("Couldn't get your location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    form.setValue("latitude", null, { shouldDirty: true });
    form.setValue("longitude", null, { shouldDirty: true });
  };

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setSaving(true);
    try {
      const token = localStorage.getItem("pickit_token");
      const res = await fetch("/api/shop/my/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: getGetMyShopQueryKey() });
    } catch (e: any) {
      toast.error(e.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Shop Settings</h1>
        <Card className="max-w-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Shop Settings</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-xl border-primary/10">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update your shop profile and operating status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accepting Orders</FormLabel>
                        <FormDescription>
                          Turn this off to prevent students from placing new orders.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location / Address (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Shop pin on map
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Required so students can find you in their "Nearby shops" list.
                      </p>
                      {lat != null && lng != null ? (
                        <p className="text-xs font-mono text-emerald-700 mt-2">
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-2">No location pinned yet.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button type="button" size="sm" variant="outline" onClick={captureLocation} disabled={locating} data-testid="button-capture-location">
                        <LocateFixed className="h-4 w-4 mr-2" />
                        {locating ? "Locating…" : lat != null ? "Re-pin here" : "Use my current location"}
                      </Button>
                      {lat != null && (
                        <Button type="button" size="sm" variant="ghost" onClick={clearLocation}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving || !form.formState.isDirty}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
