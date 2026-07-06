import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["#002FA7", "#111111", "#525252", "#A3A3A3", "#FFD700"];

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/overview").then((r) => setData(r.data));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [["Date", "Revenue", "Orders"], ...data.sales_series.map((r) => [r.date, r.revenue, r.orders])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `businessflow-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!data) return <div className="text-sm text-neutral-500">Loading reports…</div>;

  const kpi = data.kpis || {};

  return (
    <div data-testid="reports-page">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Analytics</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Reports</h1>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-sm border-neutral-300 h-10" data-testid="reports-export-btn">
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {[
          { label: "Revenue", value: `$${(kpi.revenue||0).toFixed(2)}` },
          { label: "Profit", value: `$${(kpi.profit||0).toFixed(2)}` },
          { label: "Expenses", value: `$${(kpi.expenses||0).toFixed(2)}` },
          { label: "Orders", value: kpi.orders || 0 },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-neutral-200 p-5 rounded-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{c.label}</div>
            <div className="font-display text-3xl font-black tabular mt-2">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Sales — 14 days</div>
          <div className="font-display text-xl font-semibold mt-1 mb-4">Daily revenue</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales_series}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#737373" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "#737373" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2 }} />
                <Bar dataKey="revenue" fill="#002FA7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Inventory</div>
          <div className="font-display text-xl font-semibold mt-1 mb-4">Products by category</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.category_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {data.category_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
