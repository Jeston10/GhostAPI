import { classifyUserTimeout, speedtestDebug } from "./abort-utils";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type StatusGroup = "2xx" | "3xx" | "4xx" | "5xx";

export type SpeedRequestResult =
  | {
      success: true;
      status: number;
      statusGroup: StatusGroup;
      ttfb: number;
      downloadTime: number;
      totalTime: number;
    }
  | {
      success: false;
      failureType: "timeout" | "network";
      ttfb: number | null;
      downloadTime: number | null;
      totalTime: number | null;
    };

const BODY_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

function statusToGroup(status: number): StatusGroup {
  if (status >= 500) return "5xx";
  if (status >= 400) return "4xx";
  if (status >= 300) return "3xx";
  return "2xx";
}

export async function executeSpeedHttpRequest(input: {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  timeoutMs: number;
}): Promise<SpeedRequestResult> {
  const startTime = performance.now();
  const hasBody = Boolean(input.body && BODY_METHODS.has(input.method));
  const headers = { ...input.headers };
  if (hasBody && !headers["content-type"] && !headers["Content-Type"]) {
    headers["content-type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    speedtestDebug("abort_timer", { url: input.url, timeoutMs: input.timeoutMs });
    controller.abort();
  }, input.timeoutMs);

  speedtestDebug("request_start", { url: input.url, method: input.method, timeoutMs: input.timeoutMs });

  try {
    const response = await fetch(input.url, {
      method: input.method,
      headers,
      body: hasBody ? JSON.stringify(input.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    speedtestDebug("fetch_resolved", { url: input.url, status: response.status });

    const tHeaders = performance.now();
    const ttfb = tHeaders - startTime;

    try {
      await response.arrayBuffer();
    } catch (bodyErr) {
      speedtestDebug("arraybuffer_error", {
        bodyErr,
        aborted: controller.signal.aborted,
      });
      if (classifyUserTimeout(bodyErr, controller.signal)) {
        return {
          success: false,
          failureType: "timeout",
          ttfb: null,
          downloadTime: null,
          totalTime: null,
        };
      }
      return {
        success: false,
        failureType: "network",
        ttfb,
        downloadTime: null,
        totalTime: null,
      };
    }

    const endTime = performance.now();
    const downloadTime = endTime - tHeaders;
    const totalTime = endTime - startTime;
    const status = response.status;

    return {
      success: true,
      status,
      statusGroup: statusToGroup(status),
      ttfb,
      downloadTime,
      totalTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    speedtestDebug("fetch_catch", {
      error,
      errorName: error instanceof Error ? error.name : typeof error,
      aborted: controller.signal.aborted,
    });
    const timedOut = classifyUserTimeout(error, controller.signal);

    return {
      success: false,
      failureType: timedOut ? "timeout" : "network",
      ttfb: null,
      downloadTime: null,
      totalTime: null,
    };
  }
}
