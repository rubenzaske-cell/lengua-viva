"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Users, BookOpen } from "lucide-react";
import { KunturMascot } from "@/components/quechua/KunturMascot";

interface LanguageRegion {
  id: string;
  name: string;
  emoji: string;
  family: string;
  region: string;
  regionLabel: string;
  speakers: string;
  available: boolean;
  status: "activo" | "en desarrollo" | "próximamente";
  description: string;
  // Posición en el mapa (porcentaje relativo)
  x: number;
  y: number;
  color: string;
}

const LANGUAGES: LanguageRegion[] = [
  {
    id: "quechua",
    name: "Quechua",
    emoji: "🦙",
    family: "Quechua",
    region: "sierra",
    regionLabel: "Sierra (Cusco, Ayacucho, Puno)",
    speakers: "~4 millones",
    available: true,
    status: "activo",
    description: "Lengua oficial del Tawantinsuyu. La más hablada de las lenguas originarias del Perú.",
    x: 58,
    y: 55,
    color: "#c2410c",
  },
  {
    id: "aimara",
    name: "Aimara",
    emoji: "🏔️",
    family: "Aru",
    region: "sur",
    regionLabel: "Sur andino (Puno, Tacna, Moquegua)",
    speakers: "~500 mil",
    available: false,
    status: "próximamente",
    description: "Lengua milenaria del altiplano, junto al lago Titicaca. Segunda lengua originaria más hablada.",
    x: 55,
    y: 72,
    color: "#0369a1",
  },
  {
    id: "ashaninka",
    name: "Asháninka",
    emoji: "🌿",
    family: "Arawak",
    region: "amazonia",
    regionLabel: "Amazonía central (Junín, Ucayali)",
    speakers: "~100 mil",
    available: false,
    status: "próximamente",
    description: "Lengua del pueblo Asháninka, uno de los más grandes de la Amazonía peruana.",
    x: 62,
    y: 48,
    color: "#15803d",
  },
  {
    id: "shipibo",
    name: "Shipibo-Konibo",
    emoji: "🐍",
    family: "Pano",
    region: "ucayali",
    regionLabel: "Amazonía (Ucayali)",
    speakers: "~35 mil",
    available: false,
    status: "próximamente",
    description: "Famosa por sus patrones geométricos y su rica tradición artesanal y espiritual.",
    x: 68,
    y: 52,
    color: "#7c3aed",
  },
  {
    id: "awajun",
    name: "Awajún",
    emoji: "🏹",
    family: "Jíbaro",
    region: "norte",
    regionLabel: "Amazonía norte (Amazonas, Loreto)",
    speakers: "~80 mil",
    available: false,
    status: "próximamente",
    description: "Pueblo guerrero de la selva norte, conocido por su resistencia y autonomía.",
    x: 52,
    y: 28,
    color: "#b45309",
  },
  {
    id: "matsigenka",
    name: "Matsigenka",
    emoji: "🍃",
    family: "Arawak",
    region: "cusco",
    regionLabel: "Amazonía (Cusco, Madre de Dios)",
    speakers: "~15 mil",
    available: false,
    status: "próximamente",
    description: "Pueblo indígena del Bajo Urubamba y Manu, con profunda conexión con la selva.",
    x: 60,
    y: 60,
    color: "#0d9488",
  },
  {
    id: "kukama",
    name: "Kukama-Kukamiria",
    emoji: "🐬",
    family: "Tupí-Guaraní",
    region: "loreto",
    regionLabel: "Amazonía (Loreto)",
    speakers: "~10 mil",
    available: false,
    status: "próximamente",
    description: "Pueblo ribereño del Marañón y Huallaga, con rica tradición acuática.",
    x: 50,
    y: 18,
    color: "#0891b2",
  },
  {
    id: "wampis",
    name: "Wampis",
    emoji: "🪵",
    family: "Jíbaro",
    region: "norte",
    regionLabel: "Amazonía norte (Condorcanqui, Datem)",
    speakers: "~10 mil",
    available: false,
    status: "próximamente",
    description: "Pueblo de la cuenca del Santiago, con autogobierno y territorio own.",
    x: 48,
    y: 22,
    color: "#92400e",
  },
];

