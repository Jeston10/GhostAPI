/**
 * Fetches public-apis/public-apis README (MIT) and emits api-hub-bulk-entries.ts
 * with up to TARGET new CuratedApiEntry rows (HTTPS-only, deduped vs existing catalog).
 *
 * Run: node scripts/generate-api-hub-bulk.mjs
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";
const TARGET = 431;
const OUT = path.join(__dirname, "..", "src", "lib", "api-hub-bulk-entries.ts");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let buf = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve(buf));
      })
      .on("error", reject);
  });
}

function slugify(s) {
  const base = String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
  return base || "api";
}

function normalizeUrl(u) {
  try {
    const x = new URL(u);
    x.hash = "";
    let path = x.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    x.pathname = path;
    return x.href.toLowerCase();
  } catch {
    return u.toLowerCase().trim();
  }
}

function parseReadme(text) {
  const lines = text.split(/\r?\n/);
  let category = "Misc";
  let inTable = false;
  const rows = [];
  for (const line of lines) {
    const hm = line.match(/^###\s+(.+)/);
    if (hm) {
      category = hm[1].trim();
      inTable = false;
      continue;
    }
    if (line.includes("API | Description | Auth | HTTPS | CORS")) {
      inTable = true;
      continue;
    }
    if (line.startsWith("|---")) continue;
    if (!inTable) continue;
    if (!line.trim().startsWith("|")) {
      inTable = false;
      continue;
    }
    const parts = line.split("|").map((s) => s.trim());
    if (parts.length < 6) continue;
    const apiCell = parts[1];
    const description = parts[2];
    const authRaw = parts[3];
    const httpsCell = parts[4];
    const cors = parts[5];
    const linkM = apiCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!linkM) continue;
    const name = linkM[1].replace(/\\/g, "");
    let url = linkM[2].trim().split(/\s+/)[0];
    rows.push({
      category,
      name,
      description,
      authRaw,
      https: httpsCell,
      cors,
      url,
    });
  }
  return rows;
}

function extractExisting() {
  const slugs = new Set();
  const urls = new Set();
  const lib = path.join(__dirname, "..", "src", "lib");
  for (const file of ["api-hub-catalog.ts", "api-hub-more-entries.ts"]) {
    const p = path.join(lib, file);
    const t = fs.readFileSync(p, "utf8");
    for (const m of t.matchAll(/slug:\s*"([^"]+)"/g)) slugs.add(m[1]);
    for (const m of t.matchAll(/exampleUrl:\s*"([^"]+)"/g)) urls.add(normalizeUrl(m[1]));
  }
  return { slugs, urls };
}

function mapAuth(authRaw) {
  const a = authRaw.replace(/`/g, "").trim().toLowerCase();
  if (a === "no" || a === "") return "none";
  return "api_key";
}

function buildEntry(row, slug) {
  const { category, name, description, authRaw, cors, url } = row;
  const auth = mapAuth(authRaw);
  const tagline =
    description.length > 120
      ? `${description.slice(0, 117)}…`
      : description || `Public ${category} API`;
  const desc =
    `Listed in the community [public-apis](https://github.com/public-apis/public-apis) catalog (${category}). ` +
    (description || "See provider documentation for request shape.");

  let pathPart = "/";
  try {
    pathPart = new URL(url).pathname || "/";
  } catch {
    /* keep default */
  }
  const requestExample = `GET ${pathPart}`;

  return {
    slug,
    name,
    category,
    tagline,
    description: desc,
    auth,
    docsUrl: url,
    defaultMethod: "GET",
    exampleUrl: url,
    requestNotes: `HTTPS GET. Table auth: ${authRaw.replace(/`/g, "")}; CORS: ${cors}. URL is the catalog link—open docs and adjust path or query for a live JSON endpoint where applicable.`,
    requestExample,
    responseExample: `{ /* response varies — use Try or read provider docs */ }`,
    responseShape: "varies by provider — inspect response or documentation",
  };
}

async function main() {
  const text = await fetchText(README_URL);
  const all = parseReadme(text);
  const filtered = all.filter(
    (r) =>
      /^yes$/i.test(r.https) &&
      /^https:\/\//i.test(r.url) &&
      !/localhost/i.test(r.url)
  );

  const { slugs: usedSlugs, urls: usedUrls } = extractExisting();

  const scored = filtered.map((r) => ({
    row: r,
    score: mapAuth(r.authRaw) === "none" ? 0 : 1,
    norm: normalizeUrl(r.url),
  }));
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const ca = a.row.category.localeCompare(b.row.category);
    if (ca !== 0) return ca;
    return a.row.name.localeCompare(b.row.name);
  });

  const picked = [];
  const seenNorm = new Set(usedUrls);

  for (const { row, norm } of scored) {
    if (picked.length >= TARGET) break;
    if (seenNorm.has(norm)) continue;
    seenNorm.add(norm);

    const base = `${slugify(row.category)}-${slugify(row.name)}`;
    let slug = base;
    let suffix = 0;
    while (usedSlugs.has(slug)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    usedSlugs.add(slug);

    picked.push(buildEntry(row, slug));
  }

  const header = `/* eslint-disable max-lines -- generated by scripts/generate-api-hub-bulk.mjs */
import type { CuratedApiEntry } from "./api-hub-types";

/** Bulk entries sourced from public-apis README (MIT). Regenerate: \`node scripts/generate-api-hub-bulk.mjs\` */
export const API_HUB_BULK_ENTRIES: CuratedApiEntry[] = `;

  const body = JSON.stringify(picked, null, 2);
  fs.writeFileSync(OUT, `${header}${body};\n`, "utf8");
  console.log(`Wrote ${picked.length} entries to ${path.relative(process.cwd(), OUT)}`);
  if (picked.length < TARGET) {
    console.warn(`Warning: only ${picked.length} rows after filters/dedupe (wanted ${TARGET}).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
