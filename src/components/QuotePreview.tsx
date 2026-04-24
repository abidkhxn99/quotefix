"use client";

import { useState } from "react";
import { PaymentDetails, DEFAULT_PAYMENT_DETAILS } from "@/types/payment";
import {
  GeneratedQuote,
  QuoteFormData,
  SavedQuote,
  DocType,
} from "@/types/quote";

interface QuotePreviewProps {
  quote: GeneratedQuote;
  formData: QuoteFormData;
  quoteId?: string;
  quoteNumber?: string;
}

interface SavedQuotePreviewProps {
  quote: SavedQuote;
}

function formatGBP(value: number): string {
  return value.toFixed(2);
}

const DOC_LABELS: Record<DocType, string> = {
  quote: "Quote",
  invoice: "Invoice",
  contract: "Contract",
};

const DOC_PATH_PREFIX: Record<DocType, string> = {
  quote: "q",
  invoice: "i",
  contract: "c",
};

export function SavedQuotePreview({ quote }: SavedQuotePreviewProps) {
  const formData: QuoteFormData = {
    docType: quote.doc_type || "quote",
    docNumber: quote.quote_number,
    companyName: quote.company_name,
    companyNumber: quote.company_number || "",
    vatNumber: quote.vat_number || "",
    tradesmanName: quote.tradesman_name,
    brandColour: quote.brand_colour || "#f97316",
    logoDataUrl: quote.logo_url || "",
    clientName: quote.client_name,
    clientEmail: quote.client_email,
    clientAddress: quote.client_address,
    clientPhone: quote.client_phone,
    jobType: quote.job_type,
    jobTypeOther: "",
    description: quote.description,
    labourDays: quote.labour_days,
    dayRate: quote.day_rate,
    materials: quote.materials,
    vatRegistered: quote.vat_registered ?? quote.vat > 0,
    selectedTerms: [],
    customTerms: [],
    paymentDetails: { ...DEFAULT_PAYMENT_DETAILS, ...(quote.payment_details || {}) },
    dueDate: quote.due_date || "",
    projectStart: quote.project_start || "",
    projectEnd: quote.project_end || "",
  };

  const generated: GeneratedQuote = {
    summary: quote.summary,
    lineItems: quote.line_items,
    subtotal: quote.subtotal,
    vat: quote.vat,
    total: quote.total,
    estimatedTimeline: quote.estimated_timeline,
    terms: quote.terms,
  };

  return (
    <QuotePreview
      quote={generated}
      formData={formData}
      quoteId={quote.id}
      quoteNumber={quote.quote_number}
    />
  );
}

function PaymentDetailsBlock({ details, colour }: { details?: PaymentDetails; colour: string }) {
  if (!details) return null;
  const { bankTransfer, cash, card, paymentLink, cheque, paymentDueNote } = details;
  const hasAny = bankTransfer?.enabled || cash?.enabled || card?.enabled || paymentLink?.enabled || cheque?.enabled;
  if (!hasAny && !paymentDueNote) return null;

  const otherMethods: string[] = [];
  if (cash?.enabled) otherMethods.push(cash.note || "Cash");
  if (card?.enabled) otherMethods.push(card.note || "Card");
  if (cheque?.enabled) otherMethods.push(cheque.payableTo ? `Cheque (payable to ${cheque.payableTo})` : "Cheque");

  return (
    <div className="p-8 border-b border-zinc-200">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colour }}>
        Payment Details
      </h3>

      {paymentDueNote && (
        <p className="text-sm text-zinc-900 font-medium mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          {paymentDueNote}
        </p>
      )}

      {bankTransfer?.enabled && bankTransfer.accountName && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bank Transfer</p>
          <div className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-zinc-500">Account Name</span>
            <span className="text-zinc-900 font-medium">{bankTransfer.accountName}</span>
            <span className="text-zinc-500">Sort Code</span>
            <span className="text-zinc-900 font-medium">{bankTransfer.sortCode}</span>
            <span className="text-zinc-500">Account Number</span>
            <span className="text-zinc-900 font-medium">{bankTransfer.accountNumber}</span>
            {bankTransfer.bankName && (
              <>
                <span className="text-zinc-500">Bank</span>
                <span className="text-zinc-900 font-medium">{bankTransfer.bankName}</span>
              </>
            )}
          </div>
          {bankTransfer.referenceNote && (
            <p className="text-xs text-zinc-500 mt-2 italic">{bankTransfer.referenceNote}</p>
          )}
        </div>
      )}

      {otherMethods.length > 0 && (
        <p className="text-sm text-zinc-700 mb-3">
          <span className="text-zinc-500">We also accept:</span>{" "}
          {otherMethods.join(" · ")}
        </p>
      )}

      {paymentLink?.enabled && paymentLink.url && (
        <p className="text-sm">
          <span className="text-zinc-500">Pay online:</span>{" "}
          <a
            href={paymentLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
            style={{ color: colour }}
          >
            {paymentLink.label || "Pay online"} &rarr;
          </a>
        </p>
      )}
    </div>
  );
}

