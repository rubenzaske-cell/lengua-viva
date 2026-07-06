"use client";

import { useAppStore } from "@/lib/quechua/store";
import { ACHIEVEMENTS } from "@/lib/quechua/content";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const TIER_COLORS: Record<string, { ring: string; text: string; bg: string }> = {
  bronze: { ring: "border-duo-orange/50", text: "text-duo-orange", bg: "bg-duo-orange/10" },
  silver: { ring: "border-muted-foreground/40", text: "text-muted-foreground", bg: "bg-muted" },
  gold: { ring: "border-duo-yellow/50", text: "text-duo-yellow", bg: "bg-duo-yellow/10" },
  diamond: { ring: "border-duo-blue/50", text: "text-duo-blue", bg: "bg-duo-blue/10" },
};

export function AchievementsView() {
  const achievements = useAppStore((s) => s.achievements);

  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = achievements[a.id]?.unlockedAt != null ? 1 : 0;
    const bUnlocked = achievements[b.id]?.unlockedAt != null ? 1 : 0;
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    const aProg = (achievements[a.id]?.progress ?? 0) / a.target;
    const bProg = (achievements[b.id]?.progress ?? 0) / b.target;
    return bProg - aProg;
  });

  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]?.unlockedAt != null).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">🎖️</div>
        <h1 className="text-2xl font-extrabold">Logros</h1>
        <p className="text-sm text-muted-foreground font-bold mt-1">
          {unlockedCount} de {ACHIEVEMENTS.length} desbloqueados
        </p>
        <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden max-w-xs mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-duo-purple to-duo-blue rounded-full"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((ach, i) => {
          const prog = achievements[ach.id] ?? { progress: 0, target: ach.target, unlockedAt: null };
          const unlocked = prog.unlockedAt != null;
          const pct = Math.min(100, (prog.progress / ach.target) * 100);
          const tier = TIER_COLORS[ach.tier];
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`relative rounded-2xl border-2 p-4 ${
                unlocked ? `${tier.ring} ${tier.bg}` : "border-border bg-card opacity-90"
              }`}
            >
              {unlocked && (
                <span className={`absolute -top-2 -right-2 text-xs font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-card border-2 ${tier.ring} ${tier.text} uppercase`}>
                  {ach.tier}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className={`text-4xl ${unlocked ? "" : "grayscale opacity-50"} relative`}>
                  {ach.emoji}
                  {!unlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-muted-foreground text-white rounded-full p-0.5">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-extrabold ${unlocked ? tier.text : "text-foreground"}`}>
                    {ach.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">{ach.description}</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${unlocked ? "bg-duo-green" : "bg-muted-foreground/50"}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold mt-1">
                    <span className="text-muted-foreground">{prog.progress}/{ach.target}</span>
                    {unlocked && <span className={tier.text}>✓ Desbloqueado</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
