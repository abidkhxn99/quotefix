"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

const H = { fontFamily: "var(--font-bebas-neue)" };

export default function WelcomePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const { dark } = useTheme();
  const t = getThemeClasses(dark);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  async function handleContinue() {
    setSaving(true);
    await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketingConsent: consent }),
    }).catch(() => {});
    router.push("/dashboard");
  }

  if (!isLoaded || !isSignedIn) return null;

  const firstName = user?.firstName || "there";

  return (
    <div className={`min-h-screen ${t.pageBg} flex items-center justify-center px-6 transition-colors`}>
      <div className="max-w-md w-full text-center">
        <h1 className={`text-5xl tracking-wide ${t.heading} mb-4`} style={H}>
          WELCOME TO <span className="text-orange-500">QUOTEFIX</span>
        </h1>
        <p className={`${t.muted} text-lg mb-2`}>
          Hey {firstName}, you&apos;re all set.
        </p>
        <p className={`${t.muted} mb-8`}>
          You&apos;ve got 3 free documents to try — create your first quote in
          under 60 seconds.
        </p>

        <div className={`${t.cardBg} border rounded-xl p-6 text-left mb-6`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className={`h-5 w-5 mt-0.5 rounded ${dark ? "border-[#333] bg-[#222]" : "border-zinc-300 bg-white"} text-orange-500 focus:ring-orange-500 cursor-pointer shrink-0`}
            />
            <span className={`text-sm ${t.body}`}>
              I&apos;d like to receive tips, updates and offers from QuoteFix by
              email. You can unsubscribe anytime.
            </span>
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          style={H}
        >
          {saving ? "SETTING UP..." : "GET STARTED"}
        </button>

        <p className={`${t.mutedMore} text-xs mt-6`}>
          <span className="text-red-400">&hearts;</span> 5% of every
          subscription goes to{" "}
          <a
            href="https://www.crisis.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.muted} hover:text-orange-500 underline`}
          >
            Crisis UK
          </a>{" "}
          to help end homelessness in the UK.
        </p>
      </div>
    </div>
  );
}
