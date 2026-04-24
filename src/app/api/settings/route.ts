import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const settingsSchema = z.object({
  companyName: z.string().max(100).default(""),
  companyNumber: z.string().max(20).default(""),
  vatNumber: z.string().max(20).default(""),
  tradesmanName: z.string().max(100).default(""),
  phone: z.string().max(30).default(""),
  email: z.string().max(254).default(""),
  address: z.string().max(300).default(""),
  website: z.string().max(200).default(""),
  logoDataUrl: z.string().max(600000).default(""),
  brandColour: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f97316"),
  vatRegistered: z.boolean().default(false),
  docPrefix: z.string().max(10).default("QF"),
  defaultValidity: z.enum(["14", "30", "60"]).default("30"),
  defaultPaymentTerms: z.string().max(200).default(""),
  selectedTerms: z.array(z.string().max(500)).max(50).default([]),
  customTerms: z.array(z.string().max(500)).max(20).default([]),
  paymentDetails: z.any().default({}),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(userId, "settings", RATE_LIMITS.default);
    if (!allowed) return rateLimitResponse();

    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      return Response.json({
        companyName: "",
        tradesmanName: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        logoDataUrl: "",
        brandColour: "#f97316",
        companyNumber: "",
        vatNumber: "",
        vatRegistered: false,
        docPrefix: "QF",
        docCounter: 1,
        defaultValidity: "30",
        defaultPaymentTerms: "",
        selectedTerms: [],
        customTerms: [],
        paymentDetails: {},
      });
    }

    return Response.json({
      companyName: data.company_name || "",
      companyNumber: data.company_number || "",
      vatNumber: data.vat_number || "",
      tradesmanName: data.tradesman_name || "",
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      website: data.website || "",
      logoDataUrl: data.logo_data_url || "",
      brandColour: data.brand_colour || "#f97316",
      vatRegistered: data.vat_registered ?? false,
      docPrefix: data.doc_prefix || "QF",
      docCounter: data.doc_counter || 1,
      defaultValidity: data.default_validity || "30",
      defaultPaymentTerms: data.default_payment_terms || "",
      selectedTerms: data.selected_terms || [],
      customTerms: data.custom_terms || [],
      paymentDetails: data.payment_details || {},
    });
  } catch (err) {
    console.error("Get settings error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(userId, "settings", RATE_LIMITS.default);
    if (!allowed) return rateLimitResponse();

    const rawBody = await request.json();
    const parsed = settingsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Invalid settings" },
        { status: 400 }
      );
    }

    const d = parsed.data;

    // Validate logo format if present
    let logoToStore: string | null = null;
    if (d.logoDataUrl && d.logoDataUrl.length < 500000 && /^data:image\/(png|jpeg|jpg);base64,/.test(d.logoDataUrl)) {
      logoToStore = d.logoDataUrl;
    }

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        company_name: d.companyName,
        company_number: d.companyNumber,
        vat_number: d.vatNumber,
        tradesman_name: d.tradesmanName,
        phone: d.phone,
        email: d.email,
        address: d.address,
        website: d.website,
        logo_data_url: logoToStore,
        brand_colour: d.brandColour,
        vat_registered: d.vatRegistered,
        doc_prefix: d.docPrefix,
        default_validity: d.defaultValidity,
        default_payment_terms: d.defaultPaymentTerms,
        selected_terms: d.selectedTerms,
        custom_terms: d.customTerms,
        payment_details: d.paymentDetails || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Save settings error:", error);
      return Response.json({ error: "Could not save settings." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Post settings error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
