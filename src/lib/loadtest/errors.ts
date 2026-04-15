export type ErrorKind =
  | "timeout"
  | "abort"
  | "dns"
  | "tls"
  | "connect"
  | "network"
  | "validation"
  | "unknown";

export function classifyError(error: unknown): ErrorKind {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("timeout")) return "timeout";
  if (message.includes("aborted")) return "abort";
  if (message.includes("dns") || message.includes("enotfound")) return "dns";
  if (message.includes("tls") || message.includes("certificate")) return "tls";
  if (message.includes("connect") || message.includes("econnrefused")) return "connect";
  if (message.includes("invalid") || message.includes("json")) return "validation";
  if (message.includes("network") || message.includes("fetch failed")) return "network";
  return "unknown";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}
