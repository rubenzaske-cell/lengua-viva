"use client";

// Versión SVG animada de Kuntur (alternativa al video).
// El componente principal KunturMascot usa el video del estudio.
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

// Paleta — diseño del estudio
const BODY = "#2a2a3a";           // cuerpo gris azulado oscuro
const BODY_DARK = "#1f1f2e";      // sombra cuerpo
const OUTLINE = "#15151f";        // contorno muy oscuro
const HEAD = "#ffd5c4";           // cabeza rosa/piel
const HEAD_SHADOW = "#f5b8a8";    // sombra cabeza
const RUFF = "#ffffff";           // gola blanca
const BEAK = "#ffc107";           // pico amarillo
const BEAK_LIGHT = "#ffe066";     // brillo del pico
const BEAK_DARK = "#d99a00";      // sombra pico
const MOUTH = "#7a3a1a";          // interior boca
const TONGUE = "#ef6b6b";         // lengua
const PUPIL = "#000000";          // pupilas negras
const WHITE = "#ffffff";
const BLUSH = "#ff9aa8";          // rubor rosa
const HEART = "#ef4444";          // corazón rojo
const FOOT = "#ff8c1a";           // patas naranja
const FOOT_DARK = "#cc6600";      // sombra patas

// Colores del chullo andino
const CHULLO_BASE = "#d63031";    // rojo base
const CHULLO_BAND1 = "#fdcb6e";   // amarillo
const CHULLO_BAND2 = "#0984e3";   // azul
const CHULLO_BAND3 = "#00b894";   // verde
const CHULLO_BAND4 = "#fd79a8";   // rosa
const CHULLO_RIM = "#6c5ce7";     // borde morado
const POMPOM = "#ffeaa7";         // pompón amarillo claro
const TASSEL = "#fd79a8";         // borlas rosa

// Posiciones de pupilas (ojos grandes buggy)
const BASE_LX = 80, BASE_LY = 72;
const BASE_RX = 120, BASE_RY = 72;
const EYE_R = 16;     // radio del ojo blanco (grande)
const PUPIL_R = 10;   // radio de la pupila
const MAX_OFFSET = 5;

