import { NextResponse } from "next/server";
import { listRuns } from "@/lib/loadtest/persistence";
import { createTestState, runTest, tests, type TestConfig } from "../store";
import { isLoadTestHistoryEnabled } from "@/lib/loadtest/flags";

export async function GET(request: Request) {
  if (!isLoadTestHistoryEnabled()) {
    return NextResponse.json({ error: "History endpoint disabled." }, { status: 503 });
  }
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const runs = await listRuns(Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 20);
  return NextResponse.json({ runs });
}

export async function POST(request: Request) {
  if (!isLoadTestHistoryEnabled()) {
    return NextResponse.json({ error: "History endpoint disabled." }, { status: 503 });
  }
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const config = (payload as Record<string, unknown>).config;
  if (!config || typeof config !== "object") {
    return NextResponse.json({ error: "config is required." }, { status: 400 });
  }

  const state = createTestState(config as TestConfig);
  tests.set(state.id, state);
  runTest(state);
  return NextResponse.json({ id: state.id, status: state.status });
}
