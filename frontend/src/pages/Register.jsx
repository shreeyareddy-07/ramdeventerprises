import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", business_name: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await register(form);
    setBusy(false);
    if (!r.ok) { setErr(r.error); toast.error(r.error); return; }
    toast.success("Workspace created");
    nav("/app");
  };

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex flex-col justify-between bg-neutral-900 text-white p-12 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black">B</div>
          <span className="font-display text-xl font-bold">BusinessFlow</span>
        </Link>
        <div className="z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">Get started</div>
          <h1 className="font-display text-5xl font-black tracking-tighter leading-tight">
            Ninety seconds<br/>to a full ERP.
          </h1>
          <p className="mt-6 text-neutral-400 max-w-sm">Create your workspace, load demo data, and start running the business.</p>
        </div>
        <div className="text-xs mono uppercase tracking-widest text-neutral-500 z-10">FREE FOREVER · UPGRADE ANYTIME</div>
        <div className="absolute inset-0 blueprint-grid opacity-20" />
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="register-form">
          <h2 className="font-display text-3xl font-bold tracking-tight">Create your workspace</h2>
          <p className="text-neutral-500 mt-2 text-sm mb-8">No credit card required.</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={upd("name")}
                     className="mt-1.5 rounded-sm" data-testid="register-name-input" required />
            </div>
            <div>
              <Label htmlFor="business">Business name</Label>
              <Input id="business" value={form.business_name} onChange={upd("business_name")}
                     className="mt-1.5 rounded-sm" data-testid="register-business-input" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={upd("email")}
                     className="mt-1.5 rounded-sm" data-testid="register-email-input" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={upd("password")}
                     className="mt-1.5 rounded-sm" data-testid="register-password-input" minLength={6} required />
            </div>
            {err && <div className="text-sm text-red-600" data-testid="register-error">{err}</div>}
            <Button type="submit" disabled={busy} data-testid="register-submit-btn"
                    className="w-full bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-11">
              {busy ? "Creating workspace…" : "Create workspace"}
            </Button>
          </div>
          <p className="text-sm text-neutral-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#002FA7] hover:underline" data-testid="register-to-login-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
