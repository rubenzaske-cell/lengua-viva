"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/quechua/store";
import { motion } from "framer-motion";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { useT } from "@/lib/quechua/useT";
import { getTranslations } from "@/lib/quechua/translations";
import { toast } from "sonner";

const COUNTRIES = [
  { code: "pe", name: "Perú", flag: "🇵🇪" },
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "bo", name: "Bolivia", flag: "🇧🇴" },
  { code: "cl", name: "Chile", flag: "🇨🇱" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
  { code: "ec", name: "Ecuador", flag: "🇪🇨" },
  { code: "mx", name: "México", flag: "🇲🇽" },
  { code: "es", name: "España", flag: "🇪🇸" },
  { code: "us", name: "EE.UU.", flag: "🇺🇸" },
  { code: "br", name: "Brasil", flag: "🇧🇷" },
  { code: "fr", name: "Francia", flag: "🇫🇷" },
  { code: "de", name: "Alemania", flag: "🇩🇪" },
  { code: "it", name: "Italia", flag: "🇮🇹" },
  { code: "jp", name: "Japón", flag: "🇯🇵" },
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "other", name: "Otro", flag: "🌍" },
];

const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "Inglés", flag: "🇺🇸" },
  { code: "pt", name: "Portugués", flag: "🇧🇷" },
  { code: "fr", name: "Francés", flag: "🇫🇷" },
  { code: "de", name: "Alemán", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japonés", flag: "🇯🇵" },
  { code: "zh", name: "Chino", flag: "🇨🇳" },
  { code: "qu", name: "Quechua", flag: "🦙" },
  { code: "ay", name: "Aimara", flag: "🏔️" },
];

export function Onboarding() {
  const setUser = useAppStore((s) => s.setUser);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const setNeedsOnboarding = useAppStore((s) => s.setNeedsOnboarding);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = getTranslations(nativeLanguage || "es");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t.writeName);
      return;
    }
    if (!country) {
      toast.error(t.selectCountry);
      return;
    }
    if (!nativeLanguage) {
      toast.error(t.selectLanguage);
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar: "🧑", country, nativeLanguage }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || "No se pudo crear el perfil");
        return;
      }
      if (data.user) setUser(data.user);
      if (data.stats) setStats(data.stats);
      if (data.progress) setProgress(data.progress);
      if (data.achievements) setAchievements(data.achievements);
      setNeedsOnboarding(false);
      toast.success(`¡Allinllachu, ${name.trim()}! 🎉`);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-duo-green/10 to-background p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <KunturMascot mood="feliz" size={180} speech="¡Allinllachu! Soy Kuntur" />

        <h1 className="text-3xl font-extrabold mt-4 mb-2">{t.appName}</h1>
        <p className="text-muted-foreground font-bold mb-6">
          {t.letsCreateProfile}
        </p>

        {/* Nombre */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 mb-4 text-left">
          <label className="block text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-2">
            {t.whatsYourName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder={t.yourName}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-bold text-lg focus:outline-none focus:border-duo-green transition-colors"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleSubmit(); }}
          />
        </div>

        {/* País */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 mb-4 text-left">
          <label className="block text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-3">
            {t.whatCountry}
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto scroll-quechua">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  country === c.code
                    ? "bg-duo-green/20 border-2 border-duo-green scale-110 shadow-lg"
                    : "bg-muted border-2 border-transparent hover:border-duo-green/40"
                }`}
              >
                <span className="text-3xl">{c.flag}</span>
                <span className="text-[9px] font-bold text-muted-foreground text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Idioma nativo */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 mb-6 text-left">
          <label className="block text-sm font-extrabold text-muted-foreground uppercase tracking-wide mb-1">
            {t.whatLanguage}
          </label>
          <p className="text-xs text-muted-foreground font-semibold mb-3">
            {t.learnFromYourLang}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setNativeLanguage(l.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  nativeLanguage === l.code
                    ? "bg-duo-green/20 border-duo-green shadow-md"
                    : "bg-muted border-transparent hover:border-duo-green/40"
                }`}
              >
                <span className="text-2xl">{l.flag}</span>
                <span className="font-bold text-sm">{l.name}</span>
                {nativeLanguage === l.code && (
                  <svg className="w-4 h-4 ml-auto text-duo-green" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !country || !nativeLanguage}
          className="duo-btn duo-btn-primary w-full"
        >
          {submitting ? t.creating : t.startLearning}
        </button>

        <p className="text-xs text-muted-foreground font-semibold mt-4">
          {t.progressSaved}
        </p>
      </motion.div>
    </div>
  );
}
