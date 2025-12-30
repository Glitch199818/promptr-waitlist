import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gradient-to-br from-neutral-200 via-neutral-50 to-neutral-400" />
            <p className="text-lg font-medium text-white">Promptr</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2 text-sm font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110"
              style={{ borderRadius: '0px' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-medium text-white mb-6 leading-tight tracking-tight">
          Save AI snippets across all your tools
        </h1>
        <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Drag-select responses from ChatGPT, Gemini, and other AI tools. Save them as snippets and reuse them whenever you need.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-6 py-3 text-base font-medium text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110"
            style={{ borderRadius: '0px' }}
          >
            Get Started
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center border border-neutral-700 bg-neutral-900 px-6 py-3 text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 transition"
            style={{ borderRadius: '0px' }}
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-neutral-900 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-white text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: '0px' }}>
                <span className="text-lg font-medium text-neutral-300">1</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-3">
                Highlight text in an AI chat
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Select any response or prompt from ChatGPT, Gemini, or other AI tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: '0px' }}>
                <span className="text-lg font-medium text-neutral-300">2</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-3">
                Save it as a snippet
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Use the browser extension to instantly save your selection as a snippet.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-6" style={{ borderRadius: '0px' }}>
                <span className="text-lg font-medium text-neutral-300">3</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-3">
                Reuse it anywhere
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Access your saved snippets anytime and copy them back into any AI tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Promptr */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-white text-center mb-12">
            Why Promptr
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-neutral-800 bg-neutral-900 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-base font-medium text-white mb-2">
                Works across all AI tools
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Save snippets from ChatGPT, Gemini, Claude, and more. All in one place.
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-base font-medium text-white mb-2">
                Organized snippets
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Keep your AI responses organized and easy to find when you need them.
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-base font-medium text-white mb-2">
                Fast recall
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Copy snippets to your clipboard instantly. No more retyping or searching.
              </p>
            </div>
            <div className="border border-neutral-800 bg-neutral-900 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-base font-medium text-white mb-2">
                Private and secure
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Your snippets are stored securely in your account. Only you have access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-medium text-white mb-4">
            Ready to start saving snippets?
          </h2>
          <p className="text-neutral-400 mb-8">
            Get started in seconds. No credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-6 py-3 text-base font-medium text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110"
            style={{ borderRadius: '0px' }}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gradient-to-br from-neutral-200 via-neutral-50 to-neutral-400" />
              <p className="text-base font-medium text-white">Promptr</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
              <Link href="/login" className="hover:text-neutral-300 transition">
                Login
              </Link>
              <Link href="/signup" className="hover:text-neutral-300 transition">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
