import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useInView, animate, useMotionValue, useTransform, useSpring, AnimatePresence, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
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
  Menu,
  X,
  QrCode,
} from "lucide-react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Impact", href: "#stats" },
  { label: "For shops", href: "#owners" },
  { label: "Pricing", href: "#stats" },
] as const;

function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const isAuthed = !!user;
  const scanHref = isAuthed ? "/join/SCAN" : "/auth/register?redirect=/join/SCAN";

  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0.6)", "rgba(255, 255, 255, 0.95)"]
  );
  const headerBlur = useTransform(scrollY, [0, 50], ["0px", "16px"]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.99]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          backdropFilter: `blur(${headerBlur})`,
          scale: headerScale,
        }}
        className="sticky top-0 z-50 border-b border-slate-200/60 will-change-transform transform-gpu py-3 sm:py-4"
      >
        {/* gradient hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="container mx-auto px-3 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
          <div className="flex items-center">
            <span className="hidden sm:flex">
              <BrandMark size={110} />
            </span>
            <span className="sm:hidden flex">
              <BrandMark size={72} />
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center justify-center gap-1 text-[14px] font-medium text-slate-700">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative px-4 py-2 rounded-full hover:text-[#1a1f4d] transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full bg-slate-100/0 group-hover:bg-slate-100 transition-colors" />
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0.5 h-[2px] w-0 group-hover:w-6 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <Link
              href={scanHref}
              className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-full hover:bg-emerald-50 transition-colors"
              data-testid="nav-scan"
              title={isAuthed ? "Scan a shop QR code" : "Sign up to scan a shop QR"}
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </Link>
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex text-[14px] font-medium text-slate-700 hover:text-[#1a1f4d] px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
              data-testid="nav-login"
            >
              Login
            </Link>
            <Button
              asChild
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-[#1a1f4d] to-[#2b3580] hover:from-[#0f1438] hover:to-[#1a1f4d] text-white px-5 h-10 text-sm font-semibold shadow-[0_10px_30px_-8px_rgba(26,31,77,0.45)] group"
              data-testid="nav-cta-get-started"
            >
              <Link href="/auth/register">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-slate-900 hover:bg-[#1a1f4d] text-white shadow-[0_8px_20px_-8px_rgba(15,23,42,0.5)] transition-colors"
              aria-label="Open menu"
              data-testid="nav-mobile-toggle"
            >
              <Menu className="h-4 w-4" />
              <span className="text-[13px] font-semibold">Menu</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl lg:hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-b from-slate-50 to-white">
                <BrandMark size={64} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Hero quick actions */}
                <div className="px-4 pt-4 grid grid-cols-2 gap-2.5">
                  <Link
                    href={scanHref}
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-start gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/70 hover:from-emerald-100 hover:to-emerald-200/60 transition-colors"
                    data-testid="drawer-scan"
                  >
                    <span className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                      <QrCode className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] font-semibold text-emerald-900">Scan QR</span>
                    <span className="text-[10px] text-emerald-700/80">Connect to a shop</span>
                  </Link>
                  <Link
                    href="/auth/register?role=student"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-start gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200/70 hover:from-blue-100 transition-colors"
                  >
                    <span className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] font-semibold text-blue-900">I'm a Student</span>
                    <span className="text-[10px] text-blue-700/80">Upload &amp; print</span>
                  </Link>
                  <Link
                    href="/auth/register?role=owner"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-start gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/60 border border-violet-200/70 hover:from-violet-100 transition-colors"
                  >
                    <span className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-700 flex items-center justify-center">
                      <Store className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] font-semibold text-violet-900">I Own a Shop</span>
                    <span className="text-[10px] text-violet-700/80">Manage queue</span>
                  </Link>
                  <a
                    href="mailto:hello@pickit.app"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-start gap-1.5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/70 hover:from-amber-100 transition-colors"
                  >
                    <span className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="text-[13px] font-semibold text-amber-900">Talk to us</span>
                    <span className="text-[10px] text-amber-700/80">hello@pickit.app</span>
                  </a>
                </div>

                {/* Section nav */}
                <div className="px-5 mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Explore</p>
                  <nav className="flex flex-col gap-0.5">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3 py-3 rounded-xl text-[15px] font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        {link.label}
                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Live status strip */}
                <div className="mx-4 mt-5 mb-2 flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[12px] font-semibold text-emerald-900">All shops live</p>
                      <p className="text-[10px] text-emerald-700/80">Avg pickup in 5 minutes</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </div>

              <div className="p-4 border-t flex flex-col gap-2 bg-slate-50/60">
                <Button asChild variant="outline" className="rounded-xl h-11">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>Login</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl h-11 bg-gradient-to-r from-[#1a1f4d] to-[#2b3580] text-white shadow-[0_10px_25px_-10px_rgba(26,31,77,0.5)]"
                >
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-center text-[10px] text-slate-400 mt-1">
                  Trusted across 50+ campuses · INR pricing
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

type DemoOrder = {
  id: string;
  name: string;
  pages: number;
  copies: number;
  mode: string;
  color: "emerald" | "blue" | "violet";
  pricePerPage: number;
  msPerPage: number;
};

const DEMO_ORDERS: DemoOrder[] = [
  { id: "PK-2847", name: "Thesis_Final.pdf", pages: 84, copies: 2, mode: "B/W", color: "emerald", pricePerPage: 2, msPerPage: 220 },
  { id: "PK-2846", name: "Lab_Report.docx", pages: 12, copies: 1, mode: "Color", pricePerPage: 8, color: "blue", msPerPage: 380 },
  { id: "PK-2845", name: "Posters_A3.pdf", pages: 4, copies: 1, mode: "A3 Color", pricePerPage: 30, color: "violet", msPerPage: 600 },
];

const COLOR_MAP: Record<DemoOrder["color"], { bg: string; text: string; ring: string; border: string; softBg: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-400/40", border: "border-emerald-200", softBg: "bg-emerald-50/60" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-400/40", border: "border-blue-200", softBg: "bg-blue-50/60" },
  violet: { bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-400/40", border: "border-violet-200", softBg: "bg-violet-50/60" },
};

function AppShowcase3D() {
  const [selectedId, setSelectedId] = useState<string>(DEMO_ORDERS[0].id);
  const [pagesDone, setPagesDone] = useState(0);
  const [revenue, setRevenue] = useState(2840);
  const [completed, setCompleted] = useState(47);
  const [activeCount, setActiveCount] = useState(3);
  const [sheets, setSheets] = useState<number[]>([]);
  const sheetIdRef = useRef(0);
  const paused = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse-tracked 3D tilt (TiltedCard-style)
  const tiltSpring = { damping: 30, stiffness: 100, mass: 1.4 };
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);
  const scale = useSpring(1, tiltSpring);

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const amp = 8;
    rotateX.set((offsetY / (rect.height / 2)) * -amp);
    rotateY.set((offsetX / (rect.width / 2)) * amp);
  }
  function handleEnter() {
    paused.current = true;
    scale.set(1.02);
  }
  function handleLeave() {
    paused.current = false;
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  const selected = DEMO_ORDERS.find((o) => o.id === selectedId)!;
  const totalPages = selected.pages * selected.copies;

  // Reset progress when user switches order
  useEffect(() => {
    setPagesDone(0);
    setSheets([]);
  }, [selectedId]);

  // Live print loop
  useEffect(() => {
    const tick = setInterval(() => {
      if (paused.current) return;
      setPagesDone((p) => {
        if (p + 1 >= totalPages) {
          // job complete — bump revenue, advance to next order
          setRevenue((r) => r + totalPages * selected.pricePerPage);
          setCompleted((c) => c + 1);
          const idx = DEMO_ORDERS.findIndex((o) => o.id === selectedId);
          const next = DEMO_ORDERS[(idx + 1) % DEMO_ORDERS.length];
          setTimeout(() => setSelectedId(next.id), 400);
          return totalPages;
        }
        // emit a paper sheet animation
        const id = ++sheetIdRef.current;
        setSheets((s) => [...s, id].slice(-5));
        setTimeout(() => setSheets((s) => s.filter((x) => x !== id)), 1400);
        return p + 1;
      });
    }, selected.msPerPage);
    return () => clearInterval(tick);
  }, [selectedId, totalPages, selected.msPerPage, selected.pricePerPage]);

  // Occasionally simulate a new order joining the queue
  useEffect(() => {
    const t = setInterval(() => setActiveCount((c) => 3 + Math.floor(Math.random() * 4)), 4200);
    return () => clearInterval(t);
  }, []);

  const progress = Math.min(1, pagesDone / totalPages);
  const remainingSec = Math.max(1, Math.ceil((totalPages - pagesDone) * (selected.msPerPage / 1000)));
  const etaLabel =
    remainingSec >= 60
      ? `${Math.floor(remainingSec / 60)}m ${remainingSec % 60}s`
      : `${remainingSec}s`;
  const liveCost = pagesDone * selected.pricePerPage;
  const c = COLOR_MAP[selected.color];

  return (
    <div
      className="relative mx-auto w-full max-w-[1080px] [perspective:1400px]"
      data-testid="hero-app-showcase"
      onMouseMove={handleTilt}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] h-[80%] rounded-[60px] bg-gradient-to-br from-blue-400/25 via-emerald-300/15 to-violet-400/20 blur-3xl" />
      </div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="relative will-change-transform transform-gpu"
      >
        {/* Dashboard surface */}
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_60px_120px_-40px_rgba(15,23,42,0.45),0_30px_60px_-30px_rgba(15,23,42,0.25)] overflow-hidden" style={{ transform: "translateZ(0)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1a1f4d] to-[#2b3580] flex items-center justify-center text-white">
                <Printer className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1f4d] leading-tight">Print Hub</p>
                <p className="text-[10px] text-slate-400">{completed} jobs completed today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeCount} active
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold tabular-nums">
                ₹{revenue.toLocaleString("en-IN")} today
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 p-5">
            {/* Order list — clickable */}
            <div className="col-span-12 md:col-span-5 space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                Queue · click to switch
              </p>
              {DEMO_ORDERS.map((o, i) => {
                const isActive = o.id === selectedId;
                const oc = COLOR_MAP[o.color];
                return (
                  <motion.button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? `${oc.border} ${oc.softBg} ring-2 ${oc.ring}`
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60"
                    }`}
                    data-testid={`demo-order-${o.id}`}
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-lg ${oc.bg} ${oc.text} flex items-center justify-center`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-800 truncate">{o.name}</p>
                      <p className="text-[10px] text-slate-400">
                        #{o.id} · {o.pages} pg · {o.mode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-[#1a1f4d] tabular-nums">
                        ₹{(o.pages * o.copies * o.pricePerPage).toLocaleString("en-IN")}
                      </p>
                      <p className={`text-[10px] font-semibold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                        {isActive ? "Printing…" : "Queued"}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Live job panel */}
            <div className="col-span-12 md:col-span-7 rounded-2xl border border-slate-100 bg-gradient-to-br from-[#0f1438] via-[#1a1f4d] to-[#2b3580] text-white p-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.45),transparent_45%),radial-gradient(circle_at_120%_120%,rgba(59,130,246,0.45),transparent_50%)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Now printing
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-bold truncate">{selected.name}</p>
                    <p className="text-[11px] text-blue-200/80">
                      Order #{selected.id} · {selected.pages} pages · {selected.mode} · {selected.copies} {selected.copies === 1 ? "copy" : "copies"}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 tabular-nums">
                    ETA {etaLabel}
                  </span>
                </div>

                {/* Mini printer + paper printing toward viewer */}
                <div className="mt-4 relative h-[160px] [perspective:900px]" style={{ transformStyle: "preserve-3d" }}>
                  {/* Printer body — sits at top, paper exits below */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[64%] h-[34px] rounded-t-lg bg-gradient-to-b from-[#2b3580] to-[#0f1438] border border-[#0a0e2a] flex items-center justify-between px-2.5 z-20">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </div>
                    <span className="font-mono text-[9px] text-emerald-300 tracking-widest tabular-nums">
                      {pagesDone.toString().padStart(2, "0")} / {totalPages}
                    </span>
                  </div>
                  {/* Paper exit slot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[34px] w-[58%] h-[14px] rounded-b-lg bg-slate-200/90 border border-slate-300 flex items-center justify-center z-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
                    <div className="w-[82%] h-1 rounded-full bg-slate-900/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]" />
                  </div>

                  {/* Sheets emerging toward the user (downward + translateZ) */}
                  <AnimatePresence>
                    {sheets.map((id, idx) => (
                      <motion.div
                        key={id}
                        initial={{ y: 36, z: 0, rotateX: -85, opacity: 0, scale: 0.7 }}
                        animate={{
                          y: 64,
                          z: 110,
                          rotateX: 18,
                          opacity: 1,
                          scale: 1.05,
                        }}
                        exit={{
                          y: 130,
                          z: 220,
                          rotateX: 30,
                          opacity: 0,
                          scale: 1.25,
                        }}
                        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          transformStyle: "preserve-3d",
                          transformOrigin: "top center",
                          zIndex: 10 + idx,
                        }}
                        className="absolute left-1/2 -translate-x-1/2 top-0 w-[36%] h-[80px] rounded-[3px] bg-white border border-slate-200 shadow-[0_18px_28px_-10px_rgba(0,0,0,0.45),0_4px_10px_-3px_rgba(0,0,0,0.25)]"
                      >
                        <div className="p-1.5 space-y-1">
                          <div className="h-[3px] w-3/4 bg-slate-300 rounded" />
                          <div className="h-[2px] w-full bg-slate-200 rounded" />
                          <div className="h-[2px] w-5/6 bg-slate-200 rounded" />
                          <div className="h-[2px] w-2/3 bg-slate-200 rounded" />
                          <div className={`mt-1 h-[14px] rounded-sm ${selected.color === "emerald" ? "bg-emerald-100" : selected.color === "blue" ? "bg-blue-100" : "bg-violet-100"}`} />
                          <div className="h-[2px] w-4/5 bg-slate-200 rounded" />
                          <div className="h-[2px] w-3/5 bg-slate-200 rounded" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Live progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-blue-200/70 mb-1.5">
                    <span className={progress > 0 ? "text-emerald-300 font-semibold" : ""}>Accepted</span>
                    <span className={progress > 0.05 ? "text-emerald-300 font-semibold" : ""}>Printing</span>
                    <span className={progress > 0.85 ? "text-emerald-300 font-semibold" : ""}>Ready</span>
                    <span className={progress >= 1 ? "text-emerald-300 font-semibold" : ""}>Picked up</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: selected.msPerPage / 1000, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Stat label="Pages done" value={`${pagesDone} / ${totalPages}`} cls="text-emerald-300" />
                  <Stat label="Live cost" value={`₹${liveCost.toLocaleString("en-IN")}`} cls="text-blue-200" />
                  <Stat label="Time left" value={etaLabel} cls="text-amber-300" />
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-[11px] text-blue-100">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Paid via UPI · GPay
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300">✓ Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating accent chips driven by live state */}
        <motion.div
          className="hidden md:flex absolute -left-10 top-24 items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] px-3.5 py-2.5"
          style={{ transform: "translateZ(80px)" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={`h-8 w-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] text-slate-400 font-medium">Now printing</p>
            <p className="text-[12px] font-semibold text-[#1a1f4d] truncate max-w-[140px]">{selected.name}</p>
          </div>
        </motion.div>

        <motion.div
          className="hidden md:flex absolute -right-8 top-40 items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] px-3.5 py-2.5"
          style={{ transform: "translateZ(80px)" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <span className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] text-slate-400 font-medium">Time left</p>
            <p className="text-[12px] font-semibold text-[#1a1f4d] tabular-nums">{etaLabel}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
      <p className="text-[9px] uppercase tracking-wider text-blue-200/60">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${cls}`}>{value}</p>
    </div>
  );
}

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

      <SiteNav />

      {/* Top progress accent that pulses */}

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
              className="font-extrabold tracking-tight leading-[0.9] text-[88px] md:text-[160px] pk-tilt transform-gpu will-change-transform"
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

          {/* Premium product showcase */}
          <div className="mt-16 mb-2">
            <AppShowcase3D />
          </div>

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
          className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-28 text-left [content-visibility:auto]"
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

        <section id="stats" className="mt-28 max-w-6xl mx-auto [content-visibility:auto]">
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
