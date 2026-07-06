"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
 * Kuntur — mascota animada del estudio.
 * Usa el video de animación idle en bucle (WebM VP9 con transparencia alpha).
 * El video tiene fondo transparente (chroma key del verde) para integrarse sobre cualquier color.
 * Mantiene la misma API que la versión SVG anterior (mood, size, speech, animate).
 *
 * Nota: el video es una sola animación idle (parpadeo, pico, cabeza). El parámetro `mood`
 * solo afecta el alt text por accesibilidad. Las animaciones de reacción contextual
 * (risa en correcto, triste en incorrecto) se gestionan fuera con motion divs.
 */
export function KunturMascot({
  mood = "feliz",
  size = 120,
  className = "",
  animate = true,
  speech,
}: KunturMascotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative mb-2 max-w-[220px] bg-white dark:bg-card border-2 border-duo-green/30 rounded-2xl px-4 py-2 text-sm font-bold text-center shadow-sm"
        >
          {speech}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-b-2 border-r-2 border-duo-green/30 rotate-45" />
        </motion.div>
      )}
      <motion.div
        animate={animate ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
      </motion.div>
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
