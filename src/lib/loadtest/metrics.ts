import type { ErrorKind } from "./errors";

export type TimeBucket = {
  ts: number;
  total: number;
  success: number;
  failed: number;
  p95: number;
  p99: number;
  avg: number;
  rps: number;
};

export type ErrorBuckets = Record<ErrorKind, number>;
export type StatusCodeBuckets = Record<string, number>;

export type RichMetrics = {
  total: number;
  success: number;
  failed: number;
  totalTime: number;
  times: number[];
  statusCodes: StatusCodeBuckets;
  errors: ErrorBuckets;
  timeBuckets: TimeBucket[];
  lastBucketStartedAt: number;
  bucketTotal: number;
  bucketSuccess: number;
  bucketFailed: number;
  bucketTimes: number[];
  inFlight: number;
  throttledCount: number;
  queueWaitMs: number;
};

export function createMetrics(): RichMetrics {
  return {
    total: 0,
    success: 0,
    failed: 0,
    totalTime: 0,
    times: [],
    statusCodes: {},
    errors: {
      timeout: 0,
      abort: 0,
      dns: 0,
      tls: 0,
      connect: 0,
      network: 0,
      validation: 0,
      unknown: 0,
    },
    timeBuckets: [],
    lastBucketStartedAt: Date.now(),
    bucketTotal: 0,
    bucketSuccess: 0,
    bucketFailed: 0,
    bucketTimes: [],
    inFlight: 0,
    throttledCount: 0,
    queueWaitMs: 0,
  };
}

export function recordSuccess(metrics: RichMetrics, durationMs: number, statusCode: number) {
  metrics.total += 1;
  metrics.success += 1;
  metrics.totalTime += durationMs;
  metrics.statusCodes[String(statusCode)] = (metrics.statusCodes[String(statusCode)] ?? 0) + 1;
  pushMetricTime(metrics.times, durationMs);
  recordBucket(metrics, durationMs, true);
}

export function recordFailure(
  metrics: RichMetrics,
  durationMs: number,
  statusCode: number | null,
  errorKind: ErrorKind
) {
  metrics.total += 1;
  metrics.failed += 1;
  metrics.totalTime += durationMs;
  if (statusCode !== null) {
    metrics.statusCodes[String(statusCode)] = (metrics.statusCodes[String(statusCode)] ?? 0) + 1;
  } else {
    metrics.errors[errorKind] += 1;
  }
  pushMetricTime(metrics.times, durationMs);
  recordBucket(metrics, durationMs, false);
}

export function flushBucket(metrics: RichMetrics, now = Date.now()) {
  const elapsed = now - metrics.lastBucketStartedAt;
  if (elapsed < 5000 || metrics.bucketTotal === 0) return;

  const seconds = Math.max(elapsed / 1000, 0.001);
  const sorted = [...metrics.bucketTimes].sort((a, b) => a - b);
  const avg = metrics.bucketTotal > 0 ? sorted.reduce((sum, item) => sum + item, 0) / metrics.bucketTotal : 0;
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);

  metrics.timeBuckets.push({
    ts: now,
    total: metrics.bucketTotal,
    success: metrics.bucketSuccess,
    failed: metrics.bucketFailed,
    p95,
    p99,
    avg,
    rps: metrics.bucketTotal / seconds,
  });

  if (metrics.timeBuckets.length > 120) {
    metrics.timeBuckets.shift();
  }

  metrics.lastBucketStartedAt = now;
  metrics.bucketTotal = 0;
  metrics.bucketSuccess = 0;
  metrics.bucketFailed = 0;
  metrics.bucketTimes = [];
}

export function percentile(values: number[], percentileValue: number) {
  if (!values.length) return 0;
  const index = Math.ceil((percentileValue / 100) * values.length) - 1;
  return values[Math.min(Math.max(index, 0), values.length - 1)];
}

function recordBucket(metrics: RichMetrics, durationMs: number, success: boolean) {
  const now = Date.now();
  if (now - metrics.lastBucketStartedAt >= 5000) {
    flushBucket(metrics, now);
  }

  metrics.bucketTotal += 1;
  if (success) {
    metrics.bucketSuccess += 1;
  } else {
    metrics.bucketFailed += 1;
  }
  metrics.bucketTimes.push(durationMs);
}

function pushMetricTime(times: number[], value: number) {
  if (times.length >= 5000) {
    times.shift();
  }
  times.push(value);
}
