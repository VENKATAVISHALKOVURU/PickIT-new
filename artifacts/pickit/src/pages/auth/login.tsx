import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast.success("Logged in successfully");
        if (data.user.role === "owner") {
          setLocation("/owner/overview");
        } else {
          const redirect = new URLSearchParams(window.location.search).get("redirect");
          if (redirect) {
            setLocation(redirect);
          } else {
            setLocation("/student/upload");
          }
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to log in");
      }
    }
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-white/8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
          <CardHeader className="space-y-1 text-center">
            <img src={brandLogo} alt="PickIT" className="mx-auto h-12 w-auto object-contain mb-2" />
            <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome back</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <div>
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary font-medium hover:underline">
                Register here
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
