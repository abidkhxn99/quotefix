// Server-side environment variable validation
// This file should only be imported in server components / API routes

const REQUIRED_SERVER_VARS = [
  "ANTHROPIC_API_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
] as const;

let validated = false;

export function validateEnv() {
  // Skip during build — env vars are only available at runtime on Vercel
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (validated) return;

  const missing: string[] = [];
  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
    return;
  }

  // Verify server-only vars are not prefixed with NEXT_PUBLIC_
  if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY must NOT be prefixed with NEXT_PUBLIC_ — it would be exposed to the client"
    );
  }
  if (process.env.NEXT_PUBLIC_CLERK_SECRET_KEY) {
    throw new Error(
      "CLERK_SECRET_KEY must NOT be prefixed with NEXT_PUBLIC_ — it would be exposed to the client"
    );
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must NOT be prefixed with NEXT_PUBLIC_ — it would be exposed to the client"
    );
  }

  validated = true;
}
