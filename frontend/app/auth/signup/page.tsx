"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://contractforge-ai-contract-and-a3425a.vercel.app";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${SITE_URL}/dashboard` },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-sm text-center">
          <a href="/" className="mb-8 block text-lg font-bold tracking-tight text-white">
            ContractForge
          </a>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-2xl">&#9993;</p>
            <h2 className="mt-4 text-lg font-semibold text-white">Check your email</h2>
            <p className="mt-2 text-sm text-zinc-400">
              We sent a confirmation link to{" "}
              <span className="text-zinc-200">{email}</span>. Click it to
              activate your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="mb-8 block text-center text-lg font-bold tracking-tight text-white">
          ContractForge
        </a>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h1 className="mb-2 text-xl font-semibold text-white">
            Start free
          </h1>
          <p className="mb-6 text-sm text-zinc-400">
            First contract on us. No credit card required.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#3E5F44] focus:ring-1 focus:ring-[#3E5F44]"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#3E5F44] focus:ring-1 focus:ring-[#3E5F44]"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#3E5F44]"
              />
              <label htmlFor="terms" className="text-sm text-zinc-400 leading-snug">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-[#3E5F44] hover:text-[#4a7252] underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-[#3E5F44] hover:text-[#4a7252] underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full rounded-xl bg-[#3E5F44] px-6 py-3 font-semibold text-white transition hover:bg-[#4a7252] disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a href="/auth/signin" className="text-[#3E5F44] hover:text-[#4a7252]">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
