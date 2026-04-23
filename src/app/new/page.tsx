"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import QuoteForm from "@/components/QuoteForm";
import QuotePreview from "@/components/QuotePreview";
import { QuoteFormData, GeneratedQuote, DocType } from "@/types/quote";

const DOC_PATH: Record<DocType, string> = {
  quote: "q",
  invoice: "i",
  contract: "c",
};

export default function NewQuotePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [quote, setQuote] = useState<
    (GeneratedQuote & { id?: string; quoteNumber?: string }) | null
  >(null);
  const [formData, setFormData] = useState<QuoteFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!isLoaded || !isSignedIn) return;

    // Check if user can create documents before showing the form
    fetch("/api/subscription")
      .then((res) => res.json())
      .then((data) => {
        if (!data.canCreate) {
          router.replace("/upgrade");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn || checking) return null;

  async function handleSubmit(data: QuoteFormData) {
    setLoading(true);
    setError(null);
    setFormData(data);

    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.error === "upgrade_required") {
          router.push("/upgrade");
          return;
        }
        throw new Error(
          body?.message ||
            body?.error ||
            `Server error (${res.status}). Please try again.`
        );
      }

      const generated = await res.json();
      setQuote(generated);

      // Update URL to the document's shareable path
      if (generated.id) {
        const prefix = DOC_PATH[data.docType] || "q";
        window.history.replaceState(null, "", `/${prefix}/${generated.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full">
      {!quote ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h2
              className="text-4xl text-white tracking-wide"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              CREATE A DOCUMENT
            </h2>
            <p className="text-zinc-400 mt-1 text-sm">
              Fill in the details to generate a professional quote, invoice, or
              contract.
            </p>
          </div>
          <QuoteForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 print:hidden">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              &larr; Back to Dashboard
            </button>
            <button
              onClick={() => {
                setQuote(null);
                setFormData(null);
                window.history.replaceState(null, "", "/new");
              }}
              className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
            >
              Create Another
            </button>
          </div>
          <QuotePreview
            quote={quote}
            formData={formData!}
            quoteId={quote.id}
            quoteNumber={quote.quoteNumber}
          />
        </div>
      )}
    </div>
  );
}
