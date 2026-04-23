import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format to prevent injection
    if (!uuidSchema.safeParse(id).success) {
      return Response.json({ error: "Invalid document ID" }, { status: 400 });
    }

    // Public access allowed for shared links — but only return safe fields
    // Check if user is authenticated for ownership context
    const { userId } = await auth();

    if (userId) {
      const { allowed } = checkRateLimit(userId, "quote-view", RATE_LIMITS.default);
      if (!allowed) return rateLimitResponse();
    }

    const { data, error } = await supabase
      .from("quotes")
      .select(
        "id, quote_number, doc_type, company_name, tradesman_name, brand_colour, logo_url, client_name, client_email, client_address, client_phone, job_type, description, labour_days, day_rate, materials, labour_total, materials_total, vat_registered, subtotal, vat, total, summary, terms, line_items, estimated_timeline, due_date, project_start, project_end, created_at, user_id"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    // Strip user_id from response — clients don't need it
    const { user_id: _uid, ...safeData } = data;
    return Response.json(safeData);
  } catch (err) {
    console.error("Get quote error:", err);
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      return Response.json({ error: "Invalid document ID" }, { status: 400 });
    }

    const { allowed } = checkRateLimit(userId, "quote-delete", RATE_LIMITS.default);
    if (!allowed) return rateLimitResponse();

    // Data ownership: only delete if user_id matches
    const { data: existing } = await supabase
      .from("quotes")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete quote error:", error);
      return Response.json(
        { error: "Could not delete document." },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Delete quote error:", err);
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
