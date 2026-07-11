// Lengua Viva - Currículo de Quechua
// Fuente de verdad del contenido de aprendizaje (no se guarda en DB, solo el progreso)

export type ExerciseType =
  | "select" // Mostrar quechua, elegir traducción en español
  | "reverse" // Mostrar español, elegir quechua
  | "match" // Emparejar pares
  | "bank" // Traducir usando banco de palabras
  | "listen"; // Escuchar (TTS) y elegir

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  hint?: string;
  audio?: string; // texto para TTS (quechua)
}

export interface ChoiceExercise extends BaseExercise {
  type: "select" | "reverse" | "listen";
  choices: string[];
  answer: string;
  image?: string;
}

export interface MatchExercise extends BaseExercise {
  type: "match";
  pairs: { q: string; a: string }[];
}

export interface BankExercise extends BaseExercise {
  type: "bank";
  words: string[]; // banco de palabras (orden mostrado se mezcla)
  answer: string[]; // secuencia correcta
}

export type Exercise = ChoiceExercise | MatchExercise | BankExercise;

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  description: string;
  xpReward: number;
  gemReward: number;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  color: string; // clase de color tailwind para el tema
  emoji: string;
  description: string;
  lessons: Lesson[];
}

// Currículo generado automáticamente - 5 meses, 80+ lecciones, 400+ ejercicios
import { generateFullCurriculum } from "./curriculum-generator";
export const CURRICULUM: Unit[] = generateFullCurriculum();

// Logros disponibles
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  target: number;
  metric: "lessons" | "xp" | "streak" | "perfect" | "gems";
  tier: "bronze" | "silver" | "gold" | "diamond";
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_lesson", name: "Primer Paso", description: "Completa tu primera lección", emoji: "🎯", target: 1, metric: "lessons", tier: "bronze" },
  { id: "lessons_5", name: "Estudiante", description: "Completa 5 lecciones", emoji: "📚", target: 5, metric: "lessons", tier: "bronze" },
  { id: "lessons_10", name: "Dedicado", description: "Completa 10 lecciones", emoji: "📖", target: 10, metric: "lessons", tier: "silver" },
  { id: "xp_100", name: "Tejedor", description: "Teje 100 quipus", emoji: "🎋", target: 100, metric: "xp", tier: "bronze" },
  { id: "xp_500", name: "Maestro Tejedor", description: "Teje 500 quipus", emoji: "🧵", target: 500, metric: "xp", tier: "silver" },
  { id: "xp_1000", name: "Leyenda", description: "Teje 1000 quipus", emoji: "💫", target: 1000, metric: "xp", tier: "gold" },
  { id: "streak_3", name: "En Racha", description: "Mantén una racha de 3 días", emoji: "🔥", target: 3, metric: "streak", tier: "bronze" },
  { id: "streak_7", name: "Semana Perfecta", description: "Mantén una racha de 7 días", emoji: "📅", target: 7, metric: "streak", tier: "silver" },
  { id: "streak_30", name: "Inquebrantable", description: "Mantén una racha de 30 días", emoji: "💎", target: 30, metric: "streak", tier: "gold" },
  { id: "perfect_1", name: "Impecable", description: "Completa una lección sin errores", emoji: "✨", target: 1, metric: "perfect", tier: "bronze" },
  { id: "perfect_5", name: "Perfeccionista", description: "Completa 5 lecciones sin errores", emoji: "🏆", target: 5, metric: "perfect", tier: "gold" },
  { id: "gems_100", name: "Ahorrador", description: "Acumula 100 intis", emoji: "☀️", target: 100, metric: "gems", tier: "silver" },
];

// Ligas
export interface League {
  id: string;
  name: string;
  emoji: string;
  color: string;
  min: number; // XP mínimo para no descender (aprox)
}

export const LEAGUES: League[] = [
  { id: "BRONZE", name: "Bronce", emoji: "🥉", color: "amber-7", min: 0 },
  { id: "SILVER", name: "Plata", emoji: "🥈", color: "slate", min: 50 },
  { id: "GOLD", name: "Oro", emoji: "🥇", color: "yellow", min: 100 },
  { id: "SAPPHIRE", name: "Zafiro", emoji: "🔷", color: "cyan", min: 150 },
  { id: "RUBY", name: "Rubí", emoji: "❤️", color: "rose", min: 200 },
  { id: "EMERALD", name: "Esmeralda", emoji: "💚", color: "emerald", min: 300 },
  { id: "DIAMOND", name: "Diamante", emoji: "💎", color: "violet", min: 500 },
];

// Items de la tienda
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  type: "hearts" | "frozen" | "boost" | "cosmetic";
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "refill_hearts", name: "Llenar Corazones", description: "Restaura todos tus corazones al instante", emoji: "❤️", cost: 350, type: "hearts" },
  { id: "frozen_1", name: "Congelar Racha", description: "Protege tu racha por un día perdido", emoji: "🧊", cost: 200, type: "frozen" },
  { id: "frozen_3", name: "3 Congeladores", description: "Tres congeladores de racha", emoji: "🧊", cost: 500, type: "frozen" },
  { id: "double_xp", name: "Doble Quipus (15 min)", description: "Duplica tus quipus tejidos por 15 minutos", emoji: "⚡", cost: 450, type: "boost" },
  { id: "extra_heart", name: "Corazón Extra", description: "Un corazón adicional permanente", emoji: "💖", cost: 800, type: "hearts" },
];

// Helpers
export function getLessonById(lessonId: string): Lesson | undefined {
  for (const unit of CURRICULUM) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getAllLessons(): { unit: Unit; lesson: Lesson; index: number }[] {
  const result: { unit: Unit; lesson: Lesson; index: number }[] = [];
  CURRICULUM.forEach((unit) => {
    unit.lessons.forEach((lesson, index) => {
      result.push({ unit, lesson, index });
    });
  });
  return result;
}

export function getLessonOrder(lessonId: string): number {
  let order = 0;
  for (const unit of CURRICULUM) {
    for (const lesson of unit.lessons) {
      if (lesson.id === lessonId) return order;
      order++;
    }
  }
  return order;
}

export function getNextLessonId(lessonId: string): string | null {
  const all = getAllLessons();
  const idx = all.findIndex((x) => x.lesson.id === lessonId);
  if (idx === -1 || idx + 1 >= all.length) return null;
  return all[idx + 1].lesson.id;
}
