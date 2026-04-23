import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(userId, "quotes-list", RATE_LIMITS.default);
    if (!allowed) return rateLimitResponse();

    const { data, error } = await supabase
      .from("quotes")
      .select("id, quote_number, doc_type, client_name, job_type, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch quotes error:", error);
      return Response.json(
        { error: "Could not load documents." },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err) {
    console.error("List quotes error:", err);
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
