import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/quechua/auth";

// GET /api/chat-history - obtiene el historial del usuario
export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const conversation = await db.chatConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = JSON.parse(conversation.messages);
    return NextResponse.json({ messages, updatedAt: conversation.updatedAt });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

// POST /api/chat-history - guarda el historial del usuario
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  const { messages } = await req.json();

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages debe ser un array" }, { status: 400 });
  }

  // Limitar a los últimos 100 mensajes para no sobrecargar la BD
  const messagesToSave = messages.slice(-100);
  const messagesJson = JSON.stringify(messagesToSave);

  // Upsert: si existe una conversación, actualizarla; si no, crearla
  const existing = await db.chatConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    await db.chatConversation.update({
      where: { id: existing.id },
      data: { messages: messagesJson },
    });
  } else {
    await db.chatConversation.create({
      data: {
        userId,
        messages: messagesJson,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/chat-history - elimina el historial (para "limpiar chat")
export async function DELETE() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }

  await db.chatConversation.deleteMany({ where: { userId } });

  return NextResponse.json({ ok: true });
}
