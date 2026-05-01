# API speed testing system

## What it is

**Speed testing** runs HTTP requests **only on the GhostAPI Node server**, uses a **worker pool** to cap concurrency, and records **per-request** intervals for **completed** responses (any HTTP status once headers and body are fully read):

- **totalTime** — `performance.now()` from before `fetch` until `arrayBuffer()` finishes.
- **ttfb** — time from the same start until **`fetch` resolves** (headers available; practical TTFB proxy for Node/undici).
- **downloadTime** — time to read the full body after headers.

**Transport failures** (timeouts and network errors before a full read) are **not** mixed with HTTP errors: they do not add to latency percentiles, and timings are **`null`**, not `0`.

## Success vs failure

- **Completed request** (`success` in engine): `fetch` returned a response **and** the body was read successfully. **HTTP 4xx and 5xx are included** — they are *not* transport failures.
- **Transport failure**: abort/timeout from `AbortController`, DNS/connection errors, TLS issues, or body read failure after headers. Classified as **`timeout`** (abort due to timer) or **`network`** (everything else).

## User flow

1. User opens `/tools/speed-test` (default tab: **Quick Speed Check**).
2. **Quick**: configure URL, method, headers, body, timeout; `POST /api/speed/single` once; results card shows timings and bars.
3. **Load**: same request fields plus concurrency and duration; `POST /api/speed-tests/start`; poll `GET /api/speed-tests/:id` about every 1.5s; optional stop via `POST /api/speed-tests/:id/stop`.

Guarded by `SPEEDTEST_ENABLED` (default on).

## `POST /api/speed/single` (Quick Speed Check)

Request JSON: `url`, `method`, `headers`, `body`, `timeoutMs` (1000–15000 ms, validated in route).

**Success** (including HTTP 500 after full body read):

`{ "success": true, "status", "statusText", "totalTime", "ttfb", "downloadTime", "size" }`

**Transport failure**:

`{ "success": false, "error": "timeout" | "network", "totalTime": null, "ttfb": null, "downloadTime": null, "size": null }`

Logic: `src/lib/speedtest/single-check.ts` · route: `src/app/api/speed/single/route.ts`.

## API response shape (`GET /api/speed-tests/:id`)

```json
{
  "id": "…",
  "status": "running",
  "running": true,
  "error": null,
  "summary": {
    "totalRequests": 100,
    "successCount": 95,
    "failureCount": 5,
    "failureRate": 0.05,
    "httpErrorRate": 0.1,
    "avgLatency": 123.4,
    "p50": 100,
    "p90": 200,
    "p95": 250,
    "p99": 400,
    "minTotalMs": 50,
    "maxTotalMs": 500,
    "rps": 12.5,
    "inFlight": 3
  },
  "timing": {
    "avgTTFB": 80,
    "avgDownload": 43,
    "p95Ttfb": 120,
    "p95Download": 90
  },
  "statusGroups": { "2xx": 60, "3xx": 5, "4xx": 20, "5xx": 10 },
  "errors": { "timeout": 2, "network": 3 },
  "timeBuckets": [ … ]
}
```

- **failureRate** = transport failures / `totalRequests`.
- **httpErrorRate** = (4xx + 5xx) / `totalRequests`.
- **Percentiles and averages** in `summary` / `timing` use **completed** requests only (`null` when no samples).

## Engine (`src/app/api/speed-tests/store.ts`)

1. **State**: In-memory `Map` on `globalThis`, keyed by UUID.
2. **Worker pool**: Bounded concurrent execution per test.
3. **Executor** (`src/lib/speedtest/execute-request.ts`): `AbortController` + timer for timeout; measure **ttfb** immediately after `fetch` resolves; then `arrayBuffer()` for download + total.
4. **Metrics** (`src/lib/speedtest/metrics.ts`): `statusGroups` from response class; separate **`errors.timeout`** / **`errors.network`**; percentile samples from **completed** timings only.

## Honest limitations

- Measures from **this server’s network path** to the target.
- **Not** browser Resource Timing (no separate DNS/connect/TLS phases).
- On **serverless**, max duration may cap long runs.

## Related files

- `src/app/tools/speed-test/page.tsx` — UI
- `src/lib/speedtest/single-check.ts` — single-request timing (`runSingleSpeedCheck`)
- `src/lib/speedtest/public-url.ts` — `isValidSpeedTestUrl` (shared with batch speed routes)
- `src/lib/loadtest/runtime-guards.ts` — host blocklist primitives
