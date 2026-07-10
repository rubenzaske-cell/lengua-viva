"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles } from "lucide-react";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { useAppStore } from "@/lib/quechua/store";
import { useTTS } from "@/lib/quechua/useTTS";

interface Message {
  role: "user" | "kuntur";
  text: string;
  palabraQuechua?: string;
  traduccion?: string;
}

export function KunturTutor({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "kuntur",
      text: "¡Allinllachu! Soy Kuntur, tu tutor 🦅. Pregúntame cualquier cosa sobre el quechua o pídime un consejo.",
      palabraQuechua: "Allinllachu",
      traduccion: "Hola / Buenos días",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const survey = useAppStore((s) => s.survey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tts = useTTS();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const enviar = async () => {
    if (!input.trim() || loading) return;
    const mensaje = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: mensaje }]);
    setLoading(true);

    try {
      const r = await fetch("/api/motor-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor_kuntur",
          mensaje,
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
      setMessages((m) => [
        ...m,
        {
          role: "kuntur",
          text: respuestaKuntur,
          palabraQuechua: data.palabraQuechua || "",
          traduccion: data.traduccion || "",
        },
      ]);
      // Kuntur habla automáticamente con voz de niño (chuichui = voz animada/infantil)
      tts.speak(respuestaKuntur, "chuichui");
    } catch {
      const errorMsg = "No pude conectar, pero sigue practicando 🦙";
      setMessages((m) => [
        ...m,
        { role: "kuntur", text: errorMsg },
      ]);
      tts.speak(errorMsg, "chuichui");
    } finally {
      setLoading(false);
    }
  };

  const sugerencias = ["¿Cómo digo gracias?", "Dame un consejo", "Enséñame una palabra", "¿Qué es yachay?"];

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
            Tutor Kuntur IA
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">Tu maestro quechua personal</p>
        </div>
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
