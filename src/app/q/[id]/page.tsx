"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SavedQuotePreview } from "@/components/QuotePreview";
import { SavedQuote } from "@/types/quote";

export default function SharedQuotePage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setQuote(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Document not found
          </h2>
          <p className="text-zinc-500">
            This document may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6 py-10 w-full">
        <SavedQuotePreview quote={quote} />
      </div>
    </div>
  );
}
