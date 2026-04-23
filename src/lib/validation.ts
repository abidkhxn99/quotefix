import { z } from "zod";

const materialSchema = z.object({
  name: z.string().max(200, "Material name too long"),
  cost: z.number().min(0).max(1000000),
});

export const quoteFormSchema = z.object({
  docType: z.enum(["quote", "invoice", "contract"]),
  docNumber: z.string().max(50, "Document number too long").default(""),
  companyName: z.string().max(100, "Company name too long").default(""),
  tradesmanName: z
    .string()
    .min(1, "Tradesman name required")
    .max(100, "Name too long"),
  brandColour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid colour")
    .default("#f97316"),
  logoDataUrl: z.string().max(600000, "Logo too large").default(""),
  clientName: z
    .string()
    .min(1, "Client name required")
    .max(100, "Name too long"),
  clientEmail: z
    .string()
    .max(254, "Email too long")
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email")
    .default(""),
  clientAddress: z.string().max(300, "Address too long").default(""),
  clientPhone: z.string().max(30, "Phone too long").default(""),
  jobType: z.string().min(1, "Job type required").max(100),
  jobTypeOther: z.string().max(100).default(""),
  description: z
    .string()
    .min(1, "Description required")
    .max(2000, "Description too long (max 2000 characters)"),
  labourDays: z.number().min(0.5, "Min 0.5 days").max(365, "Max 365 days"),
  dayRate: z.number().min(1, "Min £1").max(100000, "Rate too high"),
  materials: z.array(materialSchema).max(50, "Too many materials"),
  vatRegistered: z.boolean().default(false),
  selectedTerms: z.array(z.string().max(500)).max(50).default([]),
  customTerms: z.array(z.string().max(500)).max(20).default([]),
  dueDate: z.string().max(20).default(""),
  projectStart: z.string().max(20).default(""),
  projectEnd: z.string().max(20).default(""),
});

export const improveDescriptionSchema = z.object({
  description: z
    .string()
    .min(1, "Description required")
    .max(2000, "Description too long"),
});

export const preferencesSchema = z.object({
  selectedTerms: z.array(z.string().max(500)).max(50).default([]),
  customTerms: z.array(z.string().max(500)).max(20).default([]),
});

export type ValidatedQuoteForm = z.infer<typeof quoteFormSchema>;
