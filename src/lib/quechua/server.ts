import { db } from "@/lib/db";
import { ACHIEVEMENTS, CURRICULUM } from "@/lib/quechua/content";
import { todayStr, yesterdayStr, calcRegenHearts } from "@/lib/quechua/gamification";

export interface GameSnapshot {
  stats: {
    xp: number;
    gems: number;
    hearts: number;
    maxHearts: number;
    streak: number;
    dailyXp: number;
    dailyGoal: number;
    league: string;
    leagueXp: number;
    leagueWeek: number;
    frozenCount: number;
    heartsLastRegen: string;
    lastStreakDate: string | null;
    dailyXpDate: string | null;
  };
  progress: Record<
    string,
    {
      status: "LOCKED" | "ACTIVE" | "COMPLETED";
      crowns: number;
      bestScore: number;
      attempts: number;
      completedAt: string | null;
    }
  >;
  achievements: Record<string, { progress: number; target: number; unlockedAt: string | null }>;
  streakDays: string[];
}

// Asegura que existe el estado del usuario por defecto y desbloquea la primera lección
export async function ensureDefaultState(): Promise<void> {
  let state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) {
    const firstLessonId = CURRICULUM[0].lessons[0].id;
    state = await db.userState.create({ data: { id: "default" } });
    await db.lessonProgress.upsert({
      where: { lessonId: firstLessonId },
      create: { lessonId: firstLessonId, status: "ACTIVE" },
      update: { status: "ACTIVE" },
    });
  }
}

// Desbloquear la siguiente lección si la actual está completa
export async function unlockNextLesson(completedLessonId: string): Promise<void> {
  const all: string[] = [];
  CURRICULUM.forEach((u) => u.lessons.forEach((l) => all.push(l.id)));
  const idx = all.indexOf(completedLessonId);
  if (idx !== -1 && idx + 1 < all.length) {
    const nextId = all[idx + 1];
    await db.lessonProgress.upsert({
      where: { lessonId: nextId },
      create: { lessonId: nextId, status: "ACTIVE" },
      update: { status: "ACTIVE" },
    });
  }
}

// Regenera corazones según el tiempo pasado
export async function regenHearts(): Promise<void> {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return;
  if (state.hearts >= state.maxHearts) {
    if (state.heartsLastRegen.getTime() < Date.now() - 60 * 1000) {
      await db.userState.update({
        where: { id: "default" },
        data: { heartsLastRegen: new Date() },
      });
    }
    return;
  }
  const newHearts = calcRegenHearts(state.heartsLastRegen, state.hearts, state.maxHearts);
  if (newHearts > state.hearts) {
    // Resetear el contador de regeneración al tiempo actual si ganó un corazón
    const minutesGained = newHearts - state.hearts;
    const newRegen = new Date(state.heartsLastRegen.getTime() + minutesGained * 30 * 60 * 1000);
    await db.userState.update({
      where: { id: "default" },
      data: { hearts: newHearts, heartsLastRegen: newRegen },
    });
  }
}

