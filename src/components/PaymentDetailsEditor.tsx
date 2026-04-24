"use client";

import { PaymentDetails } from "@/types/payment";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

interface Props {
  value: PaymentDetails;
  onChange: (v: PaymentDetails) => void;
  compact?: boolean; // true = form mode (toggles only), false = settings mode (full edit)
}

function formatSortCode(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export default function PaymentDetailsEditor({ value, onChange, compact }: Props) {
  const { dark } = useTheme();
  const t = getThemeClasses(dark);

  const inputClass = `w-full rounded-lg ${t.input} border px-3 py-2 text-sm focus:outline-none ${t.inputFocus} transition-colors`;
  const labelClass = `block text-sm font-medium ${t.label} mb-1`;
  const toggleRow = `flex items-center gap-3 cursor-pointer`;
  const checkClass = `h-5 w-5 rounded ${dark ? "border-[#333] bg-[#222]" : "border-zinc-300 bg-white"} text-orange-500 focus:ring-orange-500 cursor-pointer`;

  function update<K extends keyof PaymentDetails>(key: K, val: PaymentDetails[K]) {
    onChange({ ...value, [key]: val });
  }

  function updateBank(field: string, val: string) {
    update("bankTransfer", { ...value.bankTransfer, [field]: val });
  }

  return (
    <div className="space-y-5">
      {/* Bank Transfer */}
      <div>
        <label className={toggleRow}>
          <input
            type="checkbox"
            checked={value.bankTransfer.enabled}
            onChange={(e) => updateBank("enabled", e.target.checked as unknown as string)}
            className={checkClass}
          />
          <span className={`font-medium ${t.heading}`}>Bank Transfer</span>
        </label>
        {value.bankTransfer.enabled && !compact && (
          <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Account Name *</label>
              <input value={value.bankTransfer.accountName} onChange={(e) => updateBank("accountName", e.target.value)} className={inputClass} placeholder="Smith Electrical Ltd" />
            </div>
            <div>
              <label className={labelClass}>Sort Code *</label>
              <input value={value.bankTransfer.sortCode} onChange={(e) => updateBank("sortCode", formatSortCode(e.target.value))} className={inputClass} placeholder="12-34-56" maxLength={8} />
            </div>
            <div>
              <label className={labelClass}>Account Number *</label>
              <input value={value.bankTransfer.accountNumber} onChange={(e) => updateBank("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 8))} className={inputClass} placeholder="12345678" maxLength={8} />
            </div>
            <div>
              <label className={labelClass}>Bank Name (optional)</label>
              <input value={value.bankTransfer.bankName} onChange={(e) => updateBank("bankName", e.target.value)} className={inputClass} placeholder="e.g. Lloyds, Barclays" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Reference Note (optional)</label>
              <input value={value.bankTransfer.referenceNote} onChange={(e) => updateBank("referenceNote", e.target.value)} className={inputClass} placeholder="e.g. Please use your invoice number as reference" />
            </div>
          </div>
        )}
      </div>

      {/* Cash */}
      <div>
        <label className={toggleRow}>
          <input type="checkbox" checked={value.cash.enabled} onChange={(e) => update("cash", { ...value.cash, enabled: e.target.checked })} className={checkClass} />
          <span className={`font-medium ${t.heading}`}>Cash</span>
        </label>
        {value.cash.enabled && !compact && (
          <div className="mt-3 ml-8">
            <label className={labelClass}>Note (optional)</label>
            <input value={value.cash.note} onChange={(e) => update("cash", { ...value.cash, note: e.target.value })} className={inputClass} placeholder="e.g. Cash on completion only" />
          </div>
        )}
      </div>

      {/* Card */}
      <div>
        <label className={toggleRow}>
          <input type="checkbox" checked={value.card.enabled} onChange={(e) => update("card", { ...value.card, enabled: e.target.checked })} className={checkClass} />
          <span className={`font-medium ${t.heading}`}>Card Payments</span>
        </label>
        {value.card.enabled && !compact && (
          <div className="mt-3 ml-8">
            <label className={labelClass}>Note (optional)</label>
            <input value={value.card.note} onChange={(e) => update("card", { ...value.card, note: e.target.value })} className={inputClass} placeholder="e.g. Card payments available on request" />
          </div>
        )}
      </div>

      {/* Payment Link */}
      <div>
        <label className={toggleRow}>
          <input type="checkbox" checked={value.paymentLink.enabled} onChange={(e) => update("paymentLink", { ...value.paymentLink, enabled: e.target.checked })} className={checkClass} />
          <span className={`font-medium ${t.heading}`}>Payment Link</span>
        </label>
        {value.paymentLink.enabled && !compact && (
          <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Link Label</label>
              <input value={value.paymentLink.label} onChange={(e) => update("paymentLink", { ...value.paymentLink, label: e.target.value })} className={inputClass} placeholder="e.g. Pay via PayPal" />
            </div>
            <div>
              <label className={labelClass}>URL</label>
              <input value={value.paymentLink.url} onChange={(e) => update("paymentLink", { ...value.paymentLink, url: e.target.value })} className={inputClass} placeholder="e.g. https://paypal.me/yourname" type="url" />
            </div>
          </div>
        )}
      </div>

      {/* Cheque */}
      <div>
        <label className={toggleRow}>
          <input type="checkbox" checked={value.cheque.enabled} onChange={(e) => update("cheque", { ...value.cheque, enabled: e.target.checked })} className={checkClass} />
          <span className={`font-medium ${t.heading}`}>Cheque</span>
        </label>
        {value.cheque.enabled && !compact && (
          <div className="mt-3 ml-8">
            <label className={labelClass}>Payable To</label>
            <input value={value.cheque.payableTo} onChange={(e) => update("cheque", { ...value.cheque, payableTo: e.target.value })} className={inputClass} placeholder="e.g. Smith Electrical Ltd" />
          </div>
        )}
      </div>

      {/* Payment Due Note */}
      <div>
        <label className={labelClass}>Payment Due Note (optional)</label>
        <input value={value.paymentDueNote} onChange={(e) => update("paymentDueNote", e.target.value)} className={inputClass} placeholder="e.g. 50% deposit on acceptance, remainder on completion" />
      </div>
    </div>
  );
}
