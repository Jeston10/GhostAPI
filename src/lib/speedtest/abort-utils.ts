/**
 * Classify user-initiated (timer) aborts from undici/Node fetch.
 * Undici may throw DOMException AbortError, or TypeError with cause = AbortError,
 * or other shapes where only `signal.aborted` is reliable.
 */

export function isAbortLikeError(error: unknown): boolean {
  if (error == null) return false;

  if (typeof error === "object" && error !== null && "name" in error) {
    const name = String((error as { name: string }).name);
    if (name === "AbortError") return true;
  }

  if (error instanceof DOMException) {
    if (error.name === "AbortError") return true;
    if (error.code === DOMException.ABORT_ERR) return true;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") return true;
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause !== undefined && isAbortLikeError(cause)) return true;
  }

  return false;
}

/**
 * Our routes only call `controller.abort()` from the request timeout timer.
 * So: explicit abort-like error, or aborted signal ⇒ treat as timeout (not network).
 */
export function classifyUserTimeout(error: unknown, signal: AbortSignal): boolean {
  if (isAbortLikeError(error)) return true;
  if (signal.aborted) return true;
  return false;
}

const DEBUG = process.env.SPEEDTEST_DEBUG === "1" || process.env.SPEEDTEST_DEBUG === "true";

export function speedtestDebug(phase: string, data: Record<string, unknown>) {
  if (!DEBUG) return;
  console.debug(`[speedtest] ${phase}`, data);
}
