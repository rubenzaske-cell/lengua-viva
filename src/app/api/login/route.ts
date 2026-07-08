import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

// POST /api/login
// body: { email, password }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const hashedPassword = Buffer.from(password).toString("base64");
  const profile = await db.userProfile.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!profile || profile.password !== hashedPassword) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
  }

  // Actualizar sesión
  const sessionId = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("runasimi_uid", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  await db.userProfile.update({
    where: { id: profile.id },
    data: { browserId: sessionId },
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      country: profile.country,
      nativeLanguage: profile.nativeLanguage,
    },
  });
}
