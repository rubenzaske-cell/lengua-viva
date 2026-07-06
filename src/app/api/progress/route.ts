import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSnapshot, unlockNextLesson, updateStreak, addDailyXp, recalcAchievements, ensureLeagueMembers } from "@/lib/quechua/server";
import { getLessonById } from "@/lib/quechua/content";

// POST /api/progress
// body: { lessonId, correct: number, total: number, perfect: boolean, xpBoost: boolean }
export async function POST(req: NextRequest) {
  const { lessonId, correct, total, perfect, xpBoost } = await req.json();
  const lesson = getLessonById(lessonId);
  if (!lesson) return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });

  // Calcular XP y gemas
  const baseXp = lesson.xpReward;
  const accuracyBonus = Math.round((correct / total) * 5);
  let xpEarned = baseXp + accuracyBonus;
  if (perfect) xpEarned += 5;
  if (xpBoost) xpEarned *= 2;
  const gemsEarned = lesson.gemReward + (perfect ? 2 : 0);

  // Actualizar progreso de la lección
  const existing = await db.lessonProgress.findUnique({ where: { lessonId } });
  const wasCompleted = existing?.status === "COMPLETED";
  const score = correct;
  const bestScore = Math.max(existing?.bestScore ?? 0, score);
  const newCrowns = perfect ? Math.min(3, (existing?.crowns ?? 0) + 1) : existing?.crowns ?? 0;

  await db.lessonProgress.upsert({
    where: { lessonId },
    create: {
      lessonId,
      status: "COMPLETED",
      crowns: newCrowns,
      lastScore: score,
      bestScore,
      completedAt: new Date(),
      attempts: 1,
    },
    update: {
      status: "COMPLETED",
      crowns: newCrowns,
      lastScore: score,
      bestScore,
      completedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  // Desbloquear siguiente lección
  await unlockNextLesson(lessonId);

  // Actualizar racha
  const { streak } = await updateStreak();

  // Actualizar XP total y diaria, gemas, XP de liga
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  await db.userState.update({
    where: { id: "default" },
    data: {
      xp: { increment: xpEarned },
      gems: { increment: gemsEarned },
      leagueXp: { increment: xpEarned },
    },
  });
  await addDailyXp(xpEarned);

  // Contar lecciones completadas (únicas)
  const completedCount = await db.lessonProgress.count({ where: { status: "COMPLETED" } });
  // Contar lecciones perfectas (crowns >= 1 y bestScore === total idealmente, usamos perfect flag acumulado en crowns>=2)
  const perfectCount = await db.lessonProgress.count({ where: { crowns: { gte: 2 } } });

  const { unlocked } = await recalcAchievements({
    lessonsCompleted: completedCount,
    xp: state.xp + xpEarned,
    streak,
    perfectLessons: perfectCount,
    gems: state.gems + gemsEarned,
  });

  // Asegurar miembros de liga
  await ensureLeagueMembers();

  // Verificar promoción de liga (si es top 3 de la semana y mucho XP)
  // Promoción simple: si leagueXp >= umbral, subir de liga al inicio de nueva semana (manejado en cliente/otro flujo)

  const snapshot = await getSnapshot();
  return NextResponse.json({
    ok: true,
    xpEarned,
    gemsEarned,
    newAchievements: unlocked,
    streak,
    wasCompleted,
    snapshot,
  });
}

// Registrar un error (perder corazón)
export async function PUT(req: NextRequest) {
  const { action } = await req.json();
  if (action === "lose_heart") {
    const state = await db.userState.findUnique({ where: { id: "default" } });
    if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });
    if (state.hearts > 0) {
      await db.userState.update({
        where: { id: "default" },
        data: { hearts: { decrement: 1 } },
      });
    }
    const snap = await getSnapshot();
    return NextResponse.json({ ok: true, hearts: Math.max(0, state.hearts - 1), snapshot: snap });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
