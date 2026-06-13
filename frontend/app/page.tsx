"use client";
import type React from "react";

const PER_CONTRACT_URL = process.env.NEXT_PUBLIC_CHECKOUT_PER_CONTRACT ?? "#";
const MONTHLY_URL      = process.env.NEXT_PUBLIC_CHECKOUT_MONTHLY      ?? "#";

const PANEL: React.CSSProperties = {
  background: "#130F18",
  border: "1px solid rgba(201,160,101,0.12)",
  borderRadius: 2,
  boxShadow: "0 0 40px rgba(139,26,26,0.06) inset",
};

const CLAUSES = [
  { num: "01", title: "GST Clause",         desc: "18% GST applicable. Tax invoice included with every contract." },
  { num: "02", title: "Jurisdiction",       desc: "Mumbai courts. Maharashtra law. Indian Contract Act 1872." },
  { num: "03", title: "Late Payment",       desc: "18% per annum interest. Enforceable under Indian law." },
  { num: "04", title: "Scope of Work",      desc: "Deliverables, milestones, and revision limits clearly defined." },
  { num: "05", title: "Payment Schedule",   desc: "Milestone-based payment terms with advance requirements." },
  { num: "06", title: "Entire Agreement",   desc: "Supersedes all prior negotiations. No verbal modifications." },
  { num: "07", title: "Signature Block",    desc: "Name, designation, date, and place. Legally binding." },
];

