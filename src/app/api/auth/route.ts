import { NextRequest, NextResponse } from "next/server";
import { updateCurrentUserProfile, getSnapshot } from "@/lib/quechua/auth";

// PUT /api/auth - actualiza el perfil del usuario actual
// body: { name, avatar, country, nativeLanguage }
export async function PUT(req: NextRequest) {
  const { name, avatar, country, nativeLanguage } = await req.json();
  await updateCurrentUserProfile(name, avatar, country, nativeLanguage);
  const snap = await getSnapshot();
  return NextResponse.json({ ok: true, ...snap });
}
