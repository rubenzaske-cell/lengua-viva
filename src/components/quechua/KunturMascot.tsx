"use client";

import { useEffect, useRef, useState } from "react";

export type KunturMood =
  | "feliz"
  | "enamorado"
  | "triste"
  | "enojado"
  | "sorprendido"
  | "guino"
  | "timido"
  | "risa";

interface KunturMascotProps {
  mood?: KunturMood;
  size?: number;
  className?: string;
  animate?: boolean;
  speech?: string;
  /** Cuando es true, Kuntur se pone a "escribir" (creando el plan galáctico).
   *  Muestra sparkles ✨ y una burbuja "Creando tu plan..." con puntos animados.
   *  Después de ~2.8s llama a onWritingComplete. */
  writing?: boolean;
  /** Callback cuando la animación de escritura termina. */
  onWritingComplete?: () => void;
}

const MOOD_ALT: Record<KunturMood, string> = {
  feliz: "Kuntur feliz",
  enamorado: "Kuntur enamorado",
  triste: "Kuntur triste",
  enojado: "Kuntur enojado",
  sorprendido: "Kuntur sorprendido",
  guino: "Kuntur guiñando",
  timido: "Kuntur tímido",
  risa: "Kuntur riendo",
};

/**
 * Efecto máquina de escribir: escribe el texto letra por letra UNA SOLA VEZ.
 * Al terminar, el texto se queda estático (NO reinicia).
 */
function useTypewriter(text: string | undefined, enabled: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text ?? "");
      setTyping(false);
      return;
    }
    let i = 0;
    let cancelled = false;
    setDisplayed("");
    setTyping(true);

    const typeNext = () => {
      if (cancelled) return;
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        const delay = 35 + Math.random() * 20;
        setTimeout(typeNext, delay);
      } else {
        setTyping(false);
      }
    };
    const startTimer = setTimeout(typeNext, 300);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [text, enabled]);

  return { text: displayed, typing };
}

// Posiciones de sparkles alrededor de Kuntur (en % relativo al contenedor)
const SPARKLES = [
  { top: "5%", left: "10%", delay: "0ms", size: 14 },
  { top: "15%", left: "85%", delay: "200ms", size: 10 },
  { top: "45%", left: "5%", delay: "400ms", size: 12 },
  { top: "50%", left: "92%", delay: "100ms", size: 16 },
  { top: "75%", left: "15%", delay: "300ms", size: 11 },
  { top: "80%", left: "80%", delay: "500ms", size: 13 },
  { top: "25%", left: "50%", delay: "150ms", size: 9 },
  { top: "90%", left: "50%", delay: "350ms", size: 15 },
];

export function KunturMascot({
  mood = "feliz",
  size = 120,
  className = "",
  animate = true,
  speech,
  writing = false,
  onWritingComplete,
}: KunturMascotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { text: typedText, typing } = useTypewriter(speech, !!speech && !writing);

  // Asegurar que el video idle siempre se reproduzca
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  // Timer para la animación de "escritura" del plan galáctico
  useEffect(() => {
    if (!writing) return;
    const timer = setTimeout(() => {
      onWritingComplete?.();
    }, 2800); // 2.8s tejiendo el plan
    return () => clearTimeout(timer);
  }, [writing, onWritingComplete]);

  // Video vertical 720x1280 (9:16). size = altura.
  const videoHeight = size;
  const videoWidth = size * (720 / 1280);

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ width: videoWidth, position: "relative" }}>
      {/* Burbuja de diálogo */}
      {writing ? (
        // Burbuja especial "Creando tu plan galáctico..." con puntos animados
        <div className="relative mb-2 max-w-[260px] min-h-[36px] bg-gradient-to-r from-duo-purple/15 to-duo-blue/15 border-2 border-duo-purple/40 rounded-2xl px-4 py-2 text-sm font-extrabold text-center shadow-sm flex items-center justify-center gap-1.5">
          <span className="text-duo-purple">✨ Tejiendo tu plan</span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-duo-purple animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-duo-purple animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-duo-purple animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-b-2 border-r-2 border-duo-purple/40 rotate-45" />
        </div>
      ) : speech ? (
        <div
          className="relative mb-2 max-w-[240px] min-h-[36px] bg-white dark:bg-card border-2 border-duo-green/30 rounded-2xl px-4 py-2 text-sm font-bold text-center shadow-sm flex items-center justify-center"
        >
          <span>
            {typedText}
            {typing && (
              <span className="inline-block w-[2px] h-4 bg-duo-green ml-0.5 align-middle animate-pulse" />
            )}
          </span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-b-2 border-r-2 border-duo-green/30 rotate-45" />
        </div>
      ) : null}

      {/* Contenedor del video con sparkles cuando está escribiendo */}
      <div style={{ width: videoWidth, height: videoHeight, position: "relative" }}>
        {/* Video idle de Kuntur (siempre reproduciéndose en bucle) */}
        <video
          ref={videoRef}
          src="/kuntur/kuntur-idle.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
          style={{ pointerEvents: "none" }}
          aria-label={MOOD_ALT[mood]}
        />

        {/* Sparkles ✨ alrededor de Kuntur cuando está escribiendo el plan */}
        {writing && (
          <>
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="absolute pointer-events-none select-none"
                style={{
                  top: s.top,
                  left: s.left,
                  fontSize: s.size,
                  animation: `sparkle-float 1.4s ease-in-out ${s.delay} infinite`,
                }}
              >
                ✨
              </span>
            ))}
            {/* Aura/resplandor mágico detrás de Kuntur */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 60%)",
                animation: "aura-pulse 1.6s ease-in-out infinite",
              }}
            />
          </>
        )}
      </div>

      {/* Estilos locales para animaciones de sparkles */}
      <style>{`
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.6; }
          50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
        }
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export const KUNTUR_PHRASES = {
  greeting: [
    "¡Allinllachu! Soy Kuntur 🦅",
    "¡Listo para aprender quechua?",
    "¡Vamos a volar juntos!",
    "Sumaq p'unchaw — ¡buen día!",
  ],
  correct: [
    "¡Sumaq! ¡Muy bien!",
    "¡Rikuypuni! ¡Increíble!",
    "¡Allin! ¡Perfecto!",
    "¡Sigue así!",
  ],
  wrong: [
    "¡No te rindas!",
    "Casi... ¡inténtalo otra vez!",
    "Tranquilo, se aprende del error",
    "¡Tú puedes!",
  ],
  streak: ["¡Tu racha arde! 🔥", "¡Imparable!", "¡Eres fuego!"],
  encourage: [
    "¡La práctica hace al maestro!",
    "Poco a poco se llega lejos",
    "Cada palabra cuenta",
  ],
  startLesson: ["¡A practicar!", "¡Vamos!", "¡Tú puedes!"],
  perfect: ["¡Impecable! Sin errores 🏆", "¡Eres un crack!", "¡Perfecto!"],
};

export function randomPhrase(category: keyof typeof KUNTUR_PHRASES): string {
  const list = KUNTUR_PHRASES[category];
  return list[Math.floor(Math.random() * list.length)];
}
