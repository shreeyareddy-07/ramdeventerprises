import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText, UserCog,
  Truck, Receipt, BarChart3, Building2, Search, LogOut, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import GlobalSearch from "@/components/GlobalSearch";

const NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/products", icon: Package, label: "Products" },
  { to: "/app/customers", icon: Users, label: "Customers" },
  { to: "/app/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/app/invoices", icon: FileText, label: "Invoices" },
  { to: "/app/employees", icon: UserCog, label: "Employees" },
  { to: "/app/suppliers", icon: Truck, label: "Suppliers" },
  { to: "/app/expenses", icon: Receipt, label: "Expenses" },
  { to: "/app/reports", icon: BarChart3, label: "Reports" },
  { to: "/app/business", icon: Building2, label: "Business" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = useNavigate();

  const seedDemo = async () => {
    try {
      await api.post("/dev/seed");
      toast.success("Demo data loaded", { description: "Refreshing your workspace…" });
      setTimeout(() => window.location.reload(), 700);
    } catch (e) {
      toast.error("Could not load demo data");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F5F0]">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col fixed inset-y-0 left-0 z-30" data-testid="sidebar">
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black text-lg">B</div>
          <span className="font-display text-xl font-bold tracking-tight">BusinessFlow</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`sidebar-link-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-sm ${
                  isActive
                    ? "bg-[#002FA7] text-white"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-4 h-4" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={seedDemo}
            data-testid="seed-demo-btn"
            className="w-full flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" /> Load demo data
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#FFD700] text-neutral-900 flex items-center justify-center font-bold">
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-neutral-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={async () => { await logout(); nav("/login"); }}
              data-testid="logout-btn"
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-20 flex items-center px-6 md:px-8 gap-4" data-testid="topbar">
          <Button
            variant="outline"
            className="text-neutral-500 justify-between rounded-sm border-neutral-300 w-72 h-9"
            onClick={() => setSearchOpen(true)}
            data-testid="global-search-trigger"
          >
            <span className="flex items-center gap-2 text-sm"><Search className="w-4 h-4" /> Search anything…</span>
            <kbd className="text-xs bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 mono">⌘K</kbd>
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:inline text-xs uppercase tracking-[0.2em] text-neutral-500">
              {user?.business_name || "Workspace"}
            </span>
          </div>
        </header>
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
