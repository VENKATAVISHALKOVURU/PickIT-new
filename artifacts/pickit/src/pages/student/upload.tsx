import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMe, useGetMyShopPricing, useCreateOrder, CreateOrderBodyColorMode } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ShieldCheck, Printer, Clock3, IndianRupee, Sparkles, CircleCheckBig, Users } from "lucide-react";

const uploadSchema = z.object({
  fileUrl: z.string().url("Must be a valid URL for the file to print"),
  fileName: z.string().min(1, "File name is required"),
  pages: z.coerce.number().min(1, "Must be at least 1 page"),
  colorMode: z.enum(["bw", "color"] as const),
  copies: z.coerce.number().min(1, "Must be at least 1 copy"),
  note: z.string().optional(),
});

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function StudentUpload() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { data: user, isLoading: isUserLoading } = useGetMe();

  const { data: pricing, isLoading: isPricingLoading } = useGetMyShopPricing({
    query: {
      queryKey: ["student-shop-pricing", user?.shopId],
      enabled: !!user?.shopId,
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
  const watchedFileName = form.watch("fileName");
  const watchedFileUrl = form.watch("fileUrl");

  const estimated = useMemo(() => {
    const perPagePrice = watchColorMode === "bw" ? pricing?.bwPerPage ?? 2 : pricing?.colorPerPage ?? 5;
    const pageCount = Math.max(1, Number(watchPages) || 1);
    const copies = Math.max(1, Number(watchCopies) || 1);
    const subtotal = perPagePrice * pageCount * copies;
    const total = Math.max(subtotal, pricing?.minimumOrder ?? 10);
    const timeMinutes = Math.max(5, Math.round((pageCount * copies) / 2) + (watchColorMode === "color" ? 3 : 0));
    return { perPagePrice, pageCount, copies, subtotal, total, timeMinutes };
  }, [pricing, watchPages, watchColorMode, watchCopies]);

  const createMutation = useCreateOrder({
    mutation: {
      onSuccess: () => {
        setCompleted(true);
        toast.success("Order placed successfully!");
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

  const fileUrlValue = watchedFileUrl?.trim();

  const handleDrop = (accepted: string) => {
    form.setValue("fileUrl", accepted, { shouldDirty: true, shouldValidate: true });
    form.setValue("fileName", accepted.split("/").pop() || "print-job.pdf", { shouldDirty: true, shouldValidate: true });
    setStep(1);
    toast.success("File added");
  };

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
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
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
      <div className="flex flex-wrap gap-2">
        {["Upload File", "Paper Configuration", "Processing", "Queue", "PickIT✓"].map((label, index) => (
          <div key={label} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${step >= index ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground"}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background border text-xs font-semibold">{index + 1}</span>
            {label}
          </div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle>Student flow</CardTitle>
              <CardDescription>Choose a shop, upload your file, then configure print options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const dropped = e.dataTransfer.getData("text/plain") || "sample-document.pdf";
                        handleDrop(dropped);
                      }}
                      className={`rounded-2xl border border-dashed p-6 transition-all ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary"><Upload className="h-5 w-5" /></div>
                        <div>
                          <p className="font-semibold">Drag and drop your file</p>
                          <p className="text-sm text-muted-foreground">PDFs and images only</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <FormField control={form.control} name="fileUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel>File URL</FormLabel>
                            <FormControl><Input placeholder="https://drive.google.com/..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="fileName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>File name</FormLabel>
                            <FormControl><Input placeholder="assignment.pdf" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <AnimatePresence>
                        {(watchedFileName || fileUrlValue) && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl border bg-background p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{watchedFileName || "Selected file"}</p>
                                <p className="text-sm text-muted-foreground">Preview ready · 2.4 MB</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page count</FormLabel>
                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="copies" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copies</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="colorMode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Print type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                          {["bw", "color"].map((value) => (
                            <label key={value} className="flex items-center gap-3 rounded-xl border p-4 hover:border-primary cursor-pointer">
                              <RadioGroupItem value={value} />
                              <span>{value === "bw" ? "B/W" : "Color"}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="note" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl><Input placeholder="Double sided, staple top left..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 p-4">
                    <Clock3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Estimated time: {estimated.timeMinutes}–{estimated.timeMinutes + 5} minutes</p>
                      <p className="text-sm text-muted-foreground">Queue load and page count affect timing.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-primary/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Live pricing</p>
                      <p className="text-lg font-semibold">₹{estimated.perPagePrice} × {estimated.pageCount} pages × {estimated.copies} copies</p>
                      <p className="text-sm text-muted-foreground">Minimum order: {formatINR(pricing?.minimumOrder ?? 10)}</p>
                    </div>
                    <div className="text-3xl font-bold text-primary">{formatINR(estimated.total)}</div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep((s) => Math.min(s + 1, 4))}>Next</Button>
                    <Button type="submit" className="flex-1 gap-2" disabled={createMutation.isPending}>
                      <Sparkles className="h-4 w-4" />
                      {createMutation.isPending ? "Sending..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Connected shop</CardTitle>
              <CardDescription>Your order is routed to this shop automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Shop linked</p>
                <p className="text-xl font-semibold">Connected to your print shop</p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Status tracker</p>
                <div className="mt-3 space-y-3">
                  {["Pending", "Accepted", "Printing", "Completed"].map((label, index) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${step >= index ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{label}</span>
                          {index === 0 && <span className="text-xs text-muted-foreground">queue</span>}
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: step >= index ? "100%" : "0%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {completed && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-700">
                    <CircleCheckBig className="mb-2 h-6 w-6" />
                    Your print request has been sent to the shop.
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
