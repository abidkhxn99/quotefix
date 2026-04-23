import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(userId, "prefs", RATE_LIMITS.default);
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
    });
  } catch (err) {
    console.error("Get preferences error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
