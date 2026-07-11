import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area, AreaChart, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";
import {
  DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle,
  ArrowRight, ArrowUpRight, Sparkles, Activity
} from "lucide-react";

const COLORS = ["#002FA7", "#111111", "#525252", "#A3A3A3", "#FFD700", "#059669", "#D97706"];

function AnimatedNumber({ value, prefix = "", decimals = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const from = 0, to = Number(value) || 0, dur = 900, t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular">{prefix}{n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}</span>;
}

function KPI({ icon: Icon, label, value, sub, tone = "default", spark, delta, index = 0, to }) {
  const Wrapper = to ? Link : "div";
  const props = to ? { to } : {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Wrapper {...props} className="block group bg-white border border-neutral-200 hover:border-neutral-900 p-5 rounded-sm transition-colors relative overflow-hidden cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          {label}
        </div>
        {delta != null && (
          <div className={`text-[10px] mono flex items-center gap-0.5 ${delta >= 0 ? "text-[#059669]" : "text-[#E53935]"}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className={`mt-3 font-display font-black text-3xl tracking-tighter ${tone === "brand" ? "text-[#002FA7]" : "text-neutral-900"}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
      {spark && (
        <div className="mt-3 -mx-2 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#002FA7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#002FA7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#002FA7" strokeWidth={1.5} fill={`url(#spark-${label})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      </Wrapper>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const fetch = () => api.get("/dashboard/overview").then((r) => { if (alive) setData(r.data); }).catch(() => alive && setData({ kpis: {} }));
    fetch();
    const id = setInterval(fetch, 15000);  // real-time-ish refresh
    return () => { alive = false; clearInterval(id); };
  }, []);

  const seedDemo = async () => {
    try {
      await api.post("/dev/seed");
      window.location.reload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("seed failed", e);
    }
  };

  if (!data) {
    return (
      <div className="grid grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-neutral-200 rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  const k = data.kpis || {};
  const fmt = (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const money = (n) => "₹" + (n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const spark = (data?.sales_series || []).map((s) => ({ v: s.revenue }));
  const orderSpark = (data?.sales_series || []).map((s) => ({ v: s.orders }));
  const isEmpty = (k.orders || 0) === 0 && (k.products || 0) === 0; 

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" data-testid="dashboard-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Overview
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Command center</h1>
        </div> 
        <div className="text-[10px] mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse" />
          LIVE · {new Date().toLocaleTimeString()}
        </div> 
      </div>

      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 text-white p-5 rounded-sm border border-neutral-900 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <div className="text-[10px] mono uppercase tracking-widest text-[#FFD700]">Welcome to BusinessFlow</div>
            <div className="font-display text-xl font-semibold mt-1">Your workspace is empty — load demo data to see it come alive.</div>
          </div>
          <button
            onClick={seedDemo}
            data-testid="dashboard-seed-btn"
            className="bg-[#FFD700] hover:bg-white text-neutral-900 px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Load demo data
          </button>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <KPI index={0} to="/app/reports" icon={DollarSign} label="Revenue" value={<AnimatedNumber value={k.revenue} prefix="₹" decimals={2} />}
             sub="From completed orders" tone="brand" spark={spark} delta={12} />
        <KPI index={1} to="/app/orders" icon={ShoppingCart} label="Orders" value={<AnimatedNumber value={k.orders} />}
             sub="All-time" spark={orderSpark} delta={8} />
        <KPI index={2} to="/app/customers" icon={Users} label="Customers" value={<AnimatedNumber value={k.customers} />} sub="Active accounts" delta={4} />
        <KPI index={3} to="/app/products" icon={Package} label="Products" value={<AnimatedNumber value={k.products} />} sub="In inventory" />
        <KPI index={4} to="/app/reports" icon={TrendingUp} label="Profit" value={<AnimatedNumber value={k.profit} prefix="₹" decimals={2} />}
             sub={`Expenses ${money(k.expenses)}`} tone="brand" />
        <KPI index={5} to="/app/employees" icon={Users} label="Employees" value={<AnimatedNumber value={k.employees} />} sub="On payroll" />
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-2 bg-neutral-900 text-white p-5 rounded-sm relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#002FA7] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFD700]">Focus of the day</div>
            <div className="mt-2 font-display text-2xl font-semibold leading-tight">
              {k.orders > 0 ? `Ship ${Math.min(3, Math.ceil(k.orders / 10))} orders and follow up with your top customer.` : "Load demo data to explore every module."}
            </div>
            <Link to="/app/orders" className="mt-4 inline-flex items-center gap-2 text-xs mono uppercase tracking-widest text-neutral-400 hover:text-white group/link">
              Open orders <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="md:col-span-2 bg-white border border-neutral-200 p-5 rounded-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Revenue · last 14 days</div>
              <div className="font-display text-xl font-semibold mt-1">Sales trend</div>
            </div>
            <Link to="/app/reports" className="text-xs text-[#002FA7] hover:underline flex items-center gap-1">
              Full report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales_series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#002FA7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#002FA7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#737373" }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#737373" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: "1px solid #111", background: "#fff" }} />
                <Area type="monotone" dataKey="revenue" stroke="#002FA7" strokeWidth={2} fill="url(#chartFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white border border-neutral-200 p-5 rounded-sm"
        >
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Products by category</div>
          <div className="font-display text-xl font-semibold mt-1 mb-2">Inventory mix</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.category_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={42} paddingAngle={2}>
                  {data.category_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: "1px solid #111", background: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="md:col-span-2 bg-white border border-neutral-200 p-5 rounded-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Orders · latest</div>
              <div className="font-display text-xl font-semibold mt-1">Recent activity</div>
            </div>
            <Link to="/app/orders" className="text-xs text-[#002FA7] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
                <th className="text-left py-2 font-medium">Order</th>
                <th className="text-left font-medium">Customer</th>
                <th className="text-right font-medium">Amount</th>
                <th className="text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders || []).map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 mono text-xs">{o.order_number}</td>
                  <td>{o.customer_name || "—"}</td>
                  <td className="text-right mono">₹{(o.total || 0).toFixed(2)}</td>
                  <td className="text-right">
                    <span className={`text-[10px] mono uppercase tracking-wider px-2 py-0.5 border ${
                      o.status === "completed" ? "text-[#059669] border-[#059669]/30 bg-[#059669]/5" :
                      o.status === "cancelled" ? "text-[#E53935] border-[#E53935]/30 bg-[#E53935]/5" :
                      "text-[#D97706] border-[#D97706]/30 bg-[#D97706]/5"
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {(!data.recent_orders || data.recent_orders.length === 0) && (
                <tr><td colSpan="4" className="py-12 text-center text-neutral-400 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white border border-neutral-200 p-5 rounded-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Attention</div>
              <div className="font-display font-semibold">Low stock</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {(data.low_stock || []).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2.5 last:border-0">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-neutral-500 mono">{p.sku}</div>
                </div>
                <div className="mono text-amber-700 font-bold text-lg tabular">{p.stock}</div>
              </li>
            ))}
            {(!data.low_stock || data.low_stock.length === 0) && (
              <li className="text-sm text-neutral-400 py-8 text-center">Nothing low — you're stocked.</li>
            )}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
