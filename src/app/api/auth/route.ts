import { NextRequest, NextResponse } from "next/server";
import { createCurrentUser, updateCurrentUserProfile, getSnapshot } from "@/lib/quechua/auth";

// POST /api/auth - crea un nuevo usuario (onboarding)
// body: { name, avatar, country, nativeLanguage }
export async function POST(req: NextRequest) {
  const { name, avatar, country, nativeLanguage } = await req.json();
  await createCurrentUser(name, avatar, country, nativeLanguage);
  const snap = await getSnapshot();
  return NextResponse.json({ ok: true, ...snap });
}

// PUT /api/auth - actualiza el perfil del usuario actual
export async function PUT(req: NextRequest) {
  const { name, avatar, country, nativeLanguage } = await req.json();
  await updateCurrentUserProfile(name, avatar, country, nativeLanguage);
  const snap = await getSnapshot();
  return NextResponse.json({ ok: true, ...snap });
}
