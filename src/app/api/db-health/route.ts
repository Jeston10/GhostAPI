import { pingMongo } from "@/lib/mongodb";
import { NextResponse } from "next/server";

/**
 * GET /api/db-health — verifies MongoDB connectivity (no secrets in response).
 */
export async function GET() {
  try {
    await pingMongo();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
