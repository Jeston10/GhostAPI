import { generateFromSchema, mergeRequestIntoGenerated } from "@/lib/mock-generate";
import { getDb } from "@/lib/mongodb";
import { mockEndpointsColl } from "@/lib/mock-endpoints";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ slug: string }> };

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

  const data = generateFromSchema(doc.responseFormat);
  return NextResponse.json(data);
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
  if (trimmed !== "") {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          {
            error: "body_must_be_json_object",
            detail: "POST body must be a JSON object, e.g. {\"key\":\"value\"}",
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "invalid_json_body", detail: "Body is not valid JSON" },
        { status: 400 }
      );
    }
  }

  const data = mergeRequestIntoGenerated(doc.responseFormat, rawBody);
  return NextResponse.json(data);
}
