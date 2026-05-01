import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { resolveStatusText, runSingleSpeedCheck } from "@/lib/speedtest/single-check";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/speed/single", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("resolveStatusText", () => {
  it("uses response phrase when present", () => {
    expect(resolveStatusText(200, "OK")).toBe("OK");
  });

  it("falls back for empty statusText", () => {
    expect(resolveStatusText(500, "")).toBe("Internal Server Error");
    expect(resolveStatusText(404, "  ")).toBe("Not Found");
  });
});

describe("runSingleSpeedCheck", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("returns success with size and timings for completed response", async () => {
    const buf = new Uint8Array(100);
    fetchMock.mockResolvedValueOnce(new Response(buf, { status: 200, statusText: "OK" }));

    const r = await runSingleSpeedCheck({
      url: "https://example.com/x",
      method: "GET",
      headers: {},
      body: null,
      timeoutMs: 5000,
    });

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.status).toBe(200);
      expect(r.statusText).toBe("OK");
      expect(r.size).toBe(100);
      expect(r.totalTime).toBeGreaterThanOrEqual(0);
      expect(r.ttfb).toBeGreaterThanOrEqual(0);
      expect(r.downloadTime).toBeGreaterThanOrEqual(0);
      expect(r.totalTime).toBeCloseTo(r.ttfb + r.downloadTime, 5);
    }
  });

  it("treats HTTP 500 as success with timings", async () => {
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array(2), { status: 500, statusText: "" }));

    const r = await runSingleSpeedCheck({
      url: "https://example.com/x",
      method: "GET",
      headers: {},
      body: null,
      timeoutMs: 5000,
    });

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.status).toBe(500);
      expect(r.statusText).toBe("Internal Server Error");
      expect(r.ttfb).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns timeout when abort fires", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error("no signal"));
          return;
        }
        signal.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    });

    const p = runSingleSpeedCheck({
      url: "https://example.com/slow",
      method: "GET",
      headers: {},
      body: null,
      timeoutMs: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);

    const r = await p;
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error).toBe("timeout");
      expect(r.totalTime).toBeNull();
      expect(r.ttfb).toBeNull();
      expect(r.downloadTime).toBeNull();
      expect(r.size).toBeNull();
    }
    vi.useRealTimers();
  });

  it("classifies TypeError with AbortError cause as timeout (Undici-style)", async () => {
    const err = new TypeError("fetch failed");
    err.cause = new DOMException("The operation was aborted.", "AbortError");
    fetchMock.mockRejectedValueOnce(err);

    const r = await runSingleSpeedCheck({
      url: "https://example.com/x",
      method: "GET",
      headers: {},
      body: null,
      timeoutMs: 5000,
    });

    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error).toBe("timeout");
    }
  });

  it("classifies plain fetch TypeError as network when not abort-related", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    const r = await runSingleSpeedCheck({
      url: "https://example.com/x",
      method: "GET",
      headers: {},
      body: null,
      timeoutMs: 5000,
    });

    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error).toBe("network");
    }
  });
});

describe("POST /api/speed/single", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array(10), { status: 200, statusText: "OK" })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("rejects localhost", async () => {
    const res = await POST(makeRequest({ url: "http://127.0.0.1:3000/", method: "GET" }));
    expect(res.status).toBe(400);
  });

  it("returns JSON result from single check", async () => {
    const res = await POST(
      makeRequest({
        url: "https://example.com/",
        method: "GET",
        headers: {},
        body: null,
        timeoutMs: 3000,
      })
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as { success: boolean };
    expect(j.success).toBe(true);
  });
});
