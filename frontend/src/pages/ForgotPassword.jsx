import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Check the backend logs for your reset link");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-6">
      <div className="w-full max-w-sm bg-white p-8 border border-neutral-200">
        <Link to="/" className="text-xs mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900">← BusinessFlow</Link>
        <h2 className="font-display text-3xl font-bold tracking-tight mt-6">Reset password</h2>
        <p className="text-neutral-500 mt-2 text-sm mb-6">Enter your email — we'll send a reset link.</p>
        {sent ? (
          <div className="text-sm text-neutral-700 border border-neutral-200 p-4 bg-neutral-50">
            If an account exists for <span className="mono">{email}</span>, a reset link was generated. (Check backend logs in dev.)
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="mt-1.5 rounded-sm" required data-testid="forgot-email-input" />
            </div>
            <Button type="submit" disabled={busy} data-testid="forgot-submit-btn"
                    className="w-full bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-11">
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <Link to="/login" className="block mt-6 text-sm text-[#002FA7] hover:underline">← Back to login</Link>
      </div>
    </div>
  );
}
