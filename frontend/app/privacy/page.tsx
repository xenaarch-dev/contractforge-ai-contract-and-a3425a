import { Metadata } from "next";
import { mdToHtml, readLegalDoc } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Privacy Policy ? ContractForge",
  description: "How ContractForge collects, uses, and protects your personal data under the DPDP Act 2023 and Indian law.",
};

export default function PrivacyPage() {
  const html = mdToHtml(readLegalDoc("privacy"));
  return <LegalPage html={html} title="Privacy Policy" />;
}

function LegalPage({ html, title }: { html: string; title: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold tracking-tight text-white">ContractForge</a>
          <div className="flex items-center gap-3">
            <a href="/auth/signin" className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white">Sign in</a>
            <a href="/auth/signup" className="rounded-xl bg-[#3E5F44] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a7252]">Start free</a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-2 py-1">
          <nav className="flex gap-1 text-sm">
            {[
              { href: "/terms", label: "Terms of Service" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/refund", label: "Refund Policy" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`rounded-xl px-4 py-2 font-medium transition ${
                  label === title
                    ? "bg-[#3E5F44] text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <article
          className="prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <span className="font-semibold text-zinc-300">ContractForge</span>
          <div className="flex gap-6">
            <a href="/terms" className="transition hover:text-zinc-300">Terms of Service</a>
            <a href="/privacy" className="transition hover:text-zinc-300">Privacy Policy</a>
            <a href="/refund" className="transition hover:text-zinc-300">Refund Policy</a>
          </div>
          <span>Built in Mumbai &middot; @xenaarch</span>
        </div>
      </footer>
    </div>
  );
}
