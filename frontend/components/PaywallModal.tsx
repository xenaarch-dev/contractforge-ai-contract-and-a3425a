"use client";

interface PaywallModalProps {
  reason: string;
  checkoutPerContract: string;
  checkoutMonthly: string;
  onClose: () => void;
}

export default function PaywallModal({
  reason,
  checkoutPerContract,
  checkoutMonthly,
  onClose,
}: PaywallModalProps) {
  const isTrialExpired = reason === "per_contract_exhausted" || reason === "no_entitlement";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 transition hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Unlock ContractForge
          </h2>
          <p className="text-sm text-zinc-400">
            {isTrialExpired
              ? "You\'ve used all your available contracts. Upgrade to keep generating."
              : "You\'ve used your free contract. Upgrade to continue."}
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={checkoutPerContract}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-[#3E5F44] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#4a7252]"
          >
            Buy Single Contract &mdash; &#8377;1,499
          </a>
          <a
            href={checkoutMonthly}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl border border-[#DDD6B9] px-6 py-3 text-center font-semibold text-[#DDD6B9] transition hover:border-[#DDD6B9]/80 hover:text-white"
          >
            Subscribe Monthly &mdash; &#8377;2,499/mo
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Secure checkout via Lemon Squeezy &middot; All prices in INR
        </p>
      </div>
    </div>
  );
}
