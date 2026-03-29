/** Hop-by-hop and sensitive headers we never forward from the try proxy. */
const BLOCKED = new Set(
  [
    "host",
    "connection",
    "content-length",
    "transfer-encoding",
    "keep-alive",
    "expect",
    "te",
    "trailer",
    "upgrade",
    "proxy-connection",
    "proxy-authenticate",
    "proxy-authorization",
    "cookie",
    "set-cookie",
  ].map((s) => s.toLowerCase())
);

const MAX_HEADER_VALUE = 8192;
const MAX_USER_HEADERS = 24;

/**
 * Merge safe client-provided headers with defaults for outbound fetch from the try proxy.
 */
export function mergeTryProxyHeaders(
  user: Record<string, string> | undefined
): Record<string, string> {
  const out: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "GhostAPI-Hub/1.0 (+https://github.com)",
  };
  if (!user || typeof user !== "object") return out;

  let n = 0;
  for (const [k, v] of Object.entries(user)) {
    if (n >= MAX_USER_HEADERS) break;
    const key = k.trim();
    if (!key || key.length > 64) continue;
    if (!/^[a-zA-Z0-9\-]+$/.test(key)) continue;
    if (BLOCKED.has(key.toLowerCase())) continue;
    const val = String(v ?? "").slice(0, MAX_HEADER_VALUE);
    out[key] = val;
    n++;
  }
  return out;
}
