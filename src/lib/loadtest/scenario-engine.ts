export type ScenarioStep = {
  name: string;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown> | null;
  };
  save?: Record<string, string>;
};

export type ScenarioConfig = {
  setup?: ScenarioStep[];
  steps?: ScenarioStep[];
  teardown?: ScenarioStep[];
};

export type ScenarioContext = {
  vars: Record<string, string>;
};

export function createScenarioContext(): ScenarioContext {
  return { vars: {} };
}

export function applyTemplate(input: string, ctx: ScenarioContext) {
  return input.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, name: string) => ctx.vars[name] ?? "");
}

export function interpolateObject(
  value: Record<string, unknown> | null | undefined,
  ctx: ScenarioContext
): Record<string, unknown> | null | undefined {
  if (!value) return value;
  const raw = JSON.stringify(value);
  return JSON.parse(applyTemplate(raw, ctx)) as Record<string, unknown>;
}

export function saveVariablesFromJson(
  json: unknown,
  save: Record<string, string> | undefined,
  ctx: ScenarioContext
) {
  if (!save || !json || typeof json !== "object") return;
  const record = json as Record<string, unknown>;
  for (const [key, field] of Object.entries(save)) {
    const value = record[field];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      ctx.vars[key] = String(value);
    }
  }
}
