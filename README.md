# GhostAPI

GhostAPI is a **Next.js** web app that helps developers work with **mock HTTP APIs** and explore **public API catalogs**.

## What this project does

- **Marketing home** — Landing content and navigation for GhostAPI.
- **Playground** — Define request/response JSON “formats,” submit to **provision** a mock endpoint stored in **MongoDB**, then **test** it from the same origin (localhost or your deploy).
- **API Hub** (`/api-hub`) — Browse a catalog of public APIs (live sources with an offline fallback), open details, copy links, optionally **test URLs through a server-side proxy** (`POST /api/free-apis/try`), and send metadata to the playground.
- **Mock HTTP API** — Dynamic routes under `/api/mock/...` serve generated JSON from your schema; provisioning and health checks are documented briefly below.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (comes with Node)

## Installation

1. Clone or copy this repository and open a terminal at the project root.

2. Install dependencies (the app lives in the `web` folder):

   ```bash
   cd web
   npm install
   ```

3. Configure environment variables:

   ```bash
   copy .env.example .env
   ```

   On macOS/Linux use `cp .env.example .env`.

4. Edit `.env` and set at least:

   - **`MONGODB_URI`** — Required for the Playground to **provision** and **persist** mock endpoints. For local-only UI browsing without mocks, you can leave it unset and skip features that need the database.

   Optional:

   - **`MONGODB_DB`** — Override the database name if needed.
   - **`FREE_APIS_TRY_RATE_LIMIT`** / **`FREE_APIS_TRY_RATE_WINDOW_MS`** — Tune rate limits for the API Hub “try proxy” (see `src/lib/rate-limit.ts` for defaults).

## Running the app

From the `web` directory:

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Development server (hot reload) |
| `npm run build`   | Production build                  |
| `npm run start`   | Run production build locally      |
| `npm run lint`    | ESLint                            |
| `npm test`        | Vitest unit tests                 |

Open **http://localhost:3000** in a browser when using `npm run dev`.

## Deploying

Set the same variables in your host (e.g. Vercel): **`MONGODB_URI`**, optional **`MONGODB_DB`**. Allow your runtime to reach MongoDB Atlas (or your cluster) from the deployed region.

## API overview (reference)

| Area        | Notes |
| ----------- | ----- |
| `POST /api/mock/provision` | Create a mock: `method` (`GET` \| `POST`), optional `requestFormat`, required `responseFormat` (JSON object whose leaves describe types as `"string"`, `"number"`, or `"boolean"`). Returns a path/slug. |
| `GET` / `POST /api/mock/[slug]` | Invoke a provisioned mock; **POST** expects a JSON **object** body. |
| `GET /api/db-health` | MongoDB connectivity check. |
| `GET /api/free-apis` | Public API catalog JSON (cached; fallback snapshot if remote sources fail). |
| `POST /api/free-apis/try` | Server-side GET/POST proxy for API Hub “Test” (rate-limited; private/local hosts blocked). |

### Load testing API (v2)

| Endpoint | Notes |
| --- | --- |
| `POST /api/tests/start` | Start a load test run with support for `PATCH`/`HEAD`/`OPTIONS`, staged profiles, auth, scenarios, and thresholds. |
| `GET /api/tests/[id]` | Live test status and rich metrics: status code groups, error taxonomy, trend buckets, threshold results. |
| `POST /api/tests/[id]/stop` | Request graceful cancellation for queued/running tests. |
| `GET /api/tests/history` | List recent persisted runs (MongoDB if available; memory fallback). |
| `POST /api/tests/history` | Rerun a historical config. |
| `GET /api/tests/compare?baseline=<id>&current=<id>` | Compare two runs (latency, error rate, throughput delta). |
| `POST /api/tests/trigger` | CI/CD trigger route with token auth (`x-loadtest-token`), disabled by default. |

Feature flags and runtime controls are in `.env.example` under “Load testing runtime controls”.

Provisioned mocks remain in Mongo until deleted; this repo does not add TTL cleanup by default.

## Tech stack

- **Next.js** (App Router), **React**, **Tailwind CSS**, **Vitest** for tests.
