import { supabase } from "@/lib/supabase";

const FREE_DOCUMENT_LIMIT = 3;

export interface SubscriptionInfo {
  status: string;
  documentCount: number;
  canCreate: boolean;
  stripeCustomerId: string | null;
}

export async function getSubscriptionInfo(
  userId: string
): Promise<SubscriptionInfo> {
  const { data } = await supabase
    .from("user_preferences")
    .select("subscription_status, document_count, stripe_customer_id")
    .eq("user_id", userId)
    .single();

  const status = data?.subscription_status || "free";
  const documentCount = data?.document_count || 0;
  const stripeCustomerId = data?.stripe_customer_id || null;

  const canCreate =
    status === "active" || documentCount < FREE_DOCUMENT_LIMIT;

  return { status, documentCount, canCreate, stripeCustomerId };
}

export async function incrementDocumentCount(userId: string): Promise<void> {
  const { data } = await supabase
    .from("user_preferences")
    .select("document_count")
    .eq("user_id", userId)
    .single();

  const current = data?.document_count || 0;

  await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        document_count: current + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

export const FREE_LIMIT = FREE_DOCUMENT_LIMIT;
