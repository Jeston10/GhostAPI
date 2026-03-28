const FAV_KEY = "ghostapi:api-hub:favorites";
const RECENT_KEY = "ghostapi:api-hub:recent";
const MAX_RECENT = 14;

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function loadFavoriteKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(safeParseStringArray(localStorage.getItem(FAV_KEY)));
}

export function saveFavoriteKeys(keys: Set<string>): void {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...keys]));
  } catch {
    /* quota */
  }
}

export function toggleFavoriteKey(key: string, current: Set<string>): Set<string> {
  const next = new Set(current);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  saveFavoriteKeys(next);
  return next;
}

export function recordRecentKey(key: string): string[] {
  if (typeof window === "undefined") return [];
  const prev = safeParseStringArray(localStorage.getItem(RECENT_KEY));
  const next = [key, ...prev.filter((k) => k !== key)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function loadRecentKeys(): string[] {
  if (typeof window === "undefined") return [];
  return safeParseStringArray(localStorage.getItem(RECENT_KEY));
}
