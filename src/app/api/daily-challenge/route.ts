import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/quechua/auth";
import { db } from "@/lib/db";

// Retos diarios predefinidos (rotan cada día)
const RETOS = [
  {
    titulo: "Saludo andino",
    descripcion: "Traduce este saludo al quechua",
    tipo: "traducir",
    pregunta: "Buenos días",
    respuesta: "Allin p'unchaw",
    xp: 20,
  },
  {
    titulo: "La familia",
    descripcion: "¿Cómo se dice 'madre' en quechua?",
    tipo: "identificar",
    pregunta: "Madre",
    respuesta: "Mama",
    xp: 20,
  },
  {
    titulo: "Números",
    descripcion: "Traduce el número al quechua",
    tipo: "traducir",
    pregunta: "Uno",
    respuesta: "Huk",
    xp: 20,
  },
  {
    titulo: "Animales",
    descripcion: "¿Qué animal es 'llama' en quechua?",
    tipo: "identificar",
    pregunta: "¿Qué significa 'llama'?",
    respuesta: "Llama (el animal)",
    xp: 20,
  },
  {
    titulo: "Despedida",
    descripcion: "Traduce esta despedida",
    tipo: "traducir",
    pregunta: "Hasta mañana",
    respuesta: "Paqarinkama",
    xp: 25,
  },
  {
    titulo: "Agradecimiento",
    descripcion: "¿Cómo se dice 'gracias' en quechua?",
    tipo: "identificar",
    pregunta: "Gracias",
    respuesta: "Sulpayki",
    xp: 20,
  },
  {
    titulo: "Pregunta básica",
    descripcion: "Traduce la pregunta",
    tipo: "traducir",
    pregunta: "¿Cómo estás?",
    respuesta: "Ima hinalla kachkanki",
    xp: 30,
  },
];

// GET /api/daily-challenge - obtiene el reto del día
export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  // Determinar reto del día según el día del año
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const reto = RETOS[dayOfYear % RETOS.length];

  // Verificar si ya completó el reto hoy
  const today = new Date().toISOString().split("T")[0];
  const state = await db.userState.findUnique({ where: { userId } });
  const lastChallengeDate = (state as any)?.lastChallengeDate as string | undefined;
  const yaCompleto = lastChallengeDate === today;

  return NextResponse.json({
    reto,
    yaCompleto,
    fecha: today,
  });
}

// POST /api/daily-challenge - marca el reto como completado
export async function POST() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  const lastChallengeDate = (state as any)?.lastChallengeDate as string | undefined;
  if (lastChallengeDate === today) {
    return NextResponse.json({ error: "Ya completaste el reto de hoy", yaCompleto: true }, { status: 400 });
  }

  // Otorgar XP del reto
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const reto = RETOS[dayOfYear % RETOS.length];
  const xpGanado = reto.xp;

  await db.userState.update({
    where: { userId },
    data: {
      xp: { increment: xpGanado },
      leagueXp: { increment: xpGanado },
      dailyXp: { increment: xpGanado },
      // Guardar fecha del último reto completado
      ...(typeof (db.userState as any).fields?.lastChallengeDate !== "undefined" ? { lastChallengeDate: today } : {}),
    } as any,
  });

  return NextResponse.json({
    ok: true,
    xpGanado,
    mensaje: "¡Reto completado!",
  });
}
