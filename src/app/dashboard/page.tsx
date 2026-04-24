"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

interface QuoteSummary {
  id: string;
  quote_number: string;
  doc_type: string;
  client_name: string;
  job_type: string;
  total: number;
  created_at: string;
}

const DOC_PATH: Record<string, string> = {
  quote: "q",
  invoice: "i",
  contract: "c",
};

const TYPE_BADGES: Record<string, string> = {
  quote: "bg-blue-500/20 text-blue-400",
  invoice: "bg-green-500/20 text-green-400",
  contract: "bg-purple-500/20 text-purple-400",
};

function DocMenu({
  doc,
  onDelete,
  onDuplicate,
}: {
  doc: QuoteSummary;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { dark } = useTheme();
  const t = getThemeClasses(dark);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const docPath = `/${DOC_PATH[doc.doc_type] || "q"}/${doc.id}`;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${docPath}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-lg hover:bg-[#333] transition-colors"
      >
        <svg
          className="w-5 h-5 text-zinc-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 top-10 z-50 ${dark?"bg-[#222] border-[#333]":"bg-white border-zinc-200"} border rounded-xl shadow-2xl py-1 w-44 overflow-hidden`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              router.push(docPath);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm ${t.heading} ${dark?"hover:bg-[#2a2a2a]":"hover:bg-zinc-50"} flex items-center gap-3 transition-colors`}
          >
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Open
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              router.push(`/edit/${doc.id}`);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm ${t.heading} ${dark?"hover:bg-[#2a2a2a]":"hover:bg-zinc-50"} flex items-center gap-3 transition-colors`}
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDuplicate(doc.id);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm ${t.heading} ${dark?"hover:bg-[#2a2a2a]":"hover:bg-zinc-50"} flex items-center gap-3 transition-colors`}
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              window.open(docPath, "_blank");
            }}
            className={`w-full text-left px-4 py-2.5 text-sm ${t.heading} ${dark?"hover:bg-[#2a2a2a]":"hover:bg-zinc-50"} flex items-center gap-3 transition-colors`}
          >
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(shareUrl).then(() => {
                setLinkCopied(true);
                setTimeout(() => {
                  setLinkCopied(false);
                  setOpen(false);
                }, 1500);
              });
            }}
            className={`w-full text-left px-4 py-2.5 text-sm ${t.heading} ${dark?"hover:bg-[#2a2a2a]":"hover:bg-zinc-50"} flex items-center gap-3 transition-colors`}
          >
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {linkCopied ? "\u2713 Copied!" : "Copy Share Link"}
          </button>
          <div className={`border-t ${t.border} my-1`} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              if (confirm("Delete this document? This cannot be undone.")) {
                onDelete(doc.id);
              }
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const { isSignedIn, isLoaded } = useUser();
  const dashRouter = useRouter();
  const searchParams = useSearchParams();
  const { dark } = useTheme();
  const t = getThemeClasses(dark);
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState("free");
  const [docCount, setDocCount] = useState(0);
  const [freeLimit, setFreeLimit] = useState(3);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      dashRouter.push("/");
    }
  }, [isLoaded, isSignedIn, dashRouter]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuotes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/subscription")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSubStatus(data.status || "free");
          setDocCount(data.documentCount || 0);
          setFreeLimit(data.freeLimit || 3);
        }
      })
      .catch(() => {});
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setToast("Welcome to QuoteFix Pro \u2014 you're all set \uD83C\uDF89");
      setTimeout(() => setToast(""), 5000);
      dashRouter.replace("/dashboard");
    }
  }, [searchParams, dashRouter]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch("/api/documents/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.error === "upgrade_required") {
      dashRouter.push("/upgrade");
      return;
    }
    if (data.id) {
      setToast("Document duplicated — now editing copy");
      setTimeout(() => setToast(""), 3000);
      dashRouter.push(`/edit/${data.id}`);
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) return null;

  const showFreeBanner = subStatus !== "active";
  const showCharityBadge = subStatus === "active";

  return (
    <div className={`max-w-6xl mx-auto px-6 py-10 w-full min-h-screen ${t.pageBg} transition-colors`}>
      {showCharityBadge && (
        <p className={`${t.mutedMore} text-xs mb-4`}>
          <span className="text-red-400">&hearts;</span>{" "}
          Thanks to your subscription, QuoteFix donates to{" "}
          <a
            href="https://www.crisis.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.muted} hover:text-orange-500 underline`}
          >
            Crisis UK
          </a>{" "}
          every month.
        </p>
      )}
      {showFreeBanner && (
        <div className={`${t.cardBg} border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
          <p className={`${t.body} text-sm`}>
            <span className="text-orange-500 font-semibold">{docCount}</span> of{" "}
            <span className="font-semibold">{freeLimit}</span> free documents used
            {docCount >= freeLimit && (
              <span className="text-orange-400 ml-1">
                — upgrade for unlimited
              </span>
            )}
          </p>
          <Link
            href="/upgrade"
            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider hover:bg-orange-600 transition-colors"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            UPGRADE
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2
            className={`text-4xl ${t.heading} tracking-wide`}
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            YOUR DOCUMENTS
          </h2>
          <p className="${t.muted} mt-1 text-sm">
            {quotes.length} document{quotes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/new"
          className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-bold tracking-wider hover:bg-orange-600 transition-colors"
          style={{ fontFamily: "var(--font-bebas-neue)", fontSize: "1rem" }}
        >
          NEW DOCUMENT
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : quotes.length === 0 ? (
        <div className={`text-center py-24 ${t.cardBg} border rounded-xl`}>
          <p
            className={`text-3xl ${t.muted} mb-4 tracking-wide`}
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            NO DOCUMENTS YET
          </p>
          <p className="text-zinc-500 mb-6 text-sm">
            Create your first quote, invoice, or contract
          </p>
          <Link
            href="/new"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            CREATE YOUR FIRST QUOTE
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((q) => (
            <div
              key={q.id}
              className={`${t.cardBg} border rounded-xl px-4 sm:px-6 py-4 hover:border-l-2 hover:border-l-orange-500 hover:-translate-y-0.5 transition-all group`}
            >
              <Link
                href={`/${DOC_PATH[q.doc_type] || "q"}/${q.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 flex-1 min-w-0"
              >
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-5">
                  <span className="text-orange-500 font-semibold text-sm">
                    {q.quote_number}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${TYPE_BADGES[q.doc_type] || TYPE_BADGES.quote}`}
                  >
                    {(q.doc_type || "quote").charAt(0).toUpperCase() +
                      (q.doc_type || "quote").slice(1)}
                  </span>
                  <span className={`${t.heading} font-semibold sm:hidden ml-auto`}>
                    &pound;{q.total?.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="sm:hidden">
                    <DocMenu doc={q} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                  </div>
                </div>
                <span className={`${t.heading} font-medium truncate hidden sm:inline`}>
                  {q.client_name}
                </span>
                <span className={`${t.muted} text-sm truncate sm:hidden`}>
                  {q.client_name} {q.job_type ? `· ${q.job_type}` : ""}
                </span>
                <span className="text-zinc-500 text-sm hidden md:inline">
                  {q.job_type}
                </span>
              </Link>
              <div className="hidden sm:flex items-center gap-4 ml-4 shrink-0">
                <span className={`${t.heading} font-semibold`}>
                  &pound;{q.total?.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-zinc-500 text-sm hidden md:inline">
                  {new Date(q.created_at).toLocaleDateString("en-GB")}
                </span>
                <DocMenu doc={q} onDelete={handleDelete} onDuplicate={handleDuplicate} />
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
