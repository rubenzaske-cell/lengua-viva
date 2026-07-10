"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook para generar y reproducir audio TTS (Text-to-Speech)
 * Usa el endpoint /api/tts que genera audio con Z.ai
 */
export function useTTS() {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const speak = useCallback(async (text: string, voice?: string) => {
    if (!text.trim()) return;

    // DETENER todo audio anterior inmediatamente
    // 1. Detener audio HTML5
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // 2. Detener Web Speech API si está activa
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);

    setLoading(true);

    try {
      // Verificar cache
      const cacheKey = `${text}-${voice || "default"}`;
      let audioUrl = cacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
        });

        if (!response.ok) {
          throw new Error("TTS failed");
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        cacheRef.current.set(cacheKey, audioUrl);
      }

      // Verificar que no se haya iniciado otro speak mientras se generaba
      // Si audioRef.current ya tiene algo, significa que otro speak() empezó
      if (audioRef.current) {
        // Otro speak started, abortar
        setLoading(false);
        return;
      }

      // Reproducir audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setPlaying(true);
      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback: usar Web Speech API del navegador
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          // Cancelar cualquier síntesis anterior
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-PE";
          utterance.rate = 0.85;
          utterance.onend = () => setPlaying(false);
          utterance.onerror = () => setPlaying(false);
          window.speechSynthesis.speak(utterance);
          setPlaying(true);
        }
      } catch {
        // Si todo falla, silencio
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  return { speak, stop, loading, playing };
}
