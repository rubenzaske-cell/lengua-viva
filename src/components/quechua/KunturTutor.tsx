"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Trash2 } from "lucide-react";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { useAppStore } from "@/lib/quechua/store";
import { useTTS } from "@/lib/quechua/useTTS";
import { toast } from "sonner";

interface Message {
  role: "user" | "kuntur";
  text: string;
  palabraQuechua?: string;
  traduccion?: string;
}

const WELCOME_MESSAGE: Message = {
  role: "kuntur",
  text: "¡Hola! Soy Kuntur, tu asistente de IA. Puedes preguntarme sobre cualquier tema — ciencia, historia, tecnología, cultura, consejos, o lo que necesites. ¿En qué puedo ayudarte?",
  palabraQuechua: "",
  traduccion: "",
};

export function KunturTutor({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const survey = useAppStore((s) => s.survey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tts = useTTS();

  // Cargar historial desde la BD al abrir el chat
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/chat-history");
        const data = await r.json();
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch {
        // Si falla, mantener el mensaje de bienvenida
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Guardar historial en la BD cada vez que cambian los mensajes
  const saveHistory = useCallback(async (msgs: Message[]) => {
    try {
      await fetch("/api/chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
    } catch {
      // Silencioso: si falla el guardado, no interrumpimos el chat
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Guardar cuando cambian los mensajes (con debounce para no sobrecargar)
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      saveHistory(messages);
    }, 1000);
    return () => clearTimeout(timer);
  }, [messages, loaded, saveHistory]);

  const limpiarChat = async () => {
    setMessages([WELCOME_MESSAGE]);
    try {
      await fetch("/api/chat-history", { method: "DELETE" });
      toast.success("Conversación reiniciada");
    } catch {
      // ignore
    }
  };

  const enviar = async () => {
    if (!input.trim() || loading) return;
    const mensaje = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: mensaje }];
    setMessages(newMessages);
    setLoading(true);

    // Construir historial de la conversación (excluyendo el mensaje inicial de bienvenida)
    const historial = newMessages.slice(1).map((m) => ({
      role: m.role === "kuntur" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const r = await fetch("/api/motor-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor_kuntur",
          mensaje,
          historial,
          contextoUsuario: {
            nombre: user?.name,
            nivel: survey?.level || "principiante",
            racha: stats?.streak || 0,
            xp: stats?.xp || 0,
            leccion: survey?.language || "quechua",
          },
        }),
      });
      const data = await r.json();
      const respuestaKuntur = data.respuesta || "No pude procesar tu pregunta 🦙";
      const finalMessages = [...newMessages, {
        role: "kuntur" as const,
        text: respuestaKuntur,
        palabraQuechua: data.palabraQuechua || "",
        traduccion: data.traduccion || "",
      }];
      setMessages(finalMessages);
      // Guardar inmediatamente después de la respuesta
      saveHistory(finalMessages);
      // Kuntur habla automáticamente con voz de niño
      tts.speak(respuestaKuntur, "chuichui");
    } catch {
      const errorMsg = "No pude conectar, pero sigue practicando 🦙";
      const errorMessages = [...newMessages, { role: "kuntur" as const, text: errorMsg }];
      setMessages(errorMessages);
      saveHistory(errorMessages);
      tts.speak(errorMsg, "chuichui");
    } finally {
      setLoading(false);
    }
  };

  const sugerencias = ["¿Qué hora es en Japón?", "Explícame la fotosíntesis", "Dame un consejo de vida", "¿Quién fue Einstein?"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-extrabold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-duo-purple" />
            Kuntur IA
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">Tu asistente inteligente</p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={limpiarChat}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Limpiar conversación"
            title="Limpiar conversación"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-quechua px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "kuntur" && (
                <div className="shrink-0">
                  <KunturMascot mood="feliz" size={48} animate={false} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-duo-green text-white rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                <p className="text-sm font-semibold">{msg.text}</p>
                {msg.palabraQuechua && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs font-bold text-duo-purple">
                      {msg.palabraQuechua} = <span className="text-muted-foreground">{msg.traduccion}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0">
                <KunturMascot mood="timido" size={48} animate={false} />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sugerencias */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="mx-auto max-w-2xl flex flex-wrap gap-2">
            {sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-bold hover:bg-muted/70 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background font-bold focus:outline-none focus:border-duo-green"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={enviar}
            disabled={!input.trim() || loading}
            className="duo-btn duo-btn-primary shrink-0"
            style={{ padding: "0.75rem 1rem" }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
