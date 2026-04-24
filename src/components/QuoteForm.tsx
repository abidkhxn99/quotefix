"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useRef, useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { QuoteFormData, DocType } from "@/types/quote";
import TermsBuilder from "@/components/TermsBuilder";
import PaymentDetailsEditor from "@/components/PaymentDetailsEditor";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";
import { PaymentDetails, DEFAULT_PAYMENT_DETAILS } from "@/types/payment";

const JOB_TYPES = [
  "Building / Construction",
  "Electrical",
  "Plumbing",
  "Painting & Decorating",
  "Carpentry",
  "Roofing",
  "Landscaping / Gardening",
  "Cleaning",
  "Tiling",
  "Plastering",
  "Flooring",
  "Kitchen / Bathroom Fitting",
  "Jet Washing / Pressure Washing",
  "Gutter Cleaning",
  "Window Cleaning",
  "Exterior Cleaning",
  "Other",
];

const DOC_TYPE_INFO: Record<DocType, { label: string; desc: string }> = {
  quote: { label: "Quote", desc: "Price estimate, valid for 30 days" },
  invoice: { label: "Invoice", desc: "Payment request with due date" },
  contract: {
    label: "Contract",
    desc: "Scope of work with dates & signatures",
  },
};

function generateDocNumber(prefix: string, counter: number): string {
  return `${prefix}-${String(counter).padStart(3, "0")}`;
}

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData) => void;
  loading: boolean;
  initialData?: Partial<QuoteFormData>;
  editMode?: boolean;
}

