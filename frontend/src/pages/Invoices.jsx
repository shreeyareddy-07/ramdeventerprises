import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customer_name: "", amount: 0, tax: 0, status: "draft", due_date: "" });

  const load = async () => {
    try { const { data } = await api.get("/invoices", { params: { search: q } }); setRows(data); }
    catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/invoices", { ...form, amount: Number(form.amount), tax: Number(form.tax) });
      toast.success("Invoice created");
      setOpen(false);
      setForm({ customer_name: "", amount: 0, tax: 0, status: "draft", due_date: "" });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const setStatus = async (id, status) => {
    try { await api.put(`/invoices/${id}/status`, null, { params: { status } }); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete invoice?")) return;
    try { await api.delete(`/invoices/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid="invoices-page">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Billing</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Invoices</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search invoices…" value={q} onChange={(e) => setQ(e.target.value)}
                   className="pl-9 rounded-sm border-neutral-300 h-10 w-64" data-testid="invoices-search" />
          </div>
          <Button onClick={() => setOpen(true)} data-testid="invoices-create-btn"
                  className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> New invoice
          </Button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr className="text-xs uppercase tracking-wider text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Invoice #</th>
              <th className="text-left font-medium">Customer</th>
              <th className="text-right font-medium">Amount</th>
              <th className="text-right font-medium">Tax</th>
              <th className="text-right font-medium">Total</th>
              <th className="text-left font-medium">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="7" className="py-16 text-center text-neutral-400 text-sm">No invoices yet</td></tr>}
            {rows.map((inv) => (
              <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 mono text-xs">{inv.invoice_number}</td>
                <td>{inv.customer_name}</td>
                <td className="text-right mono">${(inv.amount || 0).toFixed(2)}</td>
                <td className="text-right mono text-neutral-500">${(inv.tax || 0).toFixed(2)}</td>
                <td className="text-right mono font-semibold">${(inv.total || 0).toFixed(2)}</td>
                <td>
                  <select value={inv.status} onChange={(e) => setStatus(inv.id, e.target.value)}
                          data-testid={`invoices-status-${inv.id}`}
                          className="text-xs uppercase tracking-wider bg-transparent border border-neutral-300 rounded-sm px-2 py-1">
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(inv.id)} data-testid={`invoices-delete-${inv.id}`}
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
        <DialogContent className="rounded-sm max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-2xl font-bold">New invoice</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Customer name</Label>
              <Input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                     required className="mt-1.5 rounded-sm" data-testid="invoices-customer-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input type="number" step="any" value={form.amount}
                       onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                       required className="mt-1.5 rounded-sm" data-testid="invoices-amount-input" />
              </div>
              <div>
                <Label>Tax</Label>
                <Input type="number" step="any" value={form.tax}
                       onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
                       className="mt-1.5 rounded-sm" data-testid="invoices-tax-input" />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                       className="mt-1.5 rounded-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={busy} data-testid="invoices-submit-btn"
                      className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
                {busy ? "Creating…" : "Create invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
