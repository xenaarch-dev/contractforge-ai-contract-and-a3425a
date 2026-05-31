"use client";

import { useState } from "react";
import { ItemForm, type ContractResult } from "@/components/ItemForm";

export default function DashboardPage() {
  const [contracts, setContracts] = useState<ContractResult[]>([]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold text-white">Generate a Contract</h1>
      <p className="mb-8 text-sm text-zinc-400">Fill in the details and choose your jurisdiction.</p>
      <ItemForm onCreated={(c) => setContracts((prev) => [c, ...prev])} />
      {contracts.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Generated ({contracts.length})</h2>
          <ul className="space-y-2">
            {contracts.map((c) => (
              <li key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                {c.id} ? {new Date(c.created_at).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
