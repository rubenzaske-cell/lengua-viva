import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSnapshot, requireUserId } from "@/lib/quechua/auth";

// POST /api/heart
// body: { action: "refill" } (cuesta gemas) o { action: "check" }
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const { action } = await req.json();
  const state = await db.userState.findUnique({ where: { userId } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });

  if (action === "refill") {
    const cost = 350;
    if (state.gems < cost) {
      return NextResponse.json({ error: "Intis insuficientes" }, { status: 400 });
    }
    if (state.hearts >= state.maxHearts) {
      return NextResponse.json({ error: "Ya tienes todos los corazones" }, { status: 400 });
    }
    await db.userState.update({
      where: { userId },
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
