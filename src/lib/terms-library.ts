export interface TermCategory {
  name: string;
  terms: string[];
}

export const TERMS_LIBRARY: TermCategory[] = [
  {
    name: "Payment",
    terms: [
      "50% deposit required before work commences",
      "Full payment required before work commences",
      "Payment due within 7 days of completion",
      "Payment due within 14 days of completion",
      "Payment due within 30 days of completion",
      "Late payments subject to interest under the Late Payment of Commercial Debts Act 1998",
      "We accept cash, bank transfer, and cheque",
      "Card payments not accepted",
    ],
  },
  {
    name: "Work & Materials",
    terms: [
      "All materials remain the property of the contractor until paid in full",
      "Any additional work outside this quote will be charged separately and agreed in writing first",
      "We reserve the right to use subcontractors where necessary",
      "All work carried out to current British Standards where applicable",
      "Customer to provide access to water and electricity at no charge",
    ],
  },
  {
    name: "Warranty & Liability",
    terms: [
      "All workmanship guaranteed for 12 months from completion",
      "All workmanship guaranteed for 6 months from completion",
      "Manufacturer warranties apply to all supplied materials",
      "We are not liable for any pre-existing faults or damage uncovered during works",
      "We are not responsible for damage caused by third parties after completion",
    ],
  },
  {
    name: "Cancellation",
    terms: [
      "48 hours notice required to cancel or reschedule without charge",
      "7 days notice required to cancel without loss of deposit",
      "Deposit is non-refundable if cancelled within 48 hours of start date",
    ],
  },
  {
    name: "Quote Validity",
    terms: [
      "This quote is valid for 14 days from the date of issue",
      "This quote is valid for 30 days from the date of issue",
      "This quote is valid for 60 days from the date of issue",
      "Prices subject to change if work does not commence within the validity period",
    ],
  },
];

export const ALL_TERMS = TERMS_LIBRARY.flatMap((c) => c.terms);
