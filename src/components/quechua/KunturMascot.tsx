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
  writing?: boolean;
  writingKey?: number;
  /** Mensaje motivador personalizado que se muestra mientras Kuntur escribe */
  writingMessage?: string;
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

function useTypewriter(text: string | undefined, enabled: boolean) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!enabled || !text) { setDisplayed(text ?? ""); setTyping(false); return; }
    let i = 0; let cancelled = false;
    setDisplayed(""); setTyping(true);
    const typeNext = () => {
      if (cancelled) return;
      if (i <= text.length) { setDisplayed(text.slice(0, i)); i++; setTimeout(typeNext, 35 + Math.random() * 20); }
      else { setTyping(false); }
    };
    const startTimer = setTimeout(typeNext, 300);
    return () => { cancelled = true; clearTimeout(startTimer); };
  }, [text, enabled]);
  return { text: displayed, typing };
}

export function KunturMascot({
  mood = "feliz", size = 120, className = "", animate = true, speech,
  writing = false, writingKey = 0, writingMessage, onWritingComplete,
}: KunturMascotProps) {
  const idleRef = useRef<HTMLVideoElement>(null);
  const writingRef = useRef<HTMLVideoElement>(null);
  const { text: typedText, typing } = useTypewriter(speech, !!speech && !writing);

  // El video idle se reproduce solo una vez al montar (NO se reinicia al cambiar props)
  useEffect(() => { idleRef.current?.play().catch(() => {}); }, []);
  useEffect(() => {
    const v = writingRef.current; if (!v) return;
    if (writing) { v.currentTime = 0; v.play().catch(() => {}); }
  }, [writing, writingKey]);

  useEffect(() => {
    if (!writing) return;
    const timer = setTimeout(() => { onWritingComplete?.(); }, 4000);
    return () => clearTimeout(timer);
  }, [writing, writingKey, onWritingComplete]);

  const boxSize = size;
  const msg = writingMessage || "Tejiendo tu plan...";

  return (
    <div className={className} style={{ position: "relative", width: boxSize, height: boxSize }}>
      {/* Video de Kuntur */}
      <video ref={idleRef} src="/kuntur/kuntur-asking-combined.webm" loop muted playsInline
        className="absolute inset-0 w-full h-full object-contain"
        style={{ pointerEvents: "none", opacity: writing ? 0 : 1, transition: "opacity 0.15s ease" }}
        aria-label={MOOD_ALT[mood]} />
      <video ref={writingRef} src="/kuntur/kuntur-writing.webm" muted playsInline
        className="absolute inset-0 w-full h-full object-contain"
        style={{ pointerEvents: "none", opacity: writing ? 1 : 0, transition: "opacity 0.15s ease" }}
        aria-hidden={!writing} />

      {/* Burbuja NEGRA — al costado derecho de la cabeza de Kuntur (siempre igual) */}
      {writing ? (
        <div className="absolute z-20" style={{ top: "3%", left: "70%", width: "220px" }}>
          <div className="relative min-h-[40px] bg-black rounded-2xl rounded-l-md px-4 py-2.5 text-sm font-extrabold text-white text-center shadow-lg flex items-center justify-center gap-1.5">
            <span className="absolute bottom-[10px] left-[-12px] w-0 h-0
              border-t-[8px] border-t-transparent
              border-b-[8px] border-b-transparent
              border-r-[14px] border-r-black" />
            <span>{msg}</span>
            <span className="flex gap-0.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>
      ) : speech ? (
        <div className="absolute z-20" style={{ top: "3%", left: "70%", width: "220px" }}>
          <div className="relative min-h-[40px] bg-black rounded-2xl rounded-l-md px-4 py-2.5 text-sm font-extrabold text-white text-center shadow-lg flex items-center justify-center">
            <span className="absolute bottom-[10px] left-[-12px] w-0 h-0
              border-t-[8px] border-t-transparent
              border-b-[8px] border-b-transparent
              border-r-[14px] border-r-black" />
            <span>{typedText}{typing && <span className="inline-block w-[2px] h-4 bg-white ml-0.5 align-middle animate-pulse" />}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const KUNTUR_PHRASES = {
  greeting: ["¡Allinllachu! Soy Kuntur 🦅", "¡Listo para aprender lenguas del Perú?", "¡Vamos a volar juntos!", "Sumaq p'unchaw — ¡buen día!"],
  correct: ["¡Sumaq! ¡Muy bien!", "¡Rikuypuni! ¡Increíble!", "¡Allin! ¡Perfecto!", "¡Sigue así!"],
  wrong: ["¡No te rindas!", "Casi... ¡inténtalo otra vez!", "Tranquilo, se aprende del error", "¡Tú puedes!"],
  streak: ["¡Tu racha arde! 🔥", "¡Imparable!", "¡Eres fuego!"],
  encourage: ["¡La práctica hace al maestro!", "Poco a poco se llega lejos", "Cada palabra cuenta"],
  startLesson: ["¡A practicar!", "¡Vamos!", "¡Tú puedes!"],
  perfect: ["¡Impecable! Sin errores 🏆", "¡Eres un crack!", "¡Perfecto!"],
};

export function randomPhrase(category: keyof typeof KUNTUR_PHRASES): string {
  const list = KUNTUR_PHRASES[category];
  return list[Math.floor(Math.random() * list.length)];
}
