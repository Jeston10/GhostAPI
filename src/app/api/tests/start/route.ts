import { NextResponse } from "next/server";
import { createTestState, runTest, tests, type TestConfig } from "../store";

const MAX_VUS = 50;
const MAX_PARALLEL = 10;
const MAX_DURATION = 60;
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const {
    url,
    method,
    headers = {},
    body = null,
    vus,
    parallelRequests,
    duration,
  } = payload as Record<string, unknown>;

  if (typeof url !== "string" || !isValidUrl(url)) {
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

  if (!isValidNumber(vus, 1, MAX_VUS)) {
    return NextResponse.json({ error: `VUs must be between 1 and ${MAX_VUS}.` }, { status: 400 });
  }

  if (!isValidNumber(parallelRequests, 1, MAX_PARALLEL)) {
    return NextResponse.json(
      { error: `Parallel requests must be between 1 and ${MAX_PARALLEL}.` },
      { status: 400 }
    );
  }

  if (!isValidNumber(duration, 1, MAX_DURATION)) {
    return NextResponse.json(
      { error: `Duration must be between 1 and ${MAX_DURATION} seconds.` },
      { status: 400 }
    );
  }

  const config: TestConfig = {
    url,
    method: method as TestConfig["method"],
    headers: headers as Record<string, string>,
    body: body as Record<string, unknown> | null,
    vus: vus as number,
    parallelRequests: parallelRequests as number,
    duration: duration as number,
  };

  const state = createTestState(config);
  tests.set(state.id, state);

  void runTest(state);

  return NextResponse.json({ id: state.id });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (!parsed.protocol.startsWith("http")) return false;
    if (isBlockedHost(parsed.hostname)) return false;
    return true;
  } catch (error) {
    return false;
  }
}

function isBlockedHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local")) return true;
  if (normalized === "0.0.0.0" || normalized === "127.0.0.1" || normalized === "::1") {
    return true;
  }

  if (isPrivateIpV4(normalized)) return true;
  return false;
}

function isPrivateIpV4(value: string) {
  const match = value.match(/^\d{1,3}(?:\.\d{1,3}){3}$/);
  if (!match) return false;

  const parts = value.split(".").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}
