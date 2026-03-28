/**
 * Simple in-memory sliding-window rate limiter (per server instance).
 * For multi-instance production, use Redis/Upstash; this still mitigates casual abuse.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 1, resetAt: now + windowMs };
    buckets.set(key, b);
    return { ok: true };
  }
  if (b.count < max) {
    b.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) };
}

/** Trim maps periodically to avoid unbounded growth (best-effort). */
export function pruneStaleBuckets(windowMs: number): void {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now >= b.resetAt + windowMs) buckets.delete(k);
  }
}

export function getTryProxyRateConfig(): { max: number; windowMs: number } {
  const max = Number(process.env.FREE_APIS_TRY_RATE_LIMIT ?? "40");
  const windowMs = Number(process.env.FREE_APIS_TRY_RATE_WINDOW_MS ?? "60000");
  return {
    max: Number.isFinite(max) && max > 0 ? max : 40,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
  };
}

export function clientIpFromRequest(req: Request): string {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "unknown";
}
