import { percentile } from "@/lib/loadtest/metrics";
import type { SpeedRequestResult, StatusGroup } from "./execute-request";

const MAX_SAMPLES = 4000;

export type SpeedTimeBucket = {
  ts: number;
  total: number;
  completed: number;
  transportFailed: number;
  p95: number | null;
  rps: number;
  avgTotalMs: number | null;
};

export type SpeedMetrics = {
  totalRequests: number;
  completedCount: number;
  transportFailureCount: number;
  statusGroups: Record<StatusGroup, number>;
  errors: { timeout: number; network: number };
  totalTimeSum: number;
  ttfbSum: number;
  downloadSum: number;
  totalTimes: number[];
  ttfbTimes: number[];
  downloadTimes: number[];
  timeBuckets: SpeedTimeBucket[];
  lastBucketStartedAt: number;
  bucketTotal: number;
  bucketCompleted: number;
  bucketTransportFailed: number;
  bucketTimes: number[];
  inFlight: number;
};

export function createSpeedMetrics(): SpeedMetrics {
  return {
    totalRequests: 0,
    completedCount: 0,
    transportFailureCount: 0,
    statusGroups: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
    errors: { timeout: 0, network: 0 },
    totalTimeSum: 0,
    ttfbSum: 0,
    downloadSum: 0,
    totalTimes: [],
    ttfbTimes: [],
    downloadTimes: [],
    timeBuckets: [],
    lastBucketStartedAt: Date.now(),
    bucketTotal: 0,
    bucketCompleted: 0,
    bucketTransportFailed: 0,
    bucketTimes: [],
    inFlight: 0,
  };
}

function pushCapped(arr: number[], value: number) {
  if (arr.length >= MAX_SAMPLES) arr.shift();
  arr.push(value);
}

export function recordSpeedSample(metrics: SpeedMetrics, result: SpeedRequestResult) {
  metrics.totalRequests += 1;

  if (result.success) {
    metrics.completedCount += 1;
    metrics.statusGroups[result.statusGroup] += 1;
    metrics.totalTimeSum += result.totalTime;
    metrics.ttfbSum += result.ttfb;
    metrics.downloadSum += result.downloadTime;
    pushCapped(metrics.totalTimes, result.totalTime);
    pushCapped(metrics.ttfbTimes, result.ttfb);
    pushCapped(metrics.downloadTimes, result.downloadTime);
    recordSpeedBucket(metrics, result.totalTime, "completed");
    return;
  }

  metrics.transportFailureCount += 1;
  if (result.failureType === "timeout") {
    metrics.errors.timeout += 1;
  } else {
    metrics.errors.network += 1;
  }
  recordSpeedBucket(metrics, null, "transportFailed");
}

function recordSpeedBucket(
  metrics: SpeedMetrics,
  durationMs: number | null,
  kind: "completed" | "transportFailed"
) {
  const now = Date.now();
  if (now - metrics.lastBucketStartedAt >= 5000) {
    flushSpeedBucket(metrics, now);
  }

  metrics.bucketTotal += 1;
  if (kind === "completed") {
    metrics.bucketCompleted += 1;
    if (durationMs != null) {
      metrics.bucketTimes.push(durationMs);
    }
  } else {
    metrics.bucketTransportFailed += 1;
  }
}

export function flushSpeedBucket(metrics: SpeedMetrics, now = Date.now()) {
  const elapsed = now - metrics.lastBucketStartedAt;
  if (elapsed < 5000 || metrics.bucketTotal === 0) return;

  const seconds = Math.max(elapsed / 1000, 0.001);
  const sorted = [...metrics.bucketTimes].sort((a, b) => a - b);
  const avgTotalMs =
    sorted.length > 0 ? sorted.reduce((s, n) => s + n, 0) / sorted.length : null;
  const p95 = sorted.length > 0 ? percentile(sorted, 95) : null;

  metrics.timeBuckets.push({
    ts: now,
    total: metrics.bucketTotal,
    completed: metrics.bucketCompleted,
    transportFailed: metrics.bucketTransportFailed,
    p95,
    rps: metrics.bucketTotal / seconds,
    avgTotalMs,
  });

  if (metrics.timeBuckets.length > 120) {
    metrics.timeBuckets.shift();
  }

  metrics.lastBucketStartedAt = now;
  metrics.bucketTotal = 0;
  metrics.bucketCompleted = 0;
  metrics.bucketTransportFailed = 0;
  metrics.bucketTimes = [];
}

export type SpeedApiPayload = {
  summary: {
    totalRequests: number;
    successCount: number;
    failureCount: number;
    failureRate: number;
    httpErrorRate: number;
    avgLatency: number | null;
    p50: number | null;
    p90: number | null;
    p95: number | null;
    p99: number | null;
    minTotalMs: number | null;
    maxTotalMs: number | null;
    rps: number;
    inFlight: number;
  };
  timing: {
    avgTTFB: number | null;
    avgDownload: number | null;
    p95Ttfb: number | null;
    p95Download: number | null;
  };
  statusGroups: Record<StatusGroup, number>;
  errors: { timeout: number; network: number };
  timeBuckets: SpeedTimeBucket[];
};

export function buildSpeedApiPayload(
  metrics: SpeedMetrics,
  startedAt: number,
  running: boolean,
  endTime?: number
): SpeedApiPayload {
  const now = Date.now();
  flushSpeedBucket(metrics, now);

  const elapsedMs = (running ? now : (endTime ?? now)) - startedAt;
  const elapsedSec = Math.max(elapsedMs / 1000, 0.001);

  const total = metrics.totalRequests;
  const completed = metrics.completedCount;
  const failed = metrics.transportFailureCount;

  const sortedTotals = [...metrics.totalTimes].sort((a, b) => a - b);
  const sortedTtfb = [...metrics.ttfbTimes].sort((a, b) => a - b);
  const sortedDl = [...metrics.downloadTimes].sort((a, b) => a - b);

  const httpErrCount = metrics.statusGroups["4xx"] + metrics.statusGroups["5xx"];

  return {
    summary: {
      totalRequests: total,
      successCount: completed,
      failureCount: failed,
      failureRate: total > 0 ? failed / total : 0,
      httpErrorRate: total > 0 ? httpErrCount / total : 0,
      avgLatency: completed > 0 ? metrics.totalTimeSum / completed : null,
      p50: completed > 0 ? percentile(sortedTotals, 50) : null,
      p90: completed > 0 ? percentile(sortedTotals, 90) : null,
      p95: completed > 0 ? percentile(sortedTotals, 95) : null,
      p99: completed > 0 ? percentile(sortedTotals, 99) : null,
      minTotalMs: sortedTotals.length ? sortedTotals[0]! : null,
      maxTotalMs: sortedTotals.length ? sortedTotals[sortedTotals.length - 1]! : null,
      rps: total / elapsedSec,
      inFlight: metrics.inFlight,
    },
    timing: {
      avgTTFB: completed > 0 ? metrics.ttfbSum / completed : null,
      avgDownload: completed > 0 ? metrics.downloadSum / completed : null,
      p95Ttfb: completed > 0 ? percentile(sortedTtfb, 95) : null,
      p95Download: completed > 0 ? percentile(sortedDl, 95) : null,
    },
    statusGroups: { ...metrics.statusGroups },
    errors: { ...metrics.errors },
    timeBuckets: metrics.timeBuckets,
  };
}
