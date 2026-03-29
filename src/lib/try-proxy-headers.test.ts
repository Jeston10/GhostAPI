import { describe, expect, it } from "vitest";
import { mergeTryProxyHeaders } from "./try-proxy-headers";

describe("mergeTryProxyHeaders", () => {
  it("adds defaults when user headers empty", () => {
    const h = mergeTryProxyHeaders(undefined);
    expect(h.Accept).toBeDefined();
    expect(h["User-Agent"]).toContain("GhostAPI");
  });

  it("drops blocked hop-by-hop headers", () => {
    const h = mergeTryProxyHeaders({
      Accept: "application/json",
      Host: "evil",
      cookie: "x=1",
      "X-Custom": "ok",
    });
    expect(h.Host).toBeUndefined();
    expect(h.cookie).toBeUndefined();
    expect(h["X-Custom"]).toBe("ok");
  });
});
