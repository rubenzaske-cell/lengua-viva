"use client";

import { useAppStore } from "@/lib/quechua/store";
import { Flame, Heart, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMs, nextHeartInMs } from "@/lib/quechua/gamification";
import { IntiCoin } from "@/components/quechua/IntiCoin";

export function TopBar() {
  const stats = useAppStore((s) => s.stats);
  const setView = useAppStore((s) => s.setView);
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!stats) return null;

  const dailyProgress = Math.min(100, (stats.dailyXp / stats.dailyGoal) * 100);
  const heartMs = nextHeartInMs(new Date(stats.heartsLastRegen), stats.hearts, stats.maxHearts);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/60">
      <div className="mx-auto max-w-2xl px-3 py-2 flex items-center gap-2 sm:gap-4">
        {/* Racha */}
        <button
          onClick={() => setView("profile")}
          className="flex items-center gap-1 shrink-0 group"
          aria-label="Racha"
        >
          <Flame className="w-6 h-6 text-duo-orange" fill="currentColor" />
          <span className="font-extrabold text-lg text-duo-orange group-hover:scale-110 transition-transform">
            {stats.streak}
          </span>
        </button>

        {/* Intis (monedas del sol) */}
        <button
          onClick={() => setView("shop")}
          className="flex items-center gap-1 shrink-0 group"
          aria-label="Intis"
        >
          <IntiCoin size={22} className="group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-base text-duo-yellow group-hover:scale-110 transition-transform">
            {stats.gems}
          </span>
        </button>

        {/* Corazones */}
        <button
          onClick={() => setView("shop")}
          className="flex items-center gap-1 shrink-0 group relative"
          aria-label="Corazones"
          title={heartMs ? `Próximo corazón en ${formatMs(heartMs)}` : "Corazones llenos"}
        >
          <Heart className="w-5 h-5 text-duo-red" fill="currentColor" />
          <span className="font-extrabold text-base text-duo-red group-hover:scale-110 transition-transform">
            {stats.hearts}/{stats.maxHearts}
          </span>
        </button>

        {/* Meta diaria */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <Target className="w-5 h-5 text-duo-yellow shrink-0" fill="currentColor" />
          <div className="flex-1 max-w-[140px]">
            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-0.5">
              <span>{stats.dailyXp}/{stats.dailyGoal} XP</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-duo-yellow rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
