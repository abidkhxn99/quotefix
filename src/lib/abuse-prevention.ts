import { supabase } from "@/lib/supabase";

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamail.info", "grr.la",
  "guerrillamail.de", "trbvm.com", "dispostable.com", "mailnesia.com",
  "maildrop.cc", "fakeinbox.com", "temp-mail.org", "10minutemail.com",
  "trashmail.com", "mohmal.com", "getnada.com", "emailondeck.com",
  "tempail.com", "burnermail.io", "tempr.email", "discard.email",
  "mailsac.com", "harakirimail.com", "33mail.com",
];

export interface AbuseCheckResult {
  allowed: boolean;
  reducedLimit: boolean;
  cooldownActive: boolean;
  reason: string | null;
}

export async function checkAbuse(
  userId: string,
  ip: string,
  email: string
): Promise<AbuseCheckResult> {
  const result: AbuseCheckResult = {
    allowed: true,
    reducedLimit: false,
    cooldownActive: false,
    reason: null,
  };

  // Get current user's preferences
  const { data: userPrefs } = await supabase
    .from("user_preferences")
    .select("device_fingerprint, ip_addresses, cooldown_until, subscription_status, document_count")
    .eq("user_id", userId)
    .maybeSingle();

  // Paying customers bypass all checks
  if (userPrefs?.subscription_status === "active") {
    return result;
  }

  // Check cooldown
  if (userPrefs?.cooldown_until) {
    const cooldownEnd = new Date(userPrefs.cooldown_until);
    if (cooldownEnd > new Date()) {
      result.allowed = false;
      result.cooldownActive = true;
      result.reason = "cooldown_active";
      return result;
    }
  }

  // Layer 3: Disposable email check
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
    result.reducedLimit = true;
    await logAbuseFlag(userId, "disposable_email", `Domain: ${emailDomain}`, { email_domain: emailDomain });
  }

  // Layer 2: IP address check
  if (ip) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: ipMatches } = await supabase
      .from("user_preferences")
      .select("user_id, document_count")
      .neq("user_id", userId)
      .filter("ip_addresses", "cs", JSON.stringify([ip]))
      .gt("document_count", 0);

    if (ipMatches && ipMatches.length > 0) {
      result.reducedLimit = true;
      await logAbuseFlag(userId, "shared_ip", `IP ${ip} used by ${ipMatches.length} other account(s)`, {
        ip,
        other_accounts: ipMatches.length,
        flagged_at: thirtyDaysAgo,
      });
    }

    // Store this IP for future checks
    const existingIps: string[] = userPrefs?.ip_addresses || [];
    if (!existingIps.includes(ip)) {
      await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: userId,
            ip_addresses: [...existingIps, ip],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    }
  }

  // Layer 1: Fingerprint check (checked separately via API)
  if (userPrefs?.device_fingerprint) {
    const { data: fpMatches } = await supabase
      .from("user_preferences")
      .select("user_id, document_count")
      .eq("device_fingerprint", userPrefs.device_fingerprint)
      .neq("user_id", userId)
      .gt("document_count", 0);

    if (fpMatches && fpMatches.length > 0) {
      result.allowed = false;
      result.reason = "fingerprint_match";
      await logAbuseFlag(userId, "fingerprint_match", `Fingerprint matches ${fpMatches.length} other account(s)`, {
        fingerprint: userPrefs.device_fingerprint,
        other_accounts: fpMatches.length,
      });
    }
  }

  // Apply cooldown if flagged
  if (result.reducedLimit || !result.allowed) {
    const cooldownEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          cooldown_until: cooldownEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
  }

  return result;
}

export async function checkCompanyNameAbuse(
  userId: string,
  companyName: string
): Promise<{ flagged: boolean; message: string | null }> {
  if (!companyName || companyName.trim().length < 3) {
    return { flagged: false, message: null };
  }

  const normalised = companyName.trim().toLowerCase();

  const { data } = await supabase
    .from("user_preferences")
    .select("user_id, document_count")
    .neq("user_id", userId)
    .gt("document_count", 0)
    .ilike("company_name", normalised);

  if (data && data.length > 0) {
    await logAbuseFlag(userId, "company_name_match", `Company "${companyName}" matches existing account`, {
      company_name: companyName,
      matching_accounts: data.length,
    });
    return {
      flagged: true,
      message: "Looks like a QuoteFix account already exists for this business. Sign in to your existing account or upgrade to continue.",
    };
  }

  return { flagged: false, message: null };
}

export async function saveFingerprint(
  userId: string,
  fingerprint: string
): Promise<void> {
  await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        device_fingerprint: fingerprint,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
}

export function getEffectiveLimit(
  reducedLimit: boolean,
  baseLimit: number
): number {
  return reducedLimit ? 1 : baseLimit;
}

async function logAbuseFlag(
  userId: string,
  flagType: string,
  reason: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await supabase.from("abuse_flags").insert({
    user_id: userId,
    flag_type: flagType,
    flag_reason: reason,
    metadata,
  });
}
