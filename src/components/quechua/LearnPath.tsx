"use client";

import { CURRICULUM } from "@/lib/quechua/content";
import { useAppStore } from "@/lib/quechua/store";
import { Check, Lock, Crown, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { KunturMascot, KUNTUR_PHRASES } from "@/components/quechua/KunturMascot";
import { getKunturGreetingForPlan } from "@/lib/quechua/survey";
import { QuipuKnot } from "@/components/quechua/QuipuKnot";

// Offsets en píxeles para crear el camino serpenteante
const OFFSETS = [0, 60, 100, 60, 0, -60, -100, -60];

export function LearnPath() {
  const progress = useAppStore((s) => s.progress);
  const startLesson = useAppStore((s) => s.startLesson);
  const stats = useAppStore((s) => s.stats);
  const survey = useAppStore((s) => s.survey);

  // Construir lista plana de lecciones con su unidad
  const allLessons = useMemo(() => {
    const list: { lessonId: string; title: string; emoji: string; description: string; unitTitle: string; unitColor: string; unitEmoji: string; unitSubtitle: string; isUnitStart: boolean }[] = [];
    CURRICULUM.forEach((unit, uIdx) => {
      unit.lessons.forEach((lesson, lIdx) => {
        list.push({
          lessonId: lesson.id,
          title: lesson.title,
          emoji: lesson.emoji,
          description: lesson.description,
          unitTitle: unit.title,
          unitColor: unit.color,
          unitEmoji: unit.emoji,
          unitSubtitle: unit.subtitle,
          isUnitStart: lIdx === 0,
        });
      });
    });
    return list;
  }, []);

  // Encontrar la lección "actual" (primera ACTIVE no completada)
  const currentLessonId = useMemo(() => {
    for (const l of allLessons) {
      const p = progress[l.lessonId];
      if (!p || p.status === "ACTIVE") return l.lessonId;
      if (p.status === "LOCKED") return l.lessonId;
    }
    return null;
  }, [allLessons, progress]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Encabezado con Kuntur */}
      <div className="text-center mb-6">
        <KunturMascot
          mood={stats && stats.streak >= 3 ? "enamorado" : "feliz"}
          size={220}
          speech={
            stats && stats.streak >= 7
              ? "¡Racha imparable! 🔥"
              : stats && stats.streak >= 3
              ? "¡Vas en racha! Sigue así 💪"
              : stats && stats.dailyXp >= (stats.dailyGoal ?? 30)
              ? "¡Meta del día cumplida! 🎋"
              : survey
              ? getKunturGreetingForPlan(survey)
              : KUNTUR_PHRASES.greeting[0]
          }
        />
        <h1 className="text-2xl font-extrabold text-foreground mt-3">
          Lengua Viva
        </h1>
        <p className="text-sm font-semibold text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
          <span>Lenguas del Perú, vivas para siempre ·</span>
          <QuipuKnot size={16} />
          <span className="font-extrabold text-duo-orange">{stats?.xp ?? 0} quipus tejidos</span>
        </p>
      </div>

      {/* Camino serpenteante */}
      <div className="relative flex flex-col items-center gap-3 pb-8">
        {allLessons.map((lesson, idx) => {
          const p = progress[lesson.lessonId];
          const status = p?.status ?? "LOCKED";
          const isCompleted = status === "COMPLETED";
          const isActive = status === "ACTIVE";
          const isLocked = status === "LOCKED" && !isCompleted && !isActive;
          const isCurrent = lesson.lessonId === currentLessonId && (isActive || isLocked);
          const crowns = p?.crowns ?? 0;
          const offset = OFFSETS[idx % OFFSETS.length];

          // Color del nodo
          let nodeBg = "var(--duo-lock)";
          let nodeShadow = "oklch(0.72 0.005 150)";
          if (isCompleted) {
            nodeBg = "var(--duo-yellow)";
            nodeShadow = "oklch(0.72 0.14 85)";
          } else if (isActive || isCurrent) {
            nodeBg = "var(--duo-green)";
            nodeShadow = "var(--duo-green-dark)";
          }

          // Banner de unidad al inicio
          const showUnitBanner = lesson.isUnitStart;

          return (
            <div key={lesson.lessonId} className="w-full flex flex-col items-center">
              {showUnitBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 mt-2 w-full max-w-sm rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
                  style={{
                    background: lesson.unitColor === "green"
                      ? "linear-gradient(135deg, var(--duo-green), var(--duo-green-dark))"
                      : lesson.unitColor === "emerald"
                      ? "linear-gradient(135deg, oklch(0.7 0.15 160), oklch(0.55 0.14 160))"
                      : lesson.unitColor === "amber"
                      ? "linear-gradient(135deg, var(--duo-orange), oklch(0.6 0.16 55))"
                      : "var(--duo-green)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{lesson.unitEmoji}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                        {lesson.unitTitle}
                      </div>
                      <div className="text-lg font-extrabold">{lesson.unitSubtitle}</div>
                    </div>
                    <BookOpen className="w-5 h-5 opacity-80" />
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => {
                  if (isLocked) return;
                  const fullLesson = CURRICULUM.flatMap((u) => u.lessons).find((l) => l.id === lesson.lessonId);
                  if (fullLesson) startLesson(fullLesson);
                }}
                disabled={isLocked}
                className={`path-node ${isCurrent ? "animate-pulse-ring" : ""} ${isLocked ? "locked" : ""}`}
                style={{
                  width: 76,
                  height: 76,
                  background: nodeBg,
                  "--node-shadow": nodeShadow,
                  transform: `translateX(${offset}px)`,
                  color: isCompleted ? "oklch(0.4 0.05 85)" : isLocked ? "oklch(0.5 0.005 150)" : "white",
                } as React.CSSProperties}
                aria-label={`Lección: ${lesson.title}`}
              >
                {isLocked ? (
                  <Lock className="w-7 h-7" />
                ) : isCompleted ? (
                  crowns > 0 ? (
                    <div className="flex flex-col items-center -space-y-1">
                      <QuipuKnot size={30} />
                      <div className="flex">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Crown
                            key={i}
                            className={`w-3.5 h-3.5 ${i < crowns ? "opacity-100" : "opacity-25"}`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Check className="w-8 h-8" strokeWidth={3} />
                  )
                ) : (
                  <span className="text-3xl">{lesson.emoji}</span>
                )}
              </button>

              {/* Tooltip/burbuja del tooltip con el título cuando es actual */}
              {isCurrent && !isLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 bg-white dark:bg-card border border-duo-green/30 rounded-lg px-3 py-1 text-xs font-bold text-duo-green shadow-sm relative"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-t-2 border-l-2 border-duo-green/30 rotate-45" />
                  ¡Empezar! · {lesson.title}
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Final */}
        <div className="mt-6 text-center">
          <p className="font-bold text-muted-foreground text-sm">¡Sigue practicando para dominar el quechua!</p>
        </div>
      </div>
    </div>
  );
}
