export type ThresholdConfig = {
  maxP95Ms?: number;
  maxErrorRate?: number;
  minRps?: number;
};

export type ThresholdSummary = {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    expected: string;
    actual: string;
  }[];
};

export type ThresholdMetricsInput = {
  p95: number;
  total: number;
  failed: number;
  rps: number;
};

export function evaluateThresholds(
  config: ThresholdConfig | undefined,
  metrics: ThresholdMetricsInput
): ThresholdSummary {
  const checks: ThresholdSummary["checks"] = [];
  if (config?.maxP95Ms !== undefined) {
    checks.push({
      name: "p95 latency",
      passed: metrics.p95 <= config.maxP95Ms,
      expected: `<= ${config.maxP95Ms}ms`,
      actual: `${metrics.p95.toFixed(1)}ms`,
    });
  }
  if (config?.maxErrorRate !== undefined) {
    const errorRate = metrics.total === 0 ? 0 : metrics.failed / metrics.total;
    checks.push({
      name: "error rate",
      passed: errorRate <= config.maxErrorRate,
      expected: `<= ${(config.maxErrorRate * 100).toFixed(2)}%`,
      actual: `${(errorRate * 100).toFixed(2)}%`,
    });
  }
  if (config?.minRps !== undefined) {
    checks.push({
      name: "throughput",
      passed: metrics.rps >= config.minRps,
      expected: `>= ${config.minRps.toFixed(2)} rps`,
      actual: `${metrics.rps.toFixed(2)} rps`,
    });
  }

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
