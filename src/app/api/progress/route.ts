import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getSnapshot,
  unlockNextLesson,
  updateStreak,
  addDailyXp,
  recalcAchievements,
  requireUserId,
} from "@/lib/quechua/auth";
import { getLessonById, CURRICULUM } from "@/lib/quechua/content";

// POST /api/progress - completar una lección
// body: { lessonId, correct, total, perfect, xpBoost }
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const { lessonId, correct, total, perfect, xpBoost } = await req.json();
  const lesson = getLessonById(lessonId);
  if (!lesson) return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });

  const baseXp = lesson.xpReward;
  const accuracyBonus = Math.round((correct / total) * 5);
  let xpEarned = baseXp + accuracyBonus;
  if (perfect) xpEarned += 5;
  if (xpBoost) xpEarned *= 2;
  const gemsEarned = lesson.gemReward + (perfect ? 2 : 0);

  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const wasCompleted = existing?.status === "COMPLETED";
  const score = correct;
  const bestScore = Math.max(existing?.bestScore ?? 0, score);
  const newCrowns = perfect ? Math.min(3, (existing?.crowns ?? 0) + 1) : existing?.crowns ?? 0;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
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

  await unlockNextLesson(userId, lessonId);
  const { streak } = await updateStreak(userId);

  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  await db.userState.update({
    where: { userId },
    data: {
      xp: { increment: xpEarned },
      gems: { increment: gemsEarned },
      leagueXp: { increment: xpEarned },
    },
  });
  await addDailyXp(userId, xpEarned);

  const completedCount = await db.lessonProgress.count({
    where: { userId, status: "COMPLETED" },
  });
  const perfectCount = await db.lessonProgress.count({
    where: { userId, crowns: { gte: 2 } },
  });

  const { unlocked } = await recalcAchievements(userId, {
    lessonsCompleted: completedCount,
    xp: state.xp + xpEarned,
    streak,
    perfectLessons: perfectCount,
    gems: state.gems + gemsEarned,
  });

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

// PUT /api/progress - registrar pérdida de corazón
export async function PUT(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const { action } = await req.json();
  if (action === "lose_heart") {
    const state = await db.userState.findUnique({ where: { userId } });
    if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });
    if (state.hearts > 0) {
      await db.userState.update({
        where: { userId },
        data: { hearts: { decrement: 1 } },
      });
    }
    const snap = await getSnapshot();
    return NextResponse.json({
      ok: true,
      hearts: Math.max(0, state.hearts - 1),
      snapshot: snap,
    });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
