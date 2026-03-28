/**
 * Parses the public-apis GitHub README.md table rows into catalog entries
 * (same shape as api.publicapis.org `entries` items).
 */

export type FreeApiEntry = {
  API: string;
  Description: string;
  Auth: string;
  HTTPS: string;
  Cors: string;
  Link: string;
  Category: string;
};

const SKIP_SECTION_TITLES = new Set([
  "APILayer APIs",
  "Learn more about Public APIs",
]);

export function parseReadmeToEntries(markdown: string): FreeApiEntry[] {
  const entries: FreeApiEntry[] = [];
  const lines = markdown.split(/\r?\n/);
  let category = "Uncategorized";

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const title = h3[1].replace(/\s*#+\s*$/, "").trim();
      if (!title.startsWith("**") && !SKIP_SECTION_TITLES.has(title)) {
        category = title;
      }
      continue;
    }

    const t = line.trimStart();
    if (!t.startsWith("| [")) continue;
    if (t.includes("|:---")) continue;
    if (/^\|\s*API\s*\|\s*Description/i.test(t)) continue;

    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 6) continue;

    const linkCell = parts[1];
    const m = linkCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!m) continue;

    const API = m[1].trim();
    const Link = m[2].trim();
    if (!Link.startsWith("http://") && !Link.startsWith("https://")) continue;

    const Description = parts[2] ?? "";
    const Auth = parts[3] ?? "";
    const HTTPS = parts[4] ?? "";
    const Cors = (parts[5] ?? "").replace(/\|/g, "").trim();

    entries.push({
      API,
      Description,
      Auth,
      HTTPS,
      Cors,
      Link,
      Category: category,
    });
  }

  return entries;
}

export function dedupeEntries(entries: FreeApiEntry[]): FreeApiEntry[] {
  const seen = new Map<string, FreeApiEntry>();
  for (const e of entries) {
    const key = `${e.API}::${e.Link}`;
    if (!seen.has(key)) seen.set(key, e);
  }
  return [...seen.values()];
}

/**
 * Same rule as [Free APIs Browse](https://free-apis.github.io/#/browse): unique by `API` name
 * (later entries replace earlier duplicates).
 */
export function dedupeEntriesByApiName(entries: FreeApiEntry[]): FreeApiEntry[] {
  const byName = new Map<string, FreeApiEntry>();
  for (const e of entries) {
    byName.set(e.API, e);
  }
  return [...byName.values()];
}
