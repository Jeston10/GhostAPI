import { describe, expect, it } from "vitest";
import { evaluateThresholds } from "./thresholds";

describe("evaluateThresholds", () => {
  it("passes when all threshold checks are within limits", () => {
    const result = evaluateThresholds(
      { maxP95Ms: 1000, maxErrorRate: 0.05, minRps: 20 },
      { p95: 900, total: 100, failed: 3, rps: 25 }
    );
    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(3);
  });

  it("fails when one or more threshold checks fail", () => {
    const result = evaluateThresholds(
      { maxP95Ms: 500, maxErrorRate: 0.02 },
      { p95: 700, total: 100, failed: 5, rps: 30 }
    );
    expect(result.passed).toBe(false);
    expect(result.checks.some((check) => check.passed === false)).toBe(true);
  });
});
