"use client";

import { useEffect, useState } from "react";
import { LEAGUES } from "@/lib/quechua/content";
import { Trophy, TrendingUp, TrendingDown, Crown, Info } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { KunturMascot } from "@/components/quechua/KunturMascot";

interface LeaderMember {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isUser: boolean;
}

interface LeagueData {
  league: { id: string; name: string; emoji: string } | null;
  nextLeague: { id: string; name: string; emoji: string } | null;
  prevLeague: { id: string; name: string; emoji: string } | null;
  members: LeaderMember[];
  rank: number;
  total: number;
  top5: LeaderMember[];
  bottom3: LeaderMember[];
  week: number;
  promotionZone: number;
  demotionZone: number;
}

export function LeagueView() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/leaderboard");
      const d = await r.json();
      setData(d);
    } catch {
      toast.error("No se pudo cargar la liga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <div className="animate-pulse text-5xl mb-3">🏆</div>
        <p className="font-bold text-muted-foreground">Cargando liga...</p>
      </div>
    );
  }

  const allLeagues = LEAGUES;
  const currentIdx = allLeagues.findIndex((l) => l.id === (data.league?.id ?? "BRONZE"));

  const advanceWeek = async () => {
    const r = await fetch("/api/leaderboard", { method: "POST" });
    const d = await r.json();
    if (d.ok) {
      toast.success(`¡Nueva semana! Ahora estás en liga ${d.newLeague}`);
      load();
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      {/* Encabezado de liga */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block bg-gradient-to-br from-duo-yellow/20 to-duo-orange/20 border-2 border-duo-yellow/40 rounded-3xl px-8 py-5"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-6xl">{data.league?.emoji}</div>
            <KunturMascot
              mood={data.rank <= data.promotionZone ? "risa" : "timido"}
              size={70}
              animate={false}
            />
          </div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Liga · Semana {data.week}
          </div>
          <h1 className="text-3xl font-extrabold text-duo-yellow">{data.league?.name}</h1>
        </motion.div>
      </div>

      {/* Progreso de promoción */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm font-bold">
          <span className="flex items-center gap-1 text-duo-green">
            <TrendingUp className="w-4 h-4" /> Top {data.promotionZone} ascienden
          </span>
          <span className="flex items-center gap-1 text-duo-red">
            <TrendingDown className="w-4 h-4" /> Últimos {data.demotionZone} descienden
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-semibold">
          Tu puesto: <span className="font-extrabold text-foreground">#{data.rank}</span> de {data.total}
          {data.rank <= data.promotionZone && data.nextLeague ? (
            <span className="text-duo-green font-bold"> · ¡Ascenderías a {data.nextLeague.name} {data.nextLeague.emoji}!</span>
          ) : data.rank > data.total - data.demotionZone && data.prevLeague ? (
            <span className="text-duo-red font-bold"> · ¡Cuidado, descenderías a {data.prevLeague.name}!</span>
          ) : null}
        </p>
      </div>

      {/* Ranking */}
      <div className="space-y-2">
        {data.members.map((m, i) => {
          const rank = i + 1;
          const isPromo = rank <= data.promotionZone;
          const isDemo = rank > data.total - data.demotionZone;
          const isUser = m.isUser;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl p-3 border-2 ${
                isUser
                  ? "border-duo-green bg-duo-green/10"
                  : isPromo
                  ? "border-duo-green/30 bg-card"
                  : isDemo
                  ? "border-duo-red/30 bg-card"
                  : "border-border bg-card"
              }`}
            >
              <div className={`w-8 text-center font-extrabold ${
                rank === 1 ? "text-duo-yellow" : rank === 2 ? "text-muted-foreground" : rank === 3 ? "text-duo-orange" : "text-muted-foreground"
              }`}>
                {rank <= 3 ? <Crown className="w-5 h-5 mx-auto" fill="currentColor" /> : rank}
              </div>
              <div className="text-3xl">{m.avatar}</div>
              <div className="flex-1">
                <div className={`font-extrabold ${isUser ? "text-duo-green" : "text-foreground"}`}>
                  {m.name}{isUser && " (tú)"}
                </div>
                <div className="text-xs text-muted-foreground font-bold">{m.xp} XP esta semana</div>
              </div>
              {isPromo && <TrendingUp className="w-5 h-5 text-duo-green" />}
              {isDemo && <TrendingDown className="w-5 h-5 text-duo-red" />}
            </motion.div>
          );
        })}
      </div>

      {/* Escalera de ligas */}
      <div className="mt-8">
        <h3 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
          <Trophy className="w-4 h-4" /> Escalera de ligas
        </h3>
        <div className="flex items-center justify-between gap-1 overflow-x-auto scroll-quechua pb-2">
          {allLeagues.map((l, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            return (
              <div key={l.id} className="flex items-center gap-1 shrink-0">
                <div className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${
                  current ? "bg-duo-yellow/20 border-2 border-duo-yellow" : done ? "opacity-60" : "opacity-40"
                }`}>
                  <span className="text-2xl">{l.emoji}</span>
                  <span className="text-[10px] font-bold">{l.name}</span>
                </div>
                {i < allLeagues.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón simular fin de semana (demo) */}
      <div className="mt-6 text-center">
        <button onClick={advanceWeek} className="duo-btn duo-btn-secondary text-sm">
          <Info className="w-4 h-4" /> Simular fin de semana
        </button>
        <p className="text-xs text-muted-foreground mt-2 font-semibold">
          Cierra la semana y recalcula tu liga según tu puesto
        </p>
      </div>
    </div>
  );
}
