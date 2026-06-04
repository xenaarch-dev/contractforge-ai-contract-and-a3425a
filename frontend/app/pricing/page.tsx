const PER_CONTRACT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_PER_CONTRACT ?? "#";
const MONTHLY_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_MONTHLY ?? "#";

const plans = [
  {
    id: "per_contract",
    name: "Single Contract",
    price: "₹1,499",
    period: "one-time",
    description: "Perfect for freelancers with an occasional project.",
    features: [
      "1 AI-generated contract",
      "PDF export with signature block",
      "Indian law compliant",
      "GST clause & INR amounts",
      "Mumbai jurisdiction clause",
    ],
    cta: "Buy Now",
    href: PER_CONTRACT_URL,
    highlight: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹2,499",
    period: "per month",
    description: "For active freelancers who draft contracts regularly.",
    features: [
      "Unlimited AI-generated contracts",
      "PDF export with signature block",
      "Indian law compliant",
      "GST clause & INR amounts",
      "Mumbai jurisdiction clause",
      "Priority support",
    ],
    cta: "Subscribe",
    href: MONTHLY_URL,
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400">
            AI-powered contracts drafted in seconds, fully compliant with Indian law.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={[
                "rounded-2xl border p-8",
                plan.highlight
                  ? "border-[#3E5F44] bg-[#3E5F44]/10"
                  : "border-zinc-800 bg-zinc-900",
              ].join(" ")}
            >
              {plan.highlight && (
                <span className="mb-4 inline-block rounded-full bg-[#3E5F44] px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}

              <h2 className="text-xl font-semibold text-white">{plan.name}</h2>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-400">/{plan.period}</span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span className="text-[#3E5F44]" aria-hidden="true">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "mt-8 block w-full rounded-xl px-6 py-3 text-center font-semibold transition",
                  plan.highlight
                    ? "bg-[#3E5F44] text-white hover:bg-[#4a7252]"
                    : "border border-[#DDD6B9] text-[#DDD6B9] hover:border-[#DDD6B9]/80 hover:text-white",
                ].join(" ")}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-sm text-zinc-600">
          Secure payment via Lemon Squeezy &middot; GST invoice included &middot; Prices in INR
        </p>
      </div>
    </main>
  );
}
