"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Trash2, Copy, Check, Download } from "lucide-react";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { useAppStore } from "@/lib/quechua/store";
import { useTTS } from "@/lib/quechua/useTTS";
import { toast } from "sonner";

interface Message {
  role: "user" | "kuntur";
  text: string;
  palabraQuechua?: string;
  traduccion?: string;
  imageUrl?: string;
  generatingImage?: boolean;
  imageProgress?: number; // 0-100
  imageError?: boolean;
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
    await enviarMensaje(mensaje);
  };

  // Función principal que envía el mensaje al API
  const enviarMensaje = async (mensaje: string) => {
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
      let respuestaKuntur = data.respuesta || "No pude procesar tu pregunta 🦙";

      // Detectar si el usuario pidió generar una imagen (o preguntó si puede)
      const userMessage = mensaje.toLowerCase();
      const wantsImage = (
        // Pedidos directos de imagen
        userMessage.includes("imagen") ||
        userMessage.includes("dibuja") ||
        userMessage.includes("dibujar") ||
        userMessage.includes("crea una imagen") ||
        userMessage.includes("genera una imagen") ||
        userMessage.includes("genera imagen") ||
        userMessage.includes("hazme una imagen") ||
        userMessage.includes("crea un logo") ||
        userMessage.includes("diseña") ||
        userMessage.includes("diseñar") ||
        userMessage.includes("fotografía") ||
        userMessage.includes("fotografia") ||
        userMessage.includes("pintura") ||
        userMessage.includes("cuadro") ||
        // Preguntas sobre si puede generar imágenes
        (userMessage.includes("puedes") && (userMessage.includes("imagen") || userMessage.includes("dibuj") || userMessage.includes("generar"))) ||
        (userMessage.includes("puedes") && userMessage.includes("crear") && userMessage.includes("imag")) ||
        userMessage.includes("sabes dibujar") ||
        userMessage.includes("sabes generar") ||
        userMessage.includes("generas imagenes") ||
        userMessage.includes("generas imágenes")
      );

      // Si preguntó si puede generar imágenes, forzar respuesta positiva
      if (wantsImage) {
        // Si Kuntur dijo que no puede, sobrescribir
        if (
          respuestaKuntur.toLowerCase().includes("no puedo") ||
          respuestaKuntur.toLowerCase().includes("modelo de texto") ||
          respuestaKuntur.toLowerCase().includes("no puedo generar") ||
          respuestaKuntur.toLowerCase().includes("no estoy diseñado") ||
          respuestaKuntur.toLowerCase().includes("no tengo la capacidad")
        ) {
          // Extraer el tema de la imagen del mensaje del usuario
          let tema = mensaje
            .replace(/^(puedes|puedes|sabes|generas|creas)\s+/i, "")
            .replace(/^(dibujar|generar|crear|hacer)\s+/i, "")
            .replace(/^(imagenes|imágenes|una imagen|un dibujo|una foto)\s+/i, "")
            .replace(/^(de|del|de la|de un|de una)?\s*/i, "")
            .replace(/\?/g, "")
            .trim();

          if (!tema || tema.length < 3) {
            respuestaKuntur = "¡Sí, puedo generar imágenes! Dime qué quieres que cree. 🎨";
          } else {
            respuestaKuntur = `¡Sí puedo! Generando imagen de ${tema}. 🎨`;
          }
        }
      }

      const finalMessages = [...newMessages, {
        role: "kuntur" as const,
        text: respuestaKuntur,
        palabraQuechua: data.palabraQuechua || "",
        traduccion: data.traduccion || "",
      }];
      setMessages(finalMessages);
      saveHistory(finalMessages);
      // TTS: solo leer el texto sin código
      const textoParaHablar = respuestaKuntur.replace(/```[\s\S]*?```/g, "").trim();
      if (textoParaHablar) {
        tts.speak(textoParaHablar, "chuichui");
      }

      // Si pidió imagen, generarla
      if (wantsImage) {
        const imagePromptIndex = finalMessages.length - 1;

        // Extraer el tema de la imagen del mensaje del usuario
        let imagePrompt = mensaje;

        // Limpiar el prompt
        imagePrompt = imagePrompt
          .replace(/^(puedes|sabes|generas|creas|hazme|muéstrame|muestrame|haz|diseña|diseñar|crea|genera|dibuja|dibujar)\s+/i, "")
          .replace(/^(crea una|genera una|crea un|genera un)\s+/i, "")
          .replace(/^(una|un|la|el|los|las|algunas|alguna|unos|unas)\s+/i, "")
          .replace(/^(imagen|imágenes|imagenes|foto|fotografía|fotografia|dibujo|ilustración|ilustracion|logo|diseño|diseno|cuadro|pintura)\s+/i, "")
          .replace(/^(de|del|de la|de un|de una|sobre|me|para)?\s*/i, "")
          .replace(/\?/g, "")
          .replace(/^(crear|generar|hacer|dibujar)\s*$/i, "")
          .trim();

        // Si después de limpiar queda vacío o es muy genérico, no generar imagen
        const genericWords = ["imagen", "imagenes", "imágenes", "dibujo", "foto", "si", "sí", "puedes", "sabes"];
        if (!imagePrompt || imagePrompt.length < 3 || genericWords.includes(imagePrompt.toLowerCase())) {
          // El usuario solo preguntó si puede, no pidió una imagen específica
        } else {
          // Marcar como generando imagen INMEDIATAMENTE
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[imagePromptIndex]) {
              updated[imagePromptIndex] = {
                ...updated[imagePromptIndex],
                generatingImage: true,
                imageProgress: 5,
                imageError: false,
              };
            }
            return updated;
          });

          // Progreso simulado mientras se genera
          const progressInterval = setInterval(() => {
            setMessages((prev) => {
              const updated = [...prev];
              const msg = updated[imagePromptIndex];
              if (msg && msg.generatingImage && (msg.imageProgress || 0) < 85) {
                updated[imagePromptIndex] = {
                  ...msg,
                  imageProgress: Math.min(85, (msg.imageProgress || 5) + Math.random() * 8),
                };
              }
              return updated;
            });
          }, 600);

          try {
            const imgResponse = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: imagePrompt }),
            });

            if (!imgResponse.ok) {
              throw new Error("Error en el servidor");
            }

            const imgData = await imgResponse.json();

            if (imgData.imageUrl) {
              // Actualizar progreso a 50% cuando tenemos la URL
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[imagePromptIndex]) {
                  updated[imagePromptIndex] = {
                    ...updated[imagePromptIndex],
                    imageProgress: 50,
                  };
                }
                return updated;
              });

              // Precargar la imagen antes de mostrarla
              const img = new Image();
              let loaded = false;
              // Timeout de 45 segundos
              const timeout = setTimeout(() => {
                if (!loaded) {
                  clearInterval(progressInterval);
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (updated[imagePromptIndex]) {
                      updated[imagePromptIndex] = {
                        ...updated[imagePromptIndex],
                        generatingImage: false,
                        imageError: true,
                      };
                    }
                    return updated;
                  });
                }
              }, 45000);

              img.onload = () => {
                loaded = true;
                clearTimeout(timeout);
                clearInterval(progressInterval);
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[imagePromptIndex]) {
                    updated[imagePromptIndex] = {
                      ...updated[imagePromptIndex],
                      imageUrl: imgData.imageUrl,
                      generatingImage: false,
                      imageProgress: 100,
                      imageError: false,
                    };
                  }
                  return updated;
                });
                setTimeout(() => {
                  setMessages((prev) => {
                    saveHistory(prev);
                    return prev;
                  });
                }, 100);
              };
              img.onerror = () => {
                loaded = true;
                clearTimeout(timeout);
                clearInterval(progressInterval);
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[imagePromptIndex]) {
                    updated[imagePromptIndex] = {
                      ...updated[imagePromptIndex],
                      generatingImage: false,
                      imageError: true,
                    };
                  }
                  return updated;
                });
              };
              // Iniciar carga
              img.src = imgData.imageUrl;
            } else {
              clearInterval(progressInterval);
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[imagePromptIndex]) {
                  updated[imagePromptIndex] = {
                    ...updated[imagePromptIndex],
                    generatingImage: false,
                    imageError: true,
                  };
                }
                return updated;
              });
            }
          } catch (err) {
            clearInterval(progressInterval);
            console.error("Error generando imagen:", err);
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[imagePromptIndex]) {
                updated[imagePromptIndex] = {
                  ...updated[imagePromptIndex],
                  generatingImage: false,
                  imageError: true,
                };
              }
              return updated;
            });
          }
        }
      }
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
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-duo-green text-white rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.role === "kuntur" ? (
                  <MessageContent
                    text={msg.text}
                    imageUrl={msg.imageUrl}
                    generatingImage={msg.generatingImage}
                    imageProgress={msg.imageProgress}
                    imageError={msg.imageError}
                  />
                ) : (
                  <p className="text-sm font-semibold">{msg.text}</p>
                )}
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

