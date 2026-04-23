"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── helpers ── */
function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("opacity-100","translate-y-0"); el.classList.remove("opacity-0","translate-y-6"); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function FadeIn({ children, className="" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollFade();
  return <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>{children}</div>;
}

const H = { fontFamily: "var(--font-bebas-neue)" };

function ViewerCount() {
  const [c, setC] = useState(4);
  useEffect(() => { const id = setInterval(() => setC(p => p===3?4:p===4?5:3), 3000); return () => clearInterval(id); }, []);
  return <p className="text-sm mt-3 flex items-center justify-center gap-1.5 opacity-60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>{c} people viewing this right now</p>;
}

/* ── theme hook ── */
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem("qf-theme") === "dark"); }, []);
  const toggle = useCallback(() => {
    setDark(prev => { const next = !prev; localStorage.setItem("qf-theme", next ? "dark" : "light"); return next; });
  }, []);
  return { dark, toggle };
}

/* ── main ── */
export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (isLoaded && isSignedIn) router.replace("/dashboard"); }, [isLoaded, isSignedIn, router]);
  if (isLoaded && isSignedIn) return null;

  // theme classes
  const bg = dark ? "bg-[#0f0f0f] text-white" : "bg-white text-zinc-900";
  const bg2 = dark ? "bg-[#1a1a1a]" : "bg-zinc-50";
  const border = dark ? "border-[#2a2a2a]" : "border-zinc-200";
  const muted = dark ? "text-zinc-400" : "text-zinc-500";
  const mutedMore = dark ? "text-zinc-500" : "text-zinc-400";
  const heading2 = dark ? "text-white" : "text-zinc-900";
  const cardBg = dark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-zinc-200 shadow-sm";

  const jsonLd = {"@context":"https://schema.org","@type":"SoftwareApplication",name:"QuoteFix",applicationCategory:"BusinessApplication",operatingSystem:"Web",url:"https://quotefix.co.uk",description:"Professional quotes, invoices and contracts for UK tradespeople.",offers:{"@type":"Offer",price:"19.00",priceCurrency:"GBP",priceValidUntil:"2027-12-31"},aggregateRating:{"@type":"AggregateRating",ratingValue:"4.9",ratingCount:"127"}};

  return (
    <div className={`${bg} transition-colors duration-300`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>

      {/* ─── STICKY HEADER ─── */}
      <header className={`sticky top-0 z-50 ${dark ? "bg-[#0f0f0f]/95" : "bg-white/95"} backdrop-blur border-b-2 border-orange-500 transition-colors`}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-3xl font-bold tracking-wide text-orange-500 leading-none" style={H}>QUOTEFIX</span>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[["Features","#features"],["How it Works","#how-it-works"],["Pricing","#pricing"]].map(([l,h])=>(
              <a key={h} href={h} className={`${muted} hover:text-orange-500 transition-colors`}>{l}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggle} className={`p-2 rounded-lg ${dark?"hover:bg-white/10":"hover:bg-zinc-100"} transition-colors`} aria-label="Toggle theme">
              {dark ? <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                : <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>}
            </button>
            <Link href="/sign-in" className={`text-sm ${muted} hover:text-orange-500 transition-colors`}>Sign in</Link>
            <a href="#pricing" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">Pricing</a>
            <Link href="/sign-up" className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold tracking-wider hover:bg-orange-600 transition-colors" style={{...H, fontSize:"0.9rem"}}>START FREE</Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggle} className="p-2" aria-label="Toggle theme">
              {dark ? <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                : <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>}
            </button>
            <button onClick={()=>setMenuOpen(!menuOpen)} className="p-2">
              <svg className={`w-6 h-6 ${dark?"text-white":"text-zinc-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`md:hidden ${dark?"bg-[#0f0f0f]":"bg-white"} border-t ${border} px-6 py-4 space-y-3`}>
            {[["Features","#features"],["How it Works","#how-it-works"],["Pricing","#pricing"]].map(([l,h])=>(
              <a key={h} href={h} onClick={()=>setMenuOpen(false)} className={`block ${muted} hover:text-orange-500`}>{l}</a>
            ))}
            <Link href="/sign-in" className={`block ${muted}`}>Sign in</Link>
            <Link href="/sign-up" className="block bg-orange-500 text-white text-center py-2 rounded-lg font-bold tracking-wider" style={H}>START FREE</Link>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className={`text-5xl lg:text-6xl tracking-wide leading-tight ${heading2}`} style={H}>
              PROFESSIONAL QUOTES,<br/>INVOICES & CONTRACTS —<br/><span className="text-orange-500">BUILT FOR TRADESPEOPLE.</span>
            </h1>
            <p className={`${muted} text-lg mt-6 max-w-lg leading-relaxed`}>
              Stop sending dodgy WhatsApp quotes. QuoteFix generates professional documents in 60 seconds — branded to your business, ready to send.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/sign-up" className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all" style={H}>START FOR FREE</Link>
              <a href="#demo" className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-500/10 transition-all" style={H}>SEE IT IN ACTION</a>
            </div>
            <p className={`${mutedMore} text-sm mt-5`}>No credit card required &middot; 3 free documents &middot; Cancel anytime</p>
          </div>

          {/* App preview mockup */}
          <div className="hidden lg:block">
            <div className={`rounded-2xl overflow-hidden shadow-2xl border ${border}`}>
              {/* Browser chrome */}
              <div className={`${dark?"bg-[#1a1a1a]":"bg-zinc-100"} px-4 py-2 flex items-center gap-2`}>
                <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400"/><span className="w-3 h-3 rounded-full bg-yellow-400"/><span className="w-3 h-3 rounded-full bg-green-400"/></div>
                <div className={`flex-1 ${dark?"bg-[#222]":"bg-white"} rounded-md px-3 py-1 text-xs ${muted} ml-2`}>quotefix.co.uk/new</div>
              </div>
              {/* App content */}
              <div className="grid grid-cols-2">
                {/* Left: dark form */}
                <div className="bg-[#0f0f0f] p-4 space-y-3">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-2 border-l-orange-500 rounded-lg p-3">
                    <p className="text-white text-xs font-semibold mb-2">Your Details</p>
                    <div className="bg-[#222] rounded h-5 w-full mb-1.5"/>
                    <div className="bg-[#222] rounded h-5 w-3/4"/>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-2 border-l-orange-500 rounded-lg p-3">
                    <p className="text-white text-xs font-semibold mb-2">Job Details</p>
                    <div className="bg-[#222] rounded h-5 w-full mb-1.5"/>
                    <div className="bg-[#222] rounded h-12 w-full"/>
                  </div>
                  <div className="bg-orange-500 rounded-lg py-2 text-center text-white text-xs font-bold tracking-wider" style={H}>BUILD MY QUOTE</div>
                </div>
                {/* Right: white document */}
                <div className="bg-white p-4">
                  <div className="bg-orange-500 rounded-t-lg p-3 text-white">
                    <p className="text-sm font-bold">Quote</p>
                    <p className="text-xs opacity-80">QF-001</p>
                  </div>
                  <div className="border border-zinc-200 border-t-0 rounded-b-lg p-3 text-xs space-y-2">
                    <p className="font-semibold text-zinc-900">Mrs Jane Patel</p>
                    <div className="border-t border-zinc-100 pt-2 space-y-1">
                      <div className="flex justify-between text-zinc-700"><span>Labour - Kitchen</span><span>&pound;1,500</span></div>
                      <div className="flex justify-between text-zinc-700"><span>Materials</span><span>&pound;600</span></div>
                    </div>
                    <div className="border-t-2 border-orange-500 pt-2 flex justify-between">
                      <span className="font-bold text-zinc-900">Total</span>
                      <span className="font-bold text-orange-500">&pound;2,100.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIDEO PLACEHOLDER ─── */}
      <FadeIn>
        <section id="demo" className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className={`text-3xl lg:text-4xl tracking-wide text-center ${heading2} mb-3`} style={H}>SEE QUOTEFIX IN ACTION</h2>
          <p className={`text-center ${muted} mb-8`}>Watch how a plumber creates a professional quote in under 60 seconds</p>
          {/* TODO: Replace with Loom embed URL when video is recorded */}
          <div className={`aspect-video rounded-2xl ${dark?"bg-[#1a1a1a] border border-[#2a2a2a]":"bg-zinc-100 border border-zinc-200"} flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}>
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className={`${muted} text-sm`}>60 second walkthrough</p>
          </div>
        </section>
      </FadeIn>

      {/* ─── TRUST BAR ─── */}
      <section className={`border-y ${border} py-6 overflow-hidden transition-colors`}>
        <p className={`text-center ${heading2} font-semibold text-sm mb-4`}>Trusted by 1,000+ tradespeople across the UK</p>
        <div className="relative" style={{maskImage:"linear-gradient(to right,transparent,black 10%,black 90%,transparent)",WebkitMaskImage:"linear-gradient(to right,transparent,black 10%,black 90%,transparent)"}}>
          <div className="flex whitespace-nowrap animate-marquee">
            {[0,1].map(i=><span key={i} className={`${mutedMore} text-sm tracking-wide shrink-0 pr-4`}>Electricians &middot; Plumbers &middot; Builders &middot; Plasterers &middot; Cleaners &middot; Landscapers &middot; Decorators &middot; Roofers &middot; Tilers &middot; Joiners &middot; Heating Engineers &middot; Window Cleaners &middot; Pressure Washers &middot; Painters &middot; Groundworkers &middot;&nbsp;</span>)}
          </div>
        </div>
      </section>

      {/* ─── WHATSAPP vs QUOTEFIX ─── */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-4xl lg:text-5xl tracking-wide ${heading2}`} style={H}>STILL SENDING QUOTES<br/>ON WHATSAPP?</h2>
              <p className={`${muted} text-lg mt-6 leading-relaxed max-w-md`}>
                Most tradespeople lose jobs not because of their work — but because their quote looked unprofessional. A scruffy message with a number on it doesn&apos;t inspire confidence. QuoteFix fixes that in 60 seconds.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Before — phone mockup */}
              <div className="bg-red-950/30 border border-red-900/30 rounded-2xl p-4">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Before QuoteFix</p>
                <div className={`${dark?"bg-[#111]":"bg-zinc-800"} rounded-2xl p-3 shadow-lg`}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700">
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">D</div>
                    <span className="text-white text-xs font-medium">Dave</span>
                  </div>
                  <div className="bg-green-800/40 rounded-lg p-2 mb-2 max-w-[85%] ml-auto">
                    <p className="text-white text-xs leading-relaxed">hi mate driveway jet wash &pound;200 cheers dave</p>
                    <p className="text-zinc-500 text-[10px] text-right mt-1">14:23</p>
                  </div>
                  <div className="flex items-center gap-1 ml-auto w-fit">
                    <span className="text-zinc-600 text-[10px]">Delivered</span>
                    <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <p className="text-zinc-600 text-[10px] text-center mt-4">No reply...</p>
                </div>
              </div>
              {/* After — document mockup */}
              <div className="bg-green-950/30 border border-green-900/30 rounded-2xl p-4">
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">After QuoteFix</p>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-orange-500 p-2.5 text-white">
                    <p className="text-xs font-bold">Quote</p>
                    <p className="text-[10px] opacity-80">Dave&apos;s Jet Washing</p>
                  </div>
                  <div className="p-3 text-xs space-y-1.5">
                    <p className="font-semibold text-zinc-900">Mr Thompson</p>
                    <p className="text-zinc-500">Driveway pressure wash</p>
                    <div className="border-t border-zinc-200 pt-1.5 flex justify-between">
                      <span className="text-zinc-700">Total</span>
                      <span className="font-bold text-orange-500">&pound;200.00</span>
                    </div>
                    <p className="text-zinc-400 text-[10px]">Valid 30 days</p>
                  </div>
                  <div className="bg-green-50 border-t border-green-200 p-2 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    <span className="text-green-700 text-xs font-medium">Quote Accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className={`text-center ${heading2} font-semibold text-lg mt-12`} style={H}>
            PROFESSIONAL QUOTES GET OPENED. <span className="text-orange-500">WHATSAPP MESSAGES GET IGNORED.</span>
          </p>
        </section>
      </FadeIn>

      {/* ─── FEATURES ─── */}
      <FadeIn>
        <section id="features" className={`${bg2} py-24 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className={`text-4xl lg:text-5xl tracking-wide text-center ${heading2} mb-16`} style={H}>EVERYTHING YOU NEED. <span className="text-orange-500">NOTHING YOU DON&apos;T.</span></h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",title:"3 Document Types",desc:"Create quotes, invoices and contracts — all from the same form. Switch between them in one click."},
                {icon:"M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",title:"Your Branding",desc:"Upload your logo and pick your brand colour. Every document looks like it came from a proper business."},
                {icon:"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",title:"Send in Seconds",desc:"Share a link your client can open on their phone, or save as a PDF. No printing, no scanning, no faff."},
                {icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",title:"AI Description Clean-up",desc:"Type your rough job notes and hit Clean up. QuoteFix rewrites them into professional language automatically."},
                {icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",title:"Terms & Conditions Builder",desc:"Pick from a library of pre-written trade terms or add your own. Never write T&Cs from scratch again."},
                {icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",title:"Document History",desc:"Every quote, invoice and contract saved to your account. Find anything in seconds."},
              ].map(f=>(
                <div key={f.title} className={`${cardBg} border rounded-xl p-6 hover:border-orange-500/40 transition-colors`}>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon}/></svg>
                  </div>
                  <h3 className={`${heading2} font-semibold mb-2`}>{f.title}</h3>
                  <p className={`${muted} text-sm leading-relaxed`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── CHARGE MORE, WIN MORE ─── */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className={`text-4xl lg:text-5xl tracking-wide text-center ${heading2} mb-6`} style={H}>LOOK PROFESSIONAL. <span className="text-orange-500">CHARGE WHAT YOU&apos;RE WORTH.</span></h2>
          <p className={`${muted} text-center text-lg max-w-2xl mx-auto leading-relaxed mb-12`}>
            When your quote looks professional, clients assume you are professional. That means less haggling, faster sign-offs, and the confidence to charge your actual rate — not what you think they&apos;ll accept. Tradespeople using QuoteFix report clients questioning their prices less and accepting quotes faster. First impressions matter even before you&apos;ve set foot on the job.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {title:"Faster quote acceptance",sub:"Clients respond quicker to professional documents"},
              {title:"Less price haggling",sub:"Professional presentation builds trust before the job starts"},
              {title:"More referrals",sub:"Clients who trust you recommend you"},
            ].map(s=>(
              <div key={s.title} className={`${cardBg} border rounded-xl p-6 text-center border-l-2 border-l-orange-500`}>
                <h3 className={`${heading2} font-semibold text-lg mb-2`}>{s.title}</h3>
                <p className={`${muted} text-sm`}>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── HOW IT WORKS ─── */}
      <FadeIn>
        <section id="how-it-works" className={`${bg2} py-24 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className={`text-4xl lg:text-5xl tracking-wide text-center ${heading2} mb-16`} style={H}>UP AND RUNNING IN <span className="text-orange-500">3 STEPS</span></h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[{n:"1",title:"Fill in your details",desc:"Enter your job info, client details, labour and materials. Takes less than 2 minutes."},{n:"2",title:"Build your document",desc:"Hit the button. QuoteFix generates a professional quote, invoice or contract instantly."},{n:"3",title:"Send to your client",desc:"Share a link, download as PDF, or print. Your client gets something that looks the business."}].map(s=>(
                <div key={s.n} className="text-center">
                  <span className="text-7xl text-orange-500 block mb-4" style={H}>{s.n}</span>
                  <h3 className={`text-xl font-semibold ${heading2} mb-3`}>{s.title}</h3>
                  <p className={`${muted} text-sm leading-relaxed max-w-xs mx-auto`}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── TESTIMONIALS ─── */}
      <FadeIn>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className={`text-4xl lg:text-5xl tracking-wide text-center ${heading2} mb-16`} style={H}>WHAT TRADESPEOPLE ARE <span className="text-orange-500">SAYING</span></h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {quote:"QuoteFix makes sending quotes dead easy. My customers actually comment on how professional everything looks now. Proper game changer for the business.",name:"Christian",company:"Rightways Cleaning Solutions",initials:"RC"},
              {quote:"I've tried loads of tools but they're all built for office people. QuoteFix is actually built for people like us — fill it in, send it, done. The contract feature alone is worth it.",name:"Mark",company:"PIXLD",initials:"MP"},
              {quote:"Went from sending WhatsApp voice notes about prices to sending proper branded invoices in the same week. Clients take you more seriously straight away.",name:"Shadmaan",company:"SuitsYouMedia",initials:"SS"},
            ].map(t=>(
              <div key={t.name} className={`${cardBg} border rounded-xl p-6`}>
                <span className="text-4xl text-orange-500 leading-none block mb-3">&ldquo;</span>
                <p className={`${muted} text-sm leading-relaxed mb-6`}>{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">{t.initials}</div>
                  <div>
                    <p className={`${heading2} font-semibold text-sm`}>{t.name}</p>
                    <p className={`${mutedMore} text-xs`}>{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── PRICING ─── */}
      <FadeIn>
        <section id="pricing" className={`${bg2} py-24 transition-colors`}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className={`text-4xl lg:text-5xl tracking-wide text-center ${heading2} mb-16`} style={H}>SIMPLE PRICING. <span className="text-orange-500">NO SURPRISES.</span></h2>
            <div className={`max-w-md mx-auto ${cardBg} border-2 border-orange-500 rounded-2xl p-8`}>
              <div className="text-center mb-8">
                <p className={`${mutedMore} text-sm line-through mb-1`}>&pound;25/month</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-6xl ${heading2}`} style={H}>&pound;19</span>
                  <span className={`${muted} text-lg`}>/month</span>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase">Sale</span>
                </div>
                <p className={`${mutedMore} text-sm mt-2`}>or &pound;190/year — save 2 months</p>
                <ViewerCount/>
              </div>
              <ul className="space-y-3 mb-6">
                {["Unlimited quotes, invoices and contracts","Your logo and brand colour on every document","Shareable client links","Terms & Conditions builder","AI description clean-up","Document history","Cancel anytime"].map(f=>(
                  <li key={f} className={`flex items-start gap-3 text-sm ${dark?"text-zinc-300":"text-zinc-700"}`}>
                    <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <p className={`${mutedMore} text-xs text-center mb-6`}>
                <span className="text-red-400">&hearts;</span> 5% of your subscription goes to <a href="https://www.crisis.org.uk" target="_blank" rel="noopener noreferrer" className="text-orange-400/80 hover:text-orange-300 underline">Crisis UK</a> to help end homelessness
              </p>
              <Link href="/sign-up" className="block w-full text-center bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all" style={H}>START FREE — NO CARD NEEDED</Link>
              <p className={`${mutedMore} text-xs text-center mt-4`}>First 3 documents completely free. Upgrade when you&apos;re ready.</p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── FINAL CTA ─── */}
      <section className={`border-l-4 border-r-4 border-orange-500 mx-6 lg:mx-auto max-w-5xl rounded-2xl ${bg2} py-16 px-8 text-center my-12 transition-colors`}>
        <h2 className={`text-4xl lg:text-5xl tracking-wide ${heading2} mb-4`} style={H}>STOP LOSING JOBS TO<br/><span className="text-orange-500">BETTER-LOOKING QUOTES.</span></h2>
        <p className={`${muted} text-lg mb-8`}>Join tradespeople across the UK using QuoteFix to win more work.</p>
        <Link href="/sign-up" className="inline-block bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all" style={H}>GET STARTED FREE</Link>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={`border-t ${border} mt-12 transition-colors`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <p className="text-2xl text-orange-500 tracking-wide mb-2" style={H}>QUOTEFIX</p>
              <p className={`${muted} text-sm`}>Professional documents for UK tradespeople</p>
              <p className={`${mutedMore} text-xs mt-2`}><span className="text-red-400">&hearts;</span> 5% of every subscription donated to <a href="https://www.crisis.org.uk" target="_blank" rel="noopener noreferrer" className={`${muted} hover:text-orange-500 underline`}>Crisis UK</a></p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#features" className={`${muted} hover:text-orange-500 transition-colors`}>Features</a>
              <a href="#pricing" className={`${muted} hover:text-orange-500 transition-colors`}>Pricing</a>
              <Link href="/sign-in" className={`${muted} hover:text-orange-500 transition-colors`}>Sign In</Link>
              <Link href="/sign-up" className={`${muted} hover:text-orange-500 transition-colors`}>Sign Up</Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className={muted}>Privacy Policy</span>
              <span className={muted}>Terms of Service</span>
              <span className={muted}>Contact</span>
            </div>
          </div>
          <div className={`border-t ${border} mt-10 pt-6`}>
            <p className={`${mutedMore} text-xs text-center`}>&copy; 2026 QuoteFix &middot; Built for UK tradespeople &middot; quotefix.co.uk</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
