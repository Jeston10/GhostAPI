import {
  createMetrics,
  flushBucket,
  percentile,
  recordFailure,
  recordSuccess,
  type RichMetrics,
} from "@/lib/loadtest/metrics";
import { classifyError } from "@/lib/loadtest/errors";
import { resolveAuthHeaders, type AuthConfig } from "@/lib/loadtest/auth";
import {
  applyTemplate,
  createScenarioContext,
  interpolateObject,
  saveVariablesFromJson,
  type ScenarioConfig,
  type ScenarioStep,
} from "@/lib/loadtest/scenario-engine";
import { getQueueLength, isRunning, removeFromQueue, schedule } from "@/lib/loadtest/scheduler";
import { nowMs, shouldStopForMemory } from "@/lib/loadtest/runtime-guards";
import { upsertRunResult } from "@/lib/loadtest/persistence";
import { evaluateThresholds, type ThresholdConfig } from "@/lib/loadtest/thresholds";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type LoadProfile =
  | { type: "steady"; thinkTimeMinMs?: number; thinkTimeMaxMs?: number }
  | {
      type: "staged";
      stages: Array<{ duration: number; targetVus: number; targetRps?: number }>;
      thinkTimeMinMs?: number;
      thinkTimeMaxMs?: number;
    };

export type TestConfig = {
  name?: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  vus: number;
  parallelRequests: number;
  duration: number;
  profile?: LoadProfile;
  auth?: AuthConfig;
  scenario?: ScenarioConfig;
  thresholds?: ThresholdConfig;
  tags?: string[];
};

export type TestState = {
  id: string;
  config: TestConfig;
  running: boolean;
  status: "queued" | "running" | "completed" | "failed" | "stopped";
  stopRequested: boolean;
  startTime: number;
  startedAt?: number;
  endTime?: number;
  queuedAt: number;
  queueWaitMs: number;
  lastHeartbeatAt: number;
  error?: string;
  metrics: RichMetrics;
  thresholdSummary?: ReturnType<typeof evaluateThresholds>;
};

declare global {
  var __ghostApiTests: Map<string, TestState> | undefined;
}

export const tests = globalThis.__ghostApiTests ?? new Map<string, TestState>();

if (!globalThis.__ghostApiTests) {
  globalThis.__ghostApiTests = tests;
}

export function createTestState(config: TestConfig): TestState {
  return {
    id: crypto.randomUUID(),
    config,
    running: false,
    status: "queued",
    stopRequested: false,
    startTime: nowMs(),
    queuedAt: nowMs(),
    queueWaitMs: 0,
    lastHeartbeatAt: nowMs(),
    metrics: createMetrics(),
  };
}

