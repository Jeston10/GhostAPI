import { NextResponse } from "next/server";
import { speedTests, stopSpeedTest } from "../../store";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!speedTests.has(id)) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }
  const result = stopSpeedTest(id);
  return NextResponse.json(result);
}