const PAIN_POINTS = [
  { num: "4+",   unit: "HOURS / WEEK",    desc: "Spent chasing unpaid invoices and rewriting contracts from scratch." },
  { num: "₹20L", unit: "AVERAGE LOSS",    desc: "Indian freelancers lose per year to poorly drafted agreements." },
  { num: "73%",  unit: "NEVER COLLECT",   desc: "Of freelancers fail to recover final payments without a contract." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#040208", color: "#E8E0D0" }}>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col"
        style={{
          background: [
            "radial-gradient(ellipse at 15% 85%, rgba(139,26,26,0.15) 0%, transparent 50%)",
            "radial-gradient(ellipse at 85% 10%, rgba(139,26,26,0.05) 0%, transparent 40%)",
            "#040208",
          ].join(", "),
        }}
      >
        {/* Nav */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid rgba(201,160,101,0.08)", backdropFilter: "blur(8px)", background: "rgba(4,2,8,0.85)" }}
        >
          <span className="font-cormorant italic" style={{ fontSize: 18, color: "#C9A065" }}>
            ContractForge
          </span>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="/auth/signin"
              className="hidden sm:inline font-space-mono uppercase transition-colors"
              style={{ fontSize: 10, letterSpacing: "0.15em", color: "#A89F94" }}
              onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E8E0D0"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.color = "#A89F94"; }}
            >
              Sign in
            </a>
            <a
              href="/auth/signup"
              className="font-space-mono uppercase transition-colors"
              style={{
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "#C9A065",
                border: "1px solid rgba(201,160,101,0.4)",
                padding: "7px 16px",
                borderRadius: 2,
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C9A065"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,160,101,0.4)"; }}
            >
              Start Free
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: "6vh", paddingBottom: "4vh" }}>
          <p
            className="font-space-mono uppercase mb-6"
            style={{ fontSize: 10, letterSpacing: "0.3em", color: "#C9A065" }}
          >
            Built for Indian Law
          </p>

          <h1
            className="font-cormorant italic"
            style={{
              fontSize: "clamp(52px, 8vw, 88px)",
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#E8E0D0",
              maxWidth: 800,
            }}
          >
            Your clients pay.
            <br />
            Your contracts make sure of it.
          </h1>

          <p
            className="font-space-mono mt-8"
            style={{ fontSize: 13, lineHeight: 1.8, color: "#A89F94", maxWidth: 400 }}
          >
            GST-compliant. Indian Contract Act 1872.
            <br />
            Mumbai jurisdiction. 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <a
              href="/auth/signup"
              className="font-space-mono transition-colors"
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                color: "#E8E0D0",
                border: "1px solid rgba(139,26,26,0.7)",
                background: "rgba(139,26,26,0.2)",
                padding: "13px 28px",
                borderRadius: 2,
                display: "inline-block",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.35)"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.2)"; }}
            >
              Generate your first contract →
            </a>
            <a
              href="/pricing"
              className="font-space-mono uppercase transition-colors"
              style={{ fontSize: 10, letterSpacing: "0.15em", color: "#C9A065" }}
              onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E8E0D0"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A065"; }}
            >
              See pricing
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center pb-8 gap-2">
          <div style={{ height: 1, width: 240, background: "rgba(201,160,101,0.15)" }} />
          <div className="flex flex-col items-center gap-1 mt-3">
            <span
              className="font-space-mono uppercase animate-bounce"
              style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(201,160,101,0.4)" }}
            >
              Scroll
            </span>
            <span style={{ color: "rgba(201,160,101,0.3)", fontSize: 12 }}>↓</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ background: "#0D0810" }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="font-cormorant italic text-center mb-16"
            style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 400, color: "#E8E0D0" }}
          >
            Indian freelancers lose lakhs to bad contracts.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.unit}
                className="p-6"
                style={{
                  ...PANEL,
                  borderLeft: "2px solid #8B1A1A",
                }}
              >
                <p
                  className="font-cormorant"
                  style={{ fontSize: 52, fontWeight: 300, lineHeight: 1, color: "#C9A065" }}
                >
                  {p.num}
                </p>
                <p
                  className="font-space-mono uppercase mt-1"
                  style={{ fontSize: 9, letterSpacing: "0.2em", color: "#A89F94" }}
                >
                  {p.unit}
                </p>
                <p
                  className="font-space-mono mt-4"
                  style={{ fontSize: 11, lineHeight: 1.7, color: "#A89F94" }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — THE SOLUTION
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ background: "#040208" }}>
        <div className="mx-auto max-w-3xl">
          <h2
            className="font-cormorant italic text-center mb-16"
            style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 400, color: "#E8E0D0" }}
          >
            Five minutes. Every clause covered.
          </h2>

          <div>
            {CLAUSES.map((c, i) => (
              <div
                key={c.num}
                className="flex items-baseline gap-6 py-5 transition-all duration-200 group"
                style={{
                  borderBottom: i < CLAUSES.length - 1 ? "1px solid rgba(122,95,58,0.15)" : "none",
                  borderLeft: "2px solid transparent",
                  paddingLeft: 12,
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = "#130F18";
                  el.style.borderLeftColor = "#8B1A1A";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = "transparent";
                  el.style.borderLeftColor = "transparent";
                }}
              >
                <span
                  className="font-space-mono shrink-0"
                  style={{ fontSize: 10, color: "#C9A065", letterSpacing: "0.1em" }}
                >
                  {c.num}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-cormorant"
                    style={{ fontSize: 22, fontWeight: 400, color: "#E8E0D0" }}
                  >
                    {c.title}
                  </span>
                  <span
                    className="font-space-mono ml-4"
                    style={{ fontSize: 11, color: "#A89F94" }}
                  >
                    — {c.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <a
              href="/auth/signup"
              className="font-space-mono transition-colors"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "#E8E0D0",
                border: "1px solid rgba(139,26,26,0.6)",
                background: "rgba(139,26,26,0.18)",
                padding: "12px 32px",
                borderRadius: 2,
                display: "inline-block",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.3)"; }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.18)"; }}
            >
              Generate your first contract — free
            </a>
            <p
              className="font-space-mono mt-4"
              style={{ fontSize: 10, color: "#A89F94", letterSpacing: "0.1em" }}
            >
              No credit card. No lawyer.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — PRICING
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24" style={{ background: "#0D0810" }}>
        <div className="mx-auto max-w-4xl">
          <h2
            className="font-cormorant italic text-center mb-16"
            style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 400, color: "#E8E0D0" }}
          >
            Simple, transparent pricing.
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Per Contract */}
            <div className="p-8 flex flex-col" style={PANEL}>
              <p
                className="font-space-mono uppercase"
                style={{ fontSize: 10, letterSpacing: "0.2em", color: "#C9A065" }}
              >
                Per Contract
              </p>
              <p
                className="font-cormorant mt-4"
                style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, color: "#E8E0D0" }}
              >
                ₹1,499
              </p>
              <p
                className="font-space-mono mt-2"
                style={{ fontSize: 11, color: "#A89F94" }}
              >
                Pay as you go
              </p>
              <ul className="mt-8 space-y-3 flex-1">
                {["One complete contract", "PDF export", "All India clauses", "Never expires"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span style={{ color: "#C9A065", fontSize: 12 }}>—</span>
                    <span className="font-space-mono" style={{ fontSize: 11, color: "#A89F94" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={PER_CONTRACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-space-mono uppercase mt-8 block text-center transition-colors"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "#C9A065",
                  border: "1px solid rgba(201,160,101,0.4)",
                  padding: "12px",
                  borderRadius: 2,
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C9A065"; }}
                onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,160,101,0.4)"; }}
              >
                Buy single contract
              </a>
            </div>

            {/* Monthly — highlighted */}
            <div
              className="p-8 flex flex-col relative"
              style={{
                ...PANEL,
                border: "1px solid rgba(139,26,26,0.5)",
                background: "linear-gradient(135deg, rgba(139,26,26,0.07) 0%, #130F18 60%)",
                boxShadow: "0 0 40px rgba(139,26,26,0.12) inset, 0 0 60px rgba(139,26,26,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <p
                  className="font-space-mono uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.2em", color: "#C9A065" }}
                >
                  Monthly
                </p>
                <span
                  className="font-space-mono uppercase"
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.15em",
                    color: "#3EB489",
                    border: "1px solid rgba(62,180,137,0.3)",
                    padding: "3px 8px",
                    borderRadius: 2,
                  }}
                >
                  Unlimited Contracts
                </span>
              </div>
              <p
                className="font-cormorant mt-4"
                style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, color: "#E8E0D0" }}
              >
                ₹2,499
              </p>
              <p
                className="font-space-mono mt-2"
                style={{ fontSize: 11, color: "#A89F94" }}
              >
                per month
              </p>
              <ul className="mt-8 space-y-3 flex-1">
                {["Unlimited contracts", "PDF export", "All India clauses", "Priority support", "Cancel anytime"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span style={{ color: "#3EB489", fontSize: 12 }}>—</span>
                    <span className="font-space-mono" style={{ fontSize: 11, color: "#A89F94" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={MONTHLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-space-mono uppercase mt-8 block text-center transition-colors"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "#E8E0D0",
                  background: "rgba(139,26,26,0.6)",
                  border: "1px solid rgba(139,26,26,0.8)",
                  padding: "12px",
                  borderRadius: 2,
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.8)"; }}
                onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,26,26,0.6)"; }}
              >
                Start monthly plan
              </a>
            </div>

          </div>

          <p
            className="font-space-mono text-center mt-10"
            style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(168,159,148,0.5)" }}
          >
            First contract always free · No credit card required · GST invoice included
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="px-6 py-12" style={{ background: "#040208", borderTop: "1px solid rgba(201,160,101,0.1)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="font-cormorant italic" style={{ fontSize: 20, color: "#C9A065" }}>
              ContractForge
            </span>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: "Terms",   href: "/terms"    },
                { label: "Privacy", href: "/privacy"  },
                { label: "Refund",  href: "/refund"   },
                { label: "Pricing", href: "/pricing"  },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="font-space-mono uppercase transition-colors"
                  style={{ fontSize: 9, letterSpacing: "0.2em", color: "#A89F94" }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E8E0D0"; }}
                  onMouseOut={(e)  => { (e.currentTarget as HTMLAnchorElement).style.color = "#A89F94"; }}
                >
                  {label}
                </a>
              ))}
            </div>
            <span
              className="font-space-mono"
              style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(168,159,148,0.4)" }}
            >
              Built in Mumbai · @xenaarch
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
