import { describe, expect, it } from "vitest";
import { isBlockedHost } from "./runtime-guards";

describe("isBlockedHost", () => {
  it("blocks localhost and private IPv4 addresses", () => {
    expect(isBlockedHost("localhost")).toBe(true);
    expect(isBlockedHost("127.0.0.1")).toBe(true);
    expect(isBlockedHost("10.1.2.3")).toBe(true);
    expect(isBlockedHost("192.168.1.50")).toBe(true);
  });

  it("blocks private/link-local IPv6 ranges", () => {
    expect(isBlockedHost("fd00::abcd")).toBe(true);
    expect(isBlockedHost("fe80::1")).toBe(true);
  });

  it("allows public hostnames", () => {
    expect(isBlockedHost("api.example.com")).toBe(false);
    expect(isBlockedHost("8.8.8.8")).toBe(false);
  });
});
