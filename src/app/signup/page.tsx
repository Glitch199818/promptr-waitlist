"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "sending" | "error" | "success";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const emailValue = email.trim();
    const passwordValue = password;

    if (!emailValue || !passwordValue) {
      setStatus("error");
      setMessage("Please enter email and password.");
      return;
    }

    setStatus("sending");

    const { data, error } = await supabase.auth.signUp({
      email: emailValue,
      password: passwordValue,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Sign up failed. Try again.");
      return;
    }

    if (data.session) {
      router.replace("/memories");
      return;
    }

    setStatus("success");
    setMessage("Check your email to confirm your account.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur">
        <div className="mb-6 space-y-1">
          <p className="text-sm text-neutral-300">Get started</p>
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-neutral-400">
            Save, share, and collaborate on prompts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-neutral-200">
            <span className="mb-1 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm text-neutral-200">
            <span className="mb-1 block">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110 disabled:opacity-60"
            style={{ borderRadius: '0px' }}
          >
            {status === "sending" ? "Creating account..." : "Create account"}
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

        <p className="mt-6 text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="text-neutral-100 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

