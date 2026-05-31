const PER_CONTRACT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_PER_CONTRACT ?? "#";
const MONTHLY_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_MONTHLY ?? "#";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">ContractForge</span>
          <div className="flex items-center gap-3">
            <a
              href="/auth/signin"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              Sign in
            </a>
            <a
              href="/auth/signup"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="mb-6 inline-block rounded-full border border-indigo-500/40 bg-indigo-950/40 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-300">
          Built for Indian freelancers
        </span>
        <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Your next client contract.
          <br />
          Done in 30 seconds.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          GST-compliant. PDF export.
          <br />
          Mumbai jurisdiction. Indian Contract Act.
          <br />
          Professional contracts without a lawyer.
        </p>
        <div className="mt-10">
          <a
            href="/auth/signup"
            className="inline-block rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-indigo-500"
          >
            Generate your first contract — free
          </a>
          <p className="mt-4 text-sm text-zinc-500">
            No credit card. No lawyer. 30 seconds.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe your project",
                body: "One sentence. Client name, scope, fee.",
              },
              {
                step: "02",
                title: "Get your contract",
                body: "AI drafts a complete, legally-sound agreement in under 30 seconds.",
              },
              {
                step: "03",
                title: "Export and send",
                body: "Download as PDF. Sign. Done.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <span className="text-sm font-bold text-indigo-400">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
            What&apos;s inside every contract
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                title: "GST Clause",
                body: "18% GST applicable. Invoice included.",
              },
              {
                title: "Jurisdiction",
                body: "Mumbai courts. Maharashtra law.",
              },
              {
                title: "Late Payment",
                body: "18% per annum. Indian Contract Act.",
              },
              {
                title: "Signature Block",
                body: "Name, designation, date, place.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Per Contract */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
              <h3 className="text-xl font-semibold text-white">Per Contract</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">&#8377;1,499</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">Pay as you go</p>
              <ul className="mt-6 space-y-2">
                {[
                  "One complete contract",
                  "PDF export",
                  "All India clauses",
                  "Never expires",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span className="text-indigo-400" aria-hidden="true">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={PER_CONTRACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-xl border border-zinc-700 px-6 py-3 text-center font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                Buy single contract
              </a>
            </div>

            {/* Monthly */}
            <div className="rounded-2xl border border-indigo-500 bg-indigo-950/30 p-8">
              <span className="mb-4 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                Most popular
              </span>
              <h3 className="text-xl font-semibold text-white">Monthly</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">&#8377;2,499</span>
                <span className="text-zinc-400">/ month</span>
              </div>
              <ul className="mt-6 space-y-2">
                {[
                  "Unlimited contracts",
                  "PDF export",
                  "All India clauses",
                  "Priority support",
                  "Cancel anytime",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span className="text-indigo-400" aria-hidden="true">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={MONTHLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-xl bg-indigo-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-indigo-500"
              >
                Start monthly plan
              </a>
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-zinc-500">
            First contract always free. No credit card required.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-zinc-800 px-6 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight">
            Stop copying contracts from Google.
          </h2>
          <p className="mt-4 text-zinc-400">
            Your clients deserve better. So do you.
          </p>
          <a
            href="/auth/signup"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white transition hover:bg-indigo-500"
          >
            Generate your first contract
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <span className="font-semibold text-zinc-300">ContractForge</span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="/terms" className="transition hover:text-zinc-300">Terms of Service</a>
            <a href="/privacy" className="transition hover:text-zinc-300">Privacy Policy</a>
            <a href="/refund" className="transition hover:text-zinc-300">Refund Policy</a>
            <a href="/pricing" className="transition hover:text-zinc-300">Pricing</a>
          </div>
          <span>Built in Mumbai &middot; @xenaarch</span>
        </div>
      </footer>
    </div>
  );
}
