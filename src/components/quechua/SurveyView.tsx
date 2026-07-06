"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/quechua/store";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { toast } from "sonner";
import {
  SURVEY_QUESTIONS,
  DEFAULT_SURVEY,
  type SurveyAnswers,
  type SurveyQuestion,
} from "@/lib/quechua/survey";

export function SurveyView() {
  const setSurvey = useAppStore((s) => s.setSurvey);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const user = useAppStore((s) => s.user);

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(DEFAULT_SURVEY);
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [timeValue, setTimeValue] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const question: SurveyQuestion | undefined = SURVEY_QUESTIONS[qIndex];
  const total = SURVEY_QUESTIONS.length;
  const progressPct = (qIndex / total) * 100;

  // Reset selección al cambiar de pregunta
  useEffect(() => {
    if (!question) return;
    if (question.type === "single") {
      const current = answers[question.field] as string;
      setSelectedSingle(current || null);
    } else if (question.type === "multi") {
      setSelectedMulti(answers.interests);
    } else if (question.type === "time") {
      setTimeValue(answers.reminderTime || "");
    }
  }, [qIndex]);

  if (!question) return null;

  const canAdvance = (() => {
    if (question.type === "single") return selectedSingle !== null;
    if (question.type === "multi") return true; // opcional
    if (question.type === "time") return true; // opcional
    return false;
  })();

  const handleSelectSingle = (id: string) => {
    // No permitir seleccionar lenguas no disponibles
    if (question.field === "language") {
      const opt = question.options.find((o) => o.id === id);
      if (opt?.description?.includes("próximamente")) {
        toast("¡Próximamente!", { description: `${opt.label} estará disponible pronto. Por ahora solo Quechua.` });
        return;
      }
    }
    setSelectedSingle(id);
  };

  const handleToggleMulti = (id: string) => {
    setSelectedMulti((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdvance = async () => {
    // Guardar respuesta de la pregunta actual
    const newAnswers = { ...answers };
    if (question.type === "single" && selectedSingle) {
      if (question.field === "dailyGoal") {
        newAnswers.dailyGoal = Number(selectedSingle);
      } else {
        (newAnswers as Record<string, unknown>)[question.field] = selectedSingle;
      }
    } else if (question.type === "multi") {
      newAnswers.interests = selectedMulti;
    } else if (question.type === "time") {
      newAnswers.reminderTime = timeValue || null;
    }
    setAnswers(newAnswers);

    // ¿Es la última pregunta?
    if (qIndex + 1 >= total) {
      await submitSurvey(newAnswers);
      return;
    }
    setQIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (qIndex > 0) setQIndex((i) => i - 1);
  };

  const submitSurvey = async (finalAnswers: SurveyAnswers) => {
    setSubmitting(true);
    try {
      const r = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || "No se pudo guardar la encuesta");
        return;
      }
      if (data.snapshot) {
        if (data.snapshot.survey) setSurvey(data.snapshot.survey);
        if (data.snapshot.stats) setStats(data.snapshot.stats);
        if (data.snapshot.progress) setProgress(data.snapshot.progress);
        if (data.snapshot.achievements) setAchievements(data.snapshot.achievements);
      }
      toast.success("¡Plan personalizado! 🎉");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-duo-green/10 to-background">
      {/* Barra de progreso */}
      <div className="px-4 pt-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          {qIndex > 0 && (
            <button onClick={handleBack} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Atrás">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-duo-green rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground shrink-0">
            {qIndex + 1}/{total}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Kuntur haciendo la pregunta — key estable para que el video
              NO se reinicie al cambiar de pregunta. Solo cambia el speech y mood. */}
          <KunturMascot
            key="kuntur-survey"
            mood={question.kunturMood}
            size={140}
            speech={question.kunturSays}
          />

          {/* Opciones */}
          <div className="w-full mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {question.type === "single" && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {question.options.map((opt) => {
                      const isSelected = selectedSingle === opt.id;
                      const isDisabled = question.field === "language" && opt.description?.includes("próximamente");
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectSingle(opt.id)}
                          disabled={isDisabled}
                          className={`exercise-option flex items-center gap-3 ${isSelected ? "selected" : ""} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className="text-3xl shrink-0">{opt.emoji}</span>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-extrabold text-base">{opt.label}</div>
                            {opt.description && (
                              <div className="text-xs text-muted-foreground font-semibold">{opt.description}</div>
                            )}
                          </div>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-duo-blue text-white flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === "multi" && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {question.options.map((opt) => {
                        const isSelected = selectedMulti.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleToggleMulti(opt.id)}
                            className={`exercise-option flex flex-col items-center gap-1 text-center ${isSelected ? "selected" : ""}`}
                          >
                            <span className="text-3xl">{opt.emoji}</span>
                            <span className="text-xs font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-xs text-muted-foreground font-semibold mt-3">
                      {selectedMulti.length === 0 ? "Puedes saltar esta pregunta" : `${selectedMulti.length} seleccionado${selectedMulti.length > 1 ? "s" : ""}`}
                    </p>
                  </>
                )}

                {question.type === "time" && (
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <input
                      type="time"
                      value={timeValue}
                      onChange={(e) => setTimeValue(e.target.value)}
                      className="px-6 py-4 rounded-2xl border-2 border-border bg-card font-bold text-2xl text-center focus:outline-none focus:border-duo-green transition-colors"
                    />
                    <div className="flex gap-2 flex-wrap justify-center">
                      {["07:00", "12:00", "18:00", "21:00"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTimeValue(t)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                            timeValue === t
                              ? "border-duo-green bg-duo-green/10 text-duo-green"
                              : "border-border bg-card text-muted-foreground hover:border-duo-green/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        onClick={() => setTimeValue("")}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                          !timeValue
                            ? "border-muted-foreground bg-muted text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        Sin recordatorio
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t-2 border-muted/50 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl flex items-center justify-end gap-4">
          <button
            onClick={handleAdvance}
            disabled={!canAdvance || submitting}
            className="duo-btn duo-btn-primary"
          >
            {submitting
              ? "Guardando..."
              : qIndex + 1 >= total
              ? "¡Crear mi plan!"
              : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
