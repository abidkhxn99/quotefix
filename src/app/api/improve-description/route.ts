import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { improveDescriptionSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { validateEnv } from "@/lib/env";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    validateEnv();
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = checkRateLimit(userId, "improve", RATE_LIMITS.improve);
    if (!allowed) return rateLimitResponse();

    const rawBody = await request.json();
    const parsed = improveDescriptionSchema.safeParse(rawBody);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Sanitise before sending to AI
    const description = parsed.data.description
      .replace(/```/g, "")
      .replace(/\bignore\b.*\binstructions?\b/gi, "")
      .slice(0, 2000);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are helping a UK tradesperson write a professional job description for a quote, invoice or contract. Take their rough notes and rewrite them into 2-3 clear, professional sentences suitable for a client-facing document. Preserve all the key facts and details they mentioned. Do not add anything that wasn't implied by their input. Return only the improved description text, nothing else.\n\nTheir notes:\n${description}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json(
        { error: "Could not improve description. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({ improved: textBlock.text.trim() });
  } catch (err) {
    console.error("Improve description error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
