import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customer_id: "", customer_name: "", items: [], tax_rate: 8, status: "pending", payment_status: "unpaid" });

  const load = async () => {
    try {
      const [o, p, c] = await Promise.all([
        api.get("/orders", { params: { search: q } }),
        api.get("/products"),
        api.get("/customers"),
      ]);
      setRows(o.data); setProducts(p.data); setCustomers(c.data);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { product_id: "", name: "", quantity: 1, price: 0 }] }));
  const updItem = (i, k, v) => setForm((f) => {
    const items = [...f.items];
    items[i] = { ...items[i], [k]: v };
    if (k === "product_id") {
      const p = products.find((pp) => pp.id === v);
      if (p) { items[i].name = p.name; items[i].price = p.price; }
    }
    return { ...f, items };
  });
  const rmItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const tax = subtotal * (Number(form.tax_rate) || 0) / 100;
  const total = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) { toast.error("Add at least one item"); return; }
    setBusy(true);
    try {
      const payload = {
        customer_id: form.customer_id || null,
        customer_name: form.customer_name,
        items: form.items.map((i) => ({ product_id: i.product_id, name: i.name, quantity: Number(i.quantity), price: Number(i.price) })),
        tax_rate: Number(form.tax_rate) || 0,
        status: form.status,
        payment_status: form.payment_status,
      };
      await api.post("/orders", payload);
      toast.success("Order created");
      setOpen(false);
      setForm({ customer_id: "", customer_name: "", items: [], tax_rate: 8, status: "pending", payment_status: "unpaid" });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const setStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, null, { params: { status } });
      toast.success("Status updated");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try { await api.delete(`/orders/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div data-testid="orders-page">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Sales</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Orders</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Search orders…" value={q} onChange={(e) => setQ(e.target.value)}
                   className="pl-9 rounded-sm border-neutral-300 h-10 w-64" data-testid="orders-search" />
          </div>
          <Button onClick={() => setOpen(true)} data-testid="orders-create-btn"
                  className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> New order
          </Button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr className="text-xs uppercase tracking-wider text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Order #</th>
              <th className="text-left font-medium">Customer</th>
              <th className="text-left font-medium">Items</th>
              <th className="text-right font-medium">Total</th>
              <th className="text-left font-medium">Status</th>
              <th className="text-left font-medium">Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="7" className="py-16 text-center text-neutral-400 text-sm">No orders yet</td></tr>}
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 mono text-xs">{o.order_number}</td>
                <td>{o.customer_name || "—"}</td>
                <td className="text-neutral-500 text-xs">{(o.items || []).length} item(s)</td>
                <td className="text-right mono">₹${(o.total || 0).toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                          data-testid={`orders-status-${o.id}`}
                          className="text-xs uppercase tracking-wider bg-transparent border border-neutral-300 rounded-sm px-2 py-1">
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
                <td><span className={`text-xs uppercase tracking-wider ${o.payment_status === "paid" ? "text-green-700" : "text-amber-700"}`}>{o.payment_status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(o.id)} data-testid={`orders-delete-${o.id}`} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">New order</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <select value={form.customer_id}
                        onChange={(e) => {
                          const c = customers.find((x) => x.id === e.target.value);
                          setForm((f) => ({ ...f, customer_id: e.target.value, customer_name: c?.name || "" }));
                        }}
                        data-testid="orders-customer-select"
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white">
                  <option value="">— Walk-in —</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Tax rate (%)</Label>
                <Input type="number" step="any" value={form.tax_rate}
                       onChange={(e) => setForm((f) => ({ ...f, tax_rate: e.target.value }))}
                       className="mt-1.5 rounded-sm" data-testid="orders-tax-input" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line items</Label>
                <Button type="button" variant="outline" onClick={addItem} className="rounded-sm h-8" data-testid="orders-add-item-btn">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add item
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {form.items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <select value={it.product_id} onChange={(e) => updItem(i, "product_id", e.target.value)}
                            className="col-span-6 border border-neutral-300 rounded-sm h-10 px-2 text-sm bg-white"
                            data-testid={`orders-item-product-${i}`} required>
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Input type="number" min="1" value={it.quantity} onChange={(e) => updItem(i, "quantity", e.target.value)}
                           className="col-span-2 rounded-sm" placeholder="Qty" />
                    <Input type="number" step="any" value={it.price} onChange={(e) => updItem(i, "price", e.target.value)}
                           className="col-span-3 rounded-sm" placeholder="Price" />
                    <button type="button" onClick={() => rmItem(i)} className="col-span-1 p-1.5 text-neutral-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {form.items.length === 0 && <div className="text-sm text-neutral-400 py-4 text-center border border-dashed border-neutral-300 rounded-sm">No items — click "Add item"</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label>Payment</Label>
                <select value={form.payment_status} onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-1 text-sm mono">
              <div className="flex justify-between"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-neutral-500"><span>Tax</span><span>₹${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-display text-xl font-bold pt-2"><span>Total</span><span>₹${total.toFixed(2)}</span></div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={busy} data-testid="orders-submit-btn"
                      className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
                {busy ? "Creating…" : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
