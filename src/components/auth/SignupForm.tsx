"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create account.");
      router.push("/dashboard");
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
        <div className="absolute -right-1/4 top-0 h-[420px] w-[420px] rounded-full bg-[#2dd4bf] opacity-[0.09] blur-[100px]" />
        <div className="absolute -left-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-[#06b6d4] opacity-[0.1] blur-[95px]" />
      </div>
      <MarketingHeader />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-lg flex-col justify-center px-4 pb-16 pt-24 sm:px-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-white/55">Start a focused path in minutes.</p>
          <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)}>
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-white/80">
                Name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-2 ring-transparent placeholder:text-white/35 focus:border-white/25 focus:ring-white/20"
                placeholder="Alex"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-2 ring-transparent placeholder:text-white/35 focus:border-white/25 focus:ring-white/20"
              />
              <p className="mt-1 text-xs text-white/40">At least 8 characters.</p>
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#c4b5fd] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
