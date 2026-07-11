"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

// Motor de aprendizaje dinámico - genera ejercicios adaptativos
export interface DynamicExercise {
  type: "select" | "listen" | "speak" | "match" | "order";
  prompt: string;
  promptQuechua?: string;
  audio?: string;
  choices: string[];
  answer: string;
  hint?: string;
  emoji?: string;
}

// Generar ejercicios dinámicos a partir del vocabulario de la lección
export function generateDynamicExercises(vocab: { quechua: string; spanish: string; emoji?: string }[]): DynamicExercise[] {
  const exercises: DynamicExercise[] = [];

  // 1. Ejercicio de selección (¿Qué significa?)
  vocab.slice(0, 4).forEach((word) => {
    const distractors = vocab.filter((v) => v.spanish !== word.spanish).slice(0, 3).map((v) => v.spanish);
    const choices = [word.spanish, ...distractors].sort(() => Math.random() - 0.5);
    exercises.push({
      type: "select",
      prompt: `¿Qué significa "${word.quechua}"?`,
      promptQuechua: word.quechua,
      audio: word.quechua,
      emoji: word.emoji,
      choices,
      answer: word.spanish,
      hint: `Empieza con "${word.spanish[0]}"`,
    });
  });

  // 2. Ejercicio de escuchar (¿Qué escuchaste?)
  vocab.slice(0, 3).forEach((word) => {
    const distractors = vocab.filter((v) => v.quechua !== word.quechua).slice(0, 3).map((v) => v.spanish);
    const choices = [word.spanish, ...distractors].sort(() => Math.random() - 0.5);
    exercises.push({
      type: "listen",
      prompt: "¿Qué palabra escuchaste?",
      promptQuechua: word.quechua,
      audio: word.quechua,
      emoji: word.emoji,
      choices,
      answer: word.spanish,
      hint: `Es ${word.emoji || "una palabra"} en quechua`,
    });
  });

  // 3. Ejercicio de pronunciación
  vocab.slice(0, 3).forEach((word) => {
    exercises.push({
      type: "speak",
      prompt: `Pronuncia: "${word.quechua}"`,
      promptQuechua: word.quechua,
      audio: word.quechua,
      emoji: word.emoji,
      choices: [],
      answer: word.quechua,
      hint: `Significa: ${word.spanish}`,
    });
  });

  // 4. Ejercicio de traducción inversa (¿Cómo se dice en quechua?)
  vocab.slice(0, 3).forEach((word) => {
    const distractors = vocab.filter((v) => v.quechua !== word.quechua).slice(0, 3).map((v) => v.quechua);
    const choices = [word.quechua, ...distractors].sort(() => Math.random() - 0.5);
    exercises.push({
      type: "select",
      prompt: `¿Cómo se dice "${word.spanish}" en quechua?`,
      promptQuechua: word.spanish,
      audio: word.quechua,
      emoji: word.emoji,
      choices,
      answer: word.quechua,
      hint: `Empieza con "${word.quechua[0]}"`,
    });
  });

  return exercises.sort(() => Math.random() - 0.5);
}

// Hook para detectar pronunciación
export function usePronunciationDetector() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setResult(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback((targetWord: string) => {
    if (!recognitionRef.current) return;
    setResult("");
    setAccuracy(0);
    setIsCorrect(null);
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // Calcular precisión
  const checkAccuracy = useCallback((target: string, spoken: string): number => {
    const normalize = (s: string) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = normalize(target);
    const s = normalize(spoken);

    if (t === s) return 100;
    if (s.includes(t) || t.includes(s)) return 90;

    const words1 = t.split(" ");
    const words2 = s.split(" ");
    let matches = 0;
    for (const w of words1) {
      if (words2.some((w2) => w2.includes(w) || w.includes(w2))) matches++;
    }
    return Math.round((matches / Math.max(words1.length, words2.length)) * 100);
  }, []);

  return { listening, result, accuracy, isCorrect, startListening, stopListening, checkAccuracy };
}

// Hook para audio TTS (usa Web Speech API con voz andina)
export function useAudioSpeaker() {
  const speak = useCallback((text: string, lang: string = "es-ES") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.8; // Más lento para aprendizaje
    u.pitch = 1.1; // Tono ligeramente más alto (más amigable)
    const voices = window.speechSynthesis.getVoices();
    // Buscar voz en español, preferiblemente latinoamericano
    const es = voices.find((v) => v.lang.startsWith("es-PE")) ||
               voices.find((v) => v.lang.startsWith("es-MX")) ||
               voices.find((v) => v.lang.startsWith("es-US")) ||
               voices.find((v) => v.lang.startsWith("es"));
    if (es) u.voice = es;
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}

// Componente de ejercicio de pronunciación
export function PronunciationExercise({ target, onResult }: {
  target: string;
  onResult: (correct: boolean, accuracy: number) => void;
}) {
  const { listening, result, startListening, stopListening, checkAccuracy } = usePronunciationDetector();
  const { speak } = useAudioSpeaker();
  const [accuracy, setAccuracy] = useState(0);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    const acc = checkAccuracy(target, result);
    setAccuracy(acc);
    setChecked(true);
    onResult(acc >= 60, acc);
  };

  return (
    <div className="bg-gradient-to-br from-duo-orange/10 to-amber-500/10 rounded-2xl p-6 border-2 border-duo-orange/30">
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Pronuncia en voz alta</p>
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => speak(target, "es-PE")}
            className="w-12 h-12 rounded-full bg-duo-blue text-white flex items-center justify-center hover:opacity-90"
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <span className="text-2xl font-extrabold text-duo-blue">{target}</span>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={listening ? stopListening : () => startListening(target)}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
            listening ? "bg-duo-red text-white" : "bg-duo-blue text-white"
          }`}
        >
          {listening && (
            <motion.span
              className="absolute inset-0 rounded-full bg-duo-red"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {listening ? <MicOff className="w-8 h-8 relative z-10" /> : <Mic className="w-8 h-8 relative z-10" />}
        </motion.button>
      </div>

      <div className="text-center min-h-[24px] mb-3">
        {listening && <p className="text-sm font-bold text-duo-red animate-pulse">🎙️ Escuchando...</p>}
        {result && !listening && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
            checked
              ? accuracy >= 60 ? "bg-duo-green/15 text-duo-green" : "bg-duo-red/15 text-duo-red"
              : "bg-muted"
          }`}>
            {checked && (accuracy >= 60 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />)}
            {checked ? `Precisión: ${accuracy}%` : `"${result}"`}
          </div>
        )}
      </div>

      {result && !checked && (
        <button onClick={handleCheck} className="duo-btn duo-btn-primary w-full">
          Comprobar pronunciación
        </button>
      )}
    </div>
  );
}
