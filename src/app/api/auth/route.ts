import { NextRequest, NextResponse } from "next/server";
import { createCurrentUser, updateCurrentUserProfile, getSnapshot } from "@/lib/quechua/auth";

// POST /api/auth - crea un nuevo usuario (onboarding)
// body: { name, avatar }
export async function POST(req: NextRequest) {
  const { name, avatar } = await req.json();
  await createCurrentUser(name, avatar);
  const snap = await getSnapshot();
  return NextResponse.json({ ok: true, ...snap });
}

// PUT /api/auth - actualiza el perfil del usuario actual
// body: { name, avatar }
export async function PUT(req: NextRequest) {
  const { name, avatar } = await req.json();
  await updateCurrentUserProfile(name, avatar);
  const snap = await getSnapshot();
  return NextResponse.json({ ok: true, ...snap });
}
