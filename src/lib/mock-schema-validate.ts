/**
 * Validates the Playground "response format" schema: nested JSON objects whose leaves
 * must be the literal strings "string" | "number" | "boolean".
 */

const TYPE_LEAVES = new Set(["string", "number", "boolean"]);

export function validateResponseSchemaShape(
  value: unknown,
  path = "responseFormat"
): string | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return `${path} must be a JSON object { ... }, not an array or primitive.`;
  }
  for (const [key, v] of Object.entries(value)) {
    const p = `${path}.${key}`;
    if (typeof v === "string" && TYPE_LEAVES.has(v)) {
      continue;
    }
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      const inner = validateResponseSchemaShape(v, p);
      if (inner) return inner;
      continue;
    }
    return `Invalid leaf at ${p}: use "string", "number", or "boolean", or a nested object.`;
  }
  return null;
}

/** Returns an error message or null if the string is empty or valid JSON. */
export function validateOptionalJsonDocument(
  raw: string,
  label: string
): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    JSON.parse(t);
    return null;
  } catch {
    return `${label} must be valid JSON.`;
  }
}
