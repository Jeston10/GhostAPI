# GhostAPI testing systems

This folder describes how each HTTP testing feature is implemented end-to-end: UI → API routes → in-process engine → metrics.

| Document | Product surface | Purpose |
|----------|-----------------|---------|
| [load-testing.md](./load-testing.md) | `/tools/load-test`, `/api/tests/*` | Sustained load with VUs, scenarios, thresholds, history |
| [speed-testing.md](./speed-testing.md) | `/tools/speed-test`, `/api/speed-tests/*`, `/api/speed/single` | Quick single check + batch speed engine |

Shared constraints (where applicable):

- **Host safety**: Public URLs only; localhost and private IPs blocked unless `LOADTEST_HOST_ALLOWLIST` is set (see runtime guards in `src/lib/loadtest/runtime-guards.ts`).
- **Ephemeral state**: Results live in memory on the Node process; restarting the server clears runs (speed tests are always ephemeral; load tests may optionally persist history depending on flags).

Flags (see `src/lib/loadtest/flags.ts`):

- `LOADTEST_V2_ENABLED` — load test API on/off
- `SPEEDTEST_ENABLED` — speed test API on/off
- Plus history/compare flags for load tests only
