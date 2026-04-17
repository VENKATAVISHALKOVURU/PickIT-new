import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Printer, Zap, LayoutDashboard, ArrowRight, ScanLine, Sparkles, ArrowUpRight } from "lucide-react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#060816] overflow-hidden relative selection:bg-fuchsia-400/30 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.45),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff14_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={brandLogo} alt="PickIT" className="h-11 w-auto object-contain drop-shadow-[0_8px_30px_rgba(167,139,250,0.25)]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-4 border border-white/15 backdrop-blur-md shadow-lg">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              Ready. Retrieve. Print.
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
              PickIt <span className="text-2xl align-top text-white/60">s</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-200">Ready. Retrieve.</span>
            </h1>
            
            <p className="text-xl text-white/72 max-w-2xl mx-auto leading-relaxed">
              Scan a QR code, upload your files, and track your print jobs in real-time. 
              The slickest print-order platform for students and shop owners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg group bg-white text-slate-950 hover:bg-white/90 shadow-[0_18px_60px_rgba(167,139,250,0.25)]" asChild>
                <Link href="/auth/register?role=student">
                  I'm a Student
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg group bg-white/10 text-white border border-white/10 backdrop-blur-md hover:bg-white/15" asChild>
                <Link href="/join/SCAN">
                  <ScanLine className="mr-2 w-5 h-5" />
                  Scan & Join
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-white/15 bg-white/5 text-white hover:bg-white/10" asChild>
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
            <div className="bg-white/8 border border-white/10 rounded-3xl p-8 text-left relative overflow-hidden group backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-400/25 to-violet-400/15 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-fuchsia-200" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Uploads</h3>
              <p className="text-white/70 leading-relaxed">
                No more USB drives or emailing yourself. Just scan the shop's QR code and drop your files right from your phone.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-white/8 border border-white/10 rounded-3xl p-8 text-left relative overflow-hidden group backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/25 to-violet-400/15 flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-cyan-200" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Tracking</h3>
              <p className="text-white/70 leading-relaxed">
                Know exactly when your prints are ready. We'll update you as your order moves from pending to printing to done.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="bg-white/8 border border-white/10 rounded-3xl p-8 text-left relative overflow-hidden group backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400/25 to-fuchsia-400/15 flex items-center justify-center mb-6">
                <Printer className="w-6 h-6 text-violet-200" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Shop Management</h3>
              <p className="text-white/70 leading-relaxed">
                For shop owners: a dedicated dashboard to manage incoming orders, set pricing, and view daily revenue analytics.
              </p>
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
