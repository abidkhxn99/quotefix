export type DocType = "quote" | "invoice" | "contract";

export interface MaterialItem {
  name: string;
  cost: number;
}

export interface QuoteFormData {
  docType: DocType;
  docNumber: string;
  companyName: string;
  tradesmanName: string;
  brandColour: string;
  logoDataUrl: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;
  jobType: string;
  jobTypeOther: string;
  description: string;
  labourDays: number;
  dayRate: number;
  materials: MaterialItem[];
  vatRegistered: boolean;
  selectedTerms: string[];
  customTerms: string[];
  dueDate: string;
  projectStart: string;
  projectEnd: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GeneratedQuote {
  summary: string;
  lineItems: LineItem[];
  subtotal: number;
  vat: number;
  total: number;
  estimatedTimeline: string;
  terms: string[];
}

export interface SavedQuote {
  id: string;
  quote_number: string;
  doc_type: DocType;
  user_id: string;
  company_name: string;
  tradesman_name: string;
  brand_colour: string;
  logo_url: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_phone: string;
  job_type: string;
  description: string;
  labour_days: number;
  day_rate: number;
  materials: MaterialItem[];
  labour_total: number;
  materials_total: number;
  vat_registered: boolean;
  subtotal: number;
  vat: number;
  total: number;
  summary: string;
  terms: string[];
  line_items: LineItem[];
  estimated_timeline: string;
  due_date: string;
  project_start: string;
  project_end: string;
  created_at: string;
}
