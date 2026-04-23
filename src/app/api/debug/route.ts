import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  // Only show debug info to authenticated users
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const monthlyPrice = process.env.STRIPE_PRICE_ID_MONTHLY;
  const yearlyPrice = process.env.STRIPE_PRICE_ID_YEARLY;

  return Response.json({
    userId,
    env: {
      SUPABASE_URL: supaUrl ? `${supaUrl.slice(0, 20)}...` : "MISSING",
      SUPABASE_KEY: supaKey ? `${supaKey.slice(0, 20)}...${supaKey.slice(-10)}` : "MISSING",
      SUPABASE_KEY_LENGTH: supaKey?.length || 0,
      STRIPE_KEY: stripeKey ? `${stripeKey.slice(0, 15)}...` : "MISSING",
      PRICE_MONTHLY: monthlyPrice || "MISSING",
      PRICE_YEARLY: yearlyPrice || "MISSING",
    },
  });
}
