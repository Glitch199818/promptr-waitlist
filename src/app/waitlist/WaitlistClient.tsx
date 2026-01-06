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

const faqs = [
  {
    q: "What is Promptr?",
    a: "Promptr is a lightweight prompt library that helps you save, organize, and reuse your best AI snippets across the tools you use every day.",
  },
  {
    q: "How do I join the waitlist?",
    a: "Enter your email above and click “Join waitlist.” We’ll notify you as soon as Promptr is ready.",
  },
  {
    q: "Which AI tools will it work with?",
    a: "We’re building for the tools people actually use: ChatGPT, Claude, Gemini, and more—without breaking your workflow.",
  },
  {
    q: "Will Promptr be free?",
    a: "We’ll have a simple plan for individuals, with options for heavier usage and teams. Join the waitlist to get early access and launch details.",
  },
];

export default function WaitlistClient() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [howItWorksVideoError, setHowItWorksVideoError] = useState(false);

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

      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:gap-12 lg:gap-14 px-6 py-16 sm:py-20 lg:py-24 relative">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.ico.png"
              alt="Promptr logo"
              className="h-9 w-9 rounded-lg shadow-md"
              loading="eager"
              decoding="async"
            />
            <span className="text-lg font-semibold">Promptr</span>
          </div>
          <nav className="flex-1 flex items-center justify-center gap-6 text-sm">
            <a href="#features" className="text-neutral-300 hover:text-white transition">
              Features
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
              href="https://x.com/3D_Pointer"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-sm text-white hover:bg-white/10"
              aria-label="Promptr on X"
              title="Promptr on X"
            >
              X
            </a>
          </div>
        </header>
        <div className="mb-5 h-px w-full bg-white/10" />

        {/* Hero */}
        <section id="waitlist" className="flex flex-col items-center text-center gap-5 sm:gap-6">

          <div className="relative">
            <div className="absolute -inset-x-24 -inset-y-12 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(180,180,200,0.18),transparent_55%)] blur-3xl" />
            <div className="relative inline-flex items-center gap-2 rounded-full bg-white/6 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-100 shadow-sm ring-1 ring-white/12 backdrop-blur">
              Coming soon
            </div>
          </div>

          <div className="relative w-full max-w-5xl px-2">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl" />
            <div className="space-y-4 sm:space-y-5">
              <h1
                className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Your AI snippets. Always within reach.
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-neutral-300 sm:text-xl">
                Promptr lets you save, organize, and instantly reuse your best AI snippets across every tool you use.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl space-y-2 rounded-3xl border border-white/12 bg-white/8 px-4 py-3 shadow-[0_24px_120px_-70px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl sm:px-5 sm:py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-[50px] flex-1 rounded-2xl border border-white/12 bg-white/5 px-4 text-neutral-50 placeholder:text-neutral-500 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
              <button
                type="submit"
                disabled={!isEmailValid || submitting}
                className="inline-flex h-[50px] min-w-[140px] items-center justify-center rounded-2xl border border-white/70 bg-white px-7 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.35)] transition hover:shadow-[0_18px_60px_-25px_rgba(255,255,255,0.5)] focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {submitting ? "Joining..." : "Join waitlist"}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-medium text-red-300 text-left px-1">{errorMsg}</p>
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
          <div className="text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 mt-0">How it works</h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-neutral-300">
              A tight loop for better prompts: capture → refine → reuse. Built to keep you in flow.
            </p>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 80% 20%, rgba(160,160,210,0.16), transparent 42%), radial-gradient(circle at 50% 90%, rgba(120,120,160,0.10), transparent 45%)",
              }}
            />

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-[0_35px_160px_-70px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="relative overflow-hidden rounded-2xl bg-black/30">
                {/* Place your demo video at: web/public/how-it-works.mp4 */}
                {!howItWorksVideoError ? (
                  <video
                    className="block w-full aspect-video"
                    src="/how-it-works.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setHowItWorksVideoError(true)}
                  />
                ) : (
                  <div className="aspect-video w-full grid place-items-center px-6 text-center">
                    <div className="max-w-xl">
                      <p className="text-sm font-semibold text-white">Demo video not found</p>
                      <p className="mt-1 text-sm text-neutral-300">
                        Add <span className="font-semibold text-white">how-it-works.mp4</span> to{" "}
                        <span className="font-semibold text-white">web/public</span> to show the How it works video.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ (accordion) */}
        <section id="faq" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 mt-0">FAQ</h2>
          </div>

          <div className="mx-auto w-full max-w-3xl space-y-2">
            {faqs.map((item, idx) => {
              const open = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
                >
                  <button
                    type="button"
                    className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left"
                    onClick={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${idx}`}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {item.q}
                    </span>
                    <span
                      className={[
                        "h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white transition",
                        open ? "rotate-45 bg-white/10" : "rotate-0",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    className={[
                      "grid transition-all duration-200 ease-out",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden px-4 pb-4">
                      <p className="text-sm text-neutral-300">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-4 border-t border-white/10 pt-8 text-sm text-neutral-400">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-500">
              © {new Date().getFullYear()} Promptr. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/3D_Pointer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white transition"
              >
                X (Twitter)
              </a>
              <a
                href="mailto:hello@promptr.app"
                className="text-neutral-300 hover:text-white transition"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

