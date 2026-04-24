"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import TermsBuilder from "@/components/TermsBuilder";
import PaymentDetailsEditor from "@/components/PaymentDetailsEditor";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";
import { PaymentDetails, DEFAULT_PAYMENT_DETAILS } from "@/types/payment";

interface Settings {
  companyName: string;
  companyNumber: string;
  vatNumber: string;
  tradesmanName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  logoDataUrl: string;
  brandColour: string;
  vatRegistered: boolean;
  docPrefix: string;
  docCounter: number;
  defaultValidity: string;
  defaultPaymentTerms: string;
  selectedTerms: string[];
  customTerms: string[];
  paymentDetails: PaymentDetails;
}

const PAYMENT_OPTIONS = [
  "",
  "50% deposit required before work commences",
  "Full payment required before work commences",
  "Payment due within 7 days of completion",
  "Payment due within 14 days of completion",
  "Payment due within 30 days of completion",
];

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<Settings>({
    companyName: "",
    companyNumber: "",
    vatNumber: "",
    tradesmanName: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    logoDataUrl: "",
    brandColour: "#f97316",
    vatRegistered: false,
    docPrefix: "QF",
    docCounter: 1,
    defaultValidity: "30",
    defaultPaymentTerms: "",
    selectedTerms: [],
    customTerms: [],
    paymentDetails: DEFAULT_PAYMENT_DETAILS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!isLoaded || !isSignedIn) return;

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setSettings({
          ...data,
          paymentDetails: { ...DEFAULT_PAYMENT_DETAILS, ...data.paymentDetails },
        });
      })
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setToast("Settings saved");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("Failed to save");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || !isSignedIn) return null;
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-zinc-500 text-sm">Loading settings...</p>
      </div>
    );
  }

  const { dark } = useTheme();
  const tc = getThemeClasses(dark);

  const inputClass =
    `w-full rounded-lg ${tc.input} border px-3 py-2.5 text-sm focus:outline-none ${tc.inputFocus} transition-colors`;
  const labelClass = `block text-sm font-medium ${tc.label} mb-1`;
  const cardClass = `${tc.cardAccent} rounded-xl p-6`;
  const sectionTitle = `text-lg font-semibold ${tc.heading} mb-4 tracking-wide`;

  return (
    <div className={`max-w-2xl mx-auto px-6 py-10 w-full min-h-screen ${tc.pageBg} transition-colors`}>
      <h2
        className={`text-4xl ${tc.heading} tracking-wide mb-2`}
        style={{ fontFamily: "var(--font-bebas-neue)" }}
      >
        SETTINGS
      </h2>
      <p className="text-zinc-400 text-sm mb-8">
        Set your business defaults. These will pre-fill every new document.
      </p>

      <div className="space-y-5">
        {/* Business Profile */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Business Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company / Trading Name</label>
              <input
                value={settings.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                className={inputClass}
                placeholder="Smith & Sons Builders"
              />
            </div>
            <div>
              <label className={labelClass}>Your Name</label>
              <input
                value={settings.tradesmanName}
                onChange={(e) => update("tradesmanName", e.target.value)}
                className={inputClass}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={settings.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                placeholder="07700 900000"
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                className={inputClass}
                placeholder="john@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Business Address</label>
              <input
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
                placeholder="123 High Street, Manchester, M1 1AA"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Website (optional)</label>
              <input
                value={settings.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
                placeholder="www.example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Company Number (optional)</label>
              <input
                value={settings.companyNumber}
                onChange={(e) => update("companyNumber", e.target.value)}
                className={inputClass}
                placeholder="e.g. 12345678"
              />
            </div>
            <div>
              <label className={labelClass}>VAT Number (optional)</label>
              <input
                value={settings.vatNumber}
                onChange={(e) => update("vatNumber", e.target.value)}
                className={inputClass}
                placeholder="e.g. GB123456789"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Branding</h3>
          <div className="mb-4">
            <label className={labelClass}>Logo (PNG/JPG, max 2MB)</label>
            <div className="flex items-center gap-4">
              {settings.logoDataUrl && (
                <img
                  src={settings.logoDataUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain rounded border border-[#333]"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoUpload}
                className="text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#333] file:text-white hover:file:bg-[#444]"
              />
              {settings.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    update("logoDataUrl", "");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>Brand Colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.brandColour}
                onChange={(e) => update("brandColour", e.target.value)}
                className="h-10 w-14 rounded border border-[#333] cursor-pointer bg-[#222]"
              />
              <span className="text-sm text-zinc-400">
                {settings.brandColour}
              </span>
            </div>
          </div>
        </div>

        {/* Document Defaults */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Document Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Document Number Prefix</label>
              <div className="flex items-center gap-2">
                <input
                  value={settings.docPrefix}
                  onChange={(e) =>
                    update("docPrefix", e.target.value.toUpperCase().slice(0, 10))
                  }
                  className={inputClass + " w-24"}
                  placeholder="QF"
                />
                <span className="text-zinc-500 text-sm">
                  Next: {settings.docPrefix}-{String(settings.docCounter).padStart(3, "0")}
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Default Quote Validity</label>
              <select
                value={settings.defaultValidity}
                onChange={(e) => update("defaultValidity", e.target.value)}
                className={inputClass}
              >
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Default Payment Terms</label>
              <select
                value={settings.defaultPaymentTerms}
                onChange={(e) => update("defaultPaymentTerms", e.target.value)}
                className={inputClass}
              >
                <option value="">None selected</option>
                {PAYMENT_OPTIONS.filter(Boolean).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vatRegistered}
                onChange={(e) => update("vatRegistered", e.target.checked)}
                className="h-5 w-5 rounded border-[#333] bg-[#222] text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-white">
                  VAT registered by default
                </span>
                <span className="text-zinc-400 text-sm ml-2">
                  Pre-tick VAT on new documents
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Details */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Payment Details</h3>
          <p className={`${tc.muted} text-sm mb-4`}>
            Set your payment methods. These will appear on your documents.
          </p>
          <PaymentDetailsEditor
            value={settings.paymentDetails}
            onChange={(v) => update("paymentDetails", v)}
          />
        </div>

        {/* Default Terms & Conditions */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Default Terms & Conditions</h3>
          <p className="text-zinc-400 text-sm mb-4">
            These will be pre-selected on every new document.
          </p>
          <TermsBuilder
            selectedTerms={settings.selectedTerms}
            customTerms={settings.customTerms}
            onSelectedChange={(t) => update("selectedTerms", t)}
            onCustomChange={(t) => update("customTerms", t)}
          />
        </div>

        {/* Subscription */}
        <div className={cardClass}>
          <h3 className={sectionTitle}>Subscription</h3>
          <button
            type="button"
            onClick={async () => {
              const res = await fetch("/api/stripe/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              } else {
                window.location.href = "/upgrade";
              }
            }}
            className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Manage subscription &rarr;
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-bebas-neue)" }}
        >
          {saving ? "SAVING..." : "SAVE SETTINGS"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all ${
            toast === "Settings saved"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
