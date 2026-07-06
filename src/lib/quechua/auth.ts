import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { CURRICULUM } from "@/lib/quechua/content";
import { todayStr, yesterdayStr, calcRegenHearts } from "@/lib/quechua/gamification";
import { randomBytes } from "crypto";

const COOKIE_NAME = "runasimi_uid";

// Obtiene o crea el browserId desde la cookie
export async function getBrowserId(): Promise<string> {
  const store = await cookies();
  let bid = store.get(COOKIE_NAME)?.value;
  if (!bid) {
    bid = randomBytes(16).toString("hex");
    store.set(COOKIE_NAME, bid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 año
      path: "/",
    });
  }
  return bid;
}

// Establece un browserId específico (para testing o migración)
export async function setBrowserId(bid: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, bid, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

// Obtiene (o crea) el perfil del usuario actual
export async function getCurrentUser(): Promise<{ id: string; name: string; avatar: string; browserId: string; isNew: boolean }> {
  const bid = await getBrowserId();
  let profile = await db.userProfile.findUnique({
    where: { browserId: bid },
    include: { state: true },
  });
  if (!profile) {
    return { id: "", name: "", avatar: "🧑", browserId: bid, isNew: true };
  }
  return { id: profile.id, name: profile.name, avatar: profile.avatar, browserId: bid, isNew: false };
}

// Crea un nuevo usuario con nombre y avatar
export async function createCurrentUser(name: string, avatar: string): Promise<string> {
  const bid = await getBrowserId();
  const profile = await db.userProfile.create({
    data: {
      browserId: bid,
      name: name.trim() || "Aprendiz",
      avatar: avatar || "🧑",
    },
  });
  // Crear estado inicial
  await db.userState.create({
    data: { userId: profile.id },
  });
  // Desbloquear la primera lección
  const firstLessonId = CURRICULUM[0].lessons[0].id;
  await db.lessonProgress.create({
    data: { userId: profile.id, lessonId: firstLessonId, status: "ACTIVE" },
  });
  return profile.id;
}

// Actualiza nombre/avatar
export async function updateCurrentUserProfile(name: string, avatar: string): Promise<void> {
  const bid = await getBrowserId();
  await db.userProfile.update({
    where: { browserId: bid },
    data: { name: name.trim() || "Aprendiz", avatar: avatar || "🧑" },
  });
}

// Requiere que el usuario exista; lanza error si no
export async function requireUserId(): Promise<string> {
  const u = await getCurrentUser();
  if (!u.id) throw new Error("USER_NOT_FOUND");
  return u.id;
}

export interface GameSnapshot {
  user: { id: string; name: string; avatar: string };
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

// Regenera corazones según el tiempo pasado
export async function regenHearts(userId: string): Promise<void> {
  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return;
  if (state.hearts >= state.maxHearts) {
    if (state.heartsLastRegen.getTime() < Date.now() - 60 * 1000) {
      await db.userState.update({
        where: { userId },
        data: { heartsLastRegen: new Date() },
      });
    }
    return;
  }
  const newHearts = calcRegenHearts(state.heartsLastRegen, state.hearts, state.maxHearts);
  if (newHearts > state.hearts) {
    const minutesGained = newHearts - state.hearts;
    const newRegen = new Date(state.heartsLastRegen.getTime() + minutesGained * 30 * 60 * 1000);
    await db.userState.update({
      where: { userId },
      data: { hearts: newHearts, heartsLastRegen: newRegen },
    });
  }
}

// Actualiza la racha diaria
export async function updateStreak(userId: string): Promise<{ streak: number; newDay: boolean }> {
  const state = await db.userState.findUnique({ where: { userId } });
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
    if (state.frozenCount > 0) {
      const gap = state.lastStreakDate ? Math.round((new Date(today).getTime() - new Date(state.lastStreakDate).getTime()) / 86400000) : 99;
      if (gap === 2) {
        newStreak = state.streak + 1;
        await db.userState.update({
          where: { userId },
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
    where: { userId },
    data: { streak: newStreak, lastStreakDate: today },
  });
  await db.streakDay.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, xp: 0 },
    update: {},
  });
  return { streak: newStreak, newDay: true };
}

// Actualiza XP diaria
export async function addDailyXp(userId: string, amount: number): Promise<void> {
  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return;
  const today = todayStr();
  if (state.dailyXpDate !== today) {
    await db.userState.update({
      where: { userId },
      data: { dailyXp: amount, dailyXpDate: today },
    });
  } else {
    await db.userState.update({
      where: { userId },
      data: { dailyXp: { increment: amount } },
    });
  }
  await db.streakDay.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, xp: amount },
    update: { xp: { increment: amount } },
  });
}

