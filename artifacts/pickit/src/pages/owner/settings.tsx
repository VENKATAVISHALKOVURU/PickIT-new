import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMyShop, getGetMyShopQueryKey, useUpdateMyShopSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

const settingsSchema = z.object({
  name: z.string().min(2, "Shop name is required"),
  address: z.string().optional(),
  isOpen: z.boolean(),
});

export default function OwnerSettings() {
  const queryClient = useQueryClient();

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
    }
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name,
        address: shop.address || "",
        isOpen: shop.isOpen,
      });
    }
  }, [shop, form]);

  const updateMutation = useUpdateMyShopSettings({
    mutation: {
      onSuccess: () => {
        toast.success("Settings updated successfully");
        queryClient.invalidateQueries({ queryKey: getGetMyShopQueryKey() });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update settings");
      }
    }
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    updateMutation.mutate({ data: values });
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

                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                  className="w-full"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
