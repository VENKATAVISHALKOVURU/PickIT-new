import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Printer, Zap, LayoutDashboard, ArrowRight, ScanLine } from "lucide-react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={brandLogo} alt="PickIT" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Sign up</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Ready. Retrieve. Print.
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              PickIt <span className="text-2xl align-top text-muted-foreground">s</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ready. Retrieve.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Scan a QR code, upload your files, and track your print jobs in real-time. 
              The slickest print-order platform for students and shop owners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg group" asChild>
                <Link href="/auth/register?role=student">
                  I'm a Student
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg group" asChild>
                <Link href="/join/SCAN">
                  <ScanLine className="mr-2 w-5 h-5" />
                  Scan & Join
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg" asChild>
                <Link href="/auth/register?role=owner">
                  I own a shop
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32"
          >
            <div className="bg-card border border-border rounded-2xl p-8 text-left relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Uploads</h3>
              <p className="text-muted-foreground leading-relaxed">
                No more USB drives or emailing yourself. Just scan the shop's QR code and drop your files right from your phone.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-left relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Know exactly when your prints are ready. We'll update you as your order moves from pending to printing to done.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-left relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Printer className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Shop Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                For shop owners: a dedicated dashboard to manage incoming orders, set pricing, and view daily revenue analytics.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
