"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not sign in.");
      const next = searchParams.get("from") || "/dashboard";
      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0c0e12] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-[#06b6d4] opacity-[0.1] blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-[360px] w-[360px] rounded-full bg-[#7c5cff] opacity-[0.08] blur-[90px]" />
      </div>
      <MarketingHeader />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-lg flex-col justify-center px-4 pb-16 pt-24 sm:px-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-white/55">Sign in to open your learning path.</p>
          <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)}>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-2 ring-transparent placeholder:text-white/35 focus:border-white/25 focus:ring-white/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-2 ring-transparent placeholder:text-white/35 focus:border-white/25 focus:ring-white/20"
              />
            </div>
            {error ? (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#0c0e12] transition hover:bg-white/95 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-white/50">
            New here?{" "}
            <Link href="/signup" className="font-medium text-[#99f6e4] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
