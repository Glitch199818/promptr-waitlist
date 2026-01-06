 "use client";

import { FormEvent, useMemo, useState } from "react";

const features = [
  {
    title: "Save as you prompt",
    desc: "No tab switching. No copy-paste. Capture prompts naturally while working inside AI tools.",
    icon: "⤓",
  },
  {
    title: "Right where you need them",
    desc: "Access your prompt library while working in ChatGPT, Claude, Gemini, and other AI tools — without breaking your flow.",
    icon: "◎",
  },
  {
    title: "Tool-aware by default",
    desc: "Automatically keeps track of where each prompt works best.",
    icon: "☰",
  },
  {
    title: "Organize effortlessly",
    desc: "Names, folders, search, and filters. Your prompts stay tidy as your library grows.",
    icon: "▤",
  },
  {
    title: "Built for reuse",
    desc: "Use variable templates to adapt the same prompts for different clients, products, or teams — without rewriting everything.",
    icon: "⟲",
  },
  {
    title: "Ready for teams",
    desc: "Versioning and shared libraries make collaboration simple. Promptr grows with you — from solo work to team workflows.",
    icon: "⋄",
  },
];

export default function WaitlistClient() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return /\S+@\S+\.\S+/.test(email.trim());
  }, [email]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isEmailValid || submitting) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.code === "duplicate") {
          setSuccessMsg("You're already on the waitlist. We'll keep you posted!");
        } else {
          setErrorMsg(data?.error || "Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      setSuccessMsg("You're in! We'll notify you when Promptr is live.");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0c10] text-neutral-50 relative overflow-hidden">
      {/* Grain + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 15%, rgba(255,255,255,0.12), transparent 35%), radial-gradient(circle at 80% 5%, rgba(140,140,180,0.1), transparent 35%), radial-gradient(circle at 20% 10%, rgba(120,120,140,0.12), transparent 38%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Cpath fill=%22%23000%22 fill-opacity=%220.3%22 d=%22M0 0h1v1H0z%22/%3E%3C/svg%3E')",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 sm:py-20 lg:py-24 relative">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-white via-neutral-400 to-neutral-700 shadow-md" />
            <span className="text-lg font-semibold">Promptr</span>
          </div>
          <nav className="flex-1 flex items-center justify-center gap-6 text-sm">
            <a href="#features" className="text-neutral-300 hover:text-white transition">
              Feature
            </a>
            <a href="#how-it-works" className="text-neutral-300 hover:text-white transition">
              How it works
            </a>
            <a href="#faq" className="text-neutral-300 hover:text-white transition">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <a
              href="#"
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-sm text-white hover:bg-white/10"
              aria-label="X"
            >
              X
            </a>
            <a
              href="#waitlist"
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Get started
            </a>
          </div>
        </header>
        <div className="mb-8 h-px w-full bg-white/10" />

        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-4">

          <div className="relative">
            <div className="absolute -inset-x-24 -inset-y-12 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(180,180,200,0.18),transparent_55%)] blur-3xl" />
            <div className="relative inline-flex items-center gap-2 rounded-md bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-200 shadow-sm ring-1 ring-white/10">
              Coming soon
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1
              className="text-4xl font-medium tracking-tight sm:text-5xl"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Your AI snippets. Always within reach.
            </h1>
            <p className="text-lg text-neutral-300 sm:text-xl">
              Promptr lets you save, organize, and instantly reuse your best AI snippets across every tool you use.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl space-y-2 rounded-2xl bg-white/5 px-4 py-3 shadow-[0_25px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur sm:h-[75px]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-neutral-50 placeholder:text-neutral-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                required
              />
              <button
                type="submit"
                disabled={!isEmailValid || submitting}
                className="inline-flex h-[48px] min-w-[120px] items-center justify-center rounded-xl border border-white bg-white px-6 text-sm font-semibold text-black shadow-[0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_0px_0px_rgba(0,0,0,0),0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition hover:shadow-[0_15px_60px_-20px_rgba(161,161,161,0.55)] focus:outline-none focus:ring-2 focus:ring-[#a1a1a1]/50 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {submitting ? "Joining..." : "Join waitlist"}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-medium text-red-300 text-left px-1">{errorMsg}</p>
            )}
            {!successMsg && !errorMsg && (
              <p className="text-xs text-neutral-400 text-left px-1 invisible">No spam. Early access only.</p>
            )}
          </form>
          <div className="space-y-0 text-center text-xl text-neutral-300">
            <div className="h-8 flex items-center justify-center">
              {successMsg && (
                <div className="text-emerald-300">Congratulations! You're in!</div>
              )}
            </div>
            <div>Works with ChatGPT, Claude, Gemini, and more!</div>
            <div className="invisible">Built for people who use AI every day</div>
          </div>

          {/* Mockup image */}
          <div className="relative w-full max-w-5xl">
            <div className="absolute inset-0 -z-10 translate-y-6 scale-95 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_50%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/8 via-white/4 to-transparent shadow-[0_35px_160px_-70px_rgba(0,0,0,0.85)] backdrop-blur aspect-[16/9]">
              <div
                className="absolute bottom-0 right-0 h-full w-full bg-center bg-cover"
                style={{
                  backgroundImage: "url('/waitlist-hero.png')",
                }}
                aria-label="Laptop screen showing Promptr prompt-saving experience"
              />
              <div
                className="absolute bottom-0 right-0 h-[85%] w-full bg-gradient-to-t from-black/35 via-transparent to-transparent"
                style={{ color: "rgba(242, 242, 242, 1)" }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="mt-1 flex items-center justify-center gap-3 text-sm text-neutral-200">
            <div className="flex -space-x-2 invisible">
              <img className="h-8 w-8 rounded-full border border-white/10 bg-neutral-800 object-cover" src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60" alt="Member avatar 1" loading="lazy" />
              <img className="h-8 w-8 rounded-full border border-white/10 bg-neutral-800 object-cover" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60" alt="Member avatar 2" loading="lazy" />
              <img className="h-8 w-8 rounded-full border border-white/10 bg-neutral-800 object-cover" src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=60" alt="Member avatar 3" loading="lazy" />
              <img className="h-8 w-8 rounded-full border border-white/10 bg-neutral-800 object-cover" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60" alt="Member avatar 4" loading="lazy" />
            </div>
            <span className="text-neutral-300 invisible">4.5k people signed up</span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-100 text-center mt-0">Built for your workflow</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_0_rgba(0,0,0,0),0_0_0_0_rgba(0,0,0,0),0_0_0_0_rgba(0,0,0,0),0_0_0_0_rgba(0,0,0,0),0_20px_70px_-50px_rgba(0,0,0,0.8)] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20"
                style={{ color: "rgba(250, 250, 250, 1)" }}
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-[14px] font-semibold text-white shadow-sm">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <p className="text-sm text-neutral-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-100 text-center mt-0">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Save", desc: "Capture prompts directly while you work. No context switching." },
              { title: "Organize", desc: "Use names, folders, tags, and versions to stay tidy." },
              { title: "Insert", desc: "Drop prompts into ChatGPT, Claude, or Gemini without leaving the page." },
            ].map((step, idx) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_-32px_rgba(0,0,0,0.8)] flex flex-col gap-2"
              >
                <span className="text-xs font-semibold text-neutral-400">Step {idx + 1}</span>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-sm text-neutral-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-100 text-center mt-0">FAQ</h2>
          <div className="space-y-2">
            {[
              { q: "What is Promptr?", a: "A prompt OS to save, organize, and insert prompts across AI tools." },
              { q: "How do I join the waitlist?", a: "Enter your email above and click “Join waitlist.”" },
              { q: "Which tools are supported?", a: "Works with ChatGPT, Claude, and Gemini, with more coming soon." },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{item.q}</p>
                <p className="text-sm text-neutral-300 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

