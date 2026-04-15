function envFlag(name: string, defaultValue = true) {
  const value = process.env[name];
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function isLoadTestV2Enabled() {
  return envFlag("LOADTEST_V2_ENABLED", true);
}

export function isLoadTestHistoryEnabled() {
  return envFlag("LOADTEST_HISTORY_ENABLED", true);
}

export function isLoadTestCompareEnabled() {
  return envFlag("LOADTEST_COMPARE_ENABLED", true);
}

export function isLoadTestCiTriggerEnabled() {
  return envFlag("LOADTEST_CI_TRIGGER_ENABLED", false);
}