// Actualiza la racha diaria
export async function updateStreak(): Promise<{ streak: number; newDay: boolean }> {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return { streak: 0, newDay: false };
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (state.lastStreakDate === today) {
    return { streak: state.streak, newDay: false };
  }

  let newStreak = state.streak;
  if (state.lastStreakDate === yesterday) {
    newStreak = state.streak + 1;
  } else if (state.lastStreakDate === null) {
    newStreak = 1;
  } else {
    // Racha rota: usar congelador si hay, sino reiniciar
    if (state.frozenCount > 0) {
      // Verificar si el último día fue anteayer (1 día perdido)
      const gap = state.lastStreakDate ? Math.round((new Date(today).getTime() - new Date(state.lastStreakDate).getTime()) / 86400000) : 99;
      if (gap === 2) {
        newStreak = state.streak + 1;
        await db.userState.update({
          where: { id: "default" },
          data: { frozenCount: { decrement: 1 } },
        });
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
  }

  await db.userState.update({
    where: { id: "default" },
    data: { streak: newStreak, lastStreakDate: today },
  });
  await db.streakDay.upsert({
    where: { date: today },
    create: { date: today, xp: 0 },
    update: {},
  });
  return { streak: newStreak, newDay: true };
}

// Actualiza XP diaria (resetea si cambió el día)
export async function addDailyXp(amount: number): Promise<void> {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return;
  const today = todayStr();
  if (state.dailyXpDate !== today) {
    await db.userState.update({
      where: { id: "default" },
      data: { dailyXp: amount, dailyXpDate: today },
    });
  } else {
    await db.userState.update({
      where: { id: "default" },
      data: { dailyXp: { increment: amount } },
    });
  }
  await db.streakDay.upsert({
    where: { date: today },
    create: { date: today, xp: amount },
    update: { xp: { increment: amount } },
  });
}

// Recalcula y actualiza los logros según las métricas actuales
export async function recalcAchievements(ctx: {
  lessonsCompleted: number;
  xp: number;
  streak: number;
  perfectLessons: number;
  gems: number;
}): Promise<{ unlocked: string[] }> {
  const unlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    let value = 0;
    switch (ach.metric) {
      case "lessons": value = ctx.lessonsCompleted; break;
      case "xp": value = ctx.xp; break;
      case "streak": value = ctx.streak; break;
      case "perfect": value = ctx.perfectLessons; break;
      case "gems": value = ctx.gems; break;
    }
    const progress = Math.min(ach.target, value);
    const existing = await db.achievementProgress.findUnique({ where: { achievementId: ach.id } });
    const wasUnlocked = existing?.unlockedAt != null;
    const nowUnlocked = value >= ach.target;
    await db.achievementProgress.upsert({
      where: { achievementId: ach.id },
      create: {
        achievementId: ach.id,
        progress,
        target: ach.target,
        unlockedAt: nowUnlocked ? new Date() : null,
      },
      update: {
        progress,
        target: ach.target,
        unlockedAt: nowUnlocked && !wasUnlocked ? new Date() : existing?.unlockedAt ?? null,
      },
    });
    if (nowUnlocked && !wasUnlocked) unlocked.push(ach.id);
  }
  return { unlocked };
}

// Genera miembros de liga (bots) si no existen para la semana actual
export async function ensureLeagueMembers(): Promise<void> {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return;
  const count = await db.leagueMember.count({
    where: { league: state.league, week: state.leagueWeek },
  });
  if (count === 0) {
    const bots = [
      { name: "Sumaq", avatar: "🦙" },
      { name: "Inti", avatar: "☀️" },
      { name: "Killa", avatar: "🌙" },
      { name: "Wayra", avatar: "💨" },
      { name: "Pacha", avatar: "🌍" },
      { name: "Nina", avatar: "🔥" },
      { name: "Yaku", avatar: "💧" },
      { name: "Rumi", avatar: "🪨" },
      { name: "Sara", avatar: "🌽" },
      { name: "Tanta", avatar: "🍞" },
    ];
    // XP aleatoria para los bots
    const data = bots.map((b) => ({
      name: b.name,
      avatar: b.avatar,
      leagueXp: Math.floor(Math.random() * 80) + 10,
      league: state.league,
      week: state.leagueWeek,
    }));
    await db.leagueMember.createMany({ data });
  }
}

// Snapshot completo del estado del juego
export async function getSnapshot(): Promise<GameSnapshot> {
  await ensureDefaultState();
  await regenHearts();

  const state = await db.userState.findUnique({ where: { id: "default" } });
  const progressRows = await db.lessonProgress.findMany();
  const achRows = await db.achievementProgress.findMany();
  const streakRows = await db.streakDay.findMany({ orderBy: { date: "asc" } });

  const progress: GameSnapshot["progress"] = {};
  for (const p of progressRows) {
    progress[p.lessonId] = {
      status: p.status as "LOCKED" | "ACTIVE" | "COMPLETED",
      crowns: p.crowns,
      bestScore: p.bestScore,
      attempts: p.attempts,
      completedAt: p.completedAt ? p.completedAt.toISOString() : null,
    };
  }

  const achievements: GameSnapshot["achievements"] = {};
  for (const a of achRows) {
    achievements[a.achievementId] = {
      progress: a.progress,
      target: a.target,
      unlockedAt: a.unlockedAt ? a.unlockedAt.toISOString() : null,
    };
  }
  // Llenar los logros no iniciados
  for (const ach of ACHIEVEMENTS) {
    if (!achievements[ach.id]) {
      achievements[ach.id] = { progress: 0, target: ach.target, unlockedAt: null };
    }
  }

  return {
    stats: {
      xp: state!.xp,
      gems: state!.gems,
      hearts: state!.hearts,
      maxHearts: state!.maxHearts,
      streak: state!.streak,
      dailyXp: state!.dailyXp,
      dailyGoal: state!.dailyGoal,
      league: state!.league,
      leagueXp: state!.leagueXp,
      leagueWeek: state!.leagueWeek,
      frozenCount: state!.frozenCount,
      heartsLastRegen: state!.heartsLastRegen.toISOString(),
      lastStreakDate: state!.lastStreakDate,
      dailyXpDate: state!.dailyXpDate,
    },
    progress,
    achievements,
    streakDays: streakRows.map((s) => s.date),
  };
}
