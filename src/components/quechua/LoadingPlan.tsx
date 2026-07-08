"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingPlanProps {
  onComplete: () => void;
}

function useAndeanMusic(active: boolean) {
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!active) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);
    const notes = [440, 523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25];
    const noteDuration = 0.5;
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = "triangle"; osc2.frequency.value = freq * 2;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 2200; filter.Q.value = 2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.1); gain.gain.setValueAtTime(0.25, startTime + duration - 0.15);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, startTime); gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain2.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.connect(gain); osc2.connect(gain2); gain.connect(filter); gain2.connect(filter); filter.connect(masterGain);
      osc.start(startTime); osc.stop(startTime + duration); osc2.start(startTime); osc2.stop(startTime + duration);
    };
    const droneOsc = ctx.createOscillator(); droneOsc.type = "sine"; droneOsc.frequency.value = 110;
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, ctx.currentTime); droneGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
    droneOsc.connect(droneGain); droneGain.connect(masterGain); droneOsc.start();
    for (let i = 0; i < 5; i++) {
      notes.forEach((freq, idx) => playNote(freq, ctx.currentTime + i * notes.length * noteDuration + idx * noteDuration, noteDuration * 0.95));
    }
    stopRef.current = () => { try { masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); setTimeout(() => { droneOsc.stop(); ctx.close(); }, 400); } catch {} };
    return () => { stopRef.current?.(); };
  }, [active]);
  return stopRef;
}

function useHuaynoMusic(active: boolean) {
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!active) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
    masterGain.connect(ctx.destination);
    const melody = [659.25, 739.99, 830.61, 987.77, 1108.73, 1318.51, 1108.73, 987.77, 830.61, 739.99];
    const noteDur = 0.22;
    const loopLen = melody.length * noteDur;
    const playMelodyNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 3000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05); gain.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
      osc.start(startTime); osc.stop(startTime + duration);
    };
    const playBombo = (startTime: number) => {
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(120, startTime); osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      osc.connect(gain); gain.connect(masterGain); osc.start(startTime); osc.stop(startTime + 0.15);
    };
    const playCharango = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1800;
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.01); gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
      osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
      osc.start(startTime); osc.stop(startTime + 0.15);
    };
    for (let i = 0; i < 8; i++) {
      const loopStart = ctx.currentTime + i * loopLen;
      melody.forEach((freq, idx) => playMelodyNote(freq, loopStart + idx * noteDur, noteDur * 0.9));
      playBombo(loopStart); playBombo(loopStart + noteDur * 2); playBombo(loopStart + noteDur * 4); playBombo(loopStart + noteDur * 6);
      const charangoChords = [329.63, 415.30, 493.88, 659.25];
      for (let b = 0; b < 10; b++) playCharango(charangoChords[b % charangoChords.length], loopStart + b * noteDur);
    }
    stopRef.current = () => { try { masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); setTimeout(() => ctx.close(), 400); } catch {} };
    return () => { stopRef.current?.(); };
  }, [active]);
  return stopRef;
}

const BENEFITS = [
  { emoji: "🗣️", title: "Hablar quechua", desc: "Conversa con comunidades andinas" },
  { emoji: "🧠", title: "Mejora tu memoria", desc: "Ejercita tu cerebro cada día" },
  { emoji: "🦙", title: "Conecta con tus raíces", desc: "Recupera la lengua de los abuelos" },
  { emoji: "🏆", title: "Sube de nivel", desc: "Gana quipus, coronas y logros" },
  { emoji: "🔥", title: "Mantén tu racha", desc: "Practica diario y no la rompas" },
  { emoji: "⚡", title: "Aprende a tu ritmo", desc: "Lecciones cortas y divertidas" },
];

export function LoadingPlan({ onComplete }: LoadingPlanProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "celebration">("loading");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const completedRef = useRef(false);
  useAndeanMusic(audioUnlocked && phase === "loading");
  useHuaynoMusic(audioUnlocked && phase === "celebration");

  const LOADING_DURATION = 15000;
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;
    const start = Date.now();
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / LOADING_DURATION) * 100);
      setProgress(pct);
      if (pct < 100) { requestAnimationFrame(tick); }
      else { setTimeout(() => { if (!cancelled && !completedRef.current) { completedRef.current = true; setPhase("celebration"); } }, 500); }
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [phase]);

  useEffect(() => {
    const unlock = () => { setAudioUnlocked(true); window.removeEventListener("click", unlock); window.removeEventListener("touchstart", unlock); window.removeEventListener("keydown", unlock); };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    setTimeout(() => setAudioUnlocked(true), 100);
    return () => { window.removeEventListener("click", unlock); window.removeEventListener("touchstart", unlock); window.removeEventListener("keydown", unlock); };
  }, []);

  const message = (() => {
    if (progress < 15) return "Tejiendo tu quipu personalizado...";
    if (progress < 30) return "Preparando tus lecciones de quechua...";
    if (progress < 50) return "Cargando vocabulario andino...";
    if (progress < 70) return "Ajustando el ritmo a tu estilo...";
    if (progress < 90) return "Últimos retoques...";
    if (progress < 100) return "Casi listo...";
    return "¡Listo!";
  })();

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
        <video src="/kuntur/kuntur-loading.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-extrabold text-white text-center mb-2 drop-shadow-lg">Creando tu plan de Quechua</motion.h1>
          <motion.p key={message} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-white/90 mb-8 text-center min-h-[20px] drop-shadow">{message}</motion.p>
          <div className="w-full max-w-sm">
            <div className="h-5 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/40 shadow-xl">
              <motion.div className="h-full bg-gradient-to-r from-duo-green via-duo-yellow to-duo-orange rounded-full relative" style={{ width: `${progress}%` }} transition={{ ease: "linear" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-bold text-white/80 drop-shadow">Cargando tu plan...</span>
              <span className="text-xs font-extrabold text-white drop-shadow">{Math.round(progress)}%</span>
            </div>
          </div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mt-8 drop-shadow-lg">🦙</motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-duo-green/20 via-background to-duo-blue/15 flex flex-col items-center justify-center overflow-y-auto px-4 py-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} className="absolute text-2xl" initial={{ x: `${Math.random() * 100}%`, y: -50, rotate: 0, opacity: 0 }}
            animate={{ y: typeof window !== "undefined" ? window.innerHeight + 50 : 800, rotate: 360, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }}>
            {["🎉", "🎊", "✨", "🎋", "☀️", "🦙"][i % 6]}
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="shrink-0 w-full max-w-[280px] aspect-square">
          <video src="/kuntur/kuntur-celebration.webm" autoPlay loop muted playsInline className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 w-full">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl sm:text-3xl font-extrabold text-duo-green mb-1 text-center md:text-left">¡Tu plan está listo! 🎉</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm font-bold text-muted-foreground mb-4 text-center md:text-left">Esto es lo que lograrás en tu curso de Quechua:</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BENEFITS.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-2.5 bg-card border-2 border-duo-green/20 rounded-xl p-2.5">
                <span className="text-2xl shrink-0">{b.emoji}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-foreground leading-tight">{b.title}</div>
                  <div className="text-xs text-muted-foreground font-semibold leading-tight">{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-5 flex justify-center md:justify-start">
            <button onClick={onComplete} className="duo-btn duo-btn-primary text-lg px-10 py-4 animate-pop-in">🚀 Comenzar aventura</button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
