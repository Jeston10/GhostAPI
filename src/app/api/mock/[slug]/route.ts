import {
  generateFromSchema,
  isInvalidGenerationResult,
  mergeRequestIntoGenerated,
} from "@/lib/mock-generate";
import { getDb } from "@/lib/mongodb";
import { mockEndpointsColl } from "@/lib/mock-endpoints";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function OPTIONS(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  if (!slug || typeof slug !== "string") {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let doc;
  try {
    const db = await getDb();
    doc = await mockEndpointsColl(db).findOne({ slug });
  } catch (e) {
    console.error("mock get lookup failed", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (doc.method !== "GET") {
    return NextResponse.json(
      { error: "method_not_allowed", detail: "This mock was provisioned as POST" },
      { status: 405 }
    );
  }

  const data = generateFromSchema(doc.responseFormat, { seed: doc.slug });
  if (isInvalidGenerationResult(data)) {
    return NextResponse.json(
      { error: data.error, detail: data.hint },
      { status: 500 }
    );
  }
  return NextResponse.json(data, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let doc;
  try {
    const db = await getDb();
    doc = await mockEndpointsColl(db).findOne({ slug });
  } catch (e) {
    console.error("mock post lookup failed", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (doc.method !== "POST") {
    return NextResponse.json(
      { error: "method_not_allowed", detail: "This mock was provisioned as GET" },
      { status: 405 }
    );
  }

  const rawBody = await req.text();
  const trimmed = rawBody.trim();
  let parsedBody: unknown | undefined;
  if (trimmed !== "") {
    try {
      parsedBody = JSON.parse(trimmed) as unknown;
    } catch {
      return NextResponse.json(
        { error: "invalid_json_body", detail: "Body is not valid JSON" },
        { status: 400 }
      );
    }
  }

  const data = mergeRequestIntoGenerated(doc.responseFormat, parsedBody, {
    seed: doc.slug,
  });
  if (isInvalidGenerationResult(data)) {
    return NextResponse.json(
      { error: data.error, detail: data.hint },
      { status: 500 }
    );
  }
  return NextResponse.json(data, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
