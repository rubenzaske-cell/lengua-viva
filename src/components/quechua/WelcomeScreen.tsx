"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  onContinue: () => void;
}

function usePeruvianSong(active: boolean) {
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!active) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1);
    masterGain.connect(ctx.destination);
    const melody = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00, 392.00, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00, 392.00, 329.63, 293.66, 329.63, 392.00];
    const noteDur = 0.28;
    const loopLen = melody.length * noteDur;
    const playQuena = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const osc2 = ctx.createOscillator(); osc2.type = "triangle"; osc2.frequency.value = freq * 1.5;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 2800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.08); gain.gain.linearRampToValueAtTime(0, startTime + duration);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, startTime); gain2.gain.linearRampToValueAtTime(0.05, startTime + 0.03);
      gain2.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.connect(gain); osc2.connect(gain2); gain.connect(filter); gain2.connect(filter); filter.connect(masterGain);
      osc.start(startTime); osc.stop(startTime + duration); osc2.start(startTime); osc2.stop(startTime + duration);
    };
    const playBombo = (startTime: number) => {
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(100, startTime); osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.12);
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);
      osc.connect(gain); gain.connect(masterGain); osc.start(startTime); osc.stop(startTime + 0.18);
    };
    const playCharango = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1600;
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.04, startTime + 0.01); gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
      osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
      osc.start(startTime); osc.stop(startTime + 0.12);
    };
    for (let i = 0; i < 10; i++) {
      const loopStart = ctx.currentTime + i * loopLen;
      melody.forEach((freq, idx) => playQuena(freq, loopStart + idx * noteDur, noteDur * 0.9));
      [0, 2, 4, 6, 8, 10, 14, 16, 18, 20, 22].forEach(b => playBombo(loopStart + b * noteDur));
      const chords = [164.81, 196.00, 246.94, 329.63];
      for (let b = 0; b < melody.length; b++) playCharango(chords[b % chords.length], loopStart + b * noteDur);
    }
    stopRef.current = () => { try { masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); setTimeout(() => ctx.close(), 500); } catch {} };
    return () => { stopRef.current?.(); };
  }, [active]);
  return stopRef;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [musicActive, setMusicActive] = useState(false);
  usePeruvianSong(musicActive);

  useEffect(() => {
    const unlock = () => {
      videoRef.current?.play().catch(() => {});
      setMusicActive(true);
      const audio = new Audio("/kuntur/trailer-narration.mp3");
      audio.volume = 0.9;
      audio.loop = true; // El audio se repite en bucle hasta que el usuario presione "Comenzar aventura"
      audio.play().then(() => setAudioPlaying(true)).catch(() => {});
      audioRef.current = audio;
      window.removeEventListener("click", unlock); window.removeEventListener("touchstart", unlock); window.removeEventListener("keydown", unlock);
    };
    const tryAuto = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
      setMusicActive(true);
      const audio = new Audio("/kuntur/trailer-narration.mp3");
      audio.volume = 0.9;
      audio.loop = true; // Bucle infinito
      audio.play().then(() => setAudioPlaying(true)).catch(() => {
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
      });
      audioRef.current = audio;
    }, 200);
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      clearTimeout(tryAuto);
      window.removeEventListener("click", unlock); window.removeEventListener("touchstart", unlock); window.removeEventListener("keydown", unlock);
      audioRef.current?.pause(); setMusicActive(false);
    };
  }, []);

  // El botón aparece después de la primera reproducción del audio
  useEffect(() => {
    if (skipped) return;
    const timer = setTimeout(() => setShowButton(true), 15000);
    return () => clearTimeout(timer);
  }, [skipped]);

  // Al presionar "Comenzar aventura" o "Saltar intro": cortar el audio y continuar
  const handleSkip = () => {
    setSkipped(true);
    audioRef.current?.pause(); // Cortar el audio inmediatamente
    setMusicActive(false); // Detener la música andina también
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Video en PANTALLA COMPLETA — llena todo el viewport sin barras */}
      <video ref={videoRef} src="/kuntur/kuntur-trailer.mp4" autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover" />
      {/* Overlay sutil para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-tight">Lengua Viva</h1>
        <p className="text-lg font-bold text-white/90 drop-shadow-lg mt-1">Lenguas del Perú, vivas para siempre</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: audioPlaying ? 0.8 : 0 }}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 text-white/80 text-xs font-bold">
        <span className="flex gap-0.5 items-end">
          <span className="w-1 h-2 bg-white/80 rounded-full animate-pulse" />
          <span className="w-1 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="w-1 h-4 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          <span className="w-1 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: "450ms" }} />
        </span>♪
      </motion.div>
      <AnimatePresence>
        {showButton && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
            <motion.button onClick={handleSkip} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="duo-btn duo-btn-primary text-lg px-10 py-4 shadow-2xl">🚀 Comenzar mi aventura</motion.button>
            <p className="text-white/70 text-xs font-bold drop-shadow">Toca para crear tu perfil</p>
          </motion.div>
        )}
      </AnimatePresence>
      {!showButton && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} onClick={handleSkip}
          className="absolute bottom-6 right-6 z-10 text-white/70 text-xs font-bold drop-shadow hover:text-white transition-colors">Saltar intro →</motion.button>
      )}
    </div>
  );
}
