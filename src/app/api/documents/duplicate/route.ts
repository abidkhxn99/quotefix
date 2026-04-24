import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getSubscriptionInfo, incrementDocumentCount } from "@/lib/subscription";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!z.string().uuid().safeParse(id).success) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Verify ownership
    const { data: original } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!original) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    // Subscription check — duplicate always counts as new document
    const subInfo = await getSubscriptionInfo(userId);
    if (!subInfo.canCreate) {
      return Response.json(
        { error: "upgrade_required", message: "You've used your 3 free documents. Upgrade to continue." },
        { status: 403 }
      );
    }

    // Generate new document number
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("doc_prefix, doc_counter")
      .eq("user_id", userId)
      .maybeSingle();

    const prefix = prefs?.doc_prefix || "QF";
    const counter = prefs?.doc_counter || 1;
    const newDocNumber = `${prefix}-${String(counter).padStart(3, "0")}`;

    // Remove id and set new values
    const { id: _oldId, created_at: _ca, edit_count: _ec, ...docData } = original;

    const { data: newDoc, error } = await supabase
      .from("quotes")
      .insert({
        ...docData,
        quote_number: newDocNumber,
        user_id: userId,
        edit_count: 0,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Duplicate error:", error);
      return Response.json({ error: "Could not duplicate document." }, { status: 500 });
    }

    // Increment counters
    await incrementDocumentCount(userId);
    if (prefs) {
      await supabase
        .from("user_preferences")
        .update({ doc_counter: counter + 1 })
        .eq("user_id", userId);
    }

    return Response.json({ id: newDoc.id, docNumber: newDocNumber });
  } catch (err) {
    console.error("Duplicate error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
