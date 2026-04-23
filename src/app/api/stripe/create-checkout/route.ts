import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSubscriptionInfo } from "@/lib/subscription";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let info;
    try {
      info = await getSubscriptionInfo(userId);
    } catch (e) {
      console.error("Subscription info error:", e);
      return Response.json(
        { error: "Could not check subscription status. Please try again." },
        { status: 500 }
      );
    }

    if (info.status === "active") {
      return Response.json({ error: "Already subscribed" }, { status: 400 });
    }

    const { plan } = await request.json().catch(() => ({ plan: "monthly" }));

    let customerId = info.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          metadata: { clerk_user_id: userId },
        });
        customerId = customer.id;

        await supabase
          .from("user_preferences")
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch (e) {
        console.error("Stripe customer creation error:", e);
        return Response.json(
          { error: "Could not set up payment. Please try again." },
          { status: 500 }
        );
      }
    }

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_PRICE_ID_YEARLY
        : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      console.error("Missing price ID. MONTHLY:", process.env.STRIPE_PRICE_ID_MONTHLY, "YEARLY:", process.env.STRIPE_PRICE_ID_YEARLY);
      return Response.json(
        { error: "Pricing not configured. Please contact support." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?upgraded=true`,
      cancel_url: `${siteUrl}/upgrade`,
      metadata: { clerk_user_id: userId },
      subscription_data: {
        metadata: { clerk_user_id: userId },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Create checkout error:", err);
    return Response.json(
      { error: "Something went wrong setting up checkout. Please try again." },
      { status: 500 }
    );
  }
}
