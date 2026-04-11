import { NextResponse } from "next/server";

const MAX_BODY_CHARS = 200_000;
const MAX_RESPONSE_CHARS = 1_000_000;
const TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      url?: string;
      method?: string;
      body?: string | null;
    };

    const url = payload.url?.trim();
    const method = payload.method?.toUpperCase();
    const body = payload.body ?? null;

    if (!url) {
      return NextResponse.json({ error: "API URL is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid API URL." }, { status: 400 });
    }

    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP/HTTPS URLs are supported." },
        { status: 400 }
      );
    }

    if (method !== "GET" && method !== "POST") {
      return NextResponse.json({ error: "Unsupported HTTP method." }, { status: 400 });
    }

    if (body && body.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }

    if (method === "POST" && body) {
      try {
        JSON.parse(body);
      } catch {
        return NextResponse.json({ error: "POST body must be valid JSON." }, { status: 400 });
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(parsedUrl.toString(), {
        method,
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: method === "POST" ? body ?? undefined : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream API error (${res.status}).` },
        { status: res.status }
      );
    }

    if (text.length > MAX_RESPONSE_CHARS) {
      return NextResponse.json({ error: "Response is too large." }, { status: 413 });
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "API response is not valid JSON." },
        { status: 400 }
      );
    }

    const raw = JSON.stringify(data, null, 2);

    return NextResponse.json({ raw, data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "API request timed out." }, { status: 408 });
    }
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
