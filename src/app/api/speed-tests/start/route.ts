import { NextResponse } from "next/server";
import { createSpeedTestState, runSpeedTest, speedTests } from "../store";
import { isSpeedTestEnabled } from "@/lib/loadtest/flags";
import { isValidSpeedTestUrl } from "@/lib/speedtest/public-url";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);
const MAX_CONCURRENCY = 20;
const MAX_DURATION = 120;
const MIN_DURATION = 5;
const MIN_TIMEOUT = 2000;
const MAX_TIMEOUT = 15000;

export async function POST(request: Request) {
  if (!isSpeedTestEnabled()) {
    return NextResponse.json({ error: "Speed testing is disabled." }, { status: 503 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const {
    url,
    method,
    headers = {},
    body = null,
    concurrency = 5,
    durationSeconds = 20,
    timeoutMs = 8000,
  } = payload as Record<string, unknown>;

  if (typeof url !== "string" || !isValidSpeedTestUrl(url)) {
    return NextResponse.json({ error: "Provide a valid public URL." }, { status: 400 });
  }

  if (typeof method !== "string" || !ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ error: "Invalid HTTP method." }, { status: 400 });
  }

  if (!isPlainObject(headers)) {
    return NextResponse.json({ error: "Headers must be a JSON object." }, { status: 400 });
  }

  if (body !== null && !isPlainObject(body)) {
    return NextResponse.json({ error: "Body must be a JSON object or null." }, { status: 400 });
  }

  if (!isValidNumber(concurrency, 1, MAX_CONCURRENCY)) {
    return NextResponse.json(
      { error: `Concurrency must be between 1 and ${MAX_CONCURRENCY}.` },
      { status: 400 }
    );
  }

  if (!isValidNumber(durationSeconds, MIN_DURATION, MAX_DURATION)) {
    return NextResponse.json(
      { error: `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds.` },
      { status: 400 }
    );
  }

  if (!isValidNumber(timeoutMs, MIN_TIMEOUT, MAX_TIMEOUT)) {
    return NextResponse.json(
      { error: `Timeout must be between ${MIN_TIMEOUT} and ${MAX_TIMEOUT} ms.` },
      { status: 400 }
    );
  }

  const config = {
    url,
    method: method as import("@/lib/speedtest/execute-request").HttpMethod,
    headers: headers as Record<string, string>,
    body: body as Record<string, unknown> | null,
    concurrency: concurrency as number,
    durationSeconds: durationSeconds as number,
    timeoutMs: timeoutMs as number,
  };

  const state = createSpeedTestState(config);
  speedTests.set(state.id, state);

  void runSpeedTest(state);

  return NextResponse.json({ id: state.id, status: state.status });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
