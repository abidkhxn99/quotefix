"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SavedQuote } from "@/types/quote";

const DOC_PATH: Record<string, string> = {
  quote: "q",
  invoice: "i",
  contract: "c",
};

export default function LegacyQuotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: SavedQuote) => {
        const prefix = DOC_PATH[data.doc_type] || "q";
        router.replace(`/${prefix}/${id}`);
      })
      .catch(() => setNotFound(true));
  }, [id, router]);

  if (notFound) {
    return (
      <div className="flex-1 flex items-center justify-center">
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

  return null;
}
