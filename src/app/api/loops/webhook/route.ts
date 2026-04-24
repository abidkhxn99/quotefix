import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle unsubscribe event from Loops
    if (body.type === "contact.unsubscribed" || body.event === "unsubscribe") {
      const email = body.email || body.data?.email;

      if (email) {
        // Find user by checking all preferences with matching email
        const { data } = await supabase
          .from("user_preferences")
          .select("user_id")
          .eq("email", email)
          .maybeSingle();

        if (data) {
          await supabase
            .from("user_preferences")
            .update({
              marketing_consent: false,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", data.user_id);
        }
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Loops webhook error:", err);
    return Response.json({ ok: true }); // Always return 200 to Loops
  }
}
