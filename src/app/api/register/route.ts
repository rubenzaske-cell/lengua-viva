import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { CURRICULUM } from "@/lib/quechua/content";

// POST /api/register
// body: { email, password, name, country, nativeLanguage }
export async function POST(req: NextRequest) {
  const { email, password, name, country, nativeLanguage } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Verificar si el email ya existe
  const existing = await db.userProfile.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
  }

  // Hash simple de la contraseña (no es production-grade pero funciona para demo)
  const hashedPassword = Buffer.from(password).toString("base64");

  // Crear sesión con browserId
  const sessionId = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("runasimi_uid", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  // Crear usuario
  const profile = await db.userProfile.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      browserId: sessionId,
      name: name.trim(),
      country: country || "",
      nativeLanguage: nativeLanguage || "es",
    },
  });

  // Crear estado inicial
  await db.userState.create({ data: { userId: profile.id } });

  // Desbloquear primera lección
  const firstLessonId = CURRICULUM[0].lessons[0].id;
  await db.lessonProgress.create({
    data: { userId: profile.id, lessonId: firstLessonId, status: "ACTIVE" },
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
