export type AuthConfig =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | {
      type: "token_endpoint";
      tokenUrl: string;
      method?: "POST" | "GET";
      body?: Record<string, unknown> | null;
      headers?: Record<string, string>;
      tokenField?: string;
      refreshSeconds?: number;
    };

type AuthCache = {
  token: string;
  expiresAtMs: number;
};

declare global {
  var __ghostApiAuthCache: Map<string, AuthCache> | undefined;
}

const cache = globalThis.__ghostApiAuthCache ?? new Map<string, AuthCache>();
if (!globalThis.__ghostApiAuthCache) {
  globalThis.__ghostApiAuthCache = cache;
}

export async function resolveAuthHeaders(auth: AuthConfig | undefined): Promise<Record<string, string>> {
  if (!auth || auth.type === "none") return {};
  if (auth.type === "bearer") {
    return auth.token ? { authorization: `Bearer ${auth.token}` } : {};
  }

  const key = JSON.stringify(auth);
  const existing = cache.get(key);
  if (existing && existing.expiresAtMs > Date.now()) {
    return { authorization: `Bearer ${existing.token}` };
  }

  const token = await fetchToken(auth);
  const refreshMs = Math.max((auth.refreshSeconds ?? 300) * 1000, 60_000);
  cache.set(key, { token, expiresAtMs: Date.now() + refreshMs });
  return { authorization: `Bearer ${token}` };
}

async function fetchToken(auth: Extract<AuthConfig, { type: "token_endpoint" }>): Promise<string> {
  const response = await fetch(auth.tokenUrl, {
    method: auth.method ?? "POST",
    headers: {
      "content-type": "application/json",
      ...(auth.headers ?? {}),
    },
    body: auth.body ? JSON.stringify(auth.body) : undefined,
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Token endpoint failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  const field = auth.tokenField ?? "access_token";
  const value = data[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Token field "${field}" missing in token response.`);
  }
  return value;
}
