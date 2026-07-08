// Helpers de gamificación para Lengua Viva

export function todayStr(): string {
  // Fecha en zona del usuario (America/Lima) en formato YYYY-MM-DD
  const now = new Date();
  const lima = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
  const y = lima.getFullYear();
  const m = String(lima.getMonth() + 1).padStart(2, "0");
  const d = String(lima.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function yesterdayStr(): string {
  const now = new Date();
  const lima = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
  lima.setDate(lima.getDate() - 1);
  const y = lima.getFullYear();
  const m = String(lima.getMonth() + 1).padStart(2, "0");
  const d = String(lima.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// Regeneración de corazones: 1 corazón cada 30 minutos
export const HEART_REGEN_MINUTES = 30;

export function calcRegenHearts(lastRegen: Date, currentHearts: number, maxHearts: number): number {
  if (currentHearts >= maxHearts) return currentHearts;
  const now = new Date();
  const minutesPassed = (now.getTime() - lastRegen.getTime()) / (1000 * 60);
  const heartsToAdd = Math.floor(minutesPassed / HEART_REGEN_MINUTES);
  return Math.min(maxHearts, currentHearts + heartsToAdd);
}

export function nextHeartInMs(lastRegen: Date, currentHearts: number, maxHearts: number): number | null {
  if (currentHearts >= maxHearts) return null;
  const now = new Date();
  const minutesPassed = (now.getTime() - lastRegen.getTime()) / (1000 * 60);
  const minutesUntilNext = HEART_REGEN_MINUTES - (minutesPassed % HEART_REGEN_MINUTES);
  return minutesUntilNext * 60 * 1000;
}

export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Determinar el nivel del usuario basado en Quipus tejidos (XP)
export function getLevel(xp: number): { level: number; title: string; current: number; needed: number; progress: number } {
  // Cada nivel requiere más quipus: nivel n requiere 50 * n quipus acumulado
  let level = 1;
  let needed = 50;
  let acc = 0;
  while (xp >= acc + needed) {
    acc += needed;
    level++;
    needed = 50 + (level - 1) * 25;
  }
  const current = xp - acc;
  const titles = ["Novato", "Aprendiz", "Explorador", "Guía", "Sabio", "Maestro", "Chakaruna", "Auki", "Apu", "Wiracocha"];
  return {
    level,
    title: titles[Math.min(level - 1, titles.length - 1)],
    current,
    needed,
    progress: current / needed,
  };
}

// Bots para el leaderboard (nombres quechuas)
export const LEAGUE_BOTS = [
  { name: "Sumaq", avatar: "🦙" },
  { name: "Inti", avatar: "☀️" },
  { name: "Killa", avatar: "🌙" },
  { name: "Wayra", avatar: "💨" },
  { name: "Pacha", avatar: "🌍" },
  { name: "Nina", avatar: "🔥" },
  { name: "Yaku", avatar: "💧" },
  { name: "Rumi", avatar: "🪨" },
  { name: "Sara", avatar: "🌽" },
  { name: "Tanta", avatar: "🍞" },
];