export default function QuoteForm({ onSubmit, loading, initialData, editMode }: QuoteFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanedOnce, setCleanedOnce] = useState(false);
  const [cleanupError, setCleanupError] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [customTerms, setCustomTerms] = useState<string[]>([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [docPrefix, setDocPrefix] = useState("QF");
  const [docCounter, setDocCounter] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(DEFAULT_PAYMENT_DETAILS);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<QuoteFormData>({
    defaultValues: {
      docType: "quote",
      docNumber: "",
      brandColour: "#f97316",
      logoDataUrl: "",
      companyNumber: "",
      vatNumber: "",
      vatRegistered: false,
      selectedTerms: [],
      customTerms: [],
      materials: [{ name: "", cost: 0 }],
      labourDays: 1,
      dayRate: 250,
      dueDate: "",
      projectStart: "",
      projectEnd: "",
    },
  });

  // Load settings or initial data
  useEffect(() => {
    if (editMode && initialData) {
      // Edit mode: populate from existing document
      Object.entries(initialData).forEach(([key, val]) => {
        if (val !== undefined && key !== "selectedTerms" && key !== "customTerms" && key !== "paymentDetails") {
          setValue(key as keyof QuoteFormData, val as string | number | boolean);
        }
      });
      if (initialData.logoDataUrl) setLogoPreview(initialData.logoDataUrl);
      if (initialData.selectedTerms?.length) setSelectedTerms(initialData.selectedTerms);
      if (initialData.customTerms?.length) setCustomTerms(initialData.customTerms);
      if (initialData.paymentDetails) setPaymentDetails({ ...DEFAULT_PAYMENT_DETAILS, ...initialData.paymentDetails });
      if (initialData.docNumber) {
        setDocPrefix(initialData.docNumber.split("-")[0] || "QF");
      }
      setPrefsLoaded(true);
      return;
    }

    // New doc: load from preferences
    fetch("/api/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;

        if (data.companyName) setValue("companyName", data.companyName);
        if (data.tradesmanName) setValue("tradesmanName", data.tradesmanName);
        if (data.companyNumber) setValue("companyNumber", data.companyNumber);
        if (data.vatNumber) setValue("vatNumber", data.vatNumber);

        if (data.logoDataUrl) {
          setValue("logoDataUrl", data.logoDataUrl);
          setLogoPreview(data.logoDataUrl);
        }
        if (data.brandColour) setValue("brandColour", data.brandColour);
        if (data.vatRegistered) setValue("vatRegistered", true);

        const prefix = data.docPrefix || "QF";
        const counter = data.docCounter || 1;
        setDocPrefix(prefix);
        setDocCounter(counter);
        setValue("docNumber", generateDocNumber(prefix, counter));

        if (data.selectedTerms?.length) setSelectedTerms(data.selectedTerms);
        if (data.customTerms?.length) setCustomTerms(data.customTerms);
        if (data.paymentDetails) setPaymentDetails({ ...DEFAULT_PAYMENT_DETAILS, ...data.paymentDetails });
      })
      .catch(() => {})
      .finally(() => setPrefsLoaded(true));

    // Capture device fingerprint for abuse prevention
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        fetch("/api/fingerprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint: result.visitorId }),
        }).catch(() => {});
      })
      .catch(() => {});
  }, [setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const jobType = watch("jobType");
  const docType = watch("docType");
  const brandColour = watch("brandColour");
  const labourDays = watch("labourDays") || 0;
  const dayRate = watch("dayRate") || 0;
  const materials = watch("materials") || [];
  const vatRegistered = watch("vatRegistered");

  const labourTotal = labourDays * dayRate;
  const materialsTotal = materials
    .filter((m) => m.name && m.cost > 0)
    .reduce((sum, m) => sum + (m.cost || 0), 0);
  const subtotal = labourTotal + materialsTotal;
  const vat = vatRegistered ? Math.round(subtotal * 0.2 * 100) / 100 : 0;
  const total = subtotal + vat;

  function handleDocTypeChange(type: DocType) {
    setValue("docType", type);
    setValue("docNumber", generateDocNumber(docPrefix, docCounter));
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
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setValue("logoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleCleanUp() {
    const desc = getValues("description");
    if (!desc || !desc.trim()) {
      setCleanupError("Type your job details first");
      return;
    }
    setCleanupError("");
    setCleaningUp(true);
    try {
      const res = await fetch("/api/improve-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setValue("description", data.improved);
      setCleanedOnce(true);
    } catch {
      setCleanupError("Something went wrong, try again");
    } finally {
      setCleaningUp(false);
    }
  }

  function handleFormSubmit(data: QuoteFormData) {
    // Inject terms and payment details into form data
    data.selectedTerms = selectedTerms;
    data.customTerms = customTerms;
    data.paymentDetails = paymentDetails;

    // Save preferences in background
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms, customTerms }),
    }).catch(() => {});

    onSubmit(data);
  }

  const { dark } = useTheme();
  const tc = getThemeClasses(dark);

  const inputClass =
    `w-full rounded-lg ${tc.input} border px-3 py-2.5 text-sm focus:outline-none ${tc.inputFocus} transition-colors`;
  const labelClass = `block text-sm font-medium ${tc.label} mb-1`;
  const cardClass = `${tc.cardAccent} rounded-xl p-6`;
  const sectionTitle = `text-lg font-semibold ${tc.heading} mb-4 tracking-wide`;

  const submitLabel = editMode
    ? "REBUILD DOCUMENT"
    : docType === "invoice"
      ? "BUILD MY INVOICE"
      : docType === "contract"
        ? "BUILD MY CONTRACT"
        : "BUILD MY QUOTE";

  if (!prefsLoaded) return null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Document Type Selector */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Document Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(DOC_TYPE_INFO) as DocType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleDocTypeChange(type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                docType === type
                  ? "border-orange-500 bg-orange-500/10"
                  : `${dark?"border-[#333] bg-[#222] hover:border-[#444]":"border-zinc-200 bg-zinc-50 hover:border-zinc-300"}`
              }`}
            >
              <p className="font-semibold text-sm text-white">
                {DOC_TYPE_INFO[type].label}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {DOC_TYPE_INFO[type].desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Document Number */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Reference Number</h3>
        <input
          {...register("docNumber")}
          className={inputClass}
          placeholder="e.g. QT-2026-04"
        />
      </div>

      {/* Your Details */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Your Details</h3>
        <div className="mb-5">
          <label className={labelClass}>Logo (PNG/JPG, max 2MB)</label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
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
            {logoPreview && (
              <button
                type="button"
                onClick={() => {
                  setLogoPreview("");
                  setValue("logoDataUrl", "");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input
              {...register("companyName")}
              className={inputClass}
              placeholder="Smith & Sons Builders"
            />
          </div>
          <div>
            <label className={labelClass}>Your Name *</label>
            <input
              {...register("tradesmanName", { required: true })}
              className={inputClass}
              placeholder="John Smith"
            />
            {errors.tradesmanName && (
              <p className="text-red-400 text-xs mt-1">Required</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Company Number (optional)</label>
            <input
              {...register("companyNumber")}
              className={inputClass}
              placeholder="e.g. 12345678"
            />
          </div>
          {vatRegistered && (
            <div>
              <label className={labelClass}>VAT Number (optional)</label>
              <input
                {...register("vatNumber")}
                className={inputClass}
                placeholder="e.g. GB123456789"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Brand Colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register("brandColour")}
                className="h-10 w-14 rounded border border-[#333] cursor-pointer bg-[#222]"
              />
              <span className="text-sm text-zinc-400">{brandColour}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Client Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name *</label>
            <input
              {...register("clientName", { required: true })}
              className={inputClass}
              placeholder="Jane Doe"
            />
            {errors.clientName && (
              <p className="text-red-400 text-xs mt-1">Required</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Client Email</label>
            <input
              {...register("clientEmail")}
              type="email"
              className={inputClass}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Client Phone</label>
            <input
              {...register("clientPhone")}
              className={inputClass}
              placeholder="07700 900000"
            />
          </div>
          <div>
            <label className={labelClass}>Client Address</label>
            <input
              {...register("clientAddress")}
              className={inputClass}
              placeholder="123 High Street, Manchester"
            />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Job Type *</label>
            <select
              {...register("jobType", { required: true })}
              className={inputClass}
            >
              <option value="">Select job type</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.jobType && (
              <p className="text-red-400 text-xs mt-1">Required</p>
            )}
          </div>
          {jobType === "Other" && (
            <div>
              <label className={labelClass}>Specify Job Type *</label>
              <input
                {...register("jobTypeOther", {
                  required: jobType === "Other",
                })}
                className={inputClass}
                placeholder="e.g. Damp proofing"
              />
            </div>
          )}
        </div>
        <div className="mt-4">
          <label className={labelClass}>Job Description *</label>
          <textarea
            {...register("description", { required: true })}
            rows={4}
            className={inputClass}
            placeholder="Describe the work to be done, including any specific requirements..."
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">Required</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleCleanUp}
              disabled={cleaningUp}
              className={`text-sm font-semibold text-white bg-orange-500 rounded-lg px-4 py-1.5 transition-all disabled:opacity-50 ${
                !cleanedOnce ? "glow-pulse" : "hover:bg-orange-600"
              }`}
            >
              {cleaningUp
                ? "Cleaning up..."
                : cleanedOnce
                  ? "Clean up again \uD83D\uDD27"
                  : "Clean up \uD83D\uDD27"}
            </button>
            {cleanupError && (
              <span className="text-xs text-red-400">{cleanupError}</span>
            )}
          </div>
        </div>
      </div>

      {/* Dates — conditional on doc type */}
      {docType === "invoice" && (
        <div className={cardClass}>
          <h3 className={sectionTitle}>Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date *</label>
              <input
                {...register("dueDate", { required: docType === "invoice" })}
                type="date"
                className={inputClass}
              />
              {errors.dueDate && (
                <p className="text-red-400 text-xs mt-1">Required</p>
              )}
            </div>
          </div>
        </div>
      )}

      {docType === "contract" && (
        <div className={cardClass}>
          <h3 className={sectionTitle}>Project Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                {...register("projectStart", {
                  required: docType === "contract",
                })}
                type="date"
                className={inputClass}
              />
              {errors.projectStart && (
                <p className="text-red-400 text-xs mt-1">Required</p>
              )}
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input
                {...register("projectEnd", {
                  required: docType === "contract",
                })}
                type="date"
                className={inputClass}
              />
              {errors.projectEnd && (
                <p className="text-red-400 text-xs mt-1">Required</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Labour */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Labour</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Number of Days *</label>
            <input
              {...register("labourDays", {
                required: true,
                valueAsNumber: true,
                min: 0.5,
              })}
              type="number"
              step="0.5"
              className={inputClass}
            />
            {errors.labourDays && (
              <p className="text-red-400 text-xs mt-1">Required (min 0.5)</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Day Rate (GBP) *</label>
            <input
              {...register("dayRate", {
                required: true,
                valueAsNumber: true,
                min: 1,
              })}
              type="number"
              className={inputClass}
            />
            {errors.dayRate && (
              <p className="text-red-400 text-xs mt-1">Required</p>
            )}
          </div>
        </div>
      </div>

      {/* Materials */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Materials</h3>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className={labelClass}>Item</label>
                <input
                  {...register(`materials.${index}.name`)}
                  className={inputClass}
                  placeholder="e.g. 10x plasterboard sheets"
                />
              </div>
              <div className="w-32">
                <label className={labelClass}>Cost (GBP)</label>
                <input
                  {...register(`materials.${index}.cost`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-0.5 text-zinc-500 hover:text-red-400 text-sm px-2 py-2 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => append({ name: "", cost: 0 })}
          className="mt-3 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
        >
          + Add material
        </button>
      </div>

      {/* VAT Toggle */}
      <div className={`${tc.vatBox} rounded-xl p-5`}>
        <label
          htmlFor="vatRegistered"
          className="flex items-center gap-3 cursor-pointer"
        >
          <input
            type="checkbox"
            id="vatRegistered"
            {...register("vatRegistered")}
            className={`h-5 w-5 rounded ${dark?"border-[#333] bg-[#222]":"border-zinc-300 bg-white"} text-orange-500 focus:ring-orange-500 cursor-pointer`}
          />
          <div>
            <span className={`font-semibold ${tc.heading}`}>VAT registered</span>
            <span className="text-zinc-400 text-sm ml-2">
              Tick to add 20% VAT to the total
            </span>
          </div>
        </label>
      </div>

      {/* Terms & Conditions Builder */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Terms & Conditions</h3>
        <TermsBuilder
          selectedTerms={selectedTerms}
          customTerms={customTerms}
          onSelectedChange={setSelectedTerms}
          onCustomChange={setCustomTerms}
          docType={docType}
        />
      </div>

      {/* Payment Details */}
      <div className={cardClass}>
        <h3 className={sectionTitle}>Payment Details</h3>
        <PaymentDetailsEditor
          value={paymentDetails}
          onChange={setPaymentDetails}
          compact
        />
      </div>

      {/* Running Total */}
      <div className={`${tc.totalBox} rounded-xl p-6`}>
        <div className="space-y-2 text-sm">
          <div className={`flex justify-between ${tc.heading}`}>
            <span>
              Labour ({labourDays} days x &pound;{dayRate.toFixed(2)})
            </span>
            <span>&pound;{labourTotal.toFixed(2)}</span>
          </div>
          {materialsTotal > 0 && (
            <div className={`flex justify-between ${tc.heading}`}>
              <span>Materials</span>
              <span>&pound;{materialsTotal.toFixed(2)}</span>
            </div>
          )}
          <div className={`flex justify-between ${tc.heading}`}>
            <span>Subtotal</span>
            <span>&pound;{subtotal.toFixed(2)}</span>
          </div>
          {vatRegistered && (
            <div className={`flex justify-between ${tc.heading}`}>
              <span>VAT (20%)</span>
              <span>&pound;{vat.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 mt-2 border-t-2 border-orange-500">
            <span
              className="text-xl font-bold text-orange-500"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              TOTAL
            </span>
            <span className="text-xl font-bold text-orange-500">
              &pound;{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider hover:bg-orange-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        style={{ fontFamily: "var(--font-bebas-neue)" }}
      >
        {loading ? (
          "GENERATING..."
        ) : (
          <>
            {submitLabel}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
