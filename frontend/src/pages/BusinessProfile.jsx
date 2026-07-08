import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BusinessProfile() {
  const [form, setForm] = useState({ business_name: "", industry: "", email: "", phone: "", address: "", tax_id: "", currency: "USD", logo_url: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/business/profile")
      .then((r) => setForm((prev) => ({ ...prev, ...r.data })))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/business/profile", form);
      toast.success("Business profile saved");
      const { data } = await api.get("/business/profile");
      setForm((f) => ({ ...f, ...data }));
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div data-testid="business-profile-page">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Settings</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Business profile</h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-neutral-200 rounded-sm p-6 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Business name</Label>
            <Input value={form.business_name} onChange={upd("business_name")} className="mt-1.5 rounded-sm"
                   data-testid="business-name-input" />
          </div>
          <div>
            <Label>Industry</Label>
            <Input value={form.industry} onChange={upd("industry")} className="mt-1.5 rounded-sm"
                   placeholder="Retail, Cafe, Clinic…" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={upd("email")} className="mt-1.5 rounded-sm" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={upd("phone")} className="mt-1.5 rounded-sm" />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={upd("address")} className="mt-1.5 rounded-sm" />
          </div>
          <div>
            <Label>Tax ID</Label>
            <Input value={form.tax_id} onChange={upd("tax_id")} className="mt-1.5 rounded-sm" />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value={form.currency} onChange={upd("currency")} className="mt-1.5 rounded-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={busy} data-testid="business-save-btn"
                  className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm">
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
