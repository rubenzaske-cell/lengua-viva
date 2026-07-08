"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/quechua/store";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { LoadingPlan } from "@/components/quechua/LoadingPlan";
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
  const [answers, setAnswers] = useState<SurveyAnswers>({
    language: "", goal: "", level: "", pace: "", dailyGoal: 0, reminderTime: null, interests: [],
  });
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [timeValue, setTimeValue] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [writingKey, setWritingKey] = useState(0);
  const [writingMessage, setWritingMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const pendingSnapshotRef = useRef<{ survey: unknown; stats: unknown; progress: unknown; achievements: unknown } | null>(null);

  const question: SurveyQuestion | undefined = SURVEY_QUESTIONS[qIndex];
  const total = SURVEY_QUESTIONS.length;
  const progressPct = (qIndex / total) * 100;

  useEffect(() => {
    setSelectedSingle(null); setSelectedMulti([]); setTimeValue(""); setIsWriting(false);
  }, [qIndex]);

  if (!question) return null;

  const commitAndAdvance = () => {
    const newAnswers = { ...answers };
    if (question.type === "single" && selectedSingle) {
      if (question.field === "dailyGoal") newAnswers.dailyGoal = Number(selectedSingle);
      else (newAnswers as Record<string, unknown>)[question.field] = selectedSingle;
    } else if (question.type === "multi") {
      newAnswers.interests = selectedMulti;
    } else if (question.type === "time") {
      newAnswers.reminderTime = timeValue || null;
    }
    setAnswers(newAnswers);
    if (qIndex + 1 >= total) { submitSurvey(newAnswers); return; }
    setQIndex((i) => i + 1);
  };

  const handleWritingComplete = () => {
    setIsWriting(false);
    setTimeout(() => { commitAndAdvance(); }, 200);
  };

  const startWriting = () => { setWritingKey((k) => k + 1); setIsWriting(true); };

  // Generar frase motivadora según la selección del usuario
  const getMotivationalMessage = (field: string, selectedId: string): string => {
    const messages: Record<string, Record<string, string>> = {
      language: {
        quechua: "¡Quechua! El idioma del Tawantinsuyu te espera 🦙",
        aimara: "¡Aimara! La lengua del lago sagrado 🏔️",
      },
      goal: {
        viajar: "¡Para tus viajes por los Andes! ✈️",
        cultura: "¡Reconectando con tus raíces! 🦙",
        trabajo: "¡Para servir mejor a tu comunidad! 💼",
        estudio: "¡La sabiduría andina te llama! 📚",
        curiosidad: "¡La curiosidad abre mundos! ✨",
      },
      level: {
        principiante: "¡Desde cero, como los grandes! 🌱",
        basico: "¡Ya tienes base, a potenciarla! 🌿",
        intermedio: "¡Vas por buen camino! 🌳",
        avanzado: "¡A perfeccionar tu maestría! 🏔️",
      },
      pace: {
        relajado: "Sin prisa, paso firme 🐢",
        medio: "Constancia es la clave 🚶",
        intenso: "¡Aprendemos rápido! ⚡",
      },
      dailyGoal: {
        "10": "5 minutos al día cambian todo 🎋",
        "20": "10 minutos, progreso constante 🎋",
        "30": "15 minutos, dedicación real 🎋",
        "50": "25 minutos, serio y comprometido 🎋",
        "100": "¡Modo intenso activado! 🔥",
      },
    };
    return messages[field]?.[selectedId] || "Tejiendo tu plan personalizado...";
  };

  const handleSelectSingle = (id: string) => {
    if (question.field === "language") {
      const opt = question.options.find((o) => o.id === id);
      if (opt?.description?.includes("próximamente")) {
        toast("¡Próximamente!", { description: `${opt.label} estará disponible pronto. Por ahora solo Quechua.` });
        return;
      }
    }
    setSelectedSingle(id);
    setWritingMessage(getMotivationalMessage(question.field, id));
    startWriting();
  };

  const handleToggleMulti = (id: string) => {
    setSelectedMulti((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleTimeSelect = (val: string) => {
    setTimeValue(val);
    setWritingMessage(val ? `Recordatorio a las ${val} 🕐` : "Sin recordatorio, a tu ritmo 🌿");
    startWriting();
  };

  const handleBack = () => { if (qIndex > 0) setQIndex((i) => i - 1); };

  const submitSurvey = async (finalAnswers: SurveyAnswers) => {
    setSubmitting(true);
    const safe: SurveyAnswers = {
      language: finalAnswers.language || DEFAULT_SURVEY.language,
      goal: finalAnswers.goal || DEFAULT_SURVEY.goal,
      level: finalAnswers.level || DEFAULT_SURVEY.level,
      pace: finalAnswers.pace || DEFAULT_SURVEY.pace,
      dailyGoal: finalAnswers.dailyGoal || DEFAULT_SURVEY.dailyGoal,
      reminderTime: finalAnswers.reminderTime,
      interests: finalAnswers.interests,
    };
    try {
      const r = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...safe, userId: user?.id }),
      });
      const data = await r.json();
      if (!r.ok) { toast.error(data.error || "No se pudo guardar la encuesta"); return; }
      pendingSnapshotRef.current = data.snapshot || null;
      setShowLoading(true);
    } catch { toast.error("Error de conexión"); }
    finally { setSubmitting(false); }
  };

  const handleLoadingComplete = () => {
    const snap = pendingSnapshotRef.current;
    if (snap) {
      if ((snap as { survey?: unknown }).survey) setSurvey((snap as { survey: Parameters<typeof setSurvey>[0] }).survey);
      if ((snap as { stats?: unknown }).stats) setStats((snap as { stats: Parameters<typeof setStats>[0] }).stats);
      if ((snap as { progress?: unknown }).progress) setProgress((snap as { progress: Parameters<typeof setProgress>[0] }).progress);
      if ((snap as { achievements?: unknown }).achievements) setAchievements((snap as { achievements: Parameters<typeof setAchievements>[0] }).achievements);
    } else {
      setSurvey({ language: "quechua", goal: "viajar", level: "principiante", pace: "medio", dailyGoal: 30, reminderTime: null, interests: [] });
    }
    useAppStore.getState().setNeedsSurvey(false);
    setShowLoading(false);
    toast.success("¡Plan personalizado! 🎉");
  };

  const guideText = isWriting
    ? "Kuntur está tejiendo tu plan..."
    : question.type === "multi"
    ? selectedMulti.length === 0 ? "Toca los temas que te interesan" : `${selectedMulti.length} seleccionado${selectedMulti.length > 1 ? "s" : ""} · toca más o presiona Continuar`
    : question.type === "time"
    ? "Elige una hora o sin recordatorio"
    : "Toca una opción para continuar";

  if (showLoading) { return <LoadingPlan onComplete={handleLoadingComplete} />; }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-duo-green/10 to-background">
      <div className="px-4 pt-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          {qIndex > 0 && (
            <button onClick={handleBack} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Atrás">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full bg-duo-green rounded-full" animate={{ width: `${progressPct}%` }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
          </div>
          <span className="text-xs font-bold text-muted-foreground shrink-0">{qIndex + 1}/{total}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <KunturMascot key="kuntur-survey" mood={question.kunturMood} size={220} speech={question.kunturSays}
            writing={isWriting} writingKey={writingKey} writingMessage={writingMessage} onWritingComplete={handleWritingComplete} />

          <div className="w-full mt-6">
            <AnimatePresence mode="wait">
              <motion.div key={question.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {question.type === "single" && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {question.options.map((opt) => {
                      const isSelected = selectedSingle === opt.id;
                      const isDisabled = question.field === "language" && opt.description?.includes("próximamente");
                      return (
                        <button key={opt.id} onClick={() => handleSelectSingle(opt.id)} disabled={isDisabled || isWriting}
                          className={`exercise-option flex items-center gap-3 ${isSelected ? "selected" : ""} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                          <span className="text-3xl shrink-0">{opt.emoji}</span>
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-extrabold text-base">{opt.label}</div>
                            {opt.description && <div className="text-xs text-muted-foreground font-semibold">{opt.description}</div>}
                          </div>
                          {isSelected && <span className="w-6 h-6 rounded-full bg-duo-blue text-white flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === "multi" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {question.options.map((opt) => {
                      const isSelected = selectedMulti.includes(opt.id);
                      return (
                        <button key={opt.id} onClick={() => handleToggleMulti(opt.id)} disabled={isWriting}
                          className={`exercise-option flex flex-col items-center gap-1 text-center ${isSelected ? "selected" : ""}`}>
                          <span className="text-3xl">{opt.emoji}</span>
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === "time" && (
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <input type="time" value={timeValue} onChange={(e) => handleTimeSelect(e.target.value)} disabled={isWriting}
                      className="px-6 py-4 rounded-2xl border-2 border-border bg-card font-bold text-2xl text-center focus:outline-none focus:border-duo-green transition-colors" />
                    <div className="flex gap-2 flex-wrap justify-center">
                      {["07:00", "12:00", "18:00", "21:00"].map((t) => (
                        <button key={t} onClick={() => handleTimeSelect(t)} disabled={isWriting}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${timeValue === t ? "border-duo-green bg-duo-green/10 text-duo-green" : "border-border bg-card text-muted-foreground hover:border-duo-green/40"}`}>{t}</button>
                      ))}
                      <button onClick={() => handleTimeSelect("")} disabled={isWriting}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${!timeValue ? "border-muted-foreground bg-muted text-foreground" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"}`}>Sin recordatorio</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-muted/50 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl flex items-center justify-center min-h-[52px]">
          {isWriting ? (
            <span className="text-sm font-bold flex items-center gap-2 text-duo-purple">
              <span className="w-2 h-2 rounded-full bg-duo-purple animate-pulse" />
              {guideText}
            </span>
          ) : question.type === "multi" ? (
            <button onClick={() => {
              const interestsMsg = selectedMulti.length > 0
                ? `¡${selectedMulti.length} temas que te apasionan! 🎯`
                : "¡A explorar todos los temas! 🌿";
              setWritingMessage(interestsMsg);
              startWriting();
            }} className="duo-btn duo-btn-primary animate-pop-in">
              {selectedMulti.length === 0 ? "Saltar pregunta" : `Continuar (${selectedMulti.length})`}
            </button>
          ) : (
            <span className="text-sm font-bold text-muted-foreground">{guideText}</span>
          )}
        </div>
      </div>
    </div>
  );
}
