"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppStore } from "@/lib/quechua/store";
import type { Exercise } from "@/lib/quechua/content";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Volume2, Check, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { KunturMascot, randomPhrase } from "@/components/quechua/KunturMascot";

type Feedback = "none" | "correct" | "wrong";

export function LessonPlayer() {
  const lesson = useAppStore((s) => s.activeLesson);
  const exercises = useAppStore((s) => s.activeExercises);
  const exitLesson = useAppStore((s) => s.exitLesson);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const setView = useAppStore((s) => s.setView);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);
  const xpBoostUntil = useAppStore((s) => s.xpBoostUntil);
  const hearts = useAppStore((s) => s.stats?.hearts ?? 5);

  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lostHearts, setLostHearts] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [result, setResult] = useState<null | { xp: number; gems: number; perfect: boolean; newAch: string[] }>(null);
  const [submitting, setSubmitting] = useState(false);
  const lostHeartRef = useRef(false);

  const total = exercises.length;
  const current = exercises[idx];
  const progressPct = (idx / total) * 100;

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.85;
    // Intentar usar una voz en español
    const voices = window.speechSynthesis.getVoices();
    const es = voices.find((v) => v.lang.startsWith("es"));
    if (es) u.voice = es;
    window.speechSynthesis.speak(u);
  }, []);

  // Reproducir audio automáticamente en ejercicios "listen"
  useEffect(() => {
    if (current && current.type === "listen" && current.audio) {
      const t = setTimeout(() => speak(current.audio!), 300);
      return () => clearTimeout(t);
    }
  }, [current, speak]);

  // Precargar voces
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Estado de respuesta por tipo de ejercicio
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [matchSelected, setMatchSelected] = useState<{ side: "q" | "a"; value: string } | null>(null);
  const [bankPlaced, setBankPlaced] = useState<string[]>([]);
  const [bankError, setBankError] = useState<string | null>(null);

  // Reset al cambiar de ejercicio
  useEffect(() => {
    setSelected(null);
    setMatched({});
    setMatchSelected(null);
    setBankPlaced([]);
    setBankError(null);
    lostHeartRef.current = false;
  }, [idx]);

  if (!lesson) return null;
  if (result) {
    return (
      <CompletionScreen
        xp={result.xp}
        gems={result.gems}
        perfect={result.perfect}
        newAch={result.newAch}
        onContinue={() => {
          exitLesson();
          triggerRefresh();
          setView("learn");
        }}
      />
    );
  }

  const isAnswered = (() => {
    if (!current) return false;
    if (current.type === "match") return Object.keys(matched).length === current.pairs.length;
    if (current.type === "bank") return bankPlaced.length === current.answer.length;
    return selected !== null;
  })();

  const validate = (): boolean => {
    if (!current) return false;
    if (current.type === "select" || current.type === "reverse" || current.type === "listen") {
      return selected === current.answer;
    }
    if (current.type === "match") {
      return current.pairs.every((p) => matched[p.q] === p.a);
    }
    if (current.type === "bank") {
      return current.answer.every((w, i) => bankPlaced[i] === w);
    }
    return false;
  };

  const handleCheck = () => {
    if (!isAnswered || feedback !== "none") return;
    const ok = validate();
    if (ok) {
      setFeedback("correct");
      setCorrectCount((c) => c + 1);
    } else {
      setFeedback("wrong");
      setWrongCount((c) => c + 1);
      if (!lostHeartRef.current) {
        lostHeartRef.current = true;
        setLostHearts((h) => h + 1);
        // Notificar al backend para perder corazón
        fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "lose_heart" }),
        }).then(async (r) => {
          const data = await r.json();
          if (data?.snapshot) {
            setStats(data.snapshot.stats);
            setProgress(data.snapshot.progress);
          }
          if (data?.hearts === 0) {
            toast.error("¡Te quedaste sin corazones!", {
              description: "Practica una lección ya completada o espera a que se regeneren.",
            });
          }
        }).catch(() => {});
      }
    }
  };

  const handleContinue = async () => {
    if (feedback === "none") return;
    // Si fue incorrecto, no avanza a menos que se presione continuar igual
    if (idx + 1 >= total) {
      // Completar lección
      setSubmitting(true);
      const perfect = wrongCount === 0;
      try {
        const r = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            correct: correctCount,
            total,
            perfect,
            xpBoost: xpBoostUntil ? xpBoostUntil > Date.now() : false,
          }),
        });
        const data = await r.json();
        if (data?.snapshot) {
          setStats(data.snapshot.stats);
          setProgress(data.snapshot.progress);
          setAchievements(data.snapshot.achievements);
        }
        setResult({
          xp: data.xpEarned,
          gems: data.gemsEarned,
          perfect,
          newAch: data.newAchievements || [],
        });
        if (data.newAchievements?.length) {
          data.newAchievements.forEach((id: string) => {
            toast.success("¡Logro desbloqueado!", { description: id, duration: 4000 });
          });
        }
      } catch {
        toast.error("Hubo un error al guardar tu progreso");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setIdx((i) => i + 1);
    setFeedback("none");
  };

  // Sin corazones: bloquear
  const noHearts = hearts <= 0 && feedback === "none";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Barra superior: progreso + corazón + salir */}
      <div className="px-4 py-3 flex items-center gap-3 max-w-2xl mx-auto w-full">
        <button
          onClick={() => setConfirmExit(true)}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Salir"
        >
          <X className="w-7 h-7" />
        </button>
        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-duo-green rounded-full"
            animate={{ width: `${((idx + (feedback !== "none" ? 1 : 0)) / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Heart className="w-6 h-6 text-duo-red" fill="currentColor" />
          <span className="font-extrabold text-duo-red text-lg">{Math.max(0, hearts)}</span>
        </div>
      </div>

      {/* Contenido del ejercicio */}
      <div className="flex-1 overflow-y-auto scroll-quechua">
        <div className="mx-auto max-w-2xl px-4 py-4 w-full">
          <ExerciseRenderer
            exercise={current}
            selected={selected}
            setSelected={setSelected}
            matched={matched}
            setMatched={setMatched}
            matchSelected={matchSelected}
            setMatchSelected={setMatchSelected}
            bankPlaced={bankPlaced}
            setBankPlaced={setBankPlaced}
            bankError={bankError}
            setBankError={setBankError}
            feedback={feedback}
            speak={speak}
          />
        </div>
      </div>

      {/* Barra inferior: feedback + check/continue */}
      <FeedbackBar
        feedback={feedback}
        isAnswered={isAnswered}
        noHearts={noHearts}
        submitting={submitting}
        exercise={current}
        selected={selected}
        matched={matched}
        bankPlaced={bankPlaced}
        onCheck={handleCheck}
        onContinue={handleContinue}
        onSkip={() => setConfirmExit(true)}
      />

      {/* Modal salir */}
      <AnimatePresence>
        {confirmExit && (
          <ExitModal onCancel={() => setConfirmExit(false)} onConfirm={() => { exitLesson(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Renderer de ejercicios ---------- */
function ExerciseRenderer(props: {
  exercise: Exercise | undefined;
  selected: string | null;
  setSelected: (v: string | null) => void;
  matched: Record<string, string>;
  setMatched: (v: Record<string, string>) => void;
  matchSelected: { side: "q" | "a"; value: string } | null;
  setMatchSelected: (v: { side: "q" | "a"; value: string } | null) => void;
  bankPlaced: string[];
  setBankPlaced: (v: string[]) => void;
  bankError: string | null;
  setBankError: (v: string | null) => void;
  feedback: Feedback;
  speak: (t: string) => void;
}) {
  const { exercise: ex } = props;
  if (!ex) return null;

  if (ex.type === "select" || ex.type === "reverse") {
    return (
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
          {ex.type === "select" ? "Selecciona el significado" : "Selecciona la palabra en quechua"}
        </p>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-foreground">{ex.prompt}</h2>
            {ex.audio && (
              <button
                onClick={() => props.speak(ex.audio!)}
                className="shrink-0 w-12 h-12 rounded-2xl bg-duo-blue text-white flex items-center justify-center duo-btn-blue duo-btn"
                aria-label="Escuchar"
                style={{ padding: 0 }}
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}
          </div>
          {ex.hint && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" /> {ex.hint}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          {ex.choices.map((c) => {
            const isSelected = props.selected === c;
            let cls = "exercise-option";
            if (isSelected && props.feedback === "none") cls += " selected";
            if (props.feedback !== "none") {
              if (c === ex.answer) cls += " correct";
              else if (isSelected) cls += " wrong";
            }
            return (
              <button
                key={c}
                disabled={props.feedback !== "none"}
                onClick={() => props.setSelected(c)}
                className={cls}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (ex.type === "listen") {
    return (
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
          ¿Qué significa lo que escuchaste?
        </p>
        <div className="mb-6 flex flex-col items-center gap-3">
          <button
            onClick={() => props.speak(ex.audio!)}
            className="w-24 h-24 rounded-full duo-btn-blue duo-btn flex items-center justify-center text-white"
            aria-label="Reproducir audio"
            style={{ padding: 0 }}
          >
            <Volume2 className="w-12 h-12" />
          </button>
          <button
            onClick={() => props.speak(ex.audio!)}
            className="text-sm font-bold text-duo-blue underline"
          >
            Repetir
          </button>
        </div>
        <div className="grid gap-3">
          {ex.choices.map((c) => {
            const isSelected = props.selected === c;
            let cls = "exercise-option";
            if (isSelected && props.feedback === "none") cls += " selected";
            if (props.feedback !== "none") {
              if (c === ex.answer) cls += " correct";
              else if (isSelected) cls += " wrong";
            }
            return (
              <button
                key={c}
                disabled={props.feedback !== "none"}
                onClick={() => props.setSelected(c)}
                className={cls}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (ex.type === "match") {
    return <MatchExerciseView exercise={ex} {...props} />;
  }

  if (ex.type === "bank") {
    return (
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
          Traduce esta frase
        </p>
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold">{ex.prompt}</h2>
          {ex.hint && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" /> {ex.hint}
            </p>
          )}
        </div>
        {/* Espacio para la respuesta */}
        <div className="min-h-[64px] mb-6 p-3 border-b-2 border-duo-green/40 flex flex-wrap gap-2 items-start">
          {props.bankPlaced.map((w, i) => (
            <span key={i} className="word-chip" style={{ opacity: 1 }}>
              {w}
            </span>
          ))}
          {props.bankPlaced.length === 0 && (
            <span className="text-muted-foreground text-sm font-bold">Toca las palabras de abajo</span>
          )}
        </div>
        {/* Banco de palabras */}
        <div className="flex flex-wrap gap-2 justify-center">
          {ex.words.map((w, i) => {
            const placedCount = props.bankPlaced.filter((x) => x === w).length;
            const wordCount = ex.words.filter((x) => x === w).length;
            const isAvailable = placedCount < wordCount;
            return (
              <button
                key={`${w}-${i}`}
                disabled={!isAvailable || props.feedback !== "none"}
                onClick={() => {
                  props.setBankPlaced([...props.bankPlaced, w]);
                  props.setBankError(null);
                }}
                className={`word-chip ${!isAvailable ? "placed" : ""}`}
              >
                {w}
              </button>
            );
          })}
        </div>
        {props.bankPlaced.length > 0 && (
          <button
            onClick={() => props.setBankPlaced(props.bankPlaced.slice(0, -1))}
            className="mt-4 text-sm font-bold text-muted-foreground underline"
          >
            ← Borrar última
          </button>
        )}
      </div>
    );
  }

  return null;
}

/* ---------- Vista del ejercicio de emparejar (con estado de orden estable) ---------- */
function MatchExerciseView(props: {
  exercise: Extract<Exercise, { type: "match" }>;
  matched: Record<string, string>;
  setMatched: (v: Record<string, string>) => void;
  matchSelected: { side: "q" | "a"; value: string } | null;
  setMatchSelected: (v: { side: "q" | "a"; value: string } | null) => void;
  feedback: Feedback;
}) {
  const { exercise: ex } = props;
  // Orden estable de la columna derecha (mezclado una vez por ejercicio)
  const rightItems = useMemo(
    () => [...ex.pairs.map((p) => p.a)].sort(() => Math.random() - 0.5),
    [ex.id]
  );
  const leftItems = ex.pairs.map((p) => p.q);

  const handleClick = (side: "q" | "a", value: string) => {
    if (props.feedback !== "none") return;
    if (!props.matchSelected) {
      props.setMatchSelected({ side, value });
      return;
    }
    if (props.matchSelected.side === side) {
      props.setMatchSelected({ side, value });
      return;
    }
    const q = side === "q" ? value : props.matchSelected.value;
    const a = side === "a" ? value : props.matchSelected.value;
    // Verificar si forman un par real
    const isPair = ex.pairs.some((p) => p.q === q && p.a === a);
    if (isPair) {
      props.setMatched({ ...props.matched, [q]: a });
    }
    props.setMatchSelected(null);
  };

  return (
    <div>
      <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
        Empareja las palabras
      </p>
      <h2 className="text-xl font-extrabold mb-4">{ex.prompt}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {leftItems.map((q) => {
            const isMatched = props.matched[q] !== undefined;
            const isSelected = props.matchSelected?.side === "q" && props.matchSelected.value === q;
            return (
              <button
                key={q}
                disabled={isMatched || props.feedback !== "none"}
                onClick={() => handleClick("q", q)}
                className={`exercise-option text-center ${isMatched ? "opacity-30" : ""} ${
                  isSelected ? "selected" : ""
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {rightItems.map((a) => {
            const isMatched = Object.values(props.matched).includes(a);
            const isSelected = props.matchSelected?.side === "a" && props.matchSelected.value === a;
            return (
              <button
                key={a}
                disabled={isMatched || props.feedback !== "none"}
                onClick={() => handleClick("a", a)}
                className={`exercise-option text-center ${isMatched ? "opacity-30" : ""} ${
                  isSelected ? "selected" : ""
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Barra de feedback ---------- */
function FeedbackBar(props: {
  feedback: Feedback;
  isAnswered: boolean;
  noHearts: boolean;
  submitting: boolean;
  exercise: Exercise | undefined;
  selected: string | null;
  matched: Record<string, string>;
  bankPlaced: string[];
  onCheck: () => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { feedback, isAnswered, onCheck, onContinue } = props;

  if (props.noHearts) {
    return (
      <div className="border-t-4 border-duo-red bg-duo-red/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <KunturMascot mood="enojado" size={56} animate={false} />
          <div className="flex-1">
            <p className="font-extrabold text-duo-red text-lg leading-tight">¡Sin corazones!</p>
            <p className="text-xs font-bold text-muted-foreground">Compra más en la tienda o espera a que se regeneren.</p>
          </div>
        </div>
      </div>
    );
  }

  if (feedback === "none") {
    return (
      <div className="border-t-2 border-muted/50 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <button onClick={props.onSkip} className="duo-btn duo-btn-ghost">
            Saltar
          </button>
          <button
            onClick={onCheck}
            disabled={!isAnswered}
            className="duo-btn duo-btn-primary flex-1 max-w-xs"
          >
            Comprobar
          </button>
        </div>
      </div>
    );
  }

  const correct = feedback === "correct";
  const ex = props.exercise;
  const correctAnswer = (() => {
    if (!ex) return "";
    if (ex.type === "select" || ex.type === "reverse" || ex.type === "listen") return ex.answer;
    if (ex.type === "bank") return ex.answer.join(" ");
    if (ex.type === "match") return "";
    return "";
  })();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`border-t-4 ${correct ? "bg-duo-green/10 border-duo-green" : "bg-duo-red/10 border-duo-red"}`}
    >
      <div className="mx-auto max-w-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <KunturMascot
              mood={correct ? "risa" : "triste"}
              size={56}
              animate={false}
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className={`flex items-center gap-2 mb-0.5 ${correct ? "text-duo-green-dark" : "text-duo-red"}`}>
                {correct ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                <span className="text-xl font-extrabold">
                  {correct ? "¡Correcto!" : "¡Casi!"}
                </span>
              </div>
              {!correct && correctAnswer && (
                <p className="text-xs font-bold text-foreground truncate">
                  Respuesta: <span className="text-duo-green-dark">{correctAnswer}</span>
                </p>
              )}
              {correct && (
                <p className="text-xs font-bold text-duo-green-dark truncate">{randomPhrase("correct")}</p>
              )}
            </div>
          </div>
          <button
            onClick={onContinue}
            disabled={props.submitting}
            className={`duo-btn ${correct ? "duo-btn-primary" : "duo-btn-danger"} shrink-0`}
          >
            {props.submitting ? "Guardando..." : "Continuar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Modal salir ---------- */
function ExitModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card rounded-2xl p-6 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-3">😢</div>
        <h3 className="text-xl font-extrabold mb-2">¿Salir de la lección?</h3>
        <p className="text-sm text-muted-foreground font-semibold mb-5">
          Perderás tu progreso en esta lección si sales ahora.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onCancel} className="duo-btn duo-btn-primary">
            Seguir aprendiendo
          </button>
          <button onClick={onConfirm} className="duo-btn duo-btn-secondary">
            Salir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Pantalla de completado ---------- */
function CompletionScreen({
  xp,
  gems,
  perfect,
  newAch,
  onContinue,
}: {
  xp: number;
  gems: number;
  perfect: boolean;
  newAch: string[];
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center w-full max-w-md"
      >
        <div className="flex justify-center mb-2">
          <KunturMascot
            mood={perfect ? "risa" : "feliz"}
            size={140}
            speech={perfect ? "¡Sumaq! ¡Perfecto!" : "¡Allin! ¡Buen trabajo!"}
          />
        </div>
        <h1 className="text-3xl font-extrabold text-duo-yellow mb-2">
          {perfect ? "¡Perfecto!" : "¡Lección completada!"}
        </h1>
        <p className="text-muted-foreground font-bold mb-6">
          {perfect ? "Sin errores. ¡Eres imparable!" : "¡Sigue así, vas mejorando!"}
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
          <div className="bg-duo-yellow/15 border-2 border-duo-yellow/30 rounded-2xl p-4">
            <div className="text-3xl mb-1">⭐</div>
            <div className="text-xs font-bold text-muted-foreground uppercase">XP ganado</div>
            <div className="text-2xl font-extrabold text-duo-yellow">+{xp}</div>
          </div>
          <div className="bg-duo-blue/15 border-2 border-duo-blue/30 rounded-2xl p-4">
            <div className="text-3xl mb-1">💠</div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Gemas</div>
            <div className="text-2xl font-extrabold text-duo-blue">+{gems}</div>
          </div>
        </div>

        {newAch.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 bg-duo-purple/10 border-2 border-duo-purple/30 rounded-2xl p-4 max-w-xs mx-auto flex items-center gap-3"
          >
            <KunturMascot mood="sorprendido" size={44} animate={false} />
            <div className="text-left">
              <div className="text-sm font-extrabold text-duo-purple">
                ¡{newAch.length} nuevo{newAch.length > 1 ? "s" : ""} logro{newAch.length > 1 ? "s" : ""}!
              </div>
              <div className="text-xs text-muted-foreground font-bold">Míralos en la pestaña Logros</div>
            </div>
          </motion.div>
        )}

        <button onClick={onContinue} className="duo-btn duo-btn-primary w-full max-w-xs">
          Continuar
        </button>
      </motion.div>
    </div>
  );
}
