import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json().catch(() => ({ plan: "monthly" }));

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_PRICE_ID_YEARLY
        : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return Response.json(
        { error: "Pricing not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Init Stripe directly to avoid proxy issues
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return Response.json(
        { error: "Payment system not configured." },
        { status: 500 }
      );
    }
    const stripeClient = new Stripe(stripeKey, { typescript: true });

    // Check for existing Stripe customer
    let customerId: string | undefined;
    try {
      const { data } = await supabase
        .from("user_preferences")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();

      customerId = data?.stripe_customer_id || undefined;
    } catch {
      // Ignore — will create new customer
    }

    if (!customerId) {
      const customer = await stripeClient.customers.create({
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
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const session = await stripeClient.checkout.sessions.create({
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
