import { NextResponse } from "next/server";
import { createTestState, runTest, tests, type TestConfig } from "../store";
import { isBlockedHost } from "@/lib/loadtest/runtime-guards";
import { isLoadTestV2Enabled } from "@/lib/loadtest/flags";

const MAX_VUS = 50;
const MAX_PARALLEL = 10;
const MAX_DURATION = 1800;
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);

export async function POST(request: Request) {
  if (!isLoadTestV2Enabled()) {
    return NextResponse.json({ error: "Load test v2 is disabled." }, { status: 503 });
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
    vus,
    parallelRequests,
    duration,
    profile,
    auth,
    scenario,
    thresholds,
    name,
    tags,
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
    name: typeof name === "string" ? name.trim() : undefined,
    url,
    method: method as TestConfig["method"],
    headers: headers as Record<string, string>,
    body: body as Record<string, unknown> | null,
    vus: vus as number,
    parallelRequests: parallelRequests as number,
    duration: duration as number,
    profile: parseProfile(profile, duration as number),
    auth: parseAuth(auth),
    scenario: parseScenario(scenario),
    thresholds: parseThresholds(thresholds),
    tags: Array.isArray(tags) ? tags.filter((item): item is string => typeof item === "string") : undefined,
  };

  const state = createTestState(config);
  tests.set(state.id, state);

  runTest(state);

  return NextResponse.json({ id: state.id, status: state.status });
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
    const allowlist = process.env.LOADTEST_HOST_ALLOWLIST?.split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist && allowlist.length > 0) {
      return allowlist.includes(parsed.hostname.toLowerCase());
    }
    if (isBlockedHost(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function parseProfile(value: unknown, duration: number): TestConfig["profile"] {
  if (!value || typeof value !== "object") {
    return {
      type: "steady",
      thinkTimeMinMs: 200,
      thinkTimeMaxMs: 800,
    };
  }
  const payload = value as Record<string, unknown>;
  if (payload.type === "staged" && Array.isArray(payload.stages)) {
    let durationTotal = 0;
    const stages = payload.stages
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const stage = item as Record<string, unknown>;
        const stageDuration = Number(stage.duration);
        const targetVus = Number(stage.targetVus);
        if (!Number.isFinite(stageDuration) || stageDuration <= 0) return null;
        if (!Number.isFinite(targetVus) || targetVus <= 0) return null;
        durationTotal += stageDuration;
        return {
          duration: stageDuration,
          targetVus: Math.min(targetVus, MAX_VUS),
          targetRps: Number.isFinite(Number(stage.targetRps)) ? Number(stage.targetRps) : undefined,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (stages.length > 0 && durationTotal <= duration) {
      return {
        type: "staged",
        stages,
        thinkTimeMinMs: Number(payload.thinkTimeMinMs ?? 200),
        thinkTimeMaxMs: Number(payload.thinkTimeMaxMs ?? 800),
      };
    }
  }

  return {
    type: "steady",
    thinkTimeMinMs: Number(payload.thinkTimeMinMs ?? 200),
    thinkTimeMaxMs: Number(payload.thinkTimeMaxMs ?? 800),
  };
}

function parseAuth(value: unknown): TestConfig["auth"] {
  if (!value || typeof value !== "object") return { type: "none" };
  const payload = value as Record<string, unknown>;
  if (payload.type === "bearer" && typeof payload.token === "string") {
    return { type: "bearer", token: payload.token };
  }
  if (payload.type === "token_endpoint" && typeof payload.tokenUrl === "string") {
    return {
      type: "token_endpoint",
      tokenUrl: payload.tokenUrl,
      method: payload.method === "GET" ? "GET" : "POST",
      body: isPlainObject(payload.body) ? payload.body : null,
      headers: isPlainObject(payload.headers) ? (payload.headers as Record<string, string>) : undefined,
      tokenField: typeof payload.tokenField === "string" ? payload.tokenField : "access_token",
      refreshSeconds: typeof payload.refreshSeconds === "number" ? payload.refreshSeconds : 300,
    };
  }
  return { type: "none" };
}

function parseScenario(value: unknown): TestConfig["scenario"] {
  if (!value || typeof value !== "object") return undefined;
  const payload = value as Record<string, unknown>;
  const setup = parseScenarioSteps(payload.setup);
  const steps = parseScenarioSteps(payload.steps);
  const teardown = parseScenarioSteps(payload.teardown);
  if (!setup && !steps && !teardown) return undefined;
  return { setup, steps, teardown };
}

function parseScenarioSteps(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const steps = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const step = item as Record<string, unknown>;
      const request = step.request;
      if (!request || typeof request !== "object") return null;
      const requestPayload = request as Record<string, unknown>;
      if (typeof requestPayload.url !== "string" || typeof requestPayload.method !== "string") return null;
      return {
        name: typeof step.name === "string" ? step.name : "step",
        request: {
          url: requestPayload.url,
          method: requestPayload.method,
          headers: isPlainObject(requestPayload.headers)
            ? (requestPayload.headers as Record<string, string>)
            : undefined,
          body: isPlainObject(requestPayload.body)
            ? (requestPayload.body as Record<string, unknown>)
            : null,
        },
        save: isPlainObject(step.save) ? (step.save as Record<string, string>) : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return steps.length > 0 ? steps : undefined;
}

function parseThresholds(value: unknown): TestConfig["thresholds"] {
  if (!value || typeof value !== "object") return undefined;
  const payload = value as Record<string, unknown>;
  const config = {
    maxP95Ms: typeof payload.maxP95Ms === "number" ? payload.maxP95Ms : undefined,
    maxErrorRate: typeof payload.maxErrorRate === "number" ? payload.maxErrorRate : undefined,
    minRps: typeof payload.minRps === "number" ? payload.minRps : undefined,
  };

  if (
    config.maxP95Ms === undefined &&
    config.maxErrorRate === undefined &&
    config.minRps === undefined
  ) {
    return undefined;
  }
  return config;
}
