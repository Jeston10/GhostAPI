import { isBlockedHost } from "@/lib/loadtest/runtime-guards";

/** Same host policy as load / batch speed tests. */
export function isValidSpeedTestUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (!parsed.protocol.startsWith("http")) return false;
    const allowlist = process.env.LOADTEST_HOST_ALLOWLIST?.split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist && allowlist.length > 0) {
      return allowlist.includes(parsed.hostname.toLowerCase());
    }
    if (isBlockedHost(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