const BODY_ALLOWED_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export async function runTest(state: TestState) {
  schedule(state.id, async () => {
    state.running = true;
    state.status = "running";
    state.startedAt = nowMs();
    state.queueWaitMs = state.startedAt - state.queuedAt;
    state.metrics.queueWaitMs = state.queueWaitMs;

    const stopAt = nowMs() + state.config.duration * 1000;
    const vus = Array.from({ length: state.config.vus }).map((_, index) =>
      virtualUser(state, stopAt, index)
    );

    try {
      await Promise.all(vus);
      flushBucket(state.metrics);
      if (state.stopRequested) {
        state.status = "stopped";
      } else {
        state.status = "completed";
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : "Load test failed";
      state.status = "failed";
    } finally {
      state.running = false;
      state.endTime = nowMs();
      state.thresholdSummary = evaluateThresholds(state.config.thresholds, getSnapshotMetrics(state));
      await upsertRunResult(state);
    }
  });
}

export function stopTest(testId: string) {
  const state = tests.get(testId);
  if (!state) return { stopped: false, message: "Test not found." };

  state.stopRequested = true;
  if (state.status === "queued") {
    removeFromQueue(testId);
    state.running = false;
    state.status = "stopped";
    state.endTime = nowMs();
    return { stopped: true, message: "Queued test removed." };
  }
  return { stopped: true, message: isRunning(testId) ? "Stop requested." : "Test already finished." };
}

function currentTargetVus(config: TestConfig, elapsedSeconds: number) {
  if (!config.profile || config.profile.type !== "staged") {
    return config.vus;
  }
  let consumed = 0;
  for (const stage of config.profile.stages) {
    consumed += stage.duration;
    if (elapsedSeconds <= consumed) {
      return stage.targetVus;
    }
  }
  return config.profile.stages[config.profile.stages.length - 1]?.targetVus ?? config.vus;
}

async function virtualUser(state: TestState, stopAt: number, userIndex: number) {
  const { parallelRequests } = state.config;

  while (nowMs() < stopAt && state.running && !state.stopRequested) {
    state.lastHeartbeatAt = nowMs();
    const elapsedSeconds = Math.max(Math.floor((nowMs() - (state.startedAt ?? nowMs())) / 1000), 0);
    const targetVus = currentTargetVus(state.config, elapsedSeconds);
    if (userIndex >= targetVus) {
      await sleep(250);
      continue;
    }

    if (shouldStopForMemory(Number(process.env.LOADTEST_MEMORY_LIMIT_MB ?? 512))) {
      state.stopRequested = true;
      state.error = "Test stopped by memory guard.";
      break;
    }

    const batch = Array.from({ length: parallelRequests }).map(() =>
      executeRequest(state)
    );

    await Promise.all(batch);
    await sleep(getThinkTime(state.config));
  }
}

async function executeRequest(state: TestState) {
  const maxInflightPerTest = Number(process.env.LOADTEST_MAX_INFLIGHT_PER_TEST ?? 100);
  if (state.metrics.inFlight >= maxInflightPerTest) {
    state.metrics.throttledCount += 1;
    await sleep(20);
    return;
  }

  const start = nowMs();
  const { url, method, headers, body } = state.config;
  const requestHeaders: Record<string, string> = { ...headers };
  const authHeaders = await resolveAuthHeaders(state.config.auth).catch(() => ({}));
  const mergedHeaders = { ...requestHeaders, ...authHeaders };
  const hasBody = Boolean(body && BODY_ALLOWED_METHODS.has(method));
  const scenarioContext = createScenarioContext();

  if (hasBody && !requestHeaders["content-type"]) {
    mergedHeaders["content-type"] = "application/json";
  }

  state.metrics.inFlight += 1;
  try {
    if (state.config.scenario?.setup?.length) {
      await runScenarioSteps(state.config.scenario.setup, scenarioContext);
    }

    const result = await executeSingleRequest({
      url: applyTemplate(url, scenarioContext),
      method,
      headers: mergedHeaders,
      body: interpolateObject(body, scenarioContext),
    });
    const duration = nowMs() - start;
    if (result.ok) {
      recordSuccess(state.metrics, duration, result.status);
    } else {
      recordFailure(state.metrics, duration, result.status, "unknown");
    }

    if (state.config.scenario?.steps?.length) {
      await runScenarioSteps(state.config.scenario.steps, scenarioContext);
    }
    if (state.config.scenario?.teardown?.length) {
      await runScenarioSteps(state.config.scenario.teardown, scenarioContext);
    }
  } catch (error) {
    const duration = nowMs() - start;
    recordFailure(state.metrics, duration, null, classifyError(error));
  } finally {
    state.metrics.inFlight = Math.max(state.metrics.inFlight - 1, 0);
  }
}

export function getSnapshotMetrics(state: TestState) {
  const elapsedMs = (state.running ? nowMs() : state.endTime ?? nowMs()) - (state.startedAt ?? state.startTime);
  const elapsedSeconds = Math.max(elapsedMs / 1000, 0.001);
  const total = state.metrics.total;
  const avg = total > 0 ? state.metrics.totalTime / total : 0;
  const times = [...state.metrics.times].sort((a, b) => a - b);
  const p95 = percentile(times, 95);
  const p99 = percentile(times, 99);
  const rps = total / elapsedSeconds;

  return {
    total,
    success: state.metrics.success,
    failed: state.metrics.failed,
    avg,
    p95,
    p99,
    rps,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getThinkTime(config: TestConfig) {
  const min = config.profile?.thinkTimeMinMs ?? 200;
  const max = config.profile?.thinkTimeMaxMs ?? 800;
  return randomBetween(min, max);
}

async function executeSingleRequest(input: {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: Record<string, unknown> | null | undefined;
}) {
  const response = await fetch(input.url, {
    method: input.method,
    headers: input.headers,
    body: input.body ? JSON.stringify(input.body) : undefined,
    signal: AbortSignal.timeout(5000),
  });

  return {
    ok: response.status < 400,
    status: response.status,
    json: await response.json().catch(() => null),
  };
}

async function runScenarioSteps(steps: ScenarioStep[], context: ReturnType<typeof createScenarioContext>) {
  for (const step of steps) {
    const response = await executeSingleRequest({
      url: applyTemplate(step.request.url, context),
      method: step.request.method as HttpMethod,
      headers: step.request.headers ?? {},
      body: interpolateObject(step.request.body ?? null, context),
    });
    saveVariablesFromJson(response.json, step.save, context);
  }
}

export function getSchedulerStats() {
  return {
    queueLength: getQueueLength(),
  };
}
