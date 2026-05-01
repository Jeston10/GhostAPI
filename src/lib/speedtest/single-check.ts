import type { HttpMethod } from "./execute-request";
import { classifyUserTimeout, speedtestDebug } from "./abort-utils";

const BODY_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

const STATUS_PHRASES: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export function resolveStatusText(status: number, statusTextFromResponse: string): string {
  const trimmed = statusTextFromResponse?.trim();
  if (trimmed) return trimmed;
  return STATUS_PHRASES[status] ?? `HTTP ${status}`;
}

export type SingleSpeedSuccess = {
  success: true;
  status: number;
  statusText: string;
  totalTime: number;
  ttfb: number;
  downloadTime: number;
  size: number;
};

export type SingleSpeedFailure = {
  success: false;
  error: "timeout" | "network";
  totalTime: null;
  ttfb: null;
  downloadTime: null;
  size: null;
};

export type SingleSpeedResult = SingleSpeedSuccess | SingleSpeedFailure;

export async function runSingleSpeedCheck(input: {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  timeoutMs: number;
}): Promise<SingleSpeedResult> {
  const start = performance.now();
  const hasBody = Boolean(input.body && BODY_METHODS.has(input.method));
  const headers = { ...input.headers };
  if (hasBody && !headers["content-type"] && !headers["Content-Type"]) {
    headers["content-type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    speedtestDebug("single_abort_timer", { url: input.url, timeoutMs: input.timeoutMs });
    controller.abort();
  }, input.timeoutMs);

  speedtestDebug("single_request_start", {
    url: input.url,
    method: input.method,
    timeoutMs: input.timeoutMs,
  });

  try {
    const response = await fetch(input.url, {
      method: input.method,
      headers,
      body: hasBody ? JSON.stringify(input.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    speedtestDebug("single_fetch_resolved", { url: input.url, status: response.status });

    const ttfbTime = performance.now();
    const ttfb = ttfbTime - start;

    let buffer: ArrayBuffer;
    try {
      buffer = await response.arrayBuffer();
    } catch (bodyErr) {
      speedtestDebug("single_arraybuffer_error", {
        bodyErr,
        aborted: controller.signal.aborted,
      });
      if (classifyUserTimeout(bodyErr, controller.signal)) {
        return {
          success: false,
          error: "timeout",
          totalTime: null,
          ttfb: null,
          downloadTime: null,
          size: null,
        };
      }
      return {
        success: false,
        error: "network",
        totalTime: null,
        ttfb: null,
        downloadTime: null,
        size: null,
      };
    }

    const end = performance.now();
    const downloadTime = end - ttfbTime;
    const totalTime = end - start;
    const status = response.status;
    const statusText = resolveStatusText(status, response.statusText);

    return {
      success: true,
      status,
      statusText,
      totalTime,
      ttfb,
      downloadTime,
      size: buffer.byteLength,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    speedtestDebug("single_fetch_catch", {
      error,
      errorName: error instanceof Error ? error.name : typeof error,
      aborted: controller.signal.aborted,
    });
    const timedOut = classifyUserTimeout(error, controller.signal);

    return {
      success: false,
      error: timedOut ? "timeout" : "network",
      totalTime: null,
      ttfb: null,
      downloadTime: null,
      size: null,
    };
  }
}
