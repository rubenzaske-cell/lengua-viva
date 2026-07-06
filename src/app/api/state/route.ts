import { NextResponse } from "next/server";
import { getSnapshot, getCurrentUser } from "@/lib/quechua/auth";

// GET /api/state - devuelve el snapshot del usuario actual (o null si no existe)
export async function GET() {
  const u = await getCurrentUser();
  if (!u.id) {
    return NextResponse.json({ needsOnboarding: true });
  }
  const snap = await getSnapshot();
  return NextResponse.json({ needsOnboarding: false, ...snap });
}
