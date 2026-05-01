import { NextResponse } from "next/server";
import { getSpeedApiPayload, speedTests } from "../store";
import { flushSpeedBucket } from "@/lib/speedtest/metrics";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const test = speedTests.get(id);
  if (!test) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }

  flushSpeedBucket(test.metrics);
  const payload = getSpeedApiPayload(test);

  return NextResponse.json({
    id: test.id,
    status: test.status,
    running: test.running,
    error: test.error ?? null,
    summary: payload.summary,
    timing: payload.timing,
    statusGroups: payload.statusGroups,
    errors: payload.errors,
    timeBuckets: payload.timeBuckets,
  });
}
