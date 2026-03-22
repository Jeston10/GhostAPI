## GhostAPI web

Marketing site and **Playground**: define formats, **Submit** to save a mock in **MongoDB**, then **Test** (same origin — localhost or deploy).

### Mock API

- `POST /api/mock/provision` — body `{ "method": "GET" | "POST", "requestFormat": string | null, "responseFormat": string }` (response format = JSON object with `"string" | "number" | "boolean"` leaves). Returns `{ path, slug }`.
- `GET /api/mock/[slug]` — only if the mock was provisioned as **GET**: generated JSON from schema + catalog.
- `POST /api/mock/[slug]` — only if provisioned as **POST**: same generation, then **shallow-merge** of the request JSON body (send `Content-Type: application/json`).
- `GET /api/db-health` — Mongo connectivity check.

**Deploy:** Set `MONGODB_URI` (and optional `MONGODB_DB`) in your host. On Atlas, allow network access from your runtime (often `0.0.0.0/0` for serverless). Endpoints are public in v1 (no auth).

### Public use on Vercel

Yes: anyone who visits your deployed site can use the Playground and call the same-origin mock URLs, as long as `MONGODB_URI` is set for that environment and Atlas accepts connections from Vercel. Request/response **formats** are whatever valid JSON you allow: **response format** must be an object whose leaves are only `"string"`, `"number"`, or `"boolean"` (nested objects allowed). **Request format** (optional) must be valid JSON when non-empty. **POST** mock calls must send a JSON **object** body (not a bare array or string).

### Validation (runtime safety)

- **Provision** (`POST /api/mock/provision`): validates response schema shape and parses request format JSON.
- **Invoke** (`POST /api/mock/[slug]`): rejects non-JSON or non-object bodies with **400** and a short `detail` message instead of embedding errors inside the mock payload.
- **Playground**: runs the same checks client-side before Submit / Test so you see errors immediately.

### How long do mocks last?

They stay in MongoDB until someone deletes them. This repo does **not** set a TTL or auto-cleanup. To expire mocks automatically, add a MongoDB [TTL index](https://www.mongodb.com/docs/manual/core/index-ttl/) on `createdAt` in `mock_endpoints` (and optionally a cron or Atlas trigger).

### Mock data catalog

Generated strings are sampled from [`src/data/mock-value-catalog.json`](src/data/mock-value-catalog.json) (names, products, **auth-ish** samples like fake JWT-shaped strings, roles, session ids — all **mock/demo**, not real secrets). Add more entries there anytime.

**Future (OpenAI):** Replace or augment `generateFromSchema` with an LLM call using the stored schema (+ optional request context), validate JSON, optionally cache per slug. See the comment at the top of `src/lib/mock-generate.ts`.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
