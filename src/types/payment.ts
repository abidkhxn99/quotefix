export interface PaymentDetails {
  bankTransfer: {
    enabled: boolean;
    accountName: string;
    sortCode: string;
    accountNumber: string;
    bankName: string;
    referenceNote: string;
  };
  cash: {
    enabled: boolean;
    note: string;
  };
  card: {
    enabled: boolean;
    note: string;
  };
  paymentLink: {
    enabled: boolean;
    url: string;
    label: string;
  };
  cheque: {
    enabled: boolean;
    payableTo: string;
  };
  paymentDueNote: string;
}

export const DEFAULT_PAYMENT_DETAILS: PaymentDetails = {
  bankTransfer: {
    enabled: false,
    accountName: "",
    sortCode: "",
    accountNumber: "",
    bankName: "",
    referenceNote: "",
  },
  cash: { enabled: false, note: "" },
  card: { enabled: false, note: "" },
  paymentLink: { enabled: false, url: "", label: "" },
  cheque: { enabled: false, payableTo: "" },
  paymentDueNote: "",
};
