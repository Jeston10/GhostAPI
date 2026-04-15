import { NextResponse } from "next/server";
import { getRun } from "@/lib/loadtest/persistence";
import { isLoadTestCompareEnabled } from "@/lib/loadtest/flags";

export async function GET(request: Request) {
  if (!isLoadTestCompareEnabled()) {
    return NextResponse.json({ error: "Compare endpoint disabled." }, { status: 503 });
  }

  const url = new URL(request.url);
  const baselineId = url.searchParams.get("baseline");
  const currentId = url.searchParams.get("current");

  if (!baselineId || !currentId) {
    return NextResponse.json({ error: "baseline and current are required." }, { status: 400 });
  }

  const [baseline, current] = await Promise.all([getRun(baselineId), getRun(currentId)]);
  if (!baseline || !current) {
    return NextResponse.json({ error: "One or both runs were not found." }, { status: 404 });
  }

  const baselineTotal = baseline.metrics.total || 1;
  const currentTotal = current.metrics.total || 1;
  const baselineErrorRate = baseline.metrics.failed / baselineTotal;
  const currentErrorRate = current.metrics.failed / currentTotal;

  return NextResponse.json({
    baseline: {
      id: baseline.id,
      total: baseline.metrics.total,
      avgMs: baseline.metrics.total ? baseline.metrics.totalTime / baseline.metrics.total : 0,
      p95: percentile(baseline.metrics.times, 95),
      rpsApprox: computeRps(baseline),
      errorRate: baselineErrorRate,
    },
    current: {
      id: current.id,
      total: current.metrics.total,
      avgMs: current.metrics.total ? current.metrics.totalTime / current.metrics.total : 0,
      p95: percentile(current.metrics.times, 95),
      rpsApprox: computeRps(current),
      errorRate: currentErrorRate,
    },
    delta: {
      p95Ms: percentile(current.metrics.times, 95) - percentile(baseline.metrics.times, 95),
      errorRate: currentErrorRate - baselineErrorRate,
      rpsApprox: computeRps(current) - computeRps(baseline),
    },
  });
}

function percentile(values: number[], percentileValue: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)];
}

function computeRps(run: {
  startedAt?: number;
  endTime?: number;
  metrics: { total: number };
}) {
  const start = run.startedAt ?? Date.now();
  const end = run.endTime ?? Date.now();
  const elapsedSeconds = Math.max((end - start) / 1000, 0.001);
  return run.metrics.total / elapsedSeconds;
}
