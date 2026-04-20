import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[rgb(12_14_18/0.65)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-white">
          Hobby Focus
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c0e12] shadow-lg shadow-black/20 transition hover:bg-white/95"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
