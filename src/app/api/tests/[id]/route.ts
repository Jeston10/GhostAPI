import { NextResponse } from "next/server";
import { tests } from "../store";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const test = tests.get(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }

  const elapsedMs = (test.running ? Date.now() : test.endTime ?? Date.now()) - test.startTime;
  const elapsedSeconds = Math.max(elapsedMs / 1000, 0.001);
  const total = test.metrics.total;
  const avg = total > 0 ? test.metrics.totalTime / total : 0;
  const times = [...test.metrics.times].sort((a, b) => a - b);
  const p95 = percentile(times, 95);
  const p99 = percentile(times, 99);
  const rps = total / elapsedSeconds;

  return NextResponse.json({
    running: test.running,
    metrics: {
      total,
      success: test.metrics.success,
      failed: test.metrics.failed,
      avg,
      p95,
      p99,
      rps,
    },
  });
}

function percentile(values: number[], percentileValue: number) {
  if (!values.length) return 0;
  const index = Math.ceil((percentileValue / 100) * values.length) - 1;
  return values[Math.min(Math.max(index, 0), values.length - 1)];
}
