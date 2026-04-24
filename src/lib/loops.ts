import { LoopsClient } from "loops";

let _client: LoopsClient | null = null;

function getLoops(): LoopsClient {
  if (!_client) {
    const key = process.env.LOOPS_API_KEY;
    if (!key) throw new Error("LOOPS_API_KEY not configured");
    _client = new LoopsClient(key);
  }
  return _client;
}

export async function createLoopsContact(params: {
  email: string;
  firstName?: string;
  plan: string;
  marketingConsent: boolean;
  source?: string;
}): Promise<void> {
  try {
    const loops = getLoops();
    await loops.createContact({
      email: params.email,
      properties: {
        firstName: params.firstName || "",
        plan: params.plan,
        marketingConsent: params.marketingConsent,
        signedUpAt: new Date().toISOString(),
        source: params.source || "quotefix",
      },
      mailingLists: params.marketingConsent
        ? { marketing: true }
        : { marketing: false },
    });
  } catch (err) {
    console.error("Loops createContact error:", err);
  }
}

export async function updateLoopsContact(
  email: string,
  properties: Record<string, string | boolean | number>
): Promise<void> {
  try {
    const loops = getLoops();
    await loops.updateContact({
      email,
      properties,
    });
  } catch (err) {
    console.error("Loops updateContact error:", err);
  }
}

export async function sendLoopsEvent(
  email: string,
  eventName: string,
  properties?: Record<string, string | boolean | number>
): Promise<void> {
  try {
    const loops = getLoops();
    await loops.sendEvent({
      email,
      eventName,
      eventProperties: properties || {},
    });
  } catch (err) {
    console.error("Loops sendEvent error:", err);
  }
}

export async function deleteLoopsContact(email: string): Promise<void> {
  try {
    const loops = getLoops();
    await loops.deleteContact({ email });
  } catch (err) {
    console.error("Loops deleteContact error:", err);
  }
}
