import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/quechua/auth";

// GET /api/stats - estadísticas avanzadas del usuario
export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  const lessons = await db.lessonProgress.findMany({ where: { userId } });
  const completed = lessons.filter((l) => l.status === "COMPLETED");
  const totalCrowns = completed.reduce((acc, l) => acc + l.crowns, 0);
  const totalAttempts = completed.reduce((acc, l) => acc + l.attempts, 0);
  const perfectLessons = completed.filter((l) => l.bestScore === 100).length;

  const streakDays = await db.streakDay.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 30,
  });

  const last7 = streakDays.slice(-7).map((s) => ({
    date: s.date,
    xp: s.xp,
  }));

  const avgAccuracy = totalAttempts > 0
    ? Math.round((completed.reduce((acc, l) => acc + l.bestScore, 0) / totalAttempts))
    : 0;

  return NextResponse.json({
    resumen: {
      xp: state.xp,
      gems: state.gems,
      streak: state.streak,
      league: state.league,
      leagueXp: state.leagueXp,
    },
    lecciones: {
      completadas: completed.length,
      coronas: totalCrowns,
      intentos: totalAttempts,
      perfectas: perfectLessons,
      precision: avgAccuracy,
    },
    racha: {
      diasActivos: streakDays.length,
      ultima7: last7,
      rachaActual: state.streak,
    },
  });
}
