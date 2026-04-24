import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { createLoopsContact, sendLoopsEvent } from "@/lib/loops";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { marketingConsent } = await request.json();
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user?.firstName || "";

    if (!email) {
      return Response.json({ error: "No email found" }, { status: 400 });
    }

    // Save consent to Supabase
    await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        marketing_consent: !!marketingConsent,
        marketing_consent_given_at: marketingConsent
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Create contact in Loops
    await createLoopsContact({
      email,
      firstName,
      plan: "free",
      marketingConsent: !!marketingConsent,
    });

    // Send welcome event — transactional, goes to everyone
    await sendLoopsEvent(email, "user_signed_up", {
      firstName,
      plan: "free",
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Onboard error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
