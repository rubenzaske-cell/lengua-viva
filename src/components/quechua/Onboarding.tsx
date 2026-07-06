"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/quechua/store";
import { motion } from "framer-motion";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { toast } from "sonner";

const AVATARS = ["🧑", "👩", "👨", "🧒", "👧", "👦", "👩‍🦱", "👨‍🦱", "🧑‍🦰", "👩‍🦰", "👨‍🦰", "🧑‍🦱", "👩‍🦳", "👨‍🦳", "🧑‍🦲", "🦙", "🦅", "🐱", "🐼", "🦊"];

export function Onboarding() {
  const setUser = useAppStore((s) => s.setUser);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const setNeedsOnboarding = useAppStore((s) => s.setNeedsOnboarding);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧑");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Escribe tu nombre para empezar");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || "No se pudo crear el perfil");
        return;
      }
      if (data.user) setUser(data.user);
      if (data.stats) setStats(data.stats);
      if (data.progress) setProgress(data.progress);
      if (data.achievements) setAchievements(data.achievements);
      setNeedsOnboarding(false);
      toast.success(`¡Allinllachu, ${name.trim()}! 🎉`);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-duo-green/10 to-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <KunturMascot mood="feliz" size={120} speech="¡Allinllachu! Soy Kuntur" />

        <h1 className="text-3xl font-extrabold mt-4 mb-2">RunaSimi</h1>
        <p className="text-muted-foreground font-bold mb-6">
          Aprende quechua jugando. ¡Creemos tu perfil!
        </p>

        {/* Nombre */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 mb-4 text-left">
          <label className="block text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-2">
            ¿Cómo te llamas?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-bold text-lg focus:outline-none focus:border-duo-green transition-colors"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleSubmit(); }}
          />
        </div>

        {/* Avatar */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 mb-6 text-left">
          <label className="block text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-3">
            Elige tu avatar
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto scroll-quechua">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                  avatar === a
                    ? "bg-duo-green/20 border-2 border-duo-green scale-110"
                    : "bg-muted border-2 border-transparent hover:border-border"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          className="duo-btn duo-btn-primary w-full"
        >
          {submitting ? "Creando..." : "¡Empezar a aprender!"}
        </button>

        <p className="text-xs text-muted-foreground font-semibold mt-4">
          🔒 Tu progreso se guarda en esta base de datos. ¡Compártelo con tus amigos para competir en las ligas!
        </p>
      </motion.div>
    </div>
  );
}
