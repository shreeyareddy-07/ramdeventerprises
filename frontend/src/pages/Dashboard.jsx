import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

const COLORS = ["#002FA7", "#111111", "#525252", "#A3A3A3", "#FFD700", "#059669", "#D97706"];

function KPI({ icon: Icon, label, value, sub, tone = "default" }) {
  return (
    <div className="bg-white border border-neutral-200 p-5 rounded-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        <Icon className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
      </div>
      <div className={`mt-3 font-display font-black text-3xl tabular tracking-tight ${tone === "brand" ? "text-[#002FA7]" : "text-neutral-900"}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/overview").then((r) => setData(r.data)).catch(() => setData({ kpis: {} }));
  }, []);

  if (!data) return <div className="text-sm text-neutral-500">Loading dashboard…</div>;

  const k = data.kpis || {};
  const fmt = (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const money = (n) => "$" + (n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Overview</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Command center</h1>
        </div>
        <div className="text-xs mono text-neutral-500">LIVE · {new Date().toLocaleString()}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <KPI icon={DollarSign} label="Revenue" value={money(k.revenue)} sub="From completed orders" tone="brand" />
        <KPI icon={ShoppingCart} label="Orders" value={fmt(k.orders)} sub="All-time" />
        <KPI icon={Users} label="Customers" value={fmt(k.customers)} sub="Active accounts" />
        <KPI icon={Package} label="Products" value={fmt(k.products)} sub="In inventory" />
        <KPI icon={TrendingUp} label="Profit" value={money(k.profit)} sub={`Expenses ${money(k.expenses)}`} tone="brand" />
        <KPI icon={Users} label="Employees" value={fmt(k.employees)} sub="On payroll" />
        <div className="bg-neutral-900 text-white p-5 rounded-sm md:col-span-2">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Next step</div>
          <div className="mt-2 font-display text-xl font-semibold">Load demo data to see BusinessFlow in action.</div>
          <div className="text-xs text-neutral-400 mt-2">Click "Load demo data" in the sidebar to populate your workspace.</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Revenue — Last 14 days</div>
              <div className="font-display text-xl font-semibold mt-1">Sales trend</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sales_series} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#737373" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "#737373" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2 }} />
                <Line type="monotone" dataKey="revenue" stroke="#002FA7" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Products by category</div>
          <div className="font-display text-xl font-semibold mt-1 mb-2">Mix</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.category_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {data.category_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Orders</div>
              <div className="font-display text-xl font-semibold mt-1">Recent activity</div>
            </div>
            <Link to="/app/orders" className="text-xs text-[#002FA7] hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <th className="text-left py-2 font-medium">Order</th>
                <th className="text-left font-medium">Customer</th>
                <th className="text-right font-medium">Amount</th>
                <th className="text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders || []).map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-2 mono text-xs">{o.order_number}</td>
                  <td>{o.customer_name || "—"}</td>
                  <td className="text-right mono">${(o.total || 0).toFixed(2)}</td>
                  <td className="text-right">
                    <span className={`text-xs uppercase tracking-wider ${
                      o.status === "completed" ? "text-green-700" :
                      o.status === "cancelled" ? "text-red-600" : "text-amber-700"
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {(!data.recent_orders || data.recent_orders.length === 0) && (
                <tr><td colSpan="4" className="py-8 text-center text-neutral-400 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Low stock alerts</div>
          </div>
          <ul className="space-y-2">
            {(data.low_stock || []).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-neutral-500 mono">{p.sku}</div>
                </div>
                <div className="mono text-amber-700 font-semibold">{p.stock}</div>
              </li>
            ))}
            {(!data.low_stock || data.low_stock.length === 0) && (
              <li className="text-sm text-neutral-400 py-8 text-center">All good — nothing low.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
