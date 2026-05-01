import { nowMs } from "@/lib/loadtest/runtime-guards";
import { WorkerPool } from "@/lib/speedtest/worker-pool";
import { executeSpeedHttpRequest } from "@/lib/speedtest/execute-request";
import {
  buildSpeedApiPayload,
  createSpeedMetrics,
  flushSpeedBucket,
  recordSpeedSample,
  type SpeedMetrics,
} from "@/lib/speedtest/metrics";
import type { HttpMethod } from "@/lib/speedtest/execute-request";

export type SpeedTestConfig = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  /** Max concurrent in-flight HTTP requests */
  concurrency: number;
  durationSeconds: number;
  timeoutMs: number;
};

export type SpeedTestState = {
  id: string;
  config: SpeedTestConfig;
  running: boolean;
  status: "running" | "completed" | "failed" | "stopped";
  stopRequested: boolean;
  startedAt: number;
  endTime?: number;
  error?: string;
  metrics: SpeedMetrics;
};

declare global {
  var __ghostApiSpeedTests: Map<string, SpeedTestState> | undefined;
}

export const speedTests = globalThis.__ghostApiSpeedTests ?? new Map<string, SpeedTestState>();

if (!globalThis.__ghostApiSpeedTests) {
  globalThis.__ghostApiSpeedTests = speedTests;
}

export function createSpeedTestState(config: SpeedTestConfig): SpeedTestState {
  return {
    id: crypto.randomUUID(),
    config,
    running: false,
    status: "running",
    stopRequested: false,
    startedAt: nowMs(),
    metrics: createSpeedMetrics(),
  };
}

export async function runSpeedTest(state: SpeedTestState) {
  state.running = true;
  state.startedAt = nowMs();
  const pool = new WorkerPool(state.config.concurrency);
  const stopAt = state.startedAt + state.config.durationSeconds * 1000;

  const virtualUsers = state.config.concurrency;
  const loops = Array.from({ length: virtualUsers }, () => vuLoop(state, pool, stopAt));

  try {
    await Promise.all(loops);
    flushSpeedBucket(state.metrics);
    state.status = state.stopRequested ? "stopped" : "completed";
  } catch (e) {
    state.error = e instanceof Error ? e.message : "Speed test failed";
    state.status = "failed";
  } finally {
    state.running = false;
    state.endTime = nowMs();
    flushSpeedBucket(state.metrics);
  }
}

async function vuLoop(state: SpeedTestState, pool: WorkerPool, stopAt: number) {
  while (nowMs() < stopAt && !state.stopRequested) {
    await pool.run(async () => {
      state.metrics.inFlight += 1;
      try {
        const result = await executeSpeedHttpRequest({
          url: state.config.url,
          method: state.config.method,
          headers: state.config.headers,
          body: state.config.body,
          timeoutMs: state.config.timeoutMs,
        });
        recordSpeedSample(state.metrics, result);
      } finally {
        state.metrics.inFlight = Math.max(state.metrics.inFlight - 1, 0);
      }
    });
  }
}

export function stopSpeedTest(id: string) {
  const state = speedTests.get(id);
  if (!state) return { stopped: false as const, message: "Test not found." };
  state.stopRequested = true;
  return { stopped: true as const, message: "Stop requested." };
}

export function getSpeedApiPayload(state: SpeedTestState) {
  return buildSpeedApiPayload(state.metrics, state.startedAt, state.running, state.endTime);
}
