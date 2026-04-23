import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getSubscriptionInfo } from "@/lib/subscription";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = await getSubscriptionInfo(userId);

    if (!info.stripeCustomerId) {
      return Response.json({ error: "No subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: info.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
