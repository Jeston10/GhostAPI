/** sessionStorage key: filled from API Hub “Fill mock playground”, read on home Playground mount. */
export const PLAYGROUND_PREFILL_STORAGE_KEY = "ghostapi-playground-prefill";

export type PlaygroundPrefillPayload = {
  request: string;
  response: string;
};
