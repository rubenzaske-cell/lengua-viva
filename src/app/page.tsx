"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/quechua/store";
import { TopBar } from "@/components/quechua/TopBar";
import { BottomNav } from "@/components/quechua/BottomNav";
import { LearnPath } from "@/components/quechua/LearnPath";
import { LessonPlayer } from "@/components/quechua/LessonPlayer";
import { LeagueView } from "@/components/quechua/LeagueView";
import { ProfileView } from "@/components/quechua/ProfileView";
import { ShopView } from "@/components/quechua/ShopView";
import { AchievementsView } from "@/components/quechua/AchievementsView";
import { Onboarding } from "@/components/quechua/Onboarding";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const stats = useAppStore((s) => s.stats);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const setLoading = useAppStore((s) => s.setLoading);
  const loading = useAppStore((s) => s.loading);
  const view = useAppStore((s) => s.view);
  const activeLesson = useAppStore((s) => s.activeLesson);
  const refreshKey = useAppStore((s) => s.refreshKey);
  const setXpBoostUntil = useAppStore((s) => s.setXpBoostUntil);
  const xpBoostUntil = useAppStore((s) => s.xpBoostUntil);
  const needsOnboarding = useAppStore((s) => s.needsOnboarding);
  const setNeedsOnboarding = useAppStore((s) => s.setNeedsOnboarding);
  const setUser = useAppStore((s) => s.setUser);

  // Cargar estado inicial
  const loadState = async () => {
    try {
      const r = await fetch("/api/state");
      const data = await r.json();
      if (data.needsOnboarding) {
        setNeedsOnboarding(true);
      } else {
        setUser(data.user);
        setStats(data.stats);
        setProgress(data.progress);
        setAchievements(data.achievements);
        setNeedsOnboarding(false);
      }
    } catch {
      // reintentar silenciosamente
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Restaurar boost de XP
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("xpBoostUntil");
      if (stored) {
        const ts = Number(stored);
        if (ts > Date.now()) setXpBoostUntil(ts);
        else localStorage.removeItem("xpBoostUntil");
      }
    }
    loadState();
  }, []);

  // Refrescar cuando triggerRefresh cambia
  useEffect(() => {
    if (refreshKey > 0) loadState();
  }, [refreshKey]);

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <KunturMascot mood="timido" size={120} />
          <h1 className="text-2xl font-extrabold text-duo-green mb-1 mt-2">RunaSimi</h1>
          <p className="text-sm font-bold text-muted-foreground">Cargando tu camino...</p>
        </motion.div>
      </div>
    );
  }

  // Onboarding: crear perfil de usuario real
  if (needsOnboarding || !stats) {
    return <Onboarding />;
  }

  // Reproductor de lección a pantalla completa
  if (activeLesson) {
    return <LessonPlayer />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {view === "learn" && <LearnPath />}
            {view === "league" && <LeagueView />}
            {view === "profile" && <ProfileView />}
            {view === "shop" && <ShopView />}
            {view === "achievements" && <AchievementsView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      {xpBoostUntil && xpBoostUntil > Date.now() && (
        <div className="fixed bottom-20 right-4 z-40 bg-duo-blue text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce-subtle">
          ⚡ Doble Quipus activo
        </div>
      )}
    </div>
  );
}
