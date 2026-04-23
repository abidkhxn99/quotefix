"use client";

import { useState } from "react";
import { getTermsForDocType } from "@/lib/terms-library";
import { DocType } from "@/types/quote";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeClasses } from "@/lib/theme-classes";

interface TermsBuilderProps {
  selectedTerms: string[];
  customTerms: string[];
  onSelectedChange: (terms: string[]) => void;
  onCustomChange: (terms: string[]) => void;
  docType?: DocType;
}

export default function TermsBuilder({
  selectedTerms,
  customTerms,
  onSelectedChange,
  onCustomChange,
  docType,
}: TermsBuilderProps) {
  const { dark } = useTheme();
  const t = getThemeClasses(dark);
  const categories = getTermsForDocType(docType || "quote");
  const [customInput, setCustomInput] = useState("");

  function toggleTerm(term: string) {
    if (selectedTerms.includes(term)) {
      onSelectedChange(selectedTerms.filter((t) => t !== term));
    } else {
      onSelectedChange([...selectedTerms, term]);
    }
  }

  function addCustomTerm() {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customTerms.includes(trimmed)) return;
    onCustomChange([...customTerms, trimmed]);
    setCustomInput("");
  }

  function removeCustomTerm(term: string) {
    onCustomChange(customTerms.filter((t) => t !== term));
  }

  return (
    <div className="space-y-5">
      {/* Pre-written terms by category */}
      {categories.map((category) => (
        <div key={category.name}>
          <p className="text-sm font-semibold text-orange-400 mb-2">
            {category.name}
          </p>
          <div className="space-y-1.5">
            {category.terms.map((term) => (
              <label
                key={term}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedTerms.includes(term)}
                  onChange={() => toggleTerm(term)}
                  className={`h-4 w-4 mt-0.5 rounded ${dark?"border-[#444] bg-[#222]":"border-zinc-300 bg-white"} text-orange-500 focus:ring-orange-500 cursor-pointer shrink-0`}
                />
                <span className={`text-sm ${t.body} group-hover:${dark?"text-white":"text-zinc-900"} transition-colors leading-snug`}>
                  {term}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Custom terms */}
      <div>
        <p className="text-sm font-semibold text-orange-400 mb-2">
          Add your own terms
        </p>
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTerm();
              }
            }}
            placeholder="Type a custom term..."
            className={`flex-1 rounded-lg ${t.input} border px-3 py-2 text-sm focus:outline-none ${t.inputFocus}`}
          />
          <button
            type="button"
            onClick={addCustomTerm}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors shrink-0"
          >
            Add
          </button>
        </div>

        {customTerms.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customTerms.map((term, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 ${dark?"bg-[#1a1a1a]":"bg-orange-50"} border border-orange-500/40 ${t.heading} text-sm px-3 py-1.5 rounded-lg`}
              >
                {term}
                <button
                  type="button"
                  onClick={() => removeCustomTerm(term)}
                  className="text-zinc-500 hover:text-red-400 transition-colors ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-zinc-500">
        {selectedTerms.length + customTerms.length} term
        {selectedTerms.length + customTerms.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
