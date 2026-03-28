/**
 * Server-side diagnostics for the free-apis try proxy — avoids logging full URLs.
 */

function hashHost(hostname: string): string {
  let h = 0;
  for (let i = 0; i < hostname.length; i++) {
    h = (Math.imul(31, h) + hostname.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(16)}`;
}

export function logTryProxyEvent(payload: {
  outcome: "ok" | "client_error" | "upstream_error" | "rate_limited";
  statusCode?: number;
  host?: string;
  errorCode?: string;
}): void {
  const hostPart = payload.host ? hashHost(payload.host) : "—";
  const line = `[try-proxy] ${payload.outcome} status=${payload.statusCode ?? "—"} host=${hostPart} err=${payload.errorCode ?? "—"}`;
  if (payload.outcome === "upstream_error" || payload.outcome === "rate_limited") {
    console.warn(line);
  } else if (process.env.NODE_ENV === "development") {
    console.info(line);
  }
}
