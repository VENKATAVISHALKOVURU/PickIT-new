import { Link, useLocation } from "wouter";
import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingCart,
  QrCode,
  Settings,
  FileUp,
  History,
  LogOut,
  ScanLine,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

export function PrivateRoute({ children, role }: { children: ReactNode; role?: "student" | "owner" }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLocation("/auth/login");
      return;
    }
    if (role && user.role !== role) {
      setLocation(user.role === "student" ? "/student/upload" : "/owner/overview");
    }
  }, [isLoading, user, role, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}

type NavLink = { href: string; label: string; icon: typeof LayoutDashboard };

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const ownerLinks: NavLink[] = [
    { href: "/owner/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/owner/orders", label: "Orders", icon: ShoppingCart },
    { href: "/owner/qr", label: "QR Code", icon: QrCode },
    { href: "/owner/pricing", label: "Pricing", icon: Settings },
    { href: "/owner/analytics", label: "Analytics", icon: LayoutDashboard },
    { href: "/owner/settings", label: "Settings", icon: Settings },
  ];

  const studentLinks: NavLink[] = [
    { href: "/student/upload", label: "Upload Print", icon: FileUp },
    { href: "/join/SCAN", label: "Scan & Join", icon: ScanLine },
    { href: "/student/orders", label: "Active Orders", icon: ShoppingCart },
    { href: "/student/history", label: "History", icon: History },
  ];

  const links: NavLink[] = user?.role === "owner" ? ownerLinks : studentLinks;
  const activeLabel = links.find((l) => l.href === location)?.label ?? "PickIT";

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-border">
          <img src={brandLogo} alt="PickIT" className="h-10 w-auto object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 flex items-center justify-between px-3">
        <div className="flex items-center gap-2 min-w-0">
          <img src={brandLogo} alt="PickIT" className="h-8 w-auto object-contain" />
          <span className="text-[13px] font-semibold text-slate-500 truncate">· {activeLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-slate-900 hover:bg-[#1a1f4d] text-white text-[13px] font-semibold shadow-[0_8px_20px_-8px_rgba(15,23,42,0.5)] transition-colors"
          aria-label="Open menu"
          data-testid="app-mobile-toggle"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl md:hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-b from-slate-50 to-white">
                <img src={brandLogo} alt="PickIT" className="h-9 w-auto object-contain" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {user && (
                <div className="px-5 py-3 border-b bg-slate-50/60">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Signed in as {user.role}
                  </p>
                  <p className="text-[14px] font-semibold text-slate-800 truncate">{user.email}</p>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t bg-slate-50/60">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl h-11"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  data-testid="mobile-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content — offset for fixed sidebar / mobile top bar */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
