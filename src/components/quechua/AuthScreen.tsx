"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/quechua/store";
import { motion } from "framer-motion";
import { KunturMascot } from "@/components/quechua/KunturMascot";
import { getTranslations } from "@/lib/quechua/translations";
import { toast } from "sonner";
import { Mail, Lock, User, Globe, Languages } from "lucide-react";

const COUNTRIES = [
  { code: "pe", name: "🇵🇪 Perú" }, { code: "ar", name: "🇦🇷 Argentina" },
  { code: "bo", name: "🇧🇴 Bolivia" }, { code: "cl", name: "🇨🇱 Chile" },
  { code: "co", name: "🇨🇴 Colombia" }, { code: "ec", name: "🇪🇨 Ecuador" },
  { code: "mx", name: "🇲🇽 México" }, { code: "es", name: "🇪🇸 España" },
  { code: "us", name: "🇺🇸 EE.UU." }, { code: "br", name: "🇧🇷 Brasil" },
  { code: "fr", name: "🇫🇷 Francia" }, { code: "de", name: "🇩🇪 Alemania" },
  { code: "it", name: "🇮🇹 Italia" }, { code: "jp", name: "🇯🇵 Japón" },
  { code: "cn", name: "🇨🇳 China" }, { code: "other", name: "🌍 Otro" },
];

const LANGUAGES = [
  { code: "es", name: "🇪🇸 Español" }, { code: "en", name: "🇺🇸 English" },
  { code: "pt", name: "🇧🇷 Português" }, { code: "fr", name: "🇫🇷 Français" },
  { code: "de", name: "🇩🇪 Deutsch" }, { code: "it", name: "🇮🇹 Italiano" },
  { code: "ja", name: "🇯🇵 日本語" }, { code: "zh", name: "🇨🇳 中文" },
  { code: "qu", name: "🦙 Quechua" }, { code: "ay", name: "🏔️ Aimara" },
];

export function AuthScreen() {
  const setUser = useAppStore((s) => s.setUser);
  const setNeedsOnboarding = useAppStore((s) => s.setNeedsOnboarding);
  const setStats = useAppStore((s) => s.setStats);
  const setProgress = useAppStore((s) => s.setProgress);
  const setAchievements = useAppStore((s) => s.setAchievements);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("pe");
  const [nativeLanguage, setNativeLanguage] = useState("es");
  const [loading, setLoading] = useState(false);

  // Traducción basada en el idioma seleccionado
  const t = getTranslations(nativeLanguage);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error(nativeLanguage === "en" ? "Fill in all fields" : "Completa todos los campos");
      return;
    }
    if (mode === "register" && !name.trim()) {
      toast.error(nativeLanguage === "en" ? "Enter your name" : "Escribe tu nombre");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/register" : "/api/login";
      const body = mode === "register"
        ? { email, password, name, country, nativeLanguage }
        : { email, password };

      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();

      if (!r.ok) {
        toast.error(data.error || "Error");
        return;
      }

      if (data.user) setUser(data.user);

      if (mode === "login") {
        // Usuario existente: cargar estado completo
        triggerRefresh();
        setNeedsOnboarding(false);
        toast.success(`${t.kunturGreeting}`);
      } else {
        // Registro nuevo: ir al onboarding (ya tiene los datos, pero necesitamos encuesta)
        setNeedsOnboarding(false);
        // Cargar estado
        const sr = await fetch("/api/state");
        const sd = await sr.json();
        if (sd.stats) setStats(sd.stats);
        if (sd.progress) setProgress(sd.progress);
        if (sd.achievements) setAchievements(sd.achievements);
        toast.success(`${t.kunturGreeting}`);
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-duo-green/10 to-background p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Kuntur + título */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <KunturMascot mood="feliz" size={120} animate={false} />
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-1">{t.appName}</h1>
        <p className="text-sm text-muted-foreground font-bold text-center mb-6">{t.appTagline}</p>

        {/* Tabs: Login / Register */}
        <div className="flex gap-2 mb-6 bg-muted rounded-2xl p-1">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
              mode === "register" ? "bg-duo-green text-white shadow-md" : "text-muted-foreground"
            }`}
          >
            {nativeLanguage === "en" ? "Register" : nativeLanguage === "pt" ? "Cadastrar" : "Registrarse"}
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
              mode === "login" ? "bg-duo-green text-white shadow-md" : "text-muted-foreground"
            }`}
          >
            {nativeLanguage === "en" ? "Log in" : nativeLanguage === "pt" ? "Entrar" : "Iniciar sesión"}
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-1.5">
              {nativeLanguage === "en" ? "Email" : nativeLanguage === "pt" ? "E-mail" : "Correo"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-background font-bold focus:outline-none focus:border-duo-green transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-1.5">
              {nativeLanguage === "en" ? "Password" : nativeLanguage === "pt" ? "Senha" : "Contraseña"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-background font-bold focus:outline-none focus:border-duo-green transition-colors"
                onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSubmit(); }}
              />
            </div>
          </div>

          {/* Campos extra solo en registro */}
          {mode === "register" && (
            <>
              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t.whatsYourName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.yourName}
                    maxLength={20}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-background font-bold focus:outline-none focus:border-duo-green transition-colors"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t.whatCountry}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-bold focus:outline-none focus:border-duo-green transition-colors"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Native Language */}
              <div>
                <label className="block text-xs font-extrabold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t.whatLanguage}
                </label>
                <p className="text-xs text-muted-foreground font-semibold mb-2">{t.learnFromYourLang}</p>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background font-bold focus:outline-none focus:border-duo-green transition-colors"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="duo-btn duo-btn-primary w-full mt-5"
        >
          {loading
            ? "..."
            : mode === "register"
            ? t.startLearning
            : (nativeLanguage === "en" ? "Log in" : nativeLanguage === "pt" ? "Entrar" : "Iniciar sesión")}
        </button>

        <p className="text-xs text-muted-foreground font-semibold text-center mt-4">
          🔒 {nativeLanguage === "en" ? "Your progress is saved and protected with your email" : nativeLanguage === "pt" ? "Seu progresso é salvo e protegido com seu e-mail" : "Tu progreso está guardado y protegido con tu correo"}
        </p>
      </motion.div>
    </div>
  );
}
