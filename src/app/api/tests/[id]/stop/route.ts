import { NextResponse } from "next/server";
import { stopTest } from "../../store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = stopTest(id);
  if (!result.stopped) {
    return NextResponse.json({ error: result.message }, { status: 404 });
  }
  return NextResponse.json(result);
}
