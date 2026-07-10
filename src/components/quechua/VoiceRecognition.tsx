"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Check, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecognitionProps {
  palabraEsperada: string;
  onResult: (correcto: boolean, textoEscuchado: string, precision: number) => void;
  onClose?: () => void;
}

// Normalizar texto para comparación
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^\w\s]/g, "") // quitar puntuación
    .replace(/\s+/g, " ");
}

// Calcular similitud entre dos strings (0-100)
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 90;

  // Distancia de Levenshtein simplificada
  const words1 = na.split(" ");
  const words2 = nb.split(" ");
  let matches = 0;
  for (const w of words1) {
    if (words2.some((w2) => w2.includes(w) || w.includes(w2))) matches++;
  }
  return Math.round((matches / Math.max(words1.length, words2.length)) * 100);
}

export function VoiceRecognition({ palabraEsperada, onResult, onClose }: VoiceRecognitionProps) {
  const [listening, setListening] = useState(false);
  const [escuchado, setEscuchado] = useState("");
  const [precision, setPrecision] = useState(0);
  const [correcto, setCorrecto] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [soportado, setSoportado] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Verificar soporte de Web Speech API al montar
  const SpeechRecognitionApi = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;
  if (!SpeechRecognitionApi && soportado) {
    setSoportado(false);
  }

  useEffect(() => {
    if (!SpeechRecognitionApi) return;

    const recognition = new SpeechRecognitionApi();
    recognition.lang = "es-PE"; // Español de Perú (cercano a quechua fonéticamente)
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const resultado = event.results[0][0].transcript;
      setEscuchado(resultado);
      const sim = similarity(resultado, palabraEsperada);
      setPrecision(sim);
      setCorrecto(sim >= 70);
    };

    recognition.onerror = (event: any) => {
      setError("No te escuché bien. Inténtalo de nuevo.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch {}
    };
  }, [palabraEsperada]);

  const iniciar = () => {
    if (!recognitionRef.current) return;
    setError(null);
    setEscuchado("");
    setCorrecto(null);
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setError("No se pudo iniciar el micrófono.");
      setListening(false);
    }
  };

  const detener = () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    setListening(false);
  };

  const confirmar = () => {
    onResult(correcto ?? false, escuchado, precision);
  };

  if (!soportado) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <div className="text-4xl mb-3">🎙️</div>
        <h3 className="font-extrabold mb-2">Tu navegador no soporta reconocimiento de voz</h3>
        <p className="text-sm text-muted-foreground font-semibold mb-4">
          Prueba con Chrome o Edge en escritorio, o escribe la respuesta:
        </p>
        <input
          type="text"
          value={escuchado}
          onChange={(e) => {
            setEscuchado(e.target.value);
            const sim = similarity(e.target.value, palabraEsperada);
            setPrecision(sim);
            setCorrecto(sim >= 70);
          }}
          placeholder="Escribe lo que escuchaste..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background font-bold mb-3 focus:outline-none focus:border-duo-green"
          autoFocus
        />
        {correcto !== null && (
          <div className={`text-sm font-bold mb-3 ${correcto ? "text-duo-green" : "text-duo-red"}`}>
            {correcto ? `¡Correcto! ${precision}%` : `Intenta de nuevo (${precision}%)`}
          </div>
        )}
        <button onClick={confirmar} disabled={correcto === null} className="duo-btn duo-btn-primary w-full">
          Confirmar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-muted-foreground uppercase mb-2">Pronuncia en voz alta</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-duo-blue" />
          <span className="text-xl font-extrabold text-duo-blue">{palabraEsperada}</span>
        </div>
      </div>

      {/* Botón de micrófono */}
      <div className="flex justify-center mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={listening ? detener : iniciar}
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

      {/* Estado */}
      <div className="text-center min-h-[24px] mb-3">
        {listening && (
          <p className="text-sm font-bold text-duo-red animate-pulse">🎙️ Escuchando...</p>
        )}
        {error && <p className="text-sm font-bold text-duo-red">{error}</p>}
        {!listening && !error && escuchado && (
          <AnimatePresence mode="wait">
            <motion.div
              key={correcto ? "ok" : "no"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                correcto ? "bg-duo-green/15 text-duo-green" : "bg-duo-red/15 text-duo-red"
              }`}
            >
              {correcto ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {correcto ? `¡Bien! ${precision}%` : `Cerca (${precision}%)`}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Texto escuchado */}
      {escuchado && (
        <div className="bg-muted/50 rounded-xl p-3 mb-4 text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Escuché:</p>
          <p className="font-bold">"{escuchado}"</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button onClick={iniciar} className="duo-btn duo-btn-secondary flex-1">
          {escuchado ? "Reintentar" : "Hablar"}
        </button>
        <button
          onClick={confirmar}
          disabled={correcto === null}
          className="duo-btn duo-btn-primary flex-1"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
