"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import UpgradeModal from "./UpgradeModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const Schema = z.object({
  // Freelancer details
  freelancer_name: z.string().min(2, "Required"),
  freelancer_gst: z.string().optional().default(""),
  freelancer_city: z.string().min(2, "Required"),
  // Contract details
  project_type: z.string().min(2, "Required"),
  client_name: z.string().min(2, "Required"),
  client_company: z.string().min(1, "Required"),
  scope: z.string().min(10, "Describe the scope"),
  fee: z.coerce.number().min(1, "Enter a fee"),
  payment_terms: z.string().min(5, "Required"),
  timeline: z.string().min(3, "Required"),
  jurisdiction: z.enum(["India", "UK", "US"]),
});
type FormValues = z.infer<typeof Schema>;

type PaywallInfo = {
  message: string;
  checkout_monthly: string;
  checkout_per_contract: string;
};

export function ItemForm({
  onCreated,
  userEmail = "",
}: {
  onCreated: (i: ContractResult) => void;
  userEmail?: string;
}) {
  const [generated, setGenerated] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ContractResult | null>(null);
  const [lastValues, setLastValues] = useState<FormValues | null>(null);
  const [paywall, setPaywall] = useState<PaywallInfo | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { jurisdiction: "India", freelancer_gst: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setPaywall(null);
    setSubmitError(null);
    const r = await fetch(`${API_BASE}/contracts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, user_email: userEmail || "anonymous@contractforge.io" }),
    });

    if (r.status === 402) {
      const body = await r.json().catch(() => ({}));
      const detail = body?.detail ?? body;
      setPaywall({
        message: detail?.message ?? "A subscription is required to generate contracts.",
        checkout_monthly: detail?.checkout_monthly ?? "/pricing",
        checkout_per_contract: detail?.checkout_per_contract ?? "/pricing",
      });
      return;
    }

    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      setSubmitError(body?.detail ?? `Server error (HTTP ${r.status})`);
      return;
    }

    const data: ContractResult = await r.json();
    // Save result + values before reset so the download handler can use them
    setLastResult(data);
    setLastValues(values);
    setGenerated(data.content);
    onCreated(data);
    reset();
  });

  const handleDownload = async () => {
    if (!lastResult || !lastValues) return;
    setDownloading(true);
    setDownloadError(null);

    try {
      // Parse scope into individual deliverables (one per non-empty line)
      const deliverables = lastValues.scope
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const exportPayload = {
        user_email: userEmail || "anonymous@contractforge.io",
        // Freelancer details from form
        freelancer_name: lastValues.freelancer_name,
        freelancer_gst: lastValues.freelancer_gst || "",
        freelancer_address: `${lastValues.freelancer_city}, India`,
        // Client details from form
        client_name: lastValues.client_name,
        client_company: lastValues.client_company,
        // Contract terms from form
        amount: lastValues.fee,
        timeline: lastValues.timeline,
        payment_schedule: lastValues.payment_terms,
        deliverables: deliverables.length > 0 ? deliverables : [lastValues.scope],
      };

      const r = await fetch(
        `${API_BASE}/contracts/${lastResult.id}/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exportPayload),
        }
      );

      if (!r.ok) {
        setDownloadError(`Export failed (HTTP ${r.status}). Please try again.`);
        return;
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract_${lastResult.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* ── Your Details (freelancer) ─────────────────────────────── */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Your Details
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your Name" error={formState.errors.freelancer_name?.message}>
              <input
                {...register("freelancer_name")}
                placeholder="Priya Mehta"
                className={inputCls}
              />
            </Field>
            <Field label="Your City" error={formState.errors.freelancer_city?.message}>
              <input
                {...register("freelancer_city")}
                placeholder="Mumbai"
                className={inputCls}
              />
            </Field>
            <Field
              label="Your GST Number (optional)"
              error={formState.errors.freelancer_gst?.message}
            >
              <input
                {...register("freelancer_gst")}
                placeholder="27AABCU9603R1ZX"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* ── Contract Details ──────────────────────────────────────── */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Contract Details
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project Type" error={formState.errors.project_type?.message}>
              <input
                {...register("project_type")}
                placeholder="e.g. Web Development"
                className={inputCls}
              />
            </Field>
            <Field label="Client Name" error={formState.errors.client_name?.message}>
              <input {...register("client_name")} placeholder="Rahul Sharma" className={inputCls} />
            </Field>
            <Field label="Client Company" error={formState.errors.client_company?.message}>
              <input
                {...register("client_company")}
                placeholder="Sharma Enterprises Pvt Ltd"
                className={inputCls}
              />
            </Field>
            <Field label="Fee (₹)" error={formState.errors.fee?.message}>
              <input
                {...register("fee")}
                type="number"
                placeholder="75000"
                className={inputCls}
              />
            </Field>
            <Field label="Payment Terms" error={formState.errors.payment_terms?.message}>
              <input
                {...register("payment_terms")}
                placeholder="50% advance, 50% on delivery"
                className={inputCls}
              />
            </Field>
            <Field label="Timeline" error={formState.errors.timeline?.message}>
              <input
                {...register("timeline")}
                placeholder="30 days from signing"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <Field label="Scope of Work" error={formState.errors.scope?.message}>
          <textarea
            {...register("scope")}
            rows={3}
            placeholder="Describe deliverables…"
            className={inputCls}
          />
        </Field>

        <Field label="Jurisdiction" error={formState.errors.jurisdiction?.message}>
          <select {...register("jurisdiction")} className={inputCls}>
            <option value="India">India (default)</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full rounded-xl bg-[#3E5F44] px-6 py-3 font-semibold text-white transition hover:bg-[#4a7252] disabled:opacity-60"
        >
          {formState.isSubmitting ? "Generating…" : "Generate Contract"}
        </button>
      </form>

      {submitError && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {submitError}
        </div>
      )}

      {paywall && (
        <UpgradeModal
          checkoutMonthly={paywall.checkout_monthly}
          checkoutSingle={paywall.checkout_per_contract}
          onClose={() => setPaywall(null)}
        />
      )}

      {generated && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">Generated Contract</h3>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl bg-[#3E5F44] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a7252] disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download PDF"}
            </button>
          </div>
          {downloadError && (
            <p className="mb-2 text-xs text-red-400">{downloadError}</p>
          )}
          <ContractMarkdown content={generated} />
        </div>
      )}
    </div>
  );
}

// ── Inline markdown renderer ───────────────────────────────────────────────────
// Handles the subset Claude uses in contracts: #/## headings, ---, **bold**, paragraphs.

function renderInline(text: string): React.ReactNode {
  // Split on **bold** spans
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export function ContractMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={i}
          className="mt-5 mb-1 text-sm font-bold uppercase tracking-wide text-zinc-100"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={i} className="mb-3 text-base font-bold text-zinc-100">
          {line.slice(2)}
        </h1>
      );
    } else if (/^[-*_]{3,}$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-zinc-700" />);
    } else if (line.trim() === "") {
      nodes.push(<div key={i} className="h-1" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm leading-relaxed text-zinc-300">
          {renderInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{nodes}</div>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#3E5F44] focus:outline-none";

export type ContractResult = { id: string; content: string; created_at: string };
