import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { quoteFormSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { validateEnv } from "@/lib/env";
import { getSubscriptionInfo, incrementDocumentCount } from "@/lib/subscription";
import { LineItem } from "@/types/quote";

validateEnv();

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit
    const { allowed } = checkRateLimit(userId, "generate", RATE_LIMITS.generate);
    if (!allowed) return rateLimitResponse();

    // 2b. Subscription check
    const subInfo = await getSubscriptionInfo(userId);
    if (!subInfo.canCreate) {
      return Response.json(
        { error: "upgrade_required", message: "You've used all 3 free documents. Upgrade to continue." },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const rawBody = await request.json();
    const parsed = quoteFormSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return Response.json(
        { error: firstError?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const formData = parsed.data;

    // 4. Compute values server-side — never trust client math
    const jobType =
      formData.jobType === "Other" ? formData.jobTypeOther : formData.jobType;
    const labourTotal = formData.labourDays * formData.dayRate;
    const materialsTotal = formData.materials
      .filter((m) => m.name && m.cost > 0)
      .reduce((sum, m) => sum + m.cost, 0);
    const docType = formData.docType;
    const vatRegistered = formData.vatRegistered;
    const subtotal = labourTotal + materialsTotal;
    const vat = vatRegistered ? Math.round(subtotal * 0.2 * 100) / 100 : 0;
    const total = subtotal + vat;

    // 5. Build line items directly
    const lineItems: LineItem[] = [
      {
        description: `Labour - ${jobType}`,
        quantity: formData.labourDays,
        unitPrice: formData.dayRate,
        total: labourTotal,
      },
      ...formData.materials
        .filter((m) => m.name && m.cost > 0)
        .map((m) => ({
          description: m.name,
          quantity: 1,
          unitPrice: m.cost,
          total: m.cost,
        })),
    ];

    // 6. User-provided terms — no AI rewriting
    const userTerms = [
      ...(formData.selectedTerms || []),
      ...(formData.customTerms || []),
    ];

    // 7. Only call AI for contract body
    let contractBody = "";
    if (docType === "contract") {
      contractBody = await generateContractBody(formData, jobType, labourTotal, materialsTotal, subtotal, vat, total, vatRegistered);
    }

    const docNumber = formData.docNumber || `${docType.toUpperCase()}-${Date.now()}`;

    // 8. Validate and truncate logo
    let logoToStore: string | null = null;
    if (
      formData.logoDataUrl &&
      formData.logoDataUrl.length < 500000 &&
      /^data:image\/(png|jpeg|jpg);base64,/.test(formData.logoDataUrl)
    ) {
      logoToStore = formData.logoDataUrl;
    }

    // 9. Save to DB
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        quote_number: docNumber,
        doc_type: docType,
        user_id: userId,
        company_name: formData.companyName,
        tradesman_name: formData.tradesmanName,
        brand_colour: formData.brandColour,
        logo_url: logoToStore,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_address: formData.clientAddress,
        client_phone: formData.clientPhone,
        job_type: jobType,
        description: formData.description,
        labour_days: formData.labourDays,
        day_rate: formData.dayRate,
        materials: formData.materials.filter((m) => m.name && m.cost > 0),
        labour_total: labourTotal,
        materials_total: materialsTotal,
        vat_registered: vatRegistered,
        subtotal,
        vat,
        total,
        summary: contractBody,
        terms: userTerms,
        line_items: lineItems,
        estimated_timeline: "",
        due_date: formData.dueDate || null,
        project_start: formData.projectStart || null,
        project_end: formData.projectEnd || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json(
        { error: "Could not save document. Please try again." },
        { status: 500 }
      );
    }

    // Increment document counter and document count for billing
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("doc_counter")
      .eq("user_id", userId)
      .single();
    if (prefs) {
      await supabase
        .from("user_preferences")
        .update({ doc_counter: (prefs.doc_counter || 1) + 1 })
        .eq("user_id", userId);
    }
    await incrementDocumentCount(userId);

    return Response.json({
      summary: contractBody,
      lineItems,
      subtotal,
      vat,
      total,
      estimatedTimeline: "",
      terms: userTerms,
      id: data.id,
      quoteNumber: docNumber,
    });
  } catch (err) {
    console.error("Generate quote error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

async function generateContractBody(
  formData: ReturnType<typeof quoteFormSchema.parse>,
  jobType: string,
  labourTotal: number,
  materialsTotal: number,
  subtotal: number,
  vat: number,
  total: number,
  vatRegistered: boolean
): Promise<string> {
  const materialsList = formData.materials
    .filter((m) => m.name && m.cost > 0)
    .map((m) => `${m.name}: £${m.cost.toFixed(2)}`)
    .join(", ");

  const vatLine = vatRegistered
    ? `VAT (20%): £${vat.toFixed(2)}\nTotal (inc. VAT): £${total.toFixed(2)}`
    : `Total: £${total.toFixed(2)} (VAT not applicable)`;

  // Sanitise user input for the prompt — strip any instruction-like patterns
  const safeDescription = formData.description
    .replace(/```/g, "")
    .replace(/\bignore\b.*\binstructions?\b/gi, "")
    .slice(0, 2000);
  const safeCompany = (formData.companyName || formData.tradesmanName).slice(0, 100);
  const safeTradesman = formData.tradesmanName.slice(0, 100);
  const safeClient = formData.clientName.slice(0, 100);
  const safeAddress = (formData.clientAddress || "address TBC").slice(0, 300);

  const prompt = `You are a professional UK contract writer for tradespeople. Generate a comprehensive, legally-sound contract body in plain English.

CONTRACTOR: ${safeCompany} (${safeTradesman})
CLIENT: ${safeClient}, ${safeAddress}
JOB TYPE: ${jobType}
PROJECT DATES: ${formData.projectStart} to ${formData.projectEnd}
LABOUR: ${formData.labourDays} days at £${formData.dayRate}/day = £${labourTotal.toFixed(2)}
MATERIALS: ${materialsList || "None"} = £${materialsTotal.toFixed(2)}
SUBTOTAL: £${subtotal.toFixed(2)}
${vatLine}

Write the contract body as a single block of text with line breaks. Use UPPERCASE HEADINGS on their own lines for each section. Include ALL of these sections:

PARTIES — full names, addresses, roles, date of agreement
SCOPE OF WORK — detailed breakdown of what IS and IS NOT included, specific to ${jobType}
MATERIALS & LABOUR — itemise exactly as provided, do not change values
PROJECT TIMELINE — start/end dates, delay clause (weather, client, unforeseen issues)
PAYMENT TERMS — 25% deposit on signing, 50% on commencement, 25% on completion, 14-day payment window, late payment interest at 8% above BoE base rate per Late Payment of Commercial Debts (Interest) Act 1998
VARIATIONS — changes must be agreed in writing, costs confirmed before work begins
ACCESS & SITE CONDITIONS — client provides safe clear access, contractor not liable for access delays
DAMAGE & LIABILITY — reasonable care taken, not liable for pre-existing damage
DISPUTE RESOLUTION — good faith negotiation, then mediation, governed by laws of England and Wales
CANCELLATION — 7 days written notice, deposit non-refundable within 7 days of start, pay for completed work

Return ONLY the contract body text. No JSON, no code fences, no preamble.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}
