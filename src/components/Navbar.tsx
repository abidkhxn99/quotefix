"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";

const SHARED_PREFIXES = ["/q/", "/i/", "/c/", "/quote/"];

export default function Navbar() {
  const pathname = usePathname();

  const isShared = SHARED_PREFIXES.some((p) => pathname.startsWith(p));
  const isLanding = pathname === "/";

  if (isShared) return null;

  // Hide navbar on landing page — it has its own layout
  if (isLanding) return null;

  return (
    <header className="bg-[#0f0f0f] border-b-2 border-orange-500 print:hidden">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-4xl font-bold tracking-wide text-orange-500 leading-none"
          style={{ fontFamily: "var(--font-bebas-neue)" }}
        >
          QUOTEFIX
        </Link>

        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <Link
              href="/settings"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <Link
              href="/new"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold tracking-wider hover:bg-orange-600 transition-colors"
              style={{ fontFamily: "var(--font-bebas-neue)", fontSize: "1rem" }}
            >
              NEW DOCUMENT
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton>
              <button className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
      </div>
    </header>
  );
}
