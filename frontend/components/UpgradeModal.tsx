"use client";

interface UpgradeModalProps {
  checkoutMonthly: string;
  checkoutSingle: string;
  onClose: () => void;
}

export default function UpgradeModal({
  checkoutMonthly,
  checkoutSingle,
  onClose,
}: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#3E5F44] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-[#DDD6B9]/60 transition hover:text-[#DDD6B9]"
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
            You&apos;ve used your free contract
          </h2>
          <p className="text-sm text-[#DDD6B9]">
            Upgrade to keep generating GST-compliant contracts.
          </p>
        </div>

        <div className="space-y-3">
          {/* Monthly */}
          <div className="rounded-xl border border-[#DDD6B9]/30 bg-[#4a7252] p-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-semibold text-white">Monthly</span>
              <span className="text-lg font-bold text-white">&#8377;2,499/month</span>
            </div>
            <p className="mb-4 text-sm text-[#DDD6B9]">Unlimited contracts</p>
            <a
              href={checkoutMonthly}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#3E5F44] transition hover:bg-[#DDD6B9]"
            >
              Start Subscription &#8594;
            </a>
          </div>

          {/* Single */}
          <div className="rounded-xl border border-[#DDD6B9]/30 bg-[#4a7252] p-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-semibold text-white">Single Contract</span>
              <span className="text-lg font-bold text-white">&#8377;1,499</span>
            </div>
            <p className="mb-4 text-sm text-[#DDD6B9]">One contract now</p>
            <a
              href={checkoutSingle}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl border border-[#DDD6B9] px-4 py-2.5 text-center text-sm font-semibold text-[#DDD6B9] transition hover:bg-[#DDD6B9]/10"
            >
              Buy Single Contract &#8594;
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#DDD6B9]/50">
          Secure checkout via Lemon Squeezy &middot; Prices in INR
        </p>
      </div>
    </div>
  );
}
