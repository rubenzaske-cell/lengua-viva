import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SHOP_ITEMS } from "@/lib/quechua/content";
import { getSnapshot } from "@/lib/quechua/server";

// POST /api/shop
// body: { itemId }
export async function POST(req: NextRequest) {
  const { itemId } = await req.json();
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

  const state = await db.userState.findUnique({ where: { id: "default" } });
  if (!state) return NextResponse.json({ error: "no state" }, { status: 500 });
  if (state.gems < item.cost) {
    return NextResponse.json({ error: "Intis insuficientes" }, { status: 400 });
  }

  switch (item.type) {
    case "hearts":
      if (item.id === "refill_hearts") {
        if (state.hearts >= state.maxHearts) {
          return NextResponse.json({ error: "Ya tienes todos los corazones" }, { status: 400 });
        }
        await db.userState.update({
          where: { id: "default" },
          data: {
            gems: { decrement: item.cost },
            hearts: state.maxHearts,
            heartsLastRegen: new Date(),
          },
        });
      } else if (item.id === "extra_heart") {
        await db.userState.update({
          where: { id: "default" },
          data: {
            gems: { decrement: item.cost },
            maxHearts: { increment: 1 },
            hearts: { increment: 1 },
          },
        });
      }
      break;
    case "frozen":
      await db.userState.update({
        where: { id: "default" },
        data: {
          gems: { decrement: item.cost },
          frozenCount: { increment: item.id === "frozen_3" ? 3 : 1 },
        },
      });
      break;
    case "boost":
      // Doble XP: lo manejamos en cliente con timestamp, pero registramos gasto
      await db.userState.update({
        where: { id: "default" },
        data: { gems: { decrement: item.cost } },
      });
      break;
    default:
      return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
  }

  const snapshot = await getSnapshot();
  return NextResponse.json({
    ok: true,
    boost: item.type === "boost" ? Date.now() + 15 * 60 * 1000 : null,
    snapshot,
  });
}
