import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useGetShopByCode, getGetShopByCodeQueryKey, useGetMyShopPricing, getGetMyShopPricingQueryKey, useCreateOrder, CreateOrderBodyColorMode } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FileUp, Info } from "lucide-react";

const uploadSchema = z.object({
  fileUrl: z.string().url("Must be a valid URL for the file to print"),
  fileName: z.string().min(1, "File name is required"),
  pages: z.coerce.number().min(1, "Must be at least 1 page"),
  colorMode: z.enum(["bw", "color"] as const),
  copies: z.coerce.number().min(1, "Must be at least 1 copy"),
  note: z.string().optional(),
});

export default function StudentUpload() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const { data: user, isLoading: isUserLoading } = useGetMe();
  
  // We need to fetch the shop info to get pricing since the student doesn't have a myShop
  // For the actual app we might need an endpoint to get the shop they joined, but for now
  // let's assume we can fetch pricing if they are linked. The API spec says useGetMyShopPricing
  // gets current shop pricing config. Wait, the student is linked via shopId.
  // Actually, useGetMyShopPricing gets the pricing for the current user's shop (if owner) 
  // OR the shop they are linked to (if student). Let's use it.
  
  const { data: pricing, isLoading: isPricingLoading } = useGetMyShopPricing({
    query: {
      queryKey: getGetMyShopPricingQueryKey(),
      enabled: !!user?.shopId
    }
  });

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      fileUrl: "",
      fileName: "",
      pages: 1,
      colorMode: "bw",
      copies: 1,
      note: "",
    }
  });

  const watchPages = form.watch("pages");
  const watchColorMode = form.watch("colorMode");
  const watchCopies = form.watch("copies");

  useEffect(() => {
    if (pricing) {
      const perPagePrice = watchColorMode === "bw" ? pricing.bwPerPage : pricing.colorPerPage;
      let total = perPagePrice * (watchPages || 1) * (watchCopies || 1);
      if (total < pricing.minimumOrder) {
        total = pricing.minimumOrder;
      }
      setEstimatedPrice(total);
    }
  }, [pricing, watchPages, watchColorMode, watchCopies]);

  const createMutation = useCreateOrder({
    mutation: {
      onSuccess: () => {
        toast.success("Order submitted successfully!");
        setLocation("/student/orders");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit order");
      }
    }
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    if (!user?.shopId) {
      toast.error("You must join a shop first");
      return;
    }
    
    createMutation.mutate({
      data: {
        shopId: user.shopId,
        ...values,
        colorMode: values.colorMode as CreateOrderBodyColorMode
      }
    });
  }

  if (isUserLoading || isPricingLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Upload Print Job</h1>
        <Card className="max-w-2xl">
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-64 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!user?.shopId) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Info className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">No Shop Linked</h1>
        <p className="text-muted-foreground max-w-md">
          You haven't joined a print shop yet. Please scan a shop's QR code or visit their link to connect to them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Upload Print Job</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-2xl border-primary/10 shadow-md">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Fill out the form below to send your file to the printer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>File URL (Google Drive, Dropbox, etc)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fileName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>File Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Essay_Final.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Pages</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="copies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Copies</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorMode"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Color Mode</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-muted/30 border rounded-md p-3 flex-1 cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="bw" />
                              </FormControl>
                              <FormLabel className="cursor-pointer w-full font-normal">
                                Black & White (${pricing?.bwPerPage}/pg)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-muted/30 border rounded-md p-3 flex-1 cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="color" />
                              </FormControl>
                              <FormLabel className="cursor-pointer w-full font-normal">
                                Color (${pricing?.colorPerPage}/pg)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Double sided, staple top left..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">Estimated Total</h4>
                    <p className="text-sm text-muted-foreground">
                      {pricing?.minimumOrder && estimatedPrice === pricing.minimumOrder 
                        ? `(Minimum order applied: $${pricing.minimumOrder})` 
                        : "Based on pages and copies"}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${estimatedPrice.toFixed(2)}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full gap-2 h-12 text-lg"
                >
                  <FileUp className="w-5 h-5" />
                  {createMutation.isPending ? "Submitting..." : "Submit Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
