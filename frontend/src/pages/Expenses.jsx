import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ category: "", description: "", amount: 0, date: new Date().toISOString().slice(0, 10) });

  const load = async () => {
    try { const { data } = await api.get("/expenses"); setRows(data); }
    catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/expenses", { ...form, amount: Number(form.amount) });
      toast.success("Expense recorded");
      setOpen(false);
      setForm({ category: "", description: "", amount: 0, date: new Date().toISOString().slice(0, 10) });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete expense?")) return;
    try { await api.delete(`/expenses/${id}`); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div data-testid="expenses-page">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Finance</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Expenses</h1>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="expenses-create-btn"
                className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-10 px-4">
          <Plus className="w-4 h-4 mr-1.5" /> New expense
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 p-5 rounded-sm mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Total tracked</div>
        <div className="font-display text-4xl font-black tabular tracking-tight mt-2">${total.toFixed(2)}</div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr className="text-xs uppercase tracking-wider text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left font-medium">Category</th>
              <th className="text-left font-medium">Description</th>
              <th className="text-right font-medium">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5" className="py-16 text-center text-neutral-400 text-sm">No expenses yet</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 mono text-xs">{r.date}</td>
                <td>{r.category}</td>
                <td className="text-neutral-600">{r.description}</td>
                <td className="text-right mono">${(r.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(r.id)} data-testid={`expenses-delete-${r.id}`}
                          className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader><DialogTitle className="font-display text-2xl font-bold">New expense</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                     required className="mt-1.5 rounded-sm" data-testid="expenses-category-input" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                     required className="mt-1.5 rounded-sm" data-testid="expenses-description-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input type="number" step="any" value={form.amount}
                       onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                       required className="mt-1.5 rounded-sm" data-testid="expenses-amount-input" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                       className="mt-1.5 rounded-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={busy} data-testid="expenses-submit-btn"
                      className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
                {busy ? "Saving…" : "Record expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
