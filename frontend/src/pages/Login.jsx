import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@businessflow.io");
  const [password, setPassword] = useState("Admin@12345");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await login(email, password);
    setBusy(false);
    if (!r.ok) { setErr(r.error); toast.error(r.error); return; }
    toast.success("Welcome back");
    nav("/app");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex flex-col justify-between bg-neutral-900 text-white p-12 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black">B</div>
          <span className="font-display text-xl font-bold">BusinessFlow</span>
        </Link>
        <div className="z-10">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">Log in</div>
          <h1 className="font-display text-5xl font-black tracking-tighter leading-tight">
            Your workspace<br/>is waiting.
          </h1>
          <p className="mt-6 text-neutral-400 max-w-sm">Every order, every invoice, every low-stock alert — right where you left them.</p>
        </div>
        <div className="text-xs mono uppercase tracking-widest text-neutral-500 z-10">SECURE · JWT · BCRYPT</div>
        <div className="absolute inset-0 blueprint-grid opacity-20" />
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-neutral-500 mt-2 text-sm">Sign in to your BusinessFlow workspace.</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="mt-1.5 rounded-sm" data-testid="login-email-input" required />
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[#002FA7] hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                     className="mt-1.5 rounded-sm" data-testid="login-password-input" required />
            </div>
            {err && <div className="text-sm text-red-600" data-testid="login-error">{err}</div>}
            <Button type="submit" disabled={busy} data-testid="login-submit-btn"
                    className="w-full bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-11">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </div>
          <p className="text-sm text-neutral-500 mt-6">
            No account?{" "}
            <Link to="/register" className="text-[#002FA7] hover:underline" data-testid="login-to-register-link">Create one</Link>
          </p>
          <div className="mt-6 p-3 bg-neutral-50 border border-neutral-200 rounded-sm text-xs text-neutral-600 mono">
            Demo: admin@businessflow.io / Admin@12345
          </div>
        </form>
      </div>
    </div>
  );
}
