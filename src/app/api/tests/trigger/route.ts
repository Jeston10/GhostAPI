import { NextResponse } from "next/server";
import { createTestState, runTest, tests, type TestConfig } from "../store";
import { isLoadTestCiTriggerEnabled } from "@/lib/loadtest/flags";

export async function POST(request: Request) {
  if (!isLoadTestCiTriggerEnabled()) {
    return NextResponse.json({ error: "CI trigger endpoint is disabled." }, { status: 503 });
  }

  const token = request.headers.get("x-loadtest-token");
  const expectedToken = process.env.LOADTEST_API_TOKEN?.trim();

  if (!expectedToken) {
    return NextResponse.json({ error: "LOADTEST_API_TOKEN is not configured." }, { status: 500 });
  }

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  return NextResponse.json({
    id: state.id,
    status: state.status,
    webhookUrl: `/api/tests/${state.id}`,
  });
}