// Componente que renderiza texto separando los bloques de código
function MessageContent({ text, imageUrl, generatingImage, imageProgress, imageError }: {
  text: string;
  imageUrl?: string;
  generatingImage?: boolean;
  imageProgress?: number;
  imageError?: boolean;
}) {
  // Dividir el texto por bloques de código (```...```)
  const parts: { type: "text" | "code"; content: string; lang?: string }[] = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Texto antes del bloque de código
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index).trim();
      if (beforeText) parts.push({ type: "text", content: beforeText });
    }
    // El bloque de código
    parts.push({ type: "code", content: match[2].trim(), lang: match[1] || "code" });
    lastIndex = codeBlockRegex.lastIndex;
  }
  // Texto después del último bloque
  if (lastIndex < text.length) {
    const afterText = text.slice(lastIndex).trim();
    if (afterText) parts.push({ type: "text", content: afterText });
  }
  // Si no había bloques de código, todo es texto
  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }

  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState<number | null>(null);

  const copiarTexto = () => {
    navigator.clipboard?.writeText(text);
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2000);
  };

  const copiarCodigo = (content: string, i: number) => {
    navigator.clipboard?.writeText(content);
    setCopiadoCodigo(i);
    setTimeout(() => setCopiadoCodigo(null), 2000);
  };

  const hasCode = parts.some((p) => p.type === "code");

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "code") {
          return (
            <div key={i} className="my-2 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-md">
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{part.lang}</span>
                </div>
                <button
                  onClick={() => copiarCodigo(part.content, i)}
                  className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  {copiadoCodigo === i ? "✓ Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                <code className="font-mono whitespace-pre">
                  <HighlightedCode code={part.content} lang={part.lang || "code"} />
                </code>
              </pre>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{part.content}</p>
        );
      })}
      {/* Botón para copiar todo el texto SOLO cuando hay código */}
      {hasCode && (
        <button
          onClick={copiarTexto}
          className="mt-1 flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {copiadoTexto ? (
            <>
              <Check className="w-3 h-3" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar texto
            </>
          )}
        </button>
      )}

      {/* Imagen generada */}
      {generatingImage && (
        <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-duo-purple animate-pulse" />
              Generando imagen...
            </span>
            <span className="text-xs font-bold text-duo-purple">
              {Math.round(imageProgress || 0)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-duo-purple to-duo-blue rounded-full transition-all duration-500"
              style={{ width: `${imageProgress || 5}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {imageProgress && imageProgress < 30 ? "Analizando tu petición..." :
             imageProgress && imageProgress < 60 ? "Creando la composición..." :
             imageProgress && imageProgress < 90 ? "Añadiendo detalles..." :
             "Finalizando..."}
          </p>
        </div>
      )}
      {imageError && !imageUrl && (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs font-bold text-destructive">
            No se pudo generar la imagen.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            El servicio puede estar saturado. Intenta con otra descripción.
          </p>
        </div>
      )}
      {imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-border shadow-md">
          <img
            src={imageUrl}
            alt="Imagen generada por Kuntur"
            className="w-full h-auto"
            loading="lazy"
          />
          <a
            href={imageUrl}
            download="imagen-kuntur.png"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 bg-muted/50 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar imagen
          </a>
        </div>
      )}
    </div>
  );
}

// Resaltador de sintaxis simple (sin dependencias externas)
function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  // Colores estilo VS Code / drácula
  const COLORS = {
    keyword: "#ff79c6",    // rosa - keywords (function, const, if, etc.)
    string: "#f1fa8c",     // amarillo - strings
    number: "#bd93f9",     // morado - números
    comment: "#6272a4",    // gris azul - comentarios
    function: "#50fa7b",   // verde - nombres de funciones
    tag: "#ff79c6",        // rosa - tags HTML/JSX
    attr: "#50fa7b",       // verde - atributos
    punctuation: "#f8f8f2", // blanco - puntuación
    plain: "#f8f8f2",      // blanco - texto normal
  };

  // Keywords comunes
  const keywords = [
    "function", "const", "let", "var", "if", "else", "return", "for", "while",
    "import", "export", "default", "class", "extends", "new", "this", "async",
    "await", "try", "catch", "throw", "typeof", "instanceof", "in", "of",
    "true", "false", "null", "undefined", "void", "delete", "switch", "case",
    "break", "continue", "do", "yield", "static", "public", "private", "protected",
    "def", "print", "lambda", "with", "as", "pass", "from", "elif", "is", "not",
    "and", "or", "None", "True", "False", "self", "struct", "fn", "pub", "use",
    "module", "interface", "type", "enum", "impl", "where", "match",
  ];

  // Tokenizar el código
  const tokenize = (code: string) => {
    const tokens: { text: string; color: string }[] = [];
    let i = 0;

    while (i < code.length) {
      const char = code[i];
      const rest = code.slice(i);

      // Comentarios // o #
      if (char === "/" && code[i + 1] === "/") {
        let comment = "";
        while (i < code.length && code[i] !== "\n") {
          comment += code[i];
          i++;
        }
        tokens.push({ text: comment, color: COLORS.comment });
        continue;
      }
      if (char === "#") {
        let comment = "";
        while (i < code.length && code[i] !== "\n") {
          comment += code[i];
          i++;
        }
        tokens.push({ text: comment, color: COLORS.comment });
        continue;
      }
      // Comentarios /* */
      if (char === "/" && code[i + 1] === "*") {
        let comment = "/*";
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
          comment += code[i];
          i++;
        }
        comment += "*/";
        i += 2;
        tokens.push({ text: comment, color: COLORS.comment });
        continue;
      }

      // Strings con comillas dobles, simples o backticks
      if (char === '"' || char === "'" || char === "`") {
        const quote = char;
        let str = char;
        i++;
        while (i < code.length && code[i] !== quote) {
          str += code[i];
          if (code[i] === "\\") {
            i++;
            str += code[i] || "";
          }
          i++;
        }
        str += quote;
        i++;
        tokens.push({ text: str, color: COLORS.string });
        continue;
      }

      // Números
      if (/[0-9]/.test(char)) {
        let num = "";
        while (i < code.length && /[0-9.]/.test(code[i])) {
          num += code[i];
          i++;
        }
        tokens.push({ text: num, color: COLORS.number });
        continue;
      }

      // Identificadores y keywords
      if (/[a-zA-Z_$]/.test(char)) {
        let word = "";
        while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
          word += code[i];
          i++;
        }
        // Verificar si es keyword
        if (keywords.includes(word)) {
          tokens.push({ text: word, color: COLORS.keyword });
        }
        // Verificar si es llamada a función (sigue un paréntesis)
        else if (code[i] === "(" || code[i] === " ") {
          let j = i;
          while (j < code.length && code[j] === " ") j++;
          if (code[j] === "(") {
            tokens.push({ text: word, color: COLORS.function });
          } else {
            tokens.push({ text: word, color: COLORS.plain });
          }
        }
        // JSX tags (después de <)
        else if (tokens.length > 0 && tokens[tokens.length - 1].text === "<") {
          tokens.push({ text: word, color: COLORS.tag });
        }
        else {
          tokens.push({ text: word, color: COLORS.plain });
        }
        continue;
      }

      // Tags JSX/HTML < y >
      if (char === "<" || char === ">") {
        tokens.push({ text: char, color: COLORS.tag });
        i++;
        continue;
      }

      // Puntuación y operadores
      if (/[{}()\[\];,.:=+\-*/%<>!&|?]/.test(char)) {
        tokens.push({ text: char, color: COLORS.punctuation });
        i++;
        continue;
      }

      // Espacios y otros
      tokens.push({ text: char, color: COLORS.plain });
      i++;
    }

    return tokens;
  };

  const tokens = tokenize(code);

  return (
    <>
      {tokens.map((token, idx) => (
        <span key={idx} style={{ color: token.color }}>
          {token.text}
        </span>
      ))}
    </>
  );
}
