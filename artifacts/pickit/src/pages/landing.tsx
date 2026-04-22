import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  GraduationCap,
  Store,
  Zap,
  LayoutDashboard,
  Printer,
  ShieldCheck,
  Clock,
  ArrowRight,
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Building2,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

function BrandMark({ size = 56 }: { size?: number; withTagline?: boolean }) {
  return (
    <Link href="/" aria-label="PickIT home" className="group inline-flex items-center select-none">
      <img
        src={brandLogo}
        alt="PickIT"
        style={{ height: size, width: "auto" }}
        className="object-contain transition-transform group-hover:scale-105 mix-blend-multiply"
      />
    </Link>
  );
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString("en-IN"));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration: 2, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, motionValue]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${latest}${suffix}`;
    });
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { icon: Building2, label: "Print shops connected", value: 120, suffix: "+", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Users, label: "Happy students", value: 18500, suffix: "+", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: FileText, label: "Pages printed", value: 245000, suffix: "+", color: "text-[#1a1f4d]", bg: "bg-slate-100" },
  { icon: Sparkles, label: "Avg. minutes saved", value: 12, suffix: " min", color: "text-amber-500", bg: "bg-amber-50" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fafbff] text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 pk-grid-bg opacity-60" />
        <motion.div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-300/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-20 right-0 w-[460px] h-[460px] rounded-full bg-emerald-300/40 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-violet-300/30 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-6 py-3 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <BrandMark size={120} />
        </div>
        <nav className="hidden md:flex items-center justify-center gap-9 text-[15px] font-medium text-slate-700">
          <a href="#features" className="hover:text-[#1a1f4d] transition-colors">Features</a>
          <a href="#stats" className="hover:text-[#1a1f4d] transition-colors">Impact</a>
          <a href="#owners" className="hover:text-[#1a1f4d] transition-colors">For shops</a>
        </nav>
        <div className="flex items-center justify-end gap-3">
          <Link href="/auth/login" className="text-[15px] font-medium text-slate-700 hover:text-[#1a1f4d] px-2">
            Login
          </Link>
          <Button
            asChild
            className="rounded-full bg-[#1a1f4d] hover:bg-[#0f1438] text-white px-5 h-10 text-sm font-semibold shadow-[0_6px_20px_rgba(26,31,77,0.2)]"
          >
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-14 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-emerald-600 text-xs font-medium border border-emerald-100 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now Live on Campus
          </div>

          <p className="mt-8 text-sm md:text-base text-slate-500 uppercase tracking-[0.25em] font-medium">
            Queue-Free Campus Printing
          </p>

          <div className="relative mt-5">
            {/* Hero wordmark with shimmer + 3D tilt */}
            <motion.h1
              className="font-extrabold tracking-tight leading-[0.9] text-[88px] md:text-[160px] pk-tilt"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="pk-shimmer-text">Pick</span>
              <span className="bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_8px_24px_rgba(16,185,129,0.35)]">
                IT
              </span>
            </motion.h1>

            {/* Pulse ring under wordmark */}
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-40 h-40 rounded-full bg-emerald-400/20 pk-pulse-ring -z-10" />
          </div>

          <p className="mt-3 text-[11px] md:text-xs tracking-[0.55em] text-slate-400 font-medium">
            REQ &nbsp;·&nbsp; READY &nbsp;·&nbsp; RETRIEVE
          </p>

          <p className="mt-10 text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Upload documents from anywhere. Skip the queue. Pick up when it's ready.
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

        <section id="stats" className="mt-28 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">By the numbers</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#1a1f4d]">
              Trusted by campuses, loved by students
            </h2>
          </motion.div>

          <div className="relative rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-sm shadow-[0_20px_60px_-30px_rgba(26,31,77,0.25)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-[#1a1f4d]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200/70">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="p-6 md:p-8 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold tracking-tight ${s.color}`}>
                      <AnimatedNumber value={s.value} suffix={s.suffix} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="pk-marquee mt-8 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
            <div className="pk-marquee-track flex whitespace-nowrap">
              {[...Array(2)].map((_, copy) => (
                <div key={copy} className="flex shrink-0 items-center">
                  {[
                    "📄 Print PDFs, Docs, PPTs in 1 click",
                    "📍 Find nearest print shop instantly",
                    "🔒 Secure file uploads",
                    "🚚 REQUEST · READY · RETRIEVE",
                  ].map((item, i) => (
                    <span key={`${copy}-${i}`} className="flex items-center">
                      <span className="px-6 md:px-10 text-slate-600 font-medium tracking-wide text-sm md:text-base">
                        {item}
                      </span>
                      <span className="text-slate-300 select-none">|</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="owners" className="relative mt-12 bg-gradient-to-br from-[#0f1438] via-[#1a1f4d] to-[#1f2a6b] text-slate-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="container mx-auto px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="bg-white inline-flex p-3 rounded-2xl shadow-lg">
                <img src={brandLogo} alt="PickIT" className="h-14 w-auto object-contain" />
              </div>
              <p className="mt-5 text-sm text-slate-400 max-w-md leading-relaxed">
                The fastest way to print on campus. Scan, upload, and pick up — no queue, no chaos.
                Built for students and shop owners who value their time.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {[Twitter, Instagram, Linkedin, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/10 hover:border-emerald-400/50 hover:bg-white/5 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white text-sm font-semibold mb-4">Company</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">For shops</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <p className="text-white text-sm font-semibold mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/legal/refund" className="hover:text-emerald-400 transition-colors">Refund Policy</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} PickIT Technologies. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 tracking-[0.3em] uppercase">
              Req · Ready · Retrieve
            </p>
          </div>
        </div>
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
