import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): Request {
  return new Request("http://localhost/api/free-apis/try", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "198.51.100.2",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/free-apis/try", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/free-apis/try", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("invalid_json");
  });

  it("returns 400 when url is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("url_required");
  });

  it("returns 400 for invalid URL string", async () => {
    const res = await POST(makeRequest({ url: ":::not-a-url" }));
    expect(res.status).toBe(400);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("invalid_url");
  });

  it("returns 403 for blocked localhost host", async () => {
    const res = await POST(makeRequest({ url: "http://localhost:3000/api" }));
    expect(res.status).toBe(403);
    const j = (await res.json()) as { error?: string };
    expect(j.error).toBe("host_not_allowed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proxies GET and returns upstream status, body, and content-type", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ hello: "world" }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      })
    );

    const res = await POST(
      makeRequest({ url: "https://example.com/v1/test", method: "GET" })
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      status: number;
      contentType: string;
      body: string;
    };
    expect(j.status).toBe(200);
    expect(j.contentType).toContain("application/json");
    expect(j.body).toContain("hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe("https://example.com/v1/test");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("proxies POST with custom body and safe headers", async () => {
    fetchMock.mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const res = await POST(
      makeRequest({
        url: "https://example.com/v1/x",
        method: "POST",
        body: '{"hello":true}',
        headers: { "X-Test": "1", Host: "ignored" },
      })
    );
    expect(res.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"hello":true}');
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Test"]).toBe("1");
    expect(headers.Host).toBeUndefined();
  });

  it("returns 502 when fetch throws", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const res = await POST(makeRequest({ url: "https://example.com/x" }));
    expect(res.status).toBe(502);
    const j = (await res.json()) as { error?: string; detail?: string };
    expect(j.error).toBe("fetch_failed");
    expect(j.detail).toContain("network down");
  });
});
