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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a href="/auth/signin" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
