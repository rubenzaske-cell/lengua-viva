import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/quechua/server";

export async function GET() {
  const snap = await getSnapshot();
  return NextResponse.json(snap);
}
