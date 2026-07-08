import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { money } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const [tab, setTab] = useState("received");
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState({ account_holder: "", upi_id: "", bank_name: "", account_number_last4: "", ifsc: "", pan: "", gstin: "", currency: "INR" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ invoice_id: "", customer_name: "", amount: 0, method: "upi", status: "received", note: "", payer_upi: "" });
  const [upiOpen, setUpiOpen] = useState(false);
  const [upi, setUpi] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const [p, i, s] = await Promise.all([
        api.get("/payments"), api.get("/invoices"), api.get("/payments/settings"),
      ]);
      setPayments(p.data); setInvoices(i.data); setSettings((prev) => ({ ...prev, ...s.data }));
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.put("/payments/settings", settings); toast.success("Payment details saved securely"); load(); }
    catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const inv = invoices.find((x) => x.id === form.invoice_id);
      await api.post("/payments", {
        ...form,
        amount: Number(form.amount),
        customer_name: form.customer_name || inv?.customer_name || "",
      });
      toast.success("Payment recorded"); setOpen(false);
      setForm({ invoice_id: "", customer_name: "", amount: 0, method: "upi", status: "received", note: "", payer_upi: "" });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try { await api.delete(`/payments/${id}`); load(); } catch (e) { toast.error(formatApiError(e)); }
  };

  const genUpiLink = async () => {
    const amount = window.prompt("Amount (₹)", "500");
    if (!amount) return;
    const customUpi = window.prompt("UPI ID (leave blank to use your saved one)", settings.upi_id || "");
    if (customUpi === null) return;
    try {
      const { data } = await api.get("/payments/upi-link", { params: { amount, note: "BusinessFlow payment", upi_id: customUpi } });
      setUpi(data); setUpiOpen(true);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const total = payments.filter((p) => p.status === "received").reduce((s, p) => s + p.amount, 0);
  const upd = (k) => (e) => setSettings((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div data-testid="payments-page">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Finance</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Payments</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={genUpiLink} className="rounded-sm border-neutral-300 h-10" data-testid="payments-upi-link-btn">Generate UPI link</Button>
          <Button onClick={() => setOpen(true)} data-testid="payments-record-btn"
                  className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-10 px-4">
            <Plus className="w-4 h-4 mr-1.5" /> Record payment
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Received (all-time)</div>
          <div className="font-display text-3xl font-black tabular text-[#002FA7] mt-2">{money(total)}</div>
        </div>
        <div className="bg-white border border-neutral-200 p-5 rounded-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Transactions</div>
          <div className="font-display text-3xl font-black tabular mt-2">{payments.length}</div>
        </div>
        <div className="bg-neutral-900 text-white p-5 rounded-sm flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#FFD700]" strokeWidth={1.5} />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Secure</div>
            <div className="text-sm mt-0.5">Only last-4 stored · UPI/PAN never exposed to customers</div>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-sm">
          <TabsTrigger value="received" data-testid="payments-tab-received" className="rounded-sm">Received</TabsTrigger>
          <TabsTrigger value="settings" data-testid="payments-tab-settings" className="rounded-sm">Payment details</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4">
          <div className="bg-white border border-neutral-200 rounded-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr className="text-xs uppercase tracking-wider text-neutral-500">
                  <th className="text-left px-4 py-3 font-medium">Ref</th>
                  <th className="text-left font-medium">Invoice</th>
                  <th className="text-left font-medium">Customer</th>
                  <th className="text-left font-medium">Method</th>
                  <th className="text-right font-medium">Amount</th>
                  <th className="text-left font-medium">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && <tr><td colSpan="7" className="py-16 text-center text-neutral-400 text-sm">No payments recorded yet</td></tr>}
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 mono text-xs">{p.reference}</td>
                    <td className="mono text-xs text-neutral-500">{p.invoice_number || "—"}</td>
                    <td>{p.customer_name || "—"}</td>
                    <td className="uppercase text-xs mono">{p.method}</td>
                    <td className="text-right mono font-semibold">{money(p.amount)}</td>
                    <td><span className={`text-xs uppercase tracking-wider ${p.status === "received" ? "text-green-700" : "text-amber-700"}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => del(p.id)} data-testid={`payments-delete-${p.id}`} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-sm">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <form onSubmit={saveSettings} className="bg-white border border-neutral-200 rounded-sm p-6 max-w-3xl">
            <div className="text-xs mono uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Owner receiving details · India
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Account holder name</Label><Input value={settings.account_holder} onChange={upd("account_holder")} className="mt-1.5 rounded-sm" data-testid="pay-settings-holder" /></div>
              <div><Label>UPI ID (VPA)</Label><Input value={settings.upi_id} onChange={upd("upi_id")} placeholder="yourname@okhdfcbank" className="mt-1.5 rounded-sm mono" data-testid="pay-settings-upi" /></div>
              <div><Label>Bank name</Label><Input value={settings.bank_name} onChange={upd("bank_name")} placeholder="HDFC Bank" className="mt-1.5 rounded-sm" data-testid="pay-settings-bank" /></div>
              <div><Label>Account number (only last 4 stored)</Label><Input value={settings.account_number_last4} onChange={upd("account_number_last4")} placeholder="XXXX" maxLength={4} className="mt-1.5 rounded-sm mono" data-testid="pay-settings-acct" /></div>
              <div><Label>IFSC code</Label><Input value={settings.ifsc} onChange={upd("ifsc")} placeholder="HDFC0001234" className="mt-1.5 rounded-sm mono uppercase" data-testid="pay-settings-ifsc" /></div>
              <div><Label>PAN</Label><Input value={settings.pan} onChange={upd("pan")} placeholder="ABCDE1234F" className="mt-1.5 rounded-sm mono uppercase" data-testid="pay-settings-pan" /></div>
              <div><Label>GSTIN</Label><Input value={settings.gstin} onChange={upd("gstin")} placeholder="22ABCDE1234F1Z5" className="mt-1.5 rounded-sm mono uppercase" data-testid="pay-settings-gstin" /></div>
              <div><Label>Currency</Label><Input value={settings.currency} onChange={upd("currency")} className="mt-1.5 rounded-sm" /></div>
            </div>
            <div className="text-xs text-neutral-500 mt-4 leading-relaxed">
              We only ever store the <strong>last 4 digits</strong> of your account number.
              Your UPI ID is used to generate secure payment links customers can pay from any UPI app (GPay, PhonePe, Paytm).
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={busy} data-testid="pay-settings-save-btn" className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
                {busy ? "Saving…" : "Save payment details"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader><DialogTitle className="font-display text-2xl font-bold">Record payment</DialogTitle></DialogHeader>
          <form onSubmit={recordPayment} className="space-y-4">
            <div>
              <Label>Against invoice (optional)</Label>
              <select value={form.invoice_id} onChange={(e) => setForm((f) => ({ ...f, invoice_id: e.target.value }))}
                      className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white" data-testid="payments-invoice-select">
                <option value="">— Standalone payment —</option>
                {invoices.map((i) => <option key={i.id} value={i.id}>{i.invoice_number} · {i.customer_name} · {money(i.total)}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Customer name</Label><Input value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} className="mt-1.5 rounded-sm" data-testid="payments-customer-input" /></div>
              <div><Label>Amount (₹)</Label><Input type="number" step="any" required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1.5 rounded-sm" data-testid="payments-amount-input" /></div>
              <div>
                <Label>Method</Label>
                <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white" data-testid="payments-method-select">
                  <option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Netbanking</option>
                  <option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="mt-1.5 w-full border border-neutral-300 rounded-sm h-10 px-3 text-sm bg-white">
                  <option value="received">Received</option><option value="pending">Pending</option>
                  <option value="failed">Failed</option><option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="col-span-2"><Label>Payer UPI / note</Label><Input value={form.payer_upi} onChange={(e) => setForm((f) => ({ ...f, payer_upi: e.target.value }))} placeholder="customer@upi" className="mt-1.5 rounded-sm mono" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={busy} data-testid="payments-submit-btn" className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">{busy ? "Saving…" : "Record payment"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={upiOpen} onOpenChange={setUpiOpen}>
        <DialogContent className="rounded-sm max-w-md" data-testid="upi-link-dialog">
          <DialogHeader><DialogTitle className="font-display text-2xl font-bold">UPI payment link</DialogTitle></DialogHeader>
          {upi && (
            <div className="space-y-4">
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                <div className="text-xs uppercase tracking-widest text-neutral-500">Amount</div>
                <div className="font-display text-3xl font-black tabular">{money(upi.amount)}</div>
                <div className="text-xs text-neutral-500 mt-2">to <span className="mono">{upi.payee}</span></div>
              </div>
              <img alt="UPI QR" className="w-full border border-neutral-200 rounded-sm"
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upi.upi_link)}`} />
              <div className="flex gap-2">
                <Input readOnly value={upi.upi_link} className="mono text-xs rounded-sm" />
                <Button type="button" onClick={() => { navigator.clipboard.writeText(upi.upi_link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-xs text-neutral-500">Share this QR / link — customers can pay via any UPI app (GPay, PhonePe, Paytm, BHIM).</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
