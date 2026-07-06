import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEAGUES } from "@/lib/quechua/content";
import { requireUserId, getSnapshot } from "@/lib/quechua/auth";

// GET /api/leaderboard - ranking de USUARIOS REALES en la misma liga que el usuario actual
export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  // Buscar usuarios reales en la misma liga y semana
  const peers = await db.userState.findMany({
    where: {
      league: state.league,
      leagueWeek: state.leagueWeek,
    },
    include: { user: true },
    orderBy: { leagueXp: "desc" },
  });

  const league = LEAGUES.find((l) => l.id === state.league);
  const leagueIdx = LEAGUES.findIndex((l) => l.id === state.league);
  const nextLeague = leagueIdx + 1 < LEAGUES.length ? LEAGUES[leagueIdx + 1] : null;
  const prevLeague = leagueIdx - 1 >= 0 ? LEAGUES[leagueIdx - 1] : null;

  // Construir ranking con usuarios reales
  const members = peers.map((p) => ({
    id: p.userId,
    name: p.user.name,
    avatar: p.user.avatar,
    xp: p.leagueXp,
    isUser: p.userId === userId,
  }));

  // Ordenar por XP descendente
  members.sort((a, b) => b.xp - a.xp);

  const rank = members.findIndex((m) => m.isUser) + 1;
  const total = members.length;

  // Zonas de ascenso/descenso ajustadas al número de miembros
  const promotionZone = Math.max(1, Math.min(5, Math.ceil(total * 0.25)));
  const demotionZone = Math.max(0, Math.min(3, Math.ceil(total * 0.25)));

  return NextResponse.json({
    league,
    nextLeague,
    prevLeague,
    members,
    rank,
    total,
    week: state.leagueWeek,
    promotionZone,
    demotionZone,
    isEmpty: total <= 1,
  });
}

// POST /api/leaderboard - avanzar de semana (recalcular liga)
export async function POST() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  const leagueIdx = LEAGUES.findIndex((l) => l.id === state.league);

  // Calcular el ranking real del usuario entre sus peers
  const peers = await db.userState.findMany({
    where: { league: state.league, leagueWeek: state.leagueWeek },
  });
  const sorted = peers.sort((a, b) => b.leagueXp - a.leagueXp);
  const userRank = sorted.findIndex((p) => p.userId === userId) + 1;
  const total = sorted.length;
  const promoZone = Math.max(1, Math.min(5, Math.ceil(total * 0.25)));
  const demoZone = Math.max(0, Math.min(3, Math.ceil(total * 0.25)));

  let newLeagueIdx = leagueIdx;
  if (userRank > 0 && userRank <= promoZone && leagueIdx + 1 < LEAGUES.length) {
    newLeagueIdx = leagueIdx + 1;
  } else if (userRank > 0 && userRank > total - demoZone && leagueIdx - 1 >= 0) {
    newLeagueIdx = leagueIdx - 1;
  }

  const newLeague = LEAGUES[newLeagueIdx];
  await db.userState.update({
    where: { userId },
    data: {
      league: newLeague.id,
      leagueWeek: { increment: 1 },
      leagueXp: 0,
    },
  });

  const snapshot = await getSnapshot();
  return NextResponse.json({ ok: true, newLeague: newLeague.id, snapshot });
}