export default function QuotePreview({
  quote,
  formData,
  quoteId,
  quoteNumber,
}: QuotePreviewProps) {
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const docType = formData.docType || "quote";
  const pathPrefix = DOC_PATH_PREFIX[docType];
  const shareUrl = quoteId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${pathPrefix}/${quoteId}`
    : null;

  const displayJobType =
    formData.jobType === "Other" ? formData.jobTypeOther : formData.jobType;

  const colour = formData.brandColour || "#f97316";
  const docLabel = DOC_LABELS[docType];
  const showVat = formData.vatRegistered || quote.vat > 0;

  function formatDate(d: string): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
      {/* Header */}
      <div className="p-8 text-white" style={{ backgroundColor: colour }}>
        <div className="flex justify-between items-start">
          <div>
            {formData.logoDataUrl ? (
              <img
                src={formData.logoDataUrl}
                alt="Logo"
                className="h-14 w-auto object-contain mb-3"
              />
            ) : formData.companyName ? (
              <p className="text-xl font-bold mb-1">{formData.companyName}</p>
            ) : null}
            <h2 className="text-2xl font-bold">{docLabel}</h2>
            {quoteNumber && (
              <p className="text-sm mt-1 opacity-80">{quoteNumber}</p>
            )}
            <p className="text-sm opacity-80">{formData.tradesmanName}</p>
            {formData.companyNumber && (
              <p className="text-xs opacity-60">Co. No. {formData.companyNumber}</p>
            )}
            {formData.vatNumber && (
              <p className="text-xs opacity-60">VAT No. {formData.vatNumber}</p>
            )}
          </div>
          <div className="text-right text-sm opacity-80 whitespace-nowrap">
            <p>Date: {today}</p>
            {docType === "quote" && <p>Valid for 30 days</p>}
            {docType === "invoice" && formData.dueDate && (
              <p className="font-semibold opacity-100">
                Due: {formatDate(formData.dueDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="p-8 border-b border-zinc-200">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              {docType === "invoice" ? "Bill To" : "Prepared For"}
            </p>
            <p className="font-semibold text-zinc-900">
              {formData.clientName}
            </p>
            {formData.clientAddress && (
              <p className="text-sm text-zinc-900">{formData.clientAddress}</p>
            )}
            {formData.clientPhone && (
              <p className="text-sm text-zinc-900">{formData.clientPhone}</p>
            )}
            {formData.clientEmail && (
              <p className="text-sm text-zinc-900">{formData.clientEmail}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Job Type
            </p>
            <p className="font-semibold text-zinc-900">{displayJobType}</p>

            {docType === "contract" && formData.projectStart && (
              <>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 mt-4">
                  Project Dates
                </p>
                <p className="text-sm text-zinc-900">
                  {formatDate(formData.projectStart)} &mdash;{" "}
                  {formatDate(formData.projectEnd)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scope of Work — user's verbatim description */}
      <div className="p-8 border-b border-zinc-200">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-2"
          style={{ color: colour }}
        >
          Scope of Work
        </h3>
        <p className="text-zinc-900 text-sm leading-relaxed whitespace-pre-line">
          {formData.description}
        </p>
      </div>

      {/* Line Items */}
      <div className="p-8 border-b border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300">
              <th className="text-left py-3 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                Description
              </th>
              <th className="text-center py-3 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                Qty
              </th>
              <th className="text-right py-3 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                Unit Price
              </th>
              <th className="text-right py-3 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-3 text-zinc-900">{item.description}</td>
                <td className="py-3 text-center text-zinc-900">
                  {item.quantity}
                </td>
                <td className="py-3 text-right text-zinc-900 pl-3 whitespace-nowrap">
                  &pound;{formatGBP(item.unitPrice)}
                </td>
                <td className="py-3 text-right font-medium text-zinc-900 pl-3 whitespace-nowrap">
                  &pound;{formatGBP(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex flex-col items-end space-y-1 text-sm">
          <div className="flex justify-between w-52">
            <span className="text-zinc-900">Subtotal</span>
            <span className="text-zinc-900">
              &pound;{formatGBP(quote.subtotal)}
            </span>
          </div>
          {showVat && (
            <div className="flex justify-between w-52">
              <span className="text-zinc-900">VAT (20%)</span>
              <span className="text-zinc-900">
                &pound;{formatGBP(quote.vat)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between w-52 pt-2 mt-1 border-t-2"
            style={{ borderColor: colour }}
          >
            <span className="font-bold text-zinc-900">Total</span>
            <span className="font-bold text-lg" style={{ color: colour }}>
              &pound;{formatGBP(quote.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Contract body — detailed legal sections (contracts only) */}
      {docType === "contract" && quote.summary && (
        <div className="p-8 border-b border-zinc-200">
          {quote.summary.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-3" />;
            if (/^[A-Z][A-Z\s&]{3,}$/.test(trimmed)) {
              return (
                <p
                  key={i}
                  className="font-bold mt-5 mb-1 text-sm"
                  style={{ color: colour }}
                >
                  {trimmed}
                </p>
              );
            }
            return (
              <p key={i} className="text-sm text-zinc-900 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      )}

      {/* Payment Details */}
      <PaymentDetailsBlock details={formData.paymentDetails} colour={colour} />

      {/* Terms — for quotes and invoices only (contracts have terms in the body) */}
      {docType !== "contract" && quote.terms && quote.terms.length > 0 && (
        <div className="p-8 border-b border-zinc-200">
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: colour }}
          >
            Terms & Conditions
          </h3>
          <ul className="space-y-1.5">
            {quote.terms.map((term, i) => (
              <li
                key={i}
                className="text-sm text-zinc-900 flex items-start gap-2"
              >
                <span className="mt-0.5" style={{ color: colour }}>
                  -
                </span>
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature Block — Contract only */}
      {docType === "contract" && (
        <div className="p-8 border-b border-zinc-200">
          <p className="text-sm text-zinc-900 mb-6 italic">
            By signing below, both parties agree to the terms set out in this
            contract.
          </p>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm text-zinc-900 font-medium mb-8">
                {formData.companyName || formData.tradesmanName}
              </p>
              <div className="border-b border-zinc-400 mb-1" />
              <p className="text-xs text-zinc-500">Signature</p>
              <div className="border-b border-zinc-400 mb-1 mt-6" />
              <p className="text-xs text-zinc-500">Printed Name</p>
              <div className="border-b border-zinc-400 mb-1 mt-6" />
              <p className="text-xs text-zinc-500">Date</p>
            </div>
            <div>
              <p className="text-sm text-zinc-900 font-medium mb-8">
                {formData.clientName}
              </p>
              <div className="border-b border-zinc-400 mb-1" />
              <p className="text-xs text-zinc-500">Signature</p>
              <div className="border-b border-zinc-400 mb-1 mt-6" />
              <p className="text-xs text-zinc-500">Printed Name</p>
              <div className="border-b border-zinc-400 mb-1 mt-6" />
              <p className="text-xs text-zinc-500">Date</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-8 flex flex-wrap gap-3 print:hidden">
        <button
          onClick={() => {
            // On iOS/mobile, window.print() often fails silently.
            // Use print for desktop, share API for mobile if available.
            if (navigator.share && /iPhone|iPad|Android/i.test(navigator.userAgent) && shareUrl) {
              navigator.share({ title: `${docLabel} ${quoteNumber || ""}`.trim(), url: shareUrl }).catch(() => {});
            } else {
              window.print();
            }
          }}
          className="text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          style={{ backgroundColor: colour }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Save as PDF
        </button>
        {shareUrl && (
          <button
            onClick={handleCopy}
            className="border px-6 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              borderColor: copied ? "#16a34a" : colour,
              color: copied ? "#16a34a" : colour,
              backgroundColor: copied ? "rgba(22,163,74,0.1)" : "transparent",
            }}
          >
            {copied ? "\u2713 Copied!" : "Copy Share Link"}
          </button>
        )}
      </div>
    </div>
  );
}
