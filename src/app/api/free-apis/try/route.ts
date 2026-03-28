import {
  checkRateLimit,
  clientIpFromRequest,
  getTryProxyRateConfig,
  pruneStaleBuckets,
} from "@/lib/rate-limit";
import { logTryProxyEvent } from "@/lib/try-proxy-log";
import { isBlockedHost, isBlockedIpLiteral } from "@/lib/try-proxy-validate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 400_000;

type TryBody = {
  url?: string;
  method?: string;
};

export async function POST(req: Request) {
  let body: TryBody;
  try {
    body = (await req.json()) as TryBody;
  } catch {
    logTryProxyEvent({ outcome: "client_error", errorCode: "invalid_json" });
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const cfg = getTryProxyRateConfig();
  pruneStaleBuckets(cfg.windowMs);
  const ip = clientIpFromRequest(req);
  const rl = checkRateLimit(`try:${ip}`, cfg.max, cfg.windowMs);
  if (!rl.ok) {
    logTryProxyEvent({ outcome: "rate_limited", errorCode: "rate_limit" });
    const retrySec = Math.max(1, Math.ceil(rl.retryAfterMs / 1000));
    return NextResponse.json(
      {
        error: "rate_limited",
        detail: "Too many proxy requests from this session. Try again in a moment.",
        retryAfterMs: rl.retryAfterMs,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retrySec) },
      }
    );
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }

  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return NextResponse.json({ error: "unsupported_protocol" }, { status: 400 });
  }

  if (isBlockedHost(u.hostname) || isBlockedIpLiteral(u.hostname)) {
    logTryProxyEvent({
      outcome: "client_error",
      errorCode: "host_not_allowed",
      host: u.hostname,
    });
    return NextResponse.json(
      { error: "host_not_allowed", detail: "Local and private hosts are blocked." },
      { status: 403 }
    );
  }

  const method = (body.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "POST") {
    return NextResponse.json({ error: "method_not_allowed" }, { status: 400 });
  }

  const init: RequestInit = {
    method,
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "GhostAPI-Hub/1.0 (+https://github.com)",
    },
  };

  if (method === "POST") {
    init.headers = {
      ...init.headers,
      "Content-Type": "application/json",
    };
    init.body = "{}";
  }

  try {
    const res = await fetch(u.toString(), init);
    const contentType = res.headers.get("content-type") ?? "";
    let text = await res.text();
    if (text.length > MAX_BODY_CHARS) {
      text = `${text.slice(0, MAX_BODY_CHARS)}\n\n… [truncated]`;
    }
    logTryProxyEvent({
      outcome: "ok",
      statusCode: res.status,
      host: u.hostname,
    });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
      body: text,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logTryProxyEvent({
      outcome: "upstream_error",
      errorCode: "fetch_failed",
      host: u.hostname,
    });
    return NextResponse.json({ error: "fetch_failed", detail: msg }, { status: 502 });
  }
}
