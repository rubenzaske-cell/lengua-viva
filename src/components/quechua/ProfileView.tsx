"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/quechua/store";
import { ACHIEVEMENTS, CURRICULUM } from "@/lib/quechua/content";
import { getLevel, todayStr } from "@/lib/quechua/gamification";
import { Flame, Heart, Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { IntiCoin } from "@/components/quechua/IntiCoin";
import { QuipuKnot } from "@/components/quechua/QuipuKnot";

export function ProfileView() {
  const stats = useAppStore((s) => s.stats);
  const progress = useAppStore((s) => s.progress);
  const achievements = useAppStore((s) => s.achievements);
  const setView = useAppStore((s) => s.setView);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const survey = useAppStore((s) => s.survey);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const r = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, avatar: user?.avatar ?? "🧑" }),
      });
      const data = await r.json();
      if (data.user) setUser(data.user);
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  if (!stats) return null;

  const level = getLevel(stats.xp);
  const completedLessons = Object.values(progress).filter((p) => p.status === "COMPLETED").length;
  const totalLessons = CURRICULUM.reduce((acc, u) => acc + u.lessons.length, 0);
  const totalCrowns = Object.values(progress).reduce((acc, p) => acc + (p.crowns ?? 0), 0);
  const unlockedAch = ACHIEVEMENTS.filter((a) => achievements[a.id]?.unlockedAt != null).length;

  // Calendario de los últimos 7 días
  const today = todayStr();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    const label = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"][d.getDay()];
    // Un día está "activo" si cae dentro de la racha actual (los últimos `streak` días incluyendo hoy)
    let active = false;
    if (stats.streak > 0 && stats.lastStreakDate === today) {
      const daysFromToday = 6 - i; // 0 = hoy, 6 = hace 6 días
      if (daysFromToday < stats.streak) active = true;
    }
    return { dateStr, label, day: d.getDate(), isToday: dateStr === today, active };
  });

  const statCards = [
    { icon: Flame, label: "Días de racha", value: stats.streak, color: "text-duo-orange", bg: "bg-duo-orange/10" },
    { icon: null, isQuipu: true, label: "Quipus tejidos", value: stats.xp, color: "text-duo-orange", bg: "bg-duo-orange/10" },
    { icon: Trophy, label: "Coronas", value: totalCrowns, color: "text-duo-purple", bg: "bg-duo-purple/10" },
    { icon: null, isCoin: true, label: "Intis", value: stats.gems, color: "text-duo-yellow", bg: "bg-duo-yellow/10" },
    { icon: Target, label: "Lecciones", value: `${completedLessons}/${totalLessons}`, color: "text-duo-green", bg: "bg-duo-green/10" },
    { icon: Heart, label: "Corazones", value: `${stats.hearts}/${stats.maxHearts}`, color: "text-duo-red", bg: "bg-duo-red/10" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      {/* Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-end justify-center gap-3 mb-3">
          <div className="text-6xl">{user?.avatar ?? "🧑"}</div>
          <KunturMascot
            mood={stats.streak >= 3 ? "guino" : "feliz"}
            size={64}
            animate={false}
          />
        </div>
        {editing ? (
          <div className="flex items-center justify-center gap-2 mb-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={20}
              className="px-3 py-1 rounded-lg border-2 border-duo-green bg-background font-bold text-center"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") saveProfile(); }}
            />
            <button onClick={saveProfile} disabled={savingProfile} className="duo-btn duo-btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
              {savingProfile ? "..." : "Guardar"}
            </button>
            <button onClick={() => { setEditing(false); setEditName(user?.name ?? ""); }} className="duo-btn duo-btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
              Cancelar
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-extrabold flex items-center justify-center gap-2">
            {user?.name ?? "Aprendiz"}
            <button
              onClick={() => { setEditing(true); setEditName(user?.name ?? ""); }}
              className="text-muted-foreground hover:text-duo-green transition-colors"
              aria-label="Editar nombre"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          </h1>
        )}
        <div className="inline-flex items-center gap-2 mt-2 bg-duo-green/10 border-2 border-duo-green/30 rounded-full px-4 py-1">
          <span className="text-duo-green font-extrabold text-sm">Nivel {level.level}</span>
          <span className="text-muted-foreground text-sm font-bold">· {level.title}</span>
        </div>
      </motion.div>

      {/* Barra de nivel (quipus tejidos) */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 mb-6">
        <div className="flex justify-between items-center text-sm font-bold mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1.5">Nivel {level.level} · {level.title}</span>
          <span className="text-duo-orange flex items-center gap-1"><QuipuKnot size={16} /> {level.current}/{level.needed}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level.progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-duo-orange to-amber-700 rounded-full"
          />
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${card.bg} rounded-2xl p-4 border-2 border-border`}
            >
              {card.isCoin ? (
                <div className="mb-2"><IntiCoin size={28} /></div>
              ) : card.isQuipu ? (
                <div className="mb-2"><QuipuKnot size={28} /></div>
              ) : (
                <Icon className={`w-7 h-7 ${card.color} mb-2`} fill="currentColor" />
              )}
              <div className={`text-2xl font-extrabold ${card.color}`}>{card.value}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Racha semanal */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 mb-6">
        <h3 className="font-extrabold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-duo-orange" /> Tu semana
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {last7.map((d) => (
            <div key={d.dateStr} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-muted-foreground">{d.label}</span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                  d.active
                    ? "bg-duo-orange text-white"
                    : d.isToday
                    ? "border-2 border-duo-orange/40 text-muted-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {d.active ? <Flame className="w-4 h-4" fill="currentColor" /> : d.day}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-semibold mt-3 text-center">
          🔥 ¡Mantén viva tu racha practicando todos los días!
        </p>
      </div>

      {/* Meta diaria de quipus */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 mb-6">
        <h3 className="font-extrabold mb-2 flex items-center gap-2">
          <QuipuKnot size={20} /> Meta diaria
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-muted-foreground">Quipus tejidos hoy</span>
          <span className="text-duo-orange font-extrabold flex items-center gap-1">{stats.dailyXp} / {stats.dailyGoal}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (stats.dailyXp / stats.dailyGoal) * 100)}%` }}
            className="h-full bg-duo-yellow rounded-full"
          />
        </div>
        {stats.dailyXp >= stats.dailyGoal && (
          <p className="text-duo-green font-bold text-sm mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> ¡Meta cumplida! ¡Sigue sumando!
          </p>
        )}
      </div>

      {/* Resumen de logros */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 mb-6">
        <h3 className="font-extrabold mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-duo-purple" /> Logros
        </h3>
        <div className="flex justify-between text-sm font-bold mb-2">
          <span className="text-muted-foreground">Desbloqueados</span>
          <span className="text-duo-purple">{unlockedAch} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedAch / ACHIEVEMENTS.length) * 100}%` }}
            className="h-full bg-duo-purple rounded-full"
          />
        </div>
      </div>

      {/* Plan personalizado */}
      {survey && (
        <div className="bg-gradient-to-br from-duo-green/10 to-duo-blue/10 border-2 border-duo-green/30 rounded-2xl p-4 mb-6">
          <h3 className="font-extrabold mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span> Mi Plan Personalizado
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Lengua</div>
              <div className="font-extrabold capitalize">{survey.language}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Meta diaria</div>
              <div className="font-extrabold flex items-center gap-1">
                <QuipuKnot size={14} /> {survey.dailyGoal} quipus
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Objetivo</div>
              <div className="font-extrabold capitalize">{survey.goal}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Ritmo</div>
              <div className="font-extrabold capitalize">{survey.pace}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-bold uppercase">Nivel</div>
              <div className="font-extrabold capitalize">{survey.level}</div>
            </div>
            {survey.reminderTime && (
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase">Recordatorio</div>
                <div className="font-extrabold">{survey.reminderTime}</div>
              </div>
            )}
          </div>
          {survey.interests.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground font-bold uppercase mb-2">Intereses</div>
              <div className="flex flex-wrap gap-1.5">
                {survey.interests.map((tag) => (
                  <span key={tag} className="text-xs font-bold bg-duo-green/15 text-duo-green-dark px-2 py-1 rounded-full capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setView("achievements")} className="duo-btn duo-btn-secondary">
          <Trophy className="w-5 h-5" /> Ver logros
        </button>
        <button onClick={() => setView("learn")} className="duo-btn duo-btn-primary">
          <Flame className="w-5 h-5" fill="currentColor" /> Seguir aprendiendo
        </button>
      </div>
    </div>
  );
}
