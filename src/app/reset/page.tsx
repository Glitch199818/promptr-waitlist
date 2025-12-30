"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "working" | "error" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const ensureRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        setStatus("error");
        setMessage("Recovery link is invalid or expired. Request a new one.");
      }
    };
    ensureRecoverySession();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!password || !confirm) {
      setStatus("error");
      setMessage("Enter and confirm your new password.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setStatus("working");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message || "Could not update password.");
      return;
    }

    setStatus("success");
    setMessage("Password updated. Redirecting to login...");
    setTimeout(() => router.replace("/login"), 1200);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur">
        <div className="mb-6 space-y-1">
          <p className="text-sm text-neutral-300">Reset password</p>
          <h1 className="text-2xl font-semibold text-white">Create a new password</h1>
          <p className="text-sm text-neutral-400">
            Choose a strong password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-neutral-200">
            <span className="mb-1 block">New password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm text-neutral-200">
            <span className="mb-1 block">Confirm password</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={status === "working"}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110 disabled:opacity-60"
            style={{ borderRadius: '0px' }}
          >
            {status === "working" ? "Updating..." : "Update password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-emerald-200" : "text-amber-200/90"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

