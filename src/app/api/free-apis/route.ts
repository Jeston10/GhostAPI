import { getFreeApisPayload } from "@/lib/free-apis-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getFreeApisPayload();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error("free-apis catalog load failed", e);
    return NextResponse.json(
      {
        entries: [],
        categories: [],
        source: "error" as const,
        error: "Could not load the public API catalog. Try again later.",
      },
      { status: 503 }
    );
  }
}
