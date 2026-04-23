// In-memory rate limiter — no external dependencies needed
// Each user gets a token bucket per route group

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.lastRefill > 3600000) {
      buckets.delete(key);
    }
  }
}, 600000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  generate: { maxRequests: 10, windowMs: 3600000 } as RateLimitConfig, // 10/hr
  improve: { maxRequests: 20, windowMs: 3600000 } as RateLimitConfig, // 20/hr
  default: { maxRequests: 60, windowMs: 3600000 } as RateLimitConfig, // 60/hr
};

export function checkRateLimit(
  userId: string,
  route: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number } {
  const key = `${userId}:${route}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry) {
    buckets.set(key, { tokens: config.maxRequests - 1, lastRefill: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = config.maxRequests / config.windowMs;
  const refill = Math.floor(elapsed * refillRate);

  if (refill > 0) {
    entry.tokens = Math.min(config.maxRequests, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return { allowed: false, remaining: 0 };
  }

  entry.tokens -= 1;
  return { allowed: true, remaining: entry.tokens };
}

export function rateLimitResponse() {
  return Response.json(
    { error: "Too many requests — please wait before trying again" },
    { status: 429 }
  );
}
