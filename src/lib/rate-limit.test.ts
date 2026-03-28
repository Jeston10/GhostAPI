import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the cap", () => {
    const k = `t:${Math.random()}`;
    expect(checkRateLimit(k, 3, 10_000)).toEqual({ ok: true });
    expect(checkRateLimit(k, 3, 10_000)).toEqual({ ok: true });
    expect(checkRateLimit(k, 3, 10_000)).toEqual({ ok: true });
  });

  it("blocks after max in window", () => {
    const k = `t:${Math.random()}`;
    expect(checkRateLimit(k, 2, 60_000).ok).toBe(true);
    expect(checkRateLimit(k, 2, 60_000).ok).toBe(true);
    const third = checkRateLimit(k, 2, 60_000);
    expect(third.ok).toBe(false);
    if (!third.ok) {
      expect(third.retryAfterMs).toBeGreaterThan(0);
    }
  });
});
