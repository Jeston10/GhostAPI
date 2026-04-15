export function shouldStopForMemory(limitMb: number): boolean {
  if (typeof process === "undefined" || !process.memoryUsage) return false;
  const usedMb = process.memoryUsage().heapUsed / (1024 * 1024);
  return usedMb > limitMb;
}

export function nowMs() {
  return Date.now();
}

export function isBlockedHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local")) return true;
  if (normalized === "0.0.0.0" || normalized === "127.0.0.1" || normalized === "::1") {
    return true;
  }

  if (isPrivateIpV4(normalized)) return true;
  if (isPrivateIpV6(normalized)) return true;
  return false;
}

function isPrivateIpV4(value: string) {
  const match = value.match(/^\d{1,3}(?:\.\d{1,3}){3}$/);
  if (!match) return false;

  const parts = value.split(".").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function isPrivateIpV6(value: string) {
  if (!value.includes(":")) return false;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (value.startsWith("fe80")) return true;
  return false;
}
