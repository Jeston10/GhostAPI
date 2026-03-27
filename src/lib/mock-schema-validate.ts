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

/** Returns an error message or null if the string is valid JSON. */
export function validateRequiredJsonDocument(raw: string, label: string): string | null {
  const t = raw.trim();
  if (!t) return `${label} is required.`;
  return validateOptionalJsonDocument(t, label);
}
