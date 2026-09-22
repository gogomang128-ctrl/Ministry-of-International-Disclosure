import { NextResponse } from "next/server";
import { getOpsPayload } from "@/lib/ops-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getOpsPayload();
  return NextResponse.json(payload);
}