export function PeruMapView() {
  const [selected, setSelected] = useState<LanguageRegion | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const families = ["all", ...Array.from(new Set(LANGUAGES.map((l) => l.family)))];
  const filtered = filter === "all" ? LANGUAGES : LANGUAGES.filter((l) => l.family === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold">Mapa Lingüístico del Perú</h1>
        <p className="text-sm text-muted-foreground font-semibold mt-1">
          Descubre las lenguas originarias que dan vida al Perú
        </p>
      </div>

      {/* Kuntur presentador */}
      <div className="flex justify-center mb-6">
        <KunturMascot
          mood="feliz"
          size={100}
          speech="¡El Perú tiene 47 lenguas originarias! Toca cada punto para descubrirlas."
        />
      </div>

      {/* Filtros por familia */}
      <div className="flex gap-2 overflow-x-auto scroll-quechua pb-2 mb-4">
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 border ${
              filter === f
                ? "bg-duo-green text-white border-duo-green"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {f === "all" ? "Todas" : f}
          </button>
        ))}
      </div>

      {/* Mapa SVG estilizado del Perú */}
      <div className="relative bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 rounded-2xl border border-border p-4 mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-auto" style={{ maxHeight: "400px" }}>
          {/* Silueta simplificada del Perú */}
          <path
            d="M 40 10 L 55 8 L 62 15 L 70 18 L 72 25 L 68 32 L 72 40 L 70 48 L 65 52 L 68 58 L 62 65 L 58 72 L 52 78 L 48 80 L 45 75 L 42 68 L 38 60 L 35 52 L 33 45 L 35 38 L 38 30 L 40 20 Z"
            className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-300 dark:stroke-emerald-700"
            strokeWidth="0.5"
          />
          {/* Línea de costa */}
          <path
            d="M 40 10 L 40 20 L 38 30 L 35 38 L 33 45 L 35 52 L 38 60 L 42 68 L 45 75 L 48 80"
            className="stroke-sky-400 dark:stroke-sky-600"
            strokeWidth="0.3"
            fill="none"
            strokeDasharray="1,1"
          />

          {/* Puntos de lenguas */}
          {filtered.map((lang) => (
            <g key={lang.id} className="cursor-pointer" onClick={() => setSelected(lang)}>
              {/* Anillo pulsante para lenguas disponibles */}
              {lang.available && (
                <circle
                  cx={lang.x}
                  cy={lang.y}
                  r="3"
                  fill={lang.color}
                  opacity="0.3"
                >
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Punto principal */}
              <circle
                cx={lang.x}
                cy={lang.y}
                r={lang.available ? 2.5 : 2}
                fill={lang.color}
                className="transition-all duration-200 hover:opacity-80"
                opacity={lang.available ? 1 : 0.6}
              />
              {/* Etiqueta */}
              <text
                x={lang.x}
                y={lang.y - 3.5}
                textAnchor="middle"
                className="fill-foreground font-bold"
                style={{ fontSize: "2.2px" }}
              >
                {lang.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-duo-green" />
            <span className="text-xs font-bold text-muted-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
            <span className="text-xs font-bold text-muted-foreground">Próximamente</span>
          </div>
        </div>
      </div>

      {/* Lista de lenguas */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((lang, i) => (
          <motion.button
            key={lang.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(lang)}
            className="bg-card rounded-2xl border border-border p-4 text-left hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{lang.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold truncate">{lang.name}</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">{lang.family}</p>
              </div>
              {lang.available ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-duo-green/15 text-duo-green">
                  Activo
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Pronto
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-semibold truncate">{lang.regionLabel}</p>
          </motion.button>
        ))}
      </div>

      {/* Modal de detalle */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto scroll-quechua"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selected.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-extrabold">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{selected.family}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge de estado */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selected.available
                      ? "bg-duo-green/15 text-duo-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {selected.available ? "● Disponible ahora" : "○ Próximamente"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">Región</span>
                  </div>
                  <p className="text-xs font-bold">{selected.regionLabel}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">Hablantes</span>
                  </div>
                  <p className="text-sm font-extrabold">{selected.speakers}</p>
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-muted/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Sobre la lengua</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed">{selected.description}</p>
              </div>

              {/* CTA */}
              {selected.available ? (
                <button className="duo-btn duo-btn-primary w-full">
                  Aprender {selected.name}
                </button>
              ) : (
                <div className="text-center text-xs text-muted-foreground font-semibold py-2">
                  Estamos trabajando para traerte esta lengua pronto
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground font-semibold">
          El Perú tiene 47 lenguas originarias: 4 andinas y 43 amazónicas
        </p>
      </div>
    </div>
  );
}
