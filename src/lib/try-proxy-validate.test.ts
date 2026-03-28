import { describe, expect, it } from "vitest";
import { isBlockedHost, isBlockedIpLiteral } from "./try-proxy-validate";

describe("try-proxy-validate", () => {
  it("blocks localhost and private hosts", () => {
    expect(isBlockedHost("localhost")).toBe(true);
    expect(isBlockedHost("10.0.0.1")).toBe(true);
    expect(isBlockedHost("example.com")).toBe(false);
  });

  it("blocks private ipv4 literals", () => {
    expect(isBlockedIpLiteral("127.0.0.1")).toBe(true);
    expect(isBlockedIpLiteral("192.168.1.1")).toBe(true);
    expect(isBlockedIpLiteral("example.com")).toBe(false);
  });
});
