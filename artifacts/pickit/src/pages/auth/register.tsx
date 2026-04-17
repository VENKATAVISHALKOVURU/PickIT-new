import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister, RegisterBodyRole } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["student", "owner"] as const),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
}).refine((data) => {
  if (data.role === "owner" && (!data.shopName || data.shopName.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Shop name is required for owners",
  path: ["shopName"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = (searchParams.get("role") as "student" | "owner") || "student";
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: "", 
      email: "", 
      password: "", 
      role: initialRole,
      shopName: "",
      shopAddress: ""
    },
  });

  const role = form.watch("role");

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast.success("Registered successfully");
        if (data.user.role === "owner") {
          setLocation("/owner/overview");
        } else {
          setLocation("/student/upload");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register");
      }
    }
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ 
      data: {
        ...values,
        role: values.role as RegisterBodyRole,
        shopName: values.role === "owner" ? values.shopName : undefined,
        shopAddress: values.role === "owner" ? values.shopAddress : undefined,
      } 
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <img src={brandLogo} alt="PickIT" className="mx-auto h-12 w-auto object-contain mb-2" />
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">Create an account</CardTitle>
            <CardDescription>
              Join PickIT to start printing or managing your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3 mb-6">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 bg-card border rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors flex-1 data-[state=checked]:border-primary">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 bg-card border rounded-md p-4 cursor-pointer hover:border-primary/50 transition-colors flex-1 data-[state=checked]:border-primary">
                            <FormControl>
                              <RadioGroupItem value="owner" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">Shop Owner</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode="popLayout">
                  {role === "owner" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="pt-2 pb-1">
                        <div className="h-px w-full bg-border" />
                        <h4 className="text-sm font-medium mt-4">Shop Details</h4>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="shopName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Campus Prints" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shopAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Address (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Student Union Building, Room 102" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <div>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
            <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline">
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
