import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Store,
  Zap,
  LayoutDashboard,
  Printer,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Link
      href="/"
      aria-label="PickIT home"
      className="group inline-flex items-center gap-2.5 select-none"
    >
      <span
        className="relative inline-flex items-center justify-center rounded-xl text-white font-bold shadow-[0_6px_20px_rgba(26,31,77,0.25)]"
        style={{
          width: size,
          height: size,
          background:
            "linear-gradient(135deg, #1a1f4d 0%, #2c3585 55%, #10b981 140%)",
        }}
      >
        <span className="text-base tracking-tight">P</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-[#1a1f4d]">
        Pick<span className="text-emerald-500">IT</span>
      </span>
    </Link>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fafbff] text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[420px] h-[420px] rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <header className="container mx-auto px-6 py-5 flex items-center justify-between">
        <BrandMark />
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <a href="#features" className="hover:text-[#1a1f4d] transition-colors">Features</a>
          <a href="#how" className="hover:text-[#1a1f4d] transition-colors">How it works</a>
          <a href="#owners" className="hover:text-[#1a1f4d] transition-colors">For shops</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 hover:text-[#1a1f4d] px-2"
          >
            Login
          </Link>
          <Button
            asChild
            className="rounded-full bg-[#1a1f4d] hover:bg-[#0f1438] text-white px-5 h-9 text-sm font-medium shadow-[0_6px_20px_rgba(26,31,77,0.2)]"
          >
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-14 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-emerald-600 text-xs font-medium border border-emerald-100 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now Live on Campus
          </div>

          <p className="mt-8 text-sm md:text-base text-slate-500 uppercase tracking-[0.25em] font-medium">
            Queue-Free Campus Printing
          </p>

          <h1 className="mt-5 font-extrabold tracking-tight leading-[0.9] text-[88px] md:text-[150px]">
            <span className="text-[#1a1f4d]">Pick</span>
            <span className="bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">IT</span>
          </h1>

          <p className="mt-3 text-[11px] md:text-xs tracking-[0.55em] text-slate-400 font-medium">
            REQ &nbsp;·&nbsp; READY &nbsp;·&nbsp; RETRIEVE
          </p>

          <p className="mt-10 text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Upload documents from anywhere. Skip the queue.
            Pick up when it's ready.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow-[0_10px_30px_rgba(37,99,235,0.28)] group"
            >
              <Link href="/auth/register?role=student">
                <GraduationCap className="mr-2 h-5 w-5" />
                I'm a Student
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#1a1f4d] hover:bg-[#0f1438] text-white text-base font-medium shadow-[0_10px_30px_rgba(26,31,77,0.25)]"
            >
              <Link href="/auth/register?role=owner">
                <Store className="mr-2 h-5 w-5" />
                I Own a Shop
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure file uploads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              Live order tracking
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Trusted across 50+ campuses
            </span>
          </div>
        </motion.div>

        <motion.div
          id="features"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-28 text-left"
        >
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            title="Instant Uploads"
            body="No more USB drives or emailing yourself. Just scan the shop's QR code and drop your files right from your phone."
          />
          <FeatureCard
            icon={<LayoutDashboard className="w-5 h-5 text-emerald-500" />}
            iconBg="bg-emerald-50"
            title="Live Tracking"
            body="Know exactly when your prints are ready. We'll update you as your order moves from pending to printing to done."
          />
          <FeatureCard
            icon={<Printer className="w-5 h-5 text-[#1a1f4d]" />}
            iconBg="bg-slate-100"
            title="Shop Management"
            body="For shop owners: a dedicated dashboard to manage incoming orders, set pricing, and view daily revenue analytics."
          />
        </motion.div>
      </main>

      <footer className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/70">
        <BrandMark size={28} />
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} PickIT · Queue-free campus printing</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  body,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-7 hover:shadow-[0_20px_50px_-20px_rgba(26,31,77,0.25)] hover:border-slate-300 transition-all">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[#1a1f4d]">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
