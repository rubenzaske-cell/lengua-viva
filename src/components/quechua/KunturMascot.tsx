"use client";

import { useState, useEffect, useRef } from "react";
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

// Paleta de colores (estilo Duolingo: plano con contornos bold)
const DARK = "#3b4a52";
const DARK_SHADOW = "#2a373e";
const RUFF = "#f5f7f8";
const BEAK = "#f5a623";
const BEAK_DARK = "#d68910";
const OUTLINE = "#1f2937";
const PUPIL = "#161616";
const WHITE = "#ffffff";
const BLUSH = "#fda4af";
const HEART = "#ef4444";

// Posiciones base de las pupilas (en coordenadas del viewBox 200x200)
const BASE_LX = 86, BASE_LY = 68;
const BASE_RX = 114, BASE_RY = 68;
const MAX_OFFSET = 4.5;

export function KunturMascot({
  mood = "feliz",
  size = 120,
  className = "",
  animate = true,
  speech,
}: KunturMascotProps) {
  const [blink, setBlink] = useState(false);
  const [yawn, setYawn] = useState(false);
  const [saccade, setSaccade] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  // Refs de las pupilas (actualizadas directo al DOM para evitar re-renders)
  const pupilL = useRef<SVGCircleElement>(null);
  const pupilR = useRef<SVGCircleElement>(null);
  const hiL = useRef<SVGCircleElement>(null);
  const hiR = useRef<SVGCircleElement>(null);

  const applyPupils = (dx: number, dy: number) => {
    const cdx = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx));
    const cdy = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy));
    pupilL.current?.setAttribute("cx", String(BASE_LX + cdx));
    pupilL.current?.setAttribute("cy", String(BASE_LY + cdy));
    pupilR.current?.setAttribute("cx", String(BASE_RX + cdx));
    pupilR.current?.setAttribute("cy", String(BASE_RY + cdy));
    hiL.current?.setAttribute("cx", String(BASE_LX + cdx + 2));
    hiL.current?.setAttribute("cy", String(BASE_LY + cdy - 2));
    hiR.current?.setAttribute("cx", String(BASE_RX + cdx + 2));
    hiR.current?.setAttribute("cy", String(BASE_RY + cdy - 2));
  };

  // --- Bucle de parpadeo ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 2000 + Math.random() * 3000;
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          loop();
        }, 140);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Parpadeo doble ocasional (gesto improvisado) ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 9000 + Math.random() * 13000;
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => {
              setBlink(false);
              loop();
            }, 120);
          }, 110);
        }, 120);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Bostezo repentino ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 18000 + Math.random() * 25000;
      t = setTimeout(() => {
        setYawn(true);
        setTimeout(() => {
          setYawn(false);
          loop();
        }, 2000);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Sacudidas de pupilas (mirar alrededor) cuando el ratón no está cerca ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 1400 + Math.random() * 2400;
      t = setTimeout(() => {
        if (!mousePos.current) {
          setSaccade({
            x: (Math.random() - 0.5) * 7,
            y: (Math.random() - 0.5) * 5,
          });
        }
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    applyPupils(saccade.x, saccade.y);
  }, [saccade]);

  // --- Seguimiento del ratón ---
  useEffect(() => {
    let raf = 0;
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.35; // nivel de los ojos
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 420) {
          mousePos.current = { x: dx, y: dy };
          const factor = Math.min(MAX_OFFSET, dist / 45);
          const mag = dist || 1;
          applyPupils((dx / mag) * factor, (dy / mag) * factor);
        } else {
          mousePos.current = null;
        }
      });
    };
    window.addEventListener("mousemove", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Inicializar pupilas
  useEffect(() => {
    applyPupils(0, 0);
  }, []);

  const speaking = !!speech;
  const isHappyEye = mood === "risa";
  const isWink = mood === "guino";
  const isHeart = mood === "enamorado";
  const showBlush =
    mood === "feliz" || mood === "timido" || mood === "enamorado" || mood === "risa";

  // Ángulo de cejas según mood
  const browAngle = (() => {
    switch (mood) {
      case "enojado":
        return { l: 20, r: -20 };
      case "triste":
        return { l: -18, r: 18 };
      case "sorprendido":
        return { l: 0, r: 0 };
      case "timido":
        return { l: -8, r: 8 };
      default:
        return { l: 0, r: 0 };
    }
  })();
  const browY = mood === "sorprendido" ? 45 : 50;
  const showBrows = mood === "enojado" || mood === "triste" || mood === "sorprendido" || mood === "timido";

  // Apertura de boca
  const mouthOpen = yawn
    ? 14
    : speaking
    ? 5
    : mood === "sorprendido"
    ? 7
    : mood === "risa"
    ? 8
    : 0;

  // Escala-Y de los ojos según estado
  const eyeScaleY = blink
    ? 0.1
    : isWink
    ? 1
    : yawn
    ? 0.3
    : mood === "triste"
    ? 0.72
    : mood === "sorprendido"
    ? 1.18
    : 1;

  return (
    <div ref={containerRef} className={`flex flex-col items-center ${className}`} style={{ width: size }}>
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
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 200 200" width={size} height={size} className="overflow-visible" role="img" aria-label={MOOD_ALT[mood]}>
          {/* Grupo cuerpo (respiración) */}
          <motion.g
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {/* Cuerpo */}
            <ellipse cx="100" cy="150" rx="52" ry="50" fill={DARK} stroke={OUTLINE} strokeWidth="2.5" />
            {/* Panza */}
            <ellipse cx="100" cy="163" rx="34" ry="30" fill={DARK_SHADOW} />
            {/* Alas */}
            <ellipse cx="50" cy="148" rx="13" ry="26" fill={DARK_SHADOW} stroke={OUTLINE} strokeWidth="2.5" transform="rotate(-12 50 148)" />
            <ellipse cx="150" cy="148" rx="13" ry="26" fill={DARK_SHADOW} stroke={OUTLINE} strokeWidth="2.5" transform="rotate(12 150 148)" />
            {/* Patas */}
            <ellipse cx="84" cy="196" rx="9" ry="4" fill={BEAK} stroke={OUTLINE} strokeWidth="2" />
            <ellipse cx="116" cy="196" rx="9" ry="4" fill={BEAK} stroke={OUTLINE} strokeWidth="2" />
          </motion.g>

          {/* Gola blanca (plumas del cuello) */}
          <g>
            <ellipse cx="100" cy="110" rx="48" ry="20" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="60" cy="108" r="10" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="140" cy="108" r="10" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="75" cy="118" r="9" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="125" cy="118" r="9" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
          </g>

          {/* Grupo cabeza (balanceo) */}
          <motion.g
            animate={{ rotate: yawn ? [-2, 4, -2] : [0, 1.8, 0, -1.8, 0] }}
            transition={{ duration: yawn ? 2 : 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
          >
            {/* Cabeza */}
            <circle cx="100" cy="72" r="40" fill={DARK} stroke={OUTLINE} strokeWidth="2.5" />

            {/* Rubor */}
            {showBlush && (
              <>
                <ellipse cx="71" cy="82" rx="7" ry="5" fill={BLUSH} opacity="0.55" />
                <ellipse cx="129" cy="82" rx="7" ry="5" fill={BLUSH} opacity="0.55" />
              </>
            )}

            {/* Cejas */}
            {showBrows && (
              <>
                <line
                  x1="76"
                  y1={browY}
                  x2="96"
                  y2={browY}
                  stroke={OUTLINE}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${browAngle.l} 86 ${browY})`}
                />
                <line
                  x1="104"
                  y1={browY}
                  x2="124"
                  y2={browY}
                  stroke={OUTLINE}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${browAngle.r} 114 ${browY})`}
                />
              </>
            )}

            {/* Ojos */}
            {isHappyEye ? (
              <>
                <path d="M76 70 Q86 60 96 70" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
                <path d="M104 70 Q114 60 124 70" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : isHeart ? (
              <>
                <path d="M86 61 C82 57 76 57 76 63 C76 67 86 74 86 74 C86 74 96 67 96 63 C96 57 90 57 86 61 Z" fill={HEART} stroke={OUTLINE} strokeWidth="2" />
                <path d="M114 61 C110 57 104 57 104 63 C104 67 114 74 114 74 C114 74 124 67 124 63 C124 57 118 57 114 61 Z" fill={HEART} stroke={OUTLINE} strokeWidth="2" />
              </>
            ) : (
              <>
                {/* Ojo izquierdo */}
                <motion.g
                  animate={{ scaleY: eyeScaleY }}
                  transition={{ duration: 0.08 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <circle cx="86" cy="68" r="12" fill={WHITE} stroke={OUTLINE} strokeWidth="2.5" />
                  <circle ref={pupilL} r="6.5" fill={PUPIL} />
                  <circle ref={hiL} r="2.2" fill={WHITE} />
                </motion.g>
                {/* Ojo derecho */}
                <motion.g
                  animate={{ scaleY: blink ? 0.1 : 1 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {isWink ? (
                    <path d="M104 68 Q114 64 124 68" fill="none" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />
                  ) : (
                    <>
                      <circle cx="114" cy="68" r="12" fill={WHITE} stroke={OUTLINE} strokeWidth="2.5" />
                      <circle ref={pupilR} r="6.5" fill={PUPIL} />
                      <circle ref={hiR} r="2.2" fill={WHITE} />
                    </>
                  )}
                </motion.g>
              </>
            )}

            {/* Pico */}
            <g>
              {/* Pico superior (gancho, fijo) */}
              <path
                d="M84 83 Q100 80 116 83 Q112 91 100 92 Q88 91 84 83 Z"
                fill={BEAK}
                stroke={OUTLINE}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Interior de la boca (cuando abierta) */}
              <motion.ellipse
                cx="100"
                cy={91}
                rx="8"
                ry={1}
                fill="#7a3a1a"
                animate={{
                  ry: speaking && !yawn ? [2, 7, 1, 6, 2] : yawn ? 10 : mouthOpen ? mouthOpen / 2 + 1 : 1,
                  cy: speaking && !yawn ? [91, 95, 91, 94, 91] : yawn ? 96 : 91,
                }}
                transition={
                  speaking && !yawn
                    ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.15 }
                }
              />
              {/* Pico inferior (mandíbula, se mueve) */}
              <motion.path
                d="M88 91 Q100 95 112 91 Q108 96 100 96 Q92 96 88 91 Z"
                fill={BEAK_DARK}
                stroke={OUTLINE}
                strokeWidth="2.5"
                strokeLinejoin="round"
                animate={{ y: speaking && !yawn ? [0, 7, 0, 6, 0] : mouthOpen }}
                transition={
                  speaking && !yawn
                    ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.15 }
                }
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              {/* Lengua (bostezo / risa) */}
              {(yawn || mood === "risa") && (
                <motion.ellipse
                  cx="100"
                  cy={96 + mouthOpen}
                  rx="5"
                  ry="3"
                  fill="#ef6b6b"
                  animate={{ cy: yawn ? 110 : 100 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </g>
          </motion.g>
        </svg>
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
