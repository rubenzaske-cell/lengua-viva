"use client";

import { create } from "zustand";
import type { Exercise, Lesson } from "./content";

export type AppView = "learn" | "league" | "profile" | "shop" | "achievements";

export interface UserStats {
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
}

export interface LessonProgressMap {
  [lessonId: string]: {
    status: "LOCKED" | "ACTIVE" | "COMPLETED";
    crowns: number;
    bestScore: number;
    attempts: number;
    completedAt: string | null;
  };
}

export interface AchievementProgressMap {
  [id: string]: { progress: number; target: number; unlockedAt: string | null };
}

interface AppState {
  // Navegación
  view: AppView;
  setView: (v: AppView) => void;

  // Estado del usuario (sincronizado con DB)
  stats: UserStats | null;
  setStats: (s: UserStats) => void;

  progress: LessonProgressMap;
  setProgress: (p: LessonProgressMap) => void;

  achievements: AchievementProgressMap;
  setAchievements: (a: AchievementProgressMap) => void;

  // Lección activa
  activeLesson: Lesson | null;
  activeExercises: Exercise[];
  startLesson: (lesson: Lesson) => void;
  exitLesson: () => void;

  // Carga
  loading: boolean;
  setLoading: (b: boolean) => void;

  // Doble XP boost temporal
  xpBoostUntil: number | null;
  setXpBoostUntil: (ts: number | null) => void;

  // Refrescar desde DB
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "learn",
  setView: (v) => set({ view: v }),

  stats: null,
  setStats: (s) => set({ stats: s }),

  progress: {},
  setProgress: (p) => set({ progress: p }),

  achievements: {},
  setAchievements: (a) => set({ achievements: a }),

  activeLesson: null,
  activeExercises: [],
  startLesson: (lesson) => {
    // Mezclar opciones y palabras para variedad
    const exercises = lesson.exercises.map((ex) => {
      if (ex.type === "select" || ex.type === "reverse" || ex.type === "listen") {
        const shuffled = [...ex.choices].sort(() => Math.random() - 0.5);
        return { ...ex, choices: shuffled };
      }
      if (ex.type === "bank") {
        const shuffled = [...ex.words].sort(() => Math.random() - 0.5);
        return { ...ex, words: shuffled };
      }
      return ex;
    });
    set({ activeLesson: lesson, activeExercises: exercises });
  },
  exitLesson: () => set({ activeLesson: null, activeExercises: [] }),

  loading: true,
  setLoading: (b) => set({ loading: b }),

  xpBoostUntil: null,
  setXpBoostUntil: (ts) => {
    if (typeof window !== "undefined") {
      if (ts) localStorage.setItem("xpBoostUntil", String(ts));
      else localStorage.removeItem("xpBoostUntil");
    }
    set({ xpBoostUntil: ts });
  },

  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));
