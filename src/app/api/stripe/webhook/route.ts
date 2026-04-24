import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { updateLoopsContact, sendLoopsEvent } from "@/lib/loops";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerk_user_id;
        if (!clerkUserId) break;

        await supabase
          .from("user_preferences")
          .upsert(
            {
              user_id: clerkUserId,
              stripe_customer_id: session.customer as string,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        // Update Loops contact with Pro status
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
          await updateLoopsContact(customerEmail, {
            plan: "pro",
            subscribedAt: new Date().toISOString(),
            stripeCustomerId: session.customer as string,
          });
          await sendLoopsEvent(customerEmail, "user_subscribed", {
            plan: "pro",
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data } = await supabase
          .from("user_preferences")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (data) {
          await supabase
            .from("user_preferences")
            .update({
              subscription_status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", data.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data } = await supabase
          .from("user_preferences")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (data) {
          await supabase
            .from("user_preferences")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", data.user_id);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return Response.json({ received: true });
}
