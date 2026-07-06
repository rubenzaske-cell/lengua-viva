"use client";

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

export function KunturMascot({
  mood = "feliz",
  size = 120,
  className = "",
  animate = true,
  speech,
}: KunturMascotProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
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
        animate={
          animate
            ? mood === "risa"
              ? { rotate: [0, -3, 3, -3, 0], y: [0, -2, 0] }
              : mood === "feliz"
              ? { y: [0, -4, 0] }
              : mood === "triste"
              ? { rotate: [0, -2, 0, 2, 0] }
              : mood === "enojado"
              ? { x: [0, -2, 2, -2, 2, 0] }
              : mood === "sorprendido"
              ? { scale: [1, 1.05, 1] }
              : mood === "timido"
              ? { y: [0, 1, 0] }
              : { y: [0, -3, 0] }
            : {}
        }
        transition={{
          duration: mood === "enojado" ? 0.4 : mood === "risa" ? 0.5 : 2,
          repeat: Infinity,
          repeatDelay: mood === "enojado" || mood === "risa" ? 1.5 : 0,
        }}
        style={{ width: size, height: size }}
        className="relative shrink-0"
      >
        <img
          src={`/kuntur/${mood}.png`}
          alt={MOOD_ALT[mood]}
          width={size}
          height={size}
          className="w-full h-full object-contain drop-shadow-md"
        />
      </motion.div>
    </div>
  );
}

// Frases aleatorias de Kuntur según el contexto
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
  streak: [
    "¡Tu racha arde! 🔥",
    "¡Imparable!",
    "¡Eres fuego!",
  ],
  encourage: [
    "¡La práctica hace al maestro!",
    "Poco a poco se llega lejos",
    "Cada palabra cuenta",
  ],
  startLesson: [
    "¡A practicar!",
    "¡Vamos!",
    "¡Tú puedes!",
  ],
  perfect: [
    "¡Impecable! Sin errores 🏆",
    "¡Eres un crack!",
    "¡Perfecto!",
  ],
};

export function randomPhrase(category: keyof typeof KUNTUR_PHRASES): string {
  const list = KUNTUR_PHRASES[category];
  return list[Math.floor(Math.random() * list.length)];
}
