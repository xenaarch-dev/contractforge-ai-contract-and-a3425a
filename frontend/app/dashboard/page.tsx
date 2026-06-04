"use client";

import { useEffect, useState } from "react";
import { ItemForm, type ContractResult } from "@/components/ItemForm";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type BillingStatus = {
  subscription_active: boolean;
  subscription_ends_at: string | null;
  credits_remaining: number;
  plan: "monthly" | "per_contract" | "free";
  checkout_monthly: string;
  checkout_per_contract: string;
};

function PlanBadge({ status }: { status: BillingStatus }) {
  if (status.plan === "monthly") {
    const expiry = status.subscription_ends_at
      ? new Date(status.subscription_ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : null;
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#3E5F44]/70 bg-[#3E5F44]/10 px-4 py-3 text-sm">
        <span className="rounded-full bg-[#3E5F44] px-2 py-0.5 text-xs font-semibold text-white">Monthly</span>
        <span className="text-zinc-300">Unlimited contracts active</span>
        {expiry && <span className="ml-auto text-zinc-500">Renews {expiry}</span>}
      </div>
    );
  }
  if (status.plan === "per_contract") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm">
        <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-semibold text-zinc-200">Credits</span>
        <span className="text-zinc-300">{status.credits_remaining} contract{status.credits_remaining !== 1 ? "s" : ""} remaining</span>
        <a href="/pricing" className="ml-auto text-xs text-[#3E5F44] hover:text-[#4a7252]">Top up</a>
      </div>
    );
  }
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
      <span className="text-zinc-400">Free plan</span>
      <span className="text-zinc-500">· 1 free contract included</span>
      <a href="/pricing" className="ml-auto text-xs text-[#3E5F44] hover:text-[#4a7252]">Upgrade</a>
    </div>
  );
}

export default function DashboardPage() {
  const [contracts, setContracts] = useState<ContractResult[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? "";
      setUserEmail(email);
      const emailParam = email || "anonymous@contractforge.io";
      fetch(`${API_BASE}/billing/status?user_email=${encodeURIComponent(emailParam)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => data && setBilling(data))
        .catch(() => null);
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold text-white">Generate a Contract</h1>
      <p className="mb-6 text-sm text-zinc-400">Fill in the details and choose your jurisdiction.</p>

      {billing && <PlanBadge status={billing} />}

      <ItemForm userEmail={userEmail} onCreated={(c) => setContracts((prev) => [c, ...prev])} />

      {contracts.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Generated ({contracts.length})</h2>
          <ul className="space-y-2">
            {contracts.map((c) => (
              <li key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                {c.id} · {new Date(c.created_at).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
