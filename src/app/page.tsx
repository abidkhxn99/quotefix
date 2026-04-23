"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollFade();
  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
}

const heading = { fontFamily: "var(--font-bebas-neue)" };

function ViewerCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c === 3) return 4;
        if (c === 4) return 5;
        return 3;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="text-zinc-400 text-xs mt-3 flex items-center justify-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      {count} people viewing this right now
    </p>
  );
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // If signed in and loaded, redirect happens via useEffect above
  // Don't block rendering while Clerk loads — show the landing page immediately
  if (isLoaded && isSignedIn) return null;

  return (
    <div className="bg-[#0f0f0f] text-white">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl tracking-wide leading-tight text-white" style={heading}>
              PROFESSIONAL QUOTES,
              <br />
              INVOICES & CONTRACTS —
              <br />
              <span className="text-orange-500">BUILT FOR TRADESPEOPLE.</span>
            </h1>
            <p className="text-zinc-400 text-lg mt-6 max-w-lg leading-relaxed">
              Stop sending dodgy WhatsApp quotes. QuoteFix generates professional
              documents in 60 seconds — branded to your business, ready to send.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/sign-up"
                className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
                style={heading}
              >
                START FOR FREE
              </Link>
              <Link
                href="#how-it-works"
                className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-500/10 transition-all"
                style={heading}
              >
                SEE A SAMPLE QUOTE
              </Link>
            </div>
            <p className="text-zinc-600 text-sm mt-5">
              No credit card required &middot; 3 free documents &middot; Cancel
              anytime
            </p>
          </div>

          {/* Mock document preview */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm ml-auto rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-orange-500 p-5 text-white">
                <p className="text-lg font-bold">Quote</p>
                <p className="text-sm opacity-80">QF-001</p>
                <p className="text-sm opacity-80">Smith & Sons Builders</p>
              </div>
              <div className="p-5 text-sm">
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>Prepared For</span>
                  <span>22 April 2026</span>
                </div>
                <p className="font-semibold text-zinc-900 mb-4">Mrs Jane Patel</p>
                <div className="border-t border-zinc-200 pt-3 space-y-2">
                  <div className="flex justify-between text-zinc-700">
                    <span>Labour - Kitchen Fitting</span>
                    <span>&pound;1,500.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Materials - Worktops</span>
                    <span>&pound;420.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Materials - Tiling</span>
                    <span>&pound;180.00</span>
                  </div>
                </div>
                <div className="border-t-2 border-orange-500 mt-4 pt-3 flex justify-between">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="font-bold text-orange-500 text-lg">
                    &pound;2,100.00
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-3">Valid for 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-[#1a1a1a] py-6 overflow-hidden">
        <p className="text-center text-white font-semibold text-sm mb-4">
          Trusted by 1,000+ tradespeople across the UK
        </p>
        <div
          className="relative"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex whitespace-nowrap animate-marquee">
            {[0, 1].map((i) => (
              <span key={i} className="text-zinc-500 text-sm tracking-wide shrink-0 pr-4">
                Electricians &middot; Plumbers &middot; Builders &middot; Plasterers &middot; Cleaners &middot; Landscapers &middot; Decorators &middot; Roofers &middot; Tilers &middot; Joiners &middot; Heating Engineers &middot; Window Cleaners &middot; Pressure Washers &middot; Painters &middot; Groundworkers &middot;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl tracking-wide text-white" style={heading}>
                STILL SENDING QUOTES
                <br />
                ON WHATSAPP?
              </h2>
              <p className="text-zinc-400 text-lg mt-6 leading-relaxed max-w-md">
                Most tradespeople lose jobs not because of their work — but
                because their quote looked unprofessional. A scruffy message with
                a number on it doesn't inspire confidence. QuoteFix fixes that in
                60 seconds.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Before card */}
              <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-5">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                  Before
                </p>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    hi mate driveway jet wash &pound;200 cheers dave
                  </p>
                </div>
              </div>
              {/* After card */}
              <div className="bg-green-950/40 border border-green-900/40 rounded-xl p-5">
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
                  After
                </p>
                <div className="bg-white rounded-lg p-3 text-xs">
                  <p className="font-bold text-zinc-900">Dave&apos;s Jet Washing</p>
                  <p className="text-zinc-500 mt-1">Driveway pressure wash</p>
                  <div className="border-t border-zinc-200 mt-2 pt-2 flex justify-between">
                    <span className="text-zinc-700">Total</span>
                    <span className="font-bold text-orange-500">
                      &pound;200.00
                    </span>
                  </div>
                  <p className="text-zinc-400 mt-1">Valid 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* FEATURES */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2
            className="text-4xl lg:text-5xl tracking-wide text-center text-white mb-16"
            style={heading}
          >
            EVERYTHING YOU NEED.{" "}
            <span className="text-orange-500">NOTHING YOU DON&apos;T.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "3 Document Types",
                desc: "Create quotes, invoices and contracts — all from the same form. Switch between them in one click.",
              },
              {
                icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
                title: "Your Branding",
                desc: "Upload your logo and pick your brand colour. Every document looks like it came from a proper business.",
              },
              {
                icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
                title: "Send in Seconds",
                desc: "Share a link your client can open on their phone, or save as a PDF. No printing, no scanning, no faff.",
              },
              {
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                title: "AI Description Clean-up",
                desc: 'Type your rough job notes and hit Clean up. QuoteFix rewrites them into professional language automatically.',
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                title: "Terms & Conditions Builder",
                desc: "Pick from a library of pre-written trade terms or add your own. Never write T&Cs from scratch again.",
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Document History",
                desc: "Every quote, invoice and contract saved to your account. Find anything in seconds.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-orange-500/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={f.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* HOW IT WORKS */}
      <FadeIn>
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
          <h2
            className="text-4xl lg:text-5xl tracking-wide text-center text-white mb-16"
            style={heading}
          >
            UP AND RUNNING IN{" "}
            <span className="text-orange-500">3 STEPS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                n: "1",
                title: "Fill in your details",
                desc: "Enter your job info, client details, labour and materials. Takes less than 2 minutes.",
              },
              {
                n: "2",
                title: "Build your document",
                desc: "Hit the button. QuoteFix generates a professional quote, invoice or contract instantly.",
              },
              {
                n: "3",
                title: "Send to your client",
                desc: "Share a link, download as PDF, or print. Your client gets something that looks the business.",
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <span
                  className="text-7xl text-orange-500 block mb-4"
                  style={heading}
                >
                  {s.n}
                </span>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* TESTIMONIALS */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2
            className="text-4xl lg:text-5xl tracking-wide text-center text-white mb-16"
            style={heading}
          >
            WHAT TRADESPEOPLE ARE{" "}
            <span className="text-orange-500">SAYING</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote:
                  "QuoteFix makes sending quotes dead easy. My customers actually comment on how professional everything looks now. Proper game changer for the business.",
                name: "Christian",
                company: "Rightways Cleaning Solutions",
                initials: "RC",
              },
              {
                quote:
                  "I've tried loads of tools but they're all built for office people. QuoteFix is actually built for people like us — fill it in, send it, done. The contract feature alone is worth it.",
                name: "Mark",
                company: "PIXLD",
                initials: "MP",
              },
              {
                quote:
                  "Went from sending WhatsApp voice notes about prices to sending proper branded invoices in the same week. Clients take you more seriously straight away.",
                name: "Shadmaan",
                company: "SuitsYouMedia",
                initials: "SS",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6"
              >
                <span className="text-4xl text-orange-500 leading-none block mb-3">
                  &ldquo;
                </span>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {t.name}
                    </p>
                    <p className="text-zinc-500 text-xs">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* PRICING */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2
            className="text-4xl lg:text-5xl tracking-wide text-center text-white mb-16"
            style={heading}
          >
            SIMPLE PRICING.{" "}
            <span className="text-orange-500">NO SURPRISES.</span>
          </h2>
          <div className="max-w-md mx-auto bg-[#1a1a1a] border-2 border-orange-500 rounded-2xl p-8">
            <div className="text-center mb-8">
              <p className="text-zinc-500 text-sm line-through mb-1">
                &pound;25/month
              </p>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="text-6xl text-white"
                  style={heading}
                >
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
              <ViewerCount />
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited quotes, invoices and contracts",
                "Your logo and brand colour on every document",
                "Shareable client links",
                "Terms & Conditions builder",
                "AI description clean-up",
                "Document history",
                "Cancel anytime",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
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
            <p className="text-zinc-500 text-xs text-center mb-6">
              <span className="text-red-400">&hearts;</span>{" "}
              5% of your subscription goes to{" "}
              <a
                href="https://www.crisis.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400/80 hover:text-orange-300 underline"
              >
                Crisis UK
              </a>{" "}
              to help end homelessness
            </p>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
              style={heading}
            >
              START FREE — NO CARD NEEDED
            </Link>
            <p className="text-zinc-600 text-xs text-center mt-4">
              First 3 documents completely free. Upgrade when you&apos;re ready.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* FINAL CTA */}
      <section className="border-l-4 border-r-4 border-orange-500 mx-6 lg:mx-auto max-w-5xl rounded-2xl bg-[#1a1a1a] py-16 px-8 text-center my-12">
        <h2
          className="text-4xl lg:text-5xl tracking-wide text-white mb-4"
          style={heading}
        >
          STOP LOSING JOBS TO
          <br />
          <span className="text-orange-500">BETTER-LOOKING QUOTES.</span>
        </h2>
        <p className="text-zinc-400 text-lg mb-8">
          Join tradespeople across the UK using QuoteFix to win more work.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
          style={heading}
        >
          GET STARTED FREE
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1a1a1a] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <p
                className="text-2xl text-orange-500 tracking-wide mb-2"
                style={heading}
              >
                QUOTEFIX
              </p>
              <p className="text-zinc-500 text-sm">
                Professional documents for UK tradespeople
              </p>
              <p className="text-zinc-600 text-xs mt-2">
                <span className="text-red-400">&hearts;</span>{" "}
                5% of every subscription donated to{" "}
                <a
                  href="https://www.crisis.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 underline"
                >
                  Crisis UK
                </a>
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="#pricing" className="text-zinc-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/sign-in" className="text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-zinc-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-zinc-400">Privacy Policy</span>
              <span className="text-zinc-400">Terms of Service</span>
              <span className="text-zinc-400">Contact</span>
            </div>
          </div>
          <div className="border-t border-[#1a1a1a] mt-10 pt-6">
            <p className="text-zinc-600 text-xs text-center">
              &copy; 2026 QuoteFix &middot; Built for UK tradespeople &middot;
              quotefix.co.uk
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
