"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import QuoteForm from "@/components/QuoteForm";
import { QuoteFormData, DocType } from "@/types/quote";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";
import { DEFAULT_PAYMENT_DETAILS } from "@/types/payment";

const DOC_PATH: Record<DocType, string> = {
  quote: "q",
  invoice: "i",
  contract: "c",
};

export default function EditPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { dark } = useTheme();
  const t = getThemeClasses(dark);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docNumber, setDocNumber] = useState("");
  const [initialData, setInitialData] = useState<Partial<QuoteFormData> | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!isLoaded || !isSignedIn) return;

    fetch(`/api/documents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((doc) => {
        setDocNumber(doc.quote_number);
        setInitialData({
          docType: doc.doc_type || "quote",
          docNumber: doc.quote_number,
          companyName: doc.company_name || "",
          companyNumber: doc.company_number || "",
          vatNumber: doc.vat_number || "",
          tradesmanName: doc.tradesman_name || "",
          brandColour: doc.brand_colour || "#f97316",
          logoDataUrl: doc.logo_url || "",
          clientName: doc.client_name || "",
          clientEmail: doc.client_email || "",
          clientAddress: doc.client_address || "",
          clientPhone: doc.client_phone || "",
          jobType: doc.job_type || "",
          jobTypeOther: "",
          description: doc.description || "",
          labourDays: doc.labour_days || 1,
          dayRate: doc.day_rate || 250,
          materials: doc.materials?.length ? doc.materials : [{ name: "", cost: 0 }],
          vatRegistered: doc.vat_registered ?? false,
          selectedTerms: doc.terms || [],
          customTerms: [],
          paymentDetails: { ...DEFAULT_PAYMENT_DETAILS, ...(doc.payment_details || {}) },
          dueDate: doc.due_date || "",
          projectStart: doc.project_start || "",
          projectEnd: doc.project_end || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Document not found");
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, id, router]);

  async function handleSubmit(data: QuoteFormData) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.error === "upgrade_required" || body?.error === "edit_limit") {
          router.push("/upgrade");
          return;
        }
        throw new Error(body?.message || body?.error || "Could not save changes");
      }

      const prefix = DOC_PATH[data.docType] || "q";
      router.push(`/${prefix}/${id}?edited=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  if (loading) {
    return (
      <div className={`max-w-2xl mx-auto px-6 py-10 min-h-screen ${t.pageBg}`}>
        <p className={t.muted}>Loading document...</p>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className={`max-w-2xl mx-auto px-6 py-10 min-h-screen ${t.pageBg}`}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-6 py-10 w-full min-h-screen ${t.pageBg} transition-colors`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className={`text-sm ${t.muted} hover:text-orange-500 transition-colors mb-4`}
          >
            &larr; Back to Dashboard
          </button>
          <h2
            className={`text-4xl ${t.heading} tracking-wide`}
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            EDIT DOCUMENT
          </h2>
          <p className={`${t.muted} mt-1 text-sm`}>
            Editing <span className="text-orange-500 font-medium">{docNumber}</span> — changes will overwrite the original
          </p>
        </div>

        <QuoteForm
          onSubmit={handleSubmit}
          loading={saving}
          initialData={initialData || undefined}
          editMode
        />

        {error && (
          <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
