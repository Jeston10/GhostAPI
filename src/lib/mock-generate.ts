/**
 * Generates JSON values from a simple schema shape (`"string" | "number" | "boolean"` leaves).
 *
 * Phase 2 (optional): swap `generateFromSchema` internals to call an LLM using the same
 * schema + optional request context, then validate/shape the result before returning.
 * See repo docs / .env.example for deployment notes.
 */

import catalogData from "@/data/mock-value-catalog.json";

interface MockValueCatalog {
  strings: string[];
  integers: number[];
  booleans: boolean[];
}

const catalog = catalogData as MockValueCatalog;

function pickString(): string {
  const list = catalog.strings;
  if (!list?.length) return "sample string";
  return list[Math.floor(Math.random() * list.length)]!;
}

function pickNumber(): number {
  const list = catalog.integers;
  if (!list?.length) return 42;
  return list[Math.floor(Math.random() * list.length)]!;
}

function pickBoolean(): boolean {
  const list = catalog.booleans;
  if (!list?.length) return true;
  return list[Math.floor(Math.random() * list.length)]!;
}

/** Walk schema object and produce a plain JSON-serializable value. */
export function generateFromSchema(schemaJson: string): unknown {
  try {
    const o = JSON.parse(schemaJson) as unknown;
    if (typeof o !== "object" || o === null) {
      return o;
    }
    if (Array.isArray(o)) {
      return o;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === "string") out[k] = pickString();
      else if (v === "number") out[k] = pickNumber();
      else if (v === "boolean") out[k] = pickBoolean();
      else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        out[k] = generateFromSchema(JSON.stringify(v));
      } else {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {
      error: "invalid_response_format",
      hint: "Use a JSON object with string|number|boolean type leaves",
    };
  }
}

/**
 * Build mock from schema, then shallow-merge a JSON object from the request body.
 * Used for POST /api/mock/[slug] so tests can send both request and response-driven output.
 */
export function mergeRequestIntoGenerated(
  schemaJson: string,
  requestBodyRaw: string
): unknown {
  const base = generateFromSchema(schemaJson);
  const trimmed = requestBodyRaw.trim();
  if (!trimmed) {
    return base;
  }

  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return base;
  }

  const baseObj = base as Record<string, unknown>;

  try {
    const reqParsed = JSON.parse(trimmed) as unknown;
    if (
      typeof reqParsed !== "object" ||
      reqParsed === null ||
      Array.isArray(reqParsed)
    ) {
      return {
        ...baseObj,
        _mock_note:
          "Request body must be a JSON object to merge into the generated response",
      };
    }
    return {
      ...baseObj,
      ...(reqParsed as Record<string, unknown>),
    };
  } catch {
    return {
      ...baseObj,
      _request_body_error: "Invalid JSON in request body",
    };
  }
}
