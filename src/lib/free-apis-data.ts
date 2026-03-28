import {
  dedupeEntriesByApiName,
  parseReadmeToEntries,
  type FreeApiEntry,
} from "@/lib/parse-public-apis-readme";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { unstable_cache } from "next/cache";

const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";
const PUBLICAPIS_URL = "https://api.publicapis.org/entries";

function normalizeRemoteEntry(raw: Record<string, unknown>): FreeApiEntry | null {
  const API = String(raw.API ?? "").trim();
  const Link = String(raw.Link ?? "").trim();
  if (!API || !Link) return null;
  return {
    API,
    Description: String(raw.Description ?? ""),
    Auth: String(raw.Auth ?? ""),
    HTTPS: raw.HTTPS === true || String(raw.HTTPS) === "true" ? "Yes" : "No",
    Cors: String(raw.Cors ?? ""),
    Link,
    Category: String(raw.Category ?? "Uncategorized"),
  };
}

/** Last-resort catalog when remote sources fail (offline / outage). */
function loadLocalFixture(): {
  entries: FreeApiEntry[];
  categories: string[];
  source: "local-fixture";
} | null {
  try {
    const p = join(process.cwd(), "src/lib/fixtures/free-apis-catalog.json");
    if (!existsSync(p)) return null;
    const raw = JSON.parse(readFileSync(p, "utf8")) as {
      entries?: FreeApiEntry[];
    };
    const entries = dedupeEntriesByApiName(raw.entries ?? []);
    if (entries.length === 0) return null;
    const categories = [...new Set(entries.map((e) => e.Category).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );
    return { entries, categories, source: "local-fixture" };
  } catch {
    return null;
  }
}

async function loadEntriesUncached(): Promise<{
  entries: FreeApiEntry[];
  categories: string[];
  source: "publicapis.org" | "github-readme" | "local-fixture";
}> {
  try {
    const res = await fetch(PUBLICAPIS_URL, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { entries?: Record<string, unknown>[] };
      const list = (data.entries ?? [])
        .map(normalizeRemoteEntry)
        .filter((e): e is FreeApiEntry => e !== null);
      if (list.length > 0) {
        const entries = dedupeEntriesByApiName(list);
        const categories = [...new Set(entries.map((e) => e.Category).filter(Boolean))].sort(
          (a, b) => a.localeCompare(b)
        );
        return { entries, categories, source: "publicapis.org" };
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const readmeRes = await fetch(README_URL, {
      next: { revalidate: 86400 },
    });
    if (readmeRes.ok) {
      const text = await readmeRes.text();
      const parsed = dedupeEntriesByApiName(parseReadmeToEntries(text));
      const categories = [...new Set(parsed.map((e) => e.Category).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      );
      return { entries: parsed, categories, source: "github-readme" };
    }
  } catch {
    /* fall through */
  }

  const fixture = loadLocalFixture();
  if (fixture) {
    console.info(
      "[free-apis] catalog: local-fixture (remote sources unavailable; bundled snapshot)"
    );
    return fixture;
  }

  throw new Error("free_apis_catalog_unavailable");
}

export const getFreeApisPayload = unstable_cache(
  async () => {
    return await loadEntriesUncached();
  },
  ["free-apis-catalog-v4"],
  { revalidate: 3600 }
);
