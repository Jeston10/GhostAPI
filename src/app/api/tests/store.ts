export type TestConfig = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  vus: number;
  parallelRequests: number;
  duration: number;
};

export type TestMetrics = {
  total: number;
  success: number;
  failed: number;
  totalTime: number;
  times: number[];
};

export type TestState = {
  id: string;
  config: TestConfig;
  running: boolean;
  startTime: number;
  endTime?: number;
  metrics: TestMetrics;
};

declare global {
  // eslint-disable-next-line no-var
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
    running: true,
    startTime: Date.now(),
    metrics: {
      total: 0,
      success: 0,
      failed: 0,
      totalTime: 0,
      times: [],
    },
  };
}

const BODY_ALLOWED_METHODS = new Set(["POST", "PUT", "DELETE"]);

export async function runTest(state: TestState) {
  const stopAt = Date.now() + state.config.duration * 1000;
  const vus = Array.from({ length: state.config.vus }).map(() =>
    virtualUser(state, stopAt)
  );

  try {
    await Promise.all(vus);
  } finally {
    state.running = false;
    state.endTime = Date.now();
  }
}

async function virtualUser(state: TestState, stopAt: number) {
  const { parallelRequests } = state.config;

  while (Date.now() < stopAt && state.running) {
    const batch = Array.from({ length: parallelRequests }).map(() =>
      executeRequest(state)
    );

    await Promise.all(batch);
    await sleep(randomBetween(200, 800));
  }
}

async function executeRequest(state: TestState) {
  const start = Date.now();
  const { url, method, headers, body } = state.config;
  const requestHeaders: Record<string, string> = { ...headers };
  const hasBody = body && BODY_ALLOWED_METHODS.has(method);

  if (hasBody && !requestHeaders["content-type"]) {
    requestHeaders["content-type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });

    const duration = Date.now() - start;

    state.metrics.total += 1;
    state.metrics.totalTime += duration;
    pushMetricTime(state.metrics.times, duration);

    if (response.status < 400) {
      state.metrics.success += 1;
    } else {
      state.metrics.failed += 1;
    }
  } catch (error) {
    const duration = Date.now() - start;
    state.metrics.total += 1;
    state.metrics.failed += 1;
    state.metrics.totalTime += duration;
    pushMetricTime(state.metrics.times, duration);
  }
}

function pushMetricTime(times: number[], value: number) {
  if (times.length >= 5000) {
    times.shift();
  }
  times.push(value);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
