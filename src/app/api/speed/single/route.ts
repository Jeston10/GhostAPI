import { NextResponse } from "next/server";
import { isSpeedTestEnabled } from "@/lib/loadtest/flags";
import { isValidSpeedTestUrl } from "@/lib/speedtest/public-url";
import { runSingleSpeedCheck } from "@/lib/speedtest/single-check";
import type { HttpMethod } from "@/lib/speedtest/execute-request";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);
const MIN_TIMEOUT = 1000;
const MAX_TIMEOUT = 15000;

export async function POST(request: Request) {
  if (!isSpeedTestEnabled()) {
    return NextResponse.json({ success: false, error: "disabled" as const }, { status: 503 });
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

  if (!isValidNumber(timeoutMs, MIN_TIMEOUT, MAX_TIMEOUT)) {
    return NextResponse.json(
      { error: `Timeout must be between ${MIN_TIMEOUT} and ${MAX_TIMEOUT} ms.` },
      { status: 400 }
    );
  }

  const result = await runSingleSpeedCheck({
    url,
    method: method as HttpMethod,
    headers: headers as Record<string, string>,
    body: body as Record<string, unknown> | null,
    timeoutMs: timeoutMs as number,
  });

  return NextResponse.json(result);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
