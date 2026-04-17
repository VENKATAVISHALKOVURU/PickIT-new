import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";
import { LayoutDashboard, ShoppingCart, QrCode, Settings, FileUp, History, LogOut, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (!user) {
    return null;
  }

  if (role && user.role !== role) {
    return null;
  }

  return <>{children}</>;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const ownerLinks = [
    { href: "/owner/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/owner/orders", label: "Orders", icon: ShoppingCart },
    { href: "/owner/qr", label: "QR Code", icon: QrCode },
    { href: "/owner/pricing", label: "Pricing", icon: Settings },
    { href: "/owner/analytics", label: "Analytics", icon: LayoutDashboard },
    { href: "/owner/settings", label: "Settings", icon: Settings },
  ];

  const studentLinks = [
    { href: "/student/upload", label: "Upload Print", icon: FileUp },
    { href: "/join/SCAN", label: "Scan & Join", icon: ScanLine },
    { href: "/student/orders", label: "Active Orders", icon: ShoppingCart },
    { href: "/student/history", label: "History", icon: History },
  ];

  const links = user?.role === "owner" ? ownerLinks : studentLinks;

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary tracking-tight">PickIT</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
