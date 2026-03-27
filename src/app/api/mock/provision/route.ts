import {
  validateOptionalJsonDocument,
  validateRequiredJsonDocument,
} from "@/lib/mock-schema-validate";
import { getDb } from "@/lib/mongodb";
import {
  ensureMockEndpointIndexes,
  mockEndpointsColl,
  type MockEndpointDoc,
} from "@/lib/mock-endpoints";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function newSlug(): string {
  return randomBytes(10).toString("hex");
}

type ProvisionBody = {
  method?: string;
  requestFormat?: string | null;
  responseFormat?: string;
};

export async function POST(req: Request) {
  let body: ProvisionBody;
  try {
    body = (await req.json()) as ProvisionBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const method = body.method?.toUpperCase();
  if (method !== "GET" && method !== "POST") {
    return NextResponse.json(
      { error: "method_not_supported", detail: "Only GET or POST is supported" },
      { status: 400 }
    );
  }

  const rawResponse = body.responseFormat;
  if (typeof rawResponse !== "string") {
    return NextResponse.json(
      { error: "response_format_required" },
      { status: 400 }
    );
  }

  const responseJsonErr = validateRequiredJsonDocument(
    rawResponse,
    "responseFormat"
  );
  if (responseJsonErr) {
    return NextResponse.json(
      { error: "response_format_invalid_json", detail: responseJsonErr },
      { status: 400 }
    );
  }

  let requestFormat: string | null = null;
  if (body.requestFormat != null && String(body.requestFormat).trim()) {
    const rf = String(body.requestFormat);
    const reqJsonErr = validateOptionalJsonDocument(rf, "requestFormat");
    if (reqJsonErr) {
      return NextResponse.json(
        { error: "request_format_invalid_json", detail: reqJsonErr },
        { status: 400 }
      );
    }
    requestFormat = rf;
  }

  const slug = newSlug();
  const doc: MockEndpointDoc = {
    slug,
    method,
    requestFormat,
    responseFormat: rawResponse.trim(),
    createdAt: new Date(),
  };

  try {
    const db = await getDb();
    await ensureMockEndpointIndexes(db);
    await mockEndpointsColl(db).insertOne(doc);
  } catch (e) {
    console.error("mock provision insert failed", e);
    return NextResponse.json({ error: "provision_failed" }, { status: 500 });
  }

  return NextResponse.json({
    path: `/api/mock/${slug}`,
    slug,
  });
}
