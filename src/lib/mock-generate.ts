/**
 * Generates JSON values from a JSON template.
 * Tokens "string" | "number" | "boolean" are expanded to sample values recursively.
 * When `seed` is set (e.g. mock slug), picks are deterministic for repeatable tests.
 */

import catalogData from "@/data/mock-value-catalog.json";

interface MockValueCatalog {
  strings: string[];
  integers: number[];
  booleans: boolean[];
}

const catalog = catalogData as MockValueCatalog;

export const INVALID_RESPONSE_FORMAT = {
  error: "invalid_response_format" as const,
  hint: "Use valid JSON in response format",
};

export function isInvalidGenerationResult(
  v: unknown
): v is typeof INVALID_RESPONSE_FORMAT {
  return (
    typeof v === "object" &&
    v !== null &&
    "error" in v &&
    (v as { error: string }).error === INVALID_RESPONSE_FORMAT.error
  );
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic [0,1) when seed is provided; otherwise Math.random. */
function createRng(seed?: string): () => number {
  if (seed === undefined) {
    return Math.random;
  }
  let a = hashString(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickString(rng: () => number): string {
  const list = catalog.strings;
  if (!list?.length) return "sample string";
  return list[Math.floor(rng() * list.length)]!;
}

function pickNumber(rng: () => number): number {
  const list = catalog.integers;
  if (!list?.length) return 42;
  return list[Math.floor(rng() * list.length)]!;
}

function pickBoolean(rng: () => number): boolean {
  const list = catalog.booleans;
  if (!list?.length) return true;
  return list[Math.floor(rng() * list.length)]!;
}

function generateFromTemplate(value: unknown, rng: () => number): unknown {
  if (value === "string") return pickString(rng);
  if (value === "number") return pickNumber(rng);
  if (value === "boolean") return pickBoolean(rng);
  if (Array.isArray(value)) {
    return value.map((item) => generateFromTemplate(item, rng));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = generateFromTemplate(v, rng);
    }
    return out;
  }
  return value;
}

export type GenerateOptions = {
  /** When set (e.g. endpoint slug), mock output is stable across requests. */
  seed?: string;
};

/** Walk JSON and produce a plain JSON-serializable value. */
export function generateFromSchema(
  schemaJson: string,
  options?: GenerateOptions
): unknown | typeof INVALID_RESPONSE_FORMAT {
  try {
    const rng = createRng(options?.seed);
    return generateFromTemplate(JSON.parse(schemaJson) as unknown, rng);
  } catch {
    return INVALID_RESPONSE_FORMAT;
  }
}

function deepMergeObjects(
  base: Record<string, unknown>,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    const existing = out[k];
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      existing !== null &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      out[k] = deepMergeObjects(
        existing as Record<string, unknown>,
        v as Record<string, unknown>
      );
    } else {
      out[k] = v;
    }
  }
  return out;
}

export type MergeOptions = GenerateOptions;

/**
 * Build mock from template, then deep-merge a JSON object body when both sides are plain objects.
 * Arrays and primitives in the body do not replace the generated tree unless at a leaf key.
 */
export function mergeRequestIntoGenerated(
  schemaJson: string,
  requestBody: unknown | undefined,
  options?: MergeOptions
): unknown | typeof INVALID_RESPONSE_FORMAT {
  const base = generateFromSchema(schemaJson, options);
  if (isInvalidGenerationResult(base)) {
    return base;
  }

  if (requestBody === undefined) {
    return base;
  }

  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return base;
  }

  if (
    typeof requestBody !== "object" ||
    requestBody === null ||
    Array.isArray(requestBody)
  ) {
    return base;
  }

  return deepMergeObjects(
    base as Record<string, unknown>,
    requestBody as Record<string, unknown>
  );
}
