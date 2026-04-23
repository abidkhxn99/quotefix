import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSubscriptionInfo } from "@/lib/subscription";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = await getSubscriptionInfo(userId);

    if (info.status === "active") {
      return Response.json({ error: "Already subscribed" }, { status: 400 });
    }

    // Reuse existing Stripe customer or create new
    let customerId = info.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { clerk_user_id: userId },
      });
      customerId = customer.id;

      await supabase
        .from("user_preferences")
        .upsert(
          { user_id: userId, stripe_customer_id: customerId, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return Response.json({ error: "Pricing not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/upgrade`,
      metadata: { clerk_user_id: userId },
      subscription_data: {
        metadata: { clerk_user_id: userId },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
