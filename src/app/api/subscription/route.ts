import { auth } from "@clerk/nextjs/server";
import { getSubscriptionInfo, FREE_LIMIT } from "@/lib/subscription";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const info = await getSubscriptionInfo(userId);

    return Response.json({
      status: info.status,
      documentCount: info.documentCount,
      canCreate: info.canCreate,
      freeLimit: FREE_LIMIT,
    });
  } catch (err) {
    console.error("Subscription info error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
