import { NextResponse } from "next/server";
import { getSchedulerStats, getSnapshotMetrics, tests } from "../store";
import { flushBucket } from "@/lib/loadtest/metrics";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const test = tests.get(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }

  flushBucket(test.metrics);
  const base = getSnapshotMetrics(test);
  const statusCodeGroups = {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0,
  };

  for (const [code, count] of Object.entries(test.metrics.statusCodes)) {
    const num = Number(code);
    if (num >= 200 && num < 300) statusCodeGroups["2xx"] += count;
    if (num >= 300 && num < 400) statusCodeGroups["3xx"] += count;
    if (num >= 400 && num < 500) statusCodeGroups["4xx"] += count;
    if (num >= 500) statusCodeGroups["5xx"] += count;
  }

  return NextResponse.json({
    id: test.id,
    status: test.status,
    running: test.running,
    queueWaitMs: test.queueWaitMs,
    lastHeartbeatAt: test.lastHeartbeatAt,
    error: test.error ?? null,
    metrics: {
      ...base,
      inFlight: test.metrics.inFlight,
      throttledCount: test.metrics.throttledCount,
      statusCodes: test.metrics.statusCodes,
      statusCodeGroups,
      errors: test.metrics.errors,
      timeBuckets: test.metrics.timeBuckets,
    },
    thresholds: test.thresholdSummary ?? null,
    scheduler: getSchedulerStats(),
  });
}
