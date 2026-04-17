import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMyShopPricing, getGetMyShopPricingQueryKey, useUpdateMyShopPricing } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

const pricingSchema = z.object({
  bwPerPage: z.coerce.number().min(0, { message: "Price must be positive" }),
  colorPerPage: z.coerce.number().min(0, { message: "Price must be positive" }),
  minimumOrder: z.coerce.number().min(0, { message: "Minimum order must be positive" }),
});

export default function OwnerPricing() {
  const queryClient = useQueryClient();

  const { data: pricing, isLoading } = useGetMyShopPricing({
    query: {
      queryKey: getGetMyShopPricingQueryKey()
    }
  });

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      bwPerPage: 0,
      colorPerPage: 0,
      minimumOrder: 0,
    }
  });

  useEffect(() => {
    if (pricing) {
      form.reset({
        bwPerPage: pricing.bwPerPage,
        colorPerPage: pricing.colorPerPage,
        minimumOrder: pricing.minimumOrder,
      });
    }
  }, [pricing, form]);

  const updateMutation = useUpdateMyShopPricing({
    mutation: {
      onSuccess: () => {
        toast.success("Pricing updated successfully");
        queryClient.invalidateQueries({ queryKey: getGetMyShopPricingQueryKey() });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update pricing");
      }
    }
  });

  function onSubmit(values: z.infer<typeof pricingSchema>) {
    updateMutation.mutate({ data: values });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Config</h1>
        <Card className="max-w-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
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
      <h1 className="text-3xl font-bold tracking-tight text-primary">Pricing Config</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-xl border-primary/10">
          <CardHeader>
            <CardTitle>Set Prices</CardTitle>
            <CardDescription>
              Configure how much you charge for prints. Changes will apply to all future orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="bwPerPage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Black & White (per page)</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <FormControl>
                          <Input type="number" step="0.01" className="pl-7" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="colorPerPage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (per page)</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <FormControl>
                          <Input type="number" step="0.01" className="pl-7" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minimumOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Value</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <FormControl>
                          <Input type="number" step="0.01" className="pl-7" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>Minimum price for any order, regardless of pages.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                  className="w-full"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
