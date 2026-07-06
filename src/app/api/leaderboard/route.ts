import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEAGUES } from "@/lib/quechua/content";
import { ensureLeagueMembers } from "@/lib/quechua/server";

// GET /api/leaderboard
export async function GET() {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });
  await ensureLeagueMembers();

  const members = await db.leagueMember.findMany({
    where: { league: state.league, week: state.leagueWeek },
    orderBy: { leagueXp: "desc" },
  });

  const league = LEAGUES.find((l) => l.id === state.league);
  const leagueIdx = LEAGUES.findIndex((l) => l.id === state.league);
  const nextLeague = leagueIdx + 1 < LEAGUES.length ? LEAGUES[leagueIdx + 1] : null;
  const prevLeague = leagueIdx - 1 >= 0 ? LEAGUES[leagueIdx - 1] : null;

  // Construir ranking con el usuario incluido
  const all = [
    ...members.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, xp: m.leagueXp, isUser: false })),
    { id: "me", name: "Tú", avatar: "🧑", xp: state.leagueXp, isUser: true },
  ].sort((a, b) => b.xp - a.xp);

  const rank = all.findIndex((m) => m.isUser) + 1;
  const top5 = all.slice(0, 5);
  const bottom3 = all.slice(-3);

  return NextResponse.json({
    league,
    nextLeague,
    prevLeague,
    members: all,
    rank,
    total: all.length,
    top5,
    bottom3,
    week: state.leagueWeek,
    promotionZone: 5, // top 5 ascienden
    demotionZone: 3, // bottom 3 descienden
  });
}

// POST: simular fin de semana (avanzar semana y recalcular ligas) — para demo
export async function POST() {
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  const leagueIdx = LEAGUES.findIndex((l) => l.id === state.league);
  // Promoción si está en top 5
  const members = await db.leagueMember.findMany({
    where: { league: state.league, week: state.leagueWeek },
  });
  const all = [
    ...members.map((m) => m.leagueXp),
    state.leagueXp,
  ].sort((a, b) => b - a);
  const userRank = all.indexOf(state.leagueXp) + 1;

  let newLeagueIdx = leagueIdx;
  if (userRank <= 5 && leagueIdx + 1 < LEAGUES.length) newLeagueIdx = leagueIdx + 1;
  else if (userRank > all.length - 3 && leagueIdx - 1 >= 0) newLeagueIdx = leagueIdx - 1;

  const newLeague = LEAGUES[newLeagueIdx];
  await db.userState.update({
    where: { id: "default" },
    data: {
      league: newLeague.id,
      leagueWeek: { increment: 1 },
      leagueXp: 0,
    },
  });
  // Limpiar bots de la semana anterior (la nueva semana genera bots nuevos en ensureLeagueMembers)
  await db.leagueMember.deleteMany({ where: { week: state.leagueWeek } });

  return NextResponse.json({ ok: true, newLeague: newLeague.id });
}