// Recalcula logros
export async function recalcAchievements(userId: string, ctx: {
  lessonsCompleted: number;
  xp: number;
  streak: number;
  perfectLessons: number;
  gems: number;
}): Promise<{ unlocked: string[] }> {
  const { ACHIEVEMENTS } = await import("@/lib/quechua/content");
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
    const existing = await db.achievementProgress.findUnique({
      where: { userId_achievementId: { userId, achievementId: ach.id } },
    });
    const wasUnlocked = existing?.unlockedAt != null;
    const nowUnlocked = value >= ach.target;
    await db.achievementProgress.upsert({
      where: { userId_achievementId: { userId, achievementId: ach.id } },
      create: {
        userId,
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

// Desbloquear la siguiente lección
export async function unlockNextLesson(userId: string, completedLessonId: string): Promise<void> {
  const all: string[] = [];
  CURRICULUM.forEach((u) => u.lessons.forEach((l) => all.push(l.id)));
  const idx = all.indexOf(completedLessonId);
  if (idx !== -1 && idx + 1 < all.length) {
    const nextId = all[idx + 1];
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: nextId } },
      create: { userId, lessonId: nextId, status: "ACTIVE" },
      update: { status: "ACTIVE" },
    });
  }
}

// Snapshot completo del estado del juego del usuario actual
export async function getSnapshot(): Promise<GameSnapshot | null> {
  const u = await getCurrentUser();
  if (!u.id) return null;
  const userId = u.id;

  await regenHearts(userId);

  const profile = await db.userProfile.findUnique({
    where: { id: userId },
    include: { state: true },
  });
  if (!profile || !profile.state) return null;

  const progressRows = await db.lessonProgress.findMany({ where: { userId } });
  const achRows = await db.achievementProgress.findMany({ where: { userId } });
  const streakRows = await db.streakDay.findMany({ where: { userId }, orderBy: { date: "asc" } });

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

  const { ACHIEVEMENTS } = await import("@/lib/quechua/content");
  const achievements: GameSnapshot["achievements"] = {};
  for (const a of achRows) {
    achievements[a.achievementId] = {
      progress: a.progress,
      target: a.target,
      unlockedAt: a.unlockedAt ? a.unlockedAt.toISOString() : null,
    };
  }
  for (const ach of ACHIEVEMENTS) {
    if (!achievements[ach.id]) {
      achievements[ach.id] = { progress: 0, target: ach.target, unlockedAt: null };
    }
  }

  return {
    user: { id: profile.id, name: profile.name, avatar: profile.avatar },
    stats: {
      xp: profile.state.xp,
      gems: profile.state.gems,
      hearts: profile.state.hearts,
      maxHearts: profile.state.maxHearts,
      streak: profile.state.streak,
      dailyXp: profile.state.dailyXp,
      dailyGoal: profile.state.dailyGoal,
      league: profile.state.league,
      leagueXp: profile.state.leagueXp,
      leagueWeek: profile.state.leagueWeek,
      frozenCount: profile.state.frozenCount,
      heartsLastRegen: profile.state.heartsLastRegen.toISOString(),
      lastStreakDate: profile.state.lastStreakDate,
      dailyXpDate: profile.state.dailyXpDate,
    },
    progress,
    achievements,
    streakDays: streakRows.map((s) => s.date),
  };
}