export function KunturMascotSVG({
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
    hiL.current?.setAttribute("cx", String(BASE_LX + cdx + 3));
    hiL.current?.setAttribute("cy", String(BASE_LY + cdy - 3));
    hiR.current?.setAttribute("cx", String(BASE_RX + cdx + 3));
    hiR.current?.setAttribute("cy", String(BASE_RY + cdy - 3));
  };

  // --- Parpadeo ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 2000 + Math.random() * 3000;
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); loop(); }, 140);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Parpadeo doble ---
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
            setTimeout(() => { setBlink(false); loop(); }, 120);
          }, 110);
        }, 120);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Bostezo ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 18000 + Math.random() * 25000;
      t = setTimeout(() => {
        setYawn(true);
        setTimeout(() => { setYawn(false); loop(); }, 2000);
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // --- Sacudidas ---
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = 1400 + Math.random() * 2400;
      t = setTimeout(() => {
        if (!mousePos.current) {
          setSaccade({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 6 });
        }
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { applyPupils(saccade.x, saccade.y); }, [saccade]);

  // --- Seguimiento del ratón ---
  useEffect(() => {
    let raf = 0;
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.35;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 420) {
          mousePos.current = { x: dx, y: dy };
          const factor = Math.min(MAX_OFFSET, dist / 42);
          const mag = dist || 1;
          applyPupils((dx / mag) * factor, (dy / mag) * factor);
        } else {
          mousePos.current = null;
        }
      });
    };
    window.addEventListener("mousemove", handler);
    return () => { window.removeEventListener("mousemove", handler); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { applyPupils(0, 0); }, []);

  const speaking = !!speech;
  const isHappyEye = mood === "risa";
  const isWink = mood === "guino";
  const isHeart = mood === "enamorado";
  const showBlush = mood === "feliz" || mood === "timido" || mood === "enamorado" || mood === "risa";

  const browAngle = (() => {
    switch (mood) {
      case "enojado": return { l: 22, r: -22 };
      case "triste": return { l: -20, r: 20 };
      case "sorprendido": return { l: 0, r: 0 };
      case "timido": return { l: -8, r: 8 };
      default: return { l: 0, r: 0 };
    }
  })();
  const browY = mood === "sorprendido" ? 46 : 52;
  const showBrows = mood === "enojado" || mood === "triste" || mood === "sorprendido" || mood === "timido";

  const mouthOpen = yawn ? 16 : speaking ? 6 : mood === "sorprendido" ? 8 : mood === "risa" ? 10 : 0;
  const eyeScaleY = blink ? 0.08 : isWink ? 1 : yawn ? 0.3 : mood === "triste" ? 0.72 : mood === "sorprendido" ? 1.18 : 1;

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
        <svg viewBox="0 0 200 220" width={size} height={size * 1.1} className="overflow-visible" role="img" aria-label={MOOD_ALT[mood]}>
          {/* === CUERPO (respiración) === */}
          <motion.g
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {/* Cuerpo */}
            <ellipse cx="100" cy="160" rx="55" ry="52" fill={BODY} stroke={OUTLINE} strokeWidth="3" />
            {/* Panza */}
            <ellipse cx="100" cy="178" rx="36" ry="32" fill={BODY_DARK} />
            {/* Ala izquierda */}
            <path d="M48 145 Q38 165 45 190 Q52 195 58 187 Q55 165 60 150 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
            {/* Ala derecha */}
            <path d="M152 145 Q162 165 155 190 Q148 195 142 187 Q145 165 140 150 Z" fill={BODY_DARK} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
            {/* Pata izquierda — 3 dedos */}
            <g>
              <ellipse cx="82" cy="209" rx="11" ry="5" fill={FOOT} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx="76" cy="209" r="2.5" fill={FOOT_DARK} />
              <circle cx="82" cy="209" r="2.5" fill={FOOT_DARK} />
              <circle cx="88" cy="209" r="2.5" fill={FOOT_DARK} />
            </g>
            {/* Pata derecha — 3 dedos */}
            <g>
              <ellipse cx="118" cy="209" rx="11" ry="5" fill={FOOT} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx="112" cy="209" r="2.5" fill={FOOT_DARK} />
              <circle cx="118" cy="209" r="2.5" fill={FOOT_DARK} />
              <circle cx="124" cy="209" r="2.5" fill={FOOT_DARK} />
            </g>
          </motion.g>

          {/* === GOLA BLANCA ESCALONADA === */}
          <g>
            <path
              d="M55 123 Q60 110 70 111 Q75 103 85 105 Q92 99 100 103 Q108 99 115 105 Q125 103 130 111 Q140 110 145 123 Q148 135 140 139 Q130 143 120 140 Q110 143 100 141 Q90 143 80 140 Q70 143 60 139 Q52 135 55 123 Z"
              fill={RUFF}
              stroke={OUTLINE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="62" cy="119" r="8" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="78" cy="113" r="8" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="100" cy="110" r="9" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="122" cy="113" r="8" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
            <circle cx="138" cy="119" r="8" fill={RUFF} stroke={OUTLINE} strokeWidth="2.5" />
          </g>

          {/* === CABEZA + CHULLO (balanceo) === */}
          <motion.g
            animate={{ rotate: yawn ? [-2, 4, -2] : [0, 1.8, 0, -1.8, 0] }}
            transition={{ duration: yawn ? 2 : 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
          >
            {/* === CHULLO ANDINO (detrás de la cabeza) === */}
            <g>
              {/* Cuerpo del chullo — más grande y puntiagudo */}
              <path
                d="M50 50 Q48 15 75 6 Q100 -2 125 6 Q152 15 150 50 Z"
                fill={CHULLO_BASE}
                stroke={OUTLINE}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Banda superior — azul */}
              <path d="M54 18 Q100 12 146 18 L146 26 Q100 20 54 26 Z" fill={CHULLO_BAND2} />
              {/* Banda media — verde */}
              <path d="M52 28 Q100 22 148 28 L148 36 Q100 30 52 36 Z" fill={CHULLO_BAND3} />
              {/* Banda de triángulos geométricos — colores alternados */}
              <g>
                <path d="M55 46 L61 36 L67 46 Z" fill={CHULLO_BAND1} />
                <path d="M67 46 L73 36 L79 46 Z" fill={CHULLO_BAND4} />
                <path d="M79 46 L85 36 L91 46 Z" fill={CHULLO_BAND1} />
                <path d="M91 46 L97 36 L103 46 Z" fill={CHULLO_BAND4} />
                <path d="M103 46 L109 36 L115 46 Z" fill={CHULLO_BAND1} />
                <path d="M115 46 L121 36 L127 46 Z" fill={CHULLO_BAND4} />
                <path d="M127 46 L133 36 L139 46 Z" fill={CHULLO_BAND1} />
                <path d="M139 46 L145 36 L148 46 Z" fill={CHULLO_BAND4} />
              </g>
              {/* Borde inferior (vueltas del chullo) — morado */}
              <ellipse cx="100" cy="48" rx="51" ry="6" fill={CHULLO_RIM} stroke={OUTLINE} strokeWidth="2.5" />
              {/* Pompón arriba — grande y amarillo */}
              <circle cx="100" cy="4" r="8" fill={POMPOM} stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx="97" cy="2" r="2.5" fill={WHITE} opacity="0.7" />
              {/* Borlas laterales largas */}
              <g>
                <line x1="50" y1="48" x2="44" y2="68" stroke={OUTLINE} strokeWidth="2" />
                <circle cx="43" cy="70" r="5" fill={TASSEL} stroke={OUTLINE} strokeWidth="2" />
                <line x1="41" y1="74" x2="39" y2="84" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
                <line x1="44" y1="74" x2="44" y2="85" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
                <line x1="47" y1="74" x2="49" y2="84" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
              </g>
              <g>
                <line x1="150" y1="48" x2="156" y2="68" stroke={OUTLINE} strokeWidth="2" />
                <circle cx="157" cy="70" r="5" fill={TASSEL} stroke={OUTLINE} strokeWidth="2" />
                <line x1="153" y1="74" x2="151" y2="84" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
                <line x1="156" y1="74" x2="156" y2="85" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
                <line x1="159" y1="74" x2="161" y2="84" stroke={TASSEL} strokeWidth="2.5" stroke-linecap="round" />
              </g>
            </g>

            {/* === CABEZA ROSA === */}
            <circle cx="100" cy="78" r="42" fill={HEAD} stroke={OUTLINE} strokeWidth="3" />
            {/* Sombra inferior de la cabeza */}
            <ellipse cx="100" cy="108" rx="38" ry="8" fill={HEAD_SHADOW} opacity="0.4" />

            {/* Rubor */}
            {showBlush && (
              <>
                <ellipse cx="66" cy="92" rx="12" ry="8" fill={BLUSH} opacity="0.7" />
                <ellipse cx="134" cy="92" rx="12" ry="8" fill={BLUSH} opacity="0.7" />
              </>
            )}

            {/* Cejas */}
            {showBrows && (
              <>
                <line x1="64" y1={browY} x2="96" y2={browY} stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${browAngle.l} 80 ${browY})`} />
                <line x1="104" y1={browY} x2="136" y2={browY} stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${browAngle.r} 120 ${browY})`} />
              </>
            )}

            {/* === OJOS GRANDES BUGGY === */}
            {isHappyEye ? (
              <>
                <path d="M64 78 Q80 62 96 78" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
                <path d="M104 78 Q120 62 136 78" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
              </>
            ) : isHeart ? (
              <>
                <path d="M80 66 C75 60 67 62 67 70 C67 76 80 88 80 88 C80 88 93 76 93 70 C93 62 85 60 80 66 Z" fill={HEART} stroke={OUTLINE} strokeWidth="2.5" />
                <path d="M120 66 C115 60 107 62 107 70 C107 76 120 88 120 88 C120 88 133 76 133 70 C133 62 125 60 120 66 Z" fill={HEART} stroke={OUTLINE} strokeWidth="2.5" />
                <ellipse cx="74" cy="68" rx="2" ry="1.5" fill={WHITE} opacity="0.8" />
                <ellipse cx="114" cy="68" rx="2" ry="1.5" fill={WHITE} opacity="0.8" />
              </>
            ) : (
              <>
                {/* Ojo izquierdo */}
                <motion.g
                  animate={{ scaleY: eyeScaleY }}
                  transition={{ duration: 0.08 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  <circle cx={BASE_LX} cy={BASE_LY} r={EYE_R} fill={WHITE} stroke={OUTLINE} strokeWidth="2.5" />
                  <circle ref={pupilL} r={PUPIL_R} fill={PUPIL} />
                  <circle ref={hiL} r="3.5" fill={WHITE} />
                  <circle cx={BASE_LX - 5} cy={BASE_LY + 5} r="2" fill={WHITE} opacity="0.6" />
                </motion.g>
                {/* Ojo derecho */}
                <motion.g
                  animate={{ scaleY: blink ? 0.08 : 1 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {isWink ? (
                    <path d="M104 76 Q120 70 136 76" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
                  ) : (
                    <>
                      <circle cx={BASE_RX} cy={BASE_RY} r={EYE_R} fill={WHITE} stroke={OUTLINE} strokeWidth="2.5" />
                      <circle ref={pupilR} r={PUPIL_R} fill={PUPIL} />
                      <circle ref={hiR} r="3.5" fill={WHITE} />
                      <circle cx={BASE_RX - 5} cy={BASE_RY + 5} r="2" fill={WHITE} opacity="0.6" />
                    </>
                  )}
                </motion.g>
              </>
            )}

            {/* === PICO === */}
            <g>
              {/* Pico superior */}
              <path
                d="M82 90 Q100 86 118 90 Q114 100 100 101 Q86 100 82 90 Z"
                fill={BEAK}
                stroke={OUTLINE}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Brillo del pico */}
              <ellipse cx="92" cy="92" rx="6" ry="2" fill={BEAK_LIGHT} opacity="0.7" />

              {/* Interior de la boca */}
              <motion.ellipse
                cx="100"
                cy={99}
                rx="10"
                ry={1.5}
                fill={MOUTH}
                animate={{
                  ry: speaking && !yawn ? [2, 9, 1, 8, 2] : yawn ? 13 : mouthOpen ? mouthOpen / 2 + 1 : 1.5,
                  cy: speaking && !yawn ? [99, 103, 99, 102, 99] : yawn ? 104 : 99,
                }}
                transition={speaking && !yawn ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
              />
              {/* Pico inferior móvil */}
              <motion.path
                d="M86 99 Q100 104 114 99 Q110 105 100 105 Q90 105 86 99 Z"
                fill={BEAK_DARK}
                stroke={OUTLINE}
                strokeWidth="2.5"
                strokeLinejoin="round"
                animate={{ y: speaking && !yawn ? [0, 9, 0, 8, 0] : mouthOpen }}
                transition={speaking && !yawn ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              {/* Lengua */}
              {(yawn || mood === "risa") && (
                <motion.ellipse
                  cx="100"
                  cy={104 + mouthOpen}
                  rx="6"
                  ry="4"
                  fill={TONGUE}
                  animate={{ cy: yawn ? 120 : 109 }}
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
