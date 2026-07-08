import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Package, Users, ShoppingCart, FileText, UserCog,
  Truck, Receipt, BarChart3, Building2, Search, LogOut, Sparkles, ChevronRight, IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import GlobalSearch from "@/components/GlobalSearch";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard", end: true, group: "workspace" },
  { to: "/app/products", icon: Package, label: "Products", group: "workspace" },
  { to: "/app/customers", icon: Users, label: "Customers", group: "workspace" },
  { to: "/app/orders", icon: ShoppingCart, label: "Orders", group: "workspace" },
  { to: "/app/invoices", icon: FileText, label: "Invoices", group: "workspace" },
  { to: "/app/employees", icon: UserCog, label: "Employees", group: "operations" },
  { to: "/app/suppliers", icon: Truck, label: "Suppliers", group: "operations" },
  { to: "/app/expenses", icon: Receipt, label: "Expenses", group: "operations" },
  { to: "/app/payments", icon: IndianRupee, label: "Payments", group: "operations" },
  { to: "/app/reports", icon: BarChart3, label: "Reports", group: "insights" },
  { to: "/app/business", icon: Building2, label: "Business", group: "insights" },
];

const GROUP_LABELS = { workspace: "Workspace", operations: "Operations", insights: "Insights" };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const seedDemo = async () => {
    try {
      await api.post("/dev/seed");
      toast.success("Demo data loaded", { description: "Refreshing your workspace…" });
      setTimeout(() => window.location.reload(), 600);
    } catch { toast.error("Could not load demo data"); }
  };

  const currentPage = NAV.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== "/app");
  const activePage = currentPage || NAV[0];

  const grouped = NAV.reduce((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex bg-[#F5F5F0]">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col fixed inset-y-0 left-0 z-30" data-testid="sidebar">
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black text-lg">B</div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight leading-none">BusinessFlow</div>
            <div className="text-[9px] mono uppercase tracking-widest text-neutral-500 mt-0.5">v1.0 · workspace</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {Object.keys(grouped).map((g) => (
            <div key={g} className="mb-4">
              <div className="text-[9px] mono uppercase tracking-widest text-neutral-500 px-3 mb-1.5">{GROUP_LABELS[g]}</div>
              <div className="space-y-0.5">
                {grouped[g].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    data-testid={`sidebar-link-${item.label.toLowerCase()}`}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-sm group ${
                        isActive
                          ? "bg-white text-neutral-900 font-medium"
                          : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD700]" />}
                        <item.icon className="w-4 h-4" strokeWidth={1.75} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3" strokeWidth={2} />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={seedDemo}
            data-testid="seed-demo-btn"
            className="w-full flex items-center gap-2 text-xs text-neutral-400 hover:text-[#FFD700] transition-colors mb-4 group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            Load demo data
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#FFD700] text-neutral-900 flex items-center justify-center font-display font-bold">
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-[10px] text-neutral-500 mono uppercase tracking-widest truncate">{user?.role?.replace("_", " ")}</div>
            </div>
            <button
              onClick={async () => { await logout(); nav("/login"); }}
              data-testid="logout-btn"
              className="p-1.5 text-neutral-400 hover:text-[#E53935] hover:bg-neutral-800 rounded-sm transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white/85 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-20 flex items-center px-6 md:px-8 gap-4" data-testid="topbar">
          <div className="hidden md:flex items-center gap-2 text-xs mono uppercase tracking-widest text-neutral-500">
            <span>BusinessFlow</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-900">{activePage.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="outline"
              className="text-neutral-500 justify-between rounded-sm border-neutral-300 hover:border-neutral-900 hover:text-neutral-900 transition-colors w-72 h-9"
              onClick={() => setSearchOpen(true)}
              data-testid="global-search-trigger"
            >
              <span className="flex items-center gap-2 text-sm"><Search className="w-4 h-4" /> Search anything…</span>
              <kbd className="text-[10px] bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 mono">⌘K</kbd>
            </Button>
            <div className="hidden md:flex items-center gap-2 text-xs px-3 h-9 border border-neutral-200 bg-white">
              <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse" />
              <span className="mono uppercase tracking-widest text-neutral-500">{user?.business_name || "Workspace"}</span>
            </div>
          </div>
        </header>
        <main className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
