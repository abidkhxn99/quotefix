import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getSubscriptionInfo } from "@/lib/subscription";
import { quoteFormSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { LineItem } from "@/types/quote";

const uuidSchema = z.string().uuid();

// GET — fetch a single document for editing (ownership verified)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    return Response.json(data);
  } catch (err) {
    console.error("Get document for edit error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// PUT — update an existing document
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { allowed } = checkRateLimit(userId, "edit", RATE_LIMITS.generate);
    if (!allowed) return rateLimitResponse();

    // Fetch original document
    const { data: original } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!original) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    // Parse new form data
    const rawBody = await request.json();
    const parsed = quoteFormSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const formData = parsed.data;

    // Subscription check for edit limits
    const subInfo = await getSubscriptionInfo(userId);
    const editCount = original.edit_count || 0;

    if (subInfo.status !== "active") {
      // Free tier: max 2 edits
      if (editCount >= 2) {
        return Response.json(
          { error: "edit_limit", message: "You've reached the edit limit on free documents. Upgrade to QuoteFix Pro for unlimited edits." },
          { status: 403 }
        );
      }

      // Check if client changed — counts as new document
      const clientChanged =
        formData.clientName.trim().toLowerCase() !== (original.client_name || "").trim().toLowerCase() ||
        formData.clientAddress.trim().toLowerCase() !== (original.client_address || "").trim().toLowerCase();

      if (clientChanged) {
        if (!subInfo.canCreate) {
          return Response.json(
            { error: "upgrade_required", message: "Changing the client details creates a new document. You've used your 3 free documents — upgrade to continue." },
            { status: 403 }
          );
        }
        // Increment document count since this is effectively a new doc
        await supabase.from("user_preferences").upsert(
          { user_id: userId, document_count: (subInfo.documentCount || 0) + 1, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

        // Log as potential abuse
        await supabase.from("edit_logs").insert({
          document_id: id,
          user_id: userId,
          fields_changed: ["client_name", "client_address"],
          abuse_flagged: true,
          flag_reason: "Client details changed on free tier — counted as new document",
        });
      }
    }

    // Save version history before overwriting
    await supabase.from("document_versions").insert({
      document_id: id,
      user_id: userId,
      version_data: original,
    });

    // Detect changed fields for logging
    const changedFields: string[] = [];
    if (formData.clientName !== original.client_name) changedFields.push("client_name");
    if (formData.clientAddress !== original.client_address) changedFields.push("client_address");
    if (formData.description !== original.description) changedFields.push("description");
    if (formData.labourDays !== original.labour_days) changedFields.push("labour_days");
    if (formData.dayRate !== original.day_rate) changedFields.push("day_rate");
    if (formData.docNumber !== original.quote_number) changedFields.push("quote_number");

    // Log the edit
    await supabase.from("edit_logs").insert({
      document_id: id,
      user_id: userId,
      fields_changed: changedFields,
      abuse_flagged: false,
    });

    // Compute values
    const jobType = formData.jobType === "Other" ? formData.jobTypeOther : formData.jobType;
    const labourTotal = formData.labourDays * formData.dayRate;
    const materialsTotal = formData.materials
      .filter((m) => m.name && m.cost > 0)
      .reduce((sum, m) => sum + m.cost, 0);
    const vatRegistered = formData.vatRegistered;
    const subtotal = labourTotal + materialsTotal;
    const vat = vatRegistered ? Math.round(subtotal * 0.2 * 100) / 100 : 0;
    const total = subtotal + vat;

    const lineItems: LineItem[] = [
      { description: `Labour - ${jobType}`, quantity: formData.labourDays, unitPrice: formData.dayRate, total: labourTotal },
      ...formData.materials
        .filter((m) => m.name && m.cost > 0)
        .map((m) => ({ description: m.name, quantity: 1, unitPrice: m.cost, total: m.cost })),
    ];

    const userTerms = [...(formData.selectedTerms || []), ...(formData.customTerms || [])];

    let logoToStore: string | null = null;
    if (formData.logoDataUrl && formData.logoDataUrl.length < 500000 && /^data:image\/(png|jpeg|jpg);base64,/.test(formData.logoDataUrl)) {
      logoToStore = formData.logoDataUrl;
    }

    // Update the document
    const { error } = await supabase
      .from("quotes")
      .update({
        quote_number: formData.docNumber || original.quote_number,
        doc_type: formData.docType,
        company_name: formData.companyName,
        company_number: formData.companyNumber || "",
        vat_number: formData.vatNumber || "",
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
        summary: original.summary,
        terms: userTerms,
        line_items: lineItems,
        payment_details: formData.paymentDetails || {},
        due_date: formData.dueDate || null,
        project_start: formData.projectStart || null,
        project_end: formData.projectEnd || null,
        edit_count: editCount + 1,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Update document error:", error);
      return Response.json({ error: "Could not save changes." }, { status: 500 });
    }

    return Response.json({ ok: true, id });
  } catch (err) {
    console.error("Edit document error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
