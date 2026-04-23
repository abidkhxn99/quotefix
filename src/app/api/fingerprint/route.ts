import { auth } from "@clerk/nextjs/server";
import { saveFingerprint } from "@/lib/abuse-prevention";
import { z } from "zod";

const schema = z.object({
  fingerprint: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    await saveFingerprint(userId, parsed.data.fingerprint);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Fingerprint error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
