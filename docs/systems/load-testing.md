# Load testing system

## What it is

The **load testing** product simulates **many virtual users (VUs)** over time, each issuing **batches of parallel requests**, with optional **think time**, **staged profiles**, **auth**, **multi-step scenarios**, and **threshold evaluation**. It is the heavier of the two live tools and is closest to a mini load generator.

## User flow

1. User opens `/tools/load-test` and configures URL, method, headers, body, VUs, parallel requests per VU, duration, and optional advanced JSON (profile, auth, scenario, thresholds).
2. Browser `POST`s to `/api/tests/start`.
3. UI polls `GET /api/tests/:id` about every 2s for live metrics until the run completes or is stopped.
4. Optional: history, compare, JSON export (export uses last client-side config snapshot).

## API surface

| Route | Role |
|-------|------|
| `POST /api/tests/start` | Validate payload, create in-memory run, enqueue execution |
| `GET /api/tests/:id` | Running snapshot: aggregates, buckets, status codes, errors, thresholds |
| `POST /api/tests/:id/stop` | Request cooperative stop |
| `GET /api/tests/history` | Recent runs (when persistence enabled) |
| `GET /api/tests/compare` | Compare two runs |

Guarded by `LOADTEST_V2_ENABLED`.

## Engine (`src/app/api/tests/store.ts`)

1. **Scheduler**: Test work is queued and executed via `src/lib/loadtest/scheduler` so multiple tests do not stampede the process.
2. **Virtual users**: For each VU index, a loop runs until wall-clock `stopAt` or `stopRequested`. Each iteration may issue `parallelRequests` concurrent `fetch` calls (bounded by per-test in-flight cap).
3. **Request path**: Merges headers with optional auth (`src/lib/loadtest/auth.ts`), runs optional scenario steps (`src/lib/loadtest/scenario-engine.ts`), calls `fetch` with a **5s** abort timeout in `executeSingleRequest`.
4. **Metrics** (`src/lib/loadtest/metrics.ts`): Records per-request duration, success/failure, status code histogram, error taxonomy, rolling **5s time buckets**, and capped latency samples (5000).
5. **Completion**: Flushes buckets, evaluates thresholds, optionally persists run metadata (`src/lib/loadtest/persistence.ts`).

## Timing semantics

- Latency is **wall time around `fetch`** on the server (start to completion of handler logic including scenario side trips). It is **not** browser Navigation Timing.
- There is **no per-phase DNS/TCP/TTFB breakdown** in this system today; that split is implemented in **speed testing** instead.

## When to use it

- Steady or staged **concurrency** and **duration**-based validation.
- Teams that need **scenario chaining** or **threshold gates** in one flow.

## Related files

- `src/app/api/tests/start/route.ts` — validation and URL policy
- `src/lib/loadtest/*` — metrics, errors, auth, scenario, scheduler, thresholds, guards
