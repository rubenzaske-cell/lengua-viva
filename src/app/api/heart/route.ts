import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSnapshot } from "@/lib/quechua/server";

// POST /api/heart
// body: { action: "refill" } (cuesta gemas) o { action: "check" } (solo regenera)
export async function POST(req: NextRequest) {
  const { action } = await req.json();
  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  if (action === "refill") {
    const cost = 350;
    if (state.gems < cost) {
      return NextResponse.json({ error: "Gemas insuficientes" }, { status: 400 });
    }
    if (state.hearts >= state.maxHearts) {
      return NextResponse.json({ error: "Ya tienes todos los corazones" }, { status: 400 });
    }
    await db.userState.update({
      where: { id: "default" },
      data: {
        gems: { decrement: cost },
        hearts: state.maxHearts,
        heartsLastRegen: new Date(),
      },
    });
    const snap = await getSnapshot();
    return NextResponse.json({ ok: true, snapshot: snap });
  }

  if (action === "check") {
    const snap = await getSnapshot();
    return NextResponse.json({ ok: true, snapshot: snap });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
