"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const heading = { fontFamily: "var(--font-bebas-neue)" };

export default function UpgradePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1
          className="text-5xl tracking-wide text-white mb-4"
          style={heading}
        >
          UNLIMITED QUOTES,
          <br />
          <span className="text-orange-500">INVOICES & CONTRACTS</span>
        </h1>
        <p className="text-zinc-400 mb-10">
          You&apos;ve used your 3 free documents. Upgrade to QuoteFix Pro for
          unlimited access.
        </p>

        <div className="bg-[#1a1a1a] border-2 border-orange-500 rounded-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-zinc-500 text-sm line-through mb-1">
              &pound;25/month
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-6xl text-white" style={heading}>
                &pound;19
              </span>
              <span className="text-zinc-400 text-lg">/month</span>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                Sale
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-2">
              or &pound;190/year — save 2 months
            </p>
          </div>

          <ul className="space-y-3 mb-8 text-left">
            {[
              "Unlimited quotes, invoices and contracts",
              "Your logo and brand colour on every document",
              "Shareable client links",
              "Terms & Conditions builder",
              "AI description clean-up",
              "Document history",
              "Cancel anytime",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-zinc-300"
              >
                <svg
                  className="w-5 h-5 text-orange-500 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            style={heading}
          >
            {loading ? "REDIRECTING..." : "SUBSCRIBE NOW — \u00A319/MONTH"}
          </button>
          <p className="text-zinc-600 text-xs text-center mt-4">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-zinc-500 hover:text-zinc-300 text-sm mt-6 inline-block transition-colors"
        >
          &larr; Back to dashboard
        </Link>
      </div>
    </div>
  );
}
