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
 * - Escribe a ~40ms por carácter (con pequeña variación aleatoria para naturalidad).
 * - Al terminar, el texto se queda estático (NO reinicia el bucle).
 * - Devuelve { text, typing } donde `typing` indica si está escribiendo (para sincronizar el pico).
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
        // Velocidad variable: 35-55ms por carácter para naturalidad
        const delay = 35 + Math.random() * 20;
        setTimeout(typeNext, delay);
      } else {
        // Terminó de escribir: el texto se queda estático (sin reiniciar)
        setTyping(false);
      }
    };
    // Pequeño delay inicial antes de empezar a escribir
    const startTimer = setTimeout(typeNext, 300);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [text, enabled]);

  return { text: displayed, typing };
}

/**
 * Kuntur — mascota animada del estudio.
 * Usa el video de animación idle en bucle (WebM VP9 con transparencia alpha).
 * El video tiene fondo transparente (chroma key del verde) para integrarse sobre cualquier color.
 * Mantiene la misma API que la versión SVG anterior (mood, size, speech, animate).
 *
 * Cuando hay `speech`, el texto se escribe letra por letra (efecto máquina de escribir)
 * en bucle, dando la sensación de que Kuntur está hablando.
 */
export function KunturMascot({
  mood = "feliz",
  size = 120,
  className = "",
  animate = true,
  speech,
}: KunturMascotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { text: typedText, typing } = useTypewriter(speech, !!speech);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  // Video vertical 720x1280 (aspecto 9:16). El size controla la ALTURA
  // para que encaje en los espacios donde antes había un SVG casi cuadrado.
  // El ancho se ajusta proporcionalmente.
  const videoHeight = size;
  const videoWidth = size * (720 / 1280);

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ width: videoWidth }}>
      {speech && (
        <div
          className="relative mb-2 max-w-[240px] min-h-[36px] bg-white dark:bg-card border-2 border-duo-green/30 rounded-2xl px-4 py-2 text-sm font-bold text-center shadow-sm flex items-center justify-center"
        >
          <span>
            {typedText}
            {/* Cursor parpadeante mientras escribe */}
            {typing && (
              <span className="inline-block w-[2px] h-4 bg-duo-green ml-0.5 align-middle animate-pulse" />
            )}
          </span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-b-2 border-r-2 border-duo-green/30 rotate-45" />
        </div>
      )}
      {/* El video NO se mueve cuando hay speech (Kuntur estático mientras escribe).
          La animación del video (pico, parpadeo) sigue reproduciéndose sin interrupción. */}
      <div
        style={{ width: videoWidth, height: videoHeight }}
      >
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
      </div>
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
