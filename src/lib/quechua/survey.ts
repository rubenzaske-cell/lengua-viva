// Encuesta de personalización del plan de aprendizaje
// Kuntur hace las preguntas estilo Duolingo y el usuario responde según sus gustos.

export interface SurveyOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface SurveyQuestion {
  id: string;
  field: "language" | "goal" | "level" | "pace" | "dailyGoal" | "reminderTime" | "interests";
  type: "single" | "multi" | "time";
  kunturSays: string; // lo que Kuntur "dice" al hacer la pregunta
  kunturMood: "feliz" | "guino" | "timido" | "sorprendido" | "enamorado";
  options: SurveyOption[];
}

// Lenguas originarias del Perú (solo Quechua activo por ahora)
export const PERUVIAN_LANGUAGES: { id: string; name: string; emoji: string; available: boolean; region: string }[] = [
  { id: "quechua", name: "Quechua", emoji: "🦙", available: true, region: "Sierra (Runa Simi)" },
  { id: "aimara", name: "Aimara", emoji: "🏔️", available: false, region: "Sur andino" },
  { id: "ashaninka", name: "Asháninka", emoji: "🌿", available: false, region: "Amazonía central" },
  { id: "shipibo", name: "Shipibo-Konibo", emoji: "🐍", available: false, region: "Amazonía (Ucayali)" },
  { id: "awajun", name: "Awajún", emoji: "🏹", available: false, region: "Amazonía norte" },
  { id: "matsigenka", name: "Matsigenka", emoji: "🍃", available: false, region: "Amazonía (Cusco/Madre de Dios)" },
  { id: "yine", name: "Yine", emoji: "🪶", available: false, region: "Amazonía sur" },
  { id: "kukama", name: "Kukama-Kukamiria", emoji: "🐬", available: false, region: "Amazonía (Loreto)" },
  { id: "wampis", name: "Wampis", emoji: "🪵", available: false, region: "Amazonía norte" },
  { id: "ese_eja", name: "Ese Eja", emoji: "🌳", available: false, region: "Amazonía sur" },
];

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q_language",
    field: "language",
    type: "single",
    kunturSays: "¿Qué lengua del Perú quieres aprender? 🦅",
    kunturMood: "feliz",
    options: PERUVIAN_LANGUAGES.map((l) => ({
      id: l.id,
      label: l.name,
      emoji: l.emoji,
      description: l.region + (l.available ? "" : " (próximamente)"),
    })),
  },
  {
    id: "q_goal",
    field: "goal",
    type: "single",
    kunturSays: "¿Por qué quieres aprender esta lengua?",
    kunturMood: "guino",
    options: [
      { id: "viajar", label: "Para viajar", emoji: "✈️", description: "Conocer comunidades y lugares" },
      { id: "cultura", label: "Conectar con mis raíces", emoji: "🦙", description: "Recuperar la lengua de mis abuelos" },
      { id: "trabajo", label: "Para mi trabajo", emoji: "💼", description: "Atender a comunidades" },
      { id: "estudio", label: "Por estudio", emoji: "📚", description: "Investigación o academia" },
      { id: "curiosidad", label: "Por curiosidad", emoji: "✨", description: "Aprender algo nuevo" },
    ],
  },
  {
    id: "q_level",
    field: "level",
    type: "single",
    kunturSays: "¿Cuánto sabes ya de esta lengua?",
    kunturMood: "timido",
    options: [
      { id: "principiante", label: "Nada, principiante", emoji: "🌱", description: "Empiezo desde cero" },
      { id: "basico", label: "Algo básico", emoji: "🌿", description: "Conozco algunas palabras" },
      { id: "intermedio", label: "Intermedio", emoji: "🌳", description: "Puedo armar frases" },
      { id: "avanzado", label: "Avanzado", emoji: "🏔️", description: "Quiero perfeccionar" },
    ],
  },
  {
    id: "q_pace",
    field: "pace",
    type: "single",
    kunturSays: "¿Qué ritmo de aprendizaje prefieres?",
    kunturMood: "feliz",
    options: [
      { id: "relajado", label: "Relajado", emoji: "🐢", description: "Poco a poco, sin presión" },
      { id: "medio", label: "Medio", emoji: "🚶", description: "Constante y equilibrado" },
      { id: "intenso", label: "Intenso", emoji: "⚡", description: "Aprendo rápido todos los días" },
    ],
  },
  {
    id: "q_dailyGoal",
    field: "dailyGoal",
    type: "single",
    kunturSays: "¿Cuántos quipus quieres tejer al día? 🎋",
    kunturMood: "sorprendido",
    options: [
      { id: "10", label: "10 quipus", emoji: "🎋", description: "5 min/día — suave" },
      { id: "20", label: "20 quipus", emoji: "🎋🎋", description: "10 min/día — casual" },
      { id: "30", label: "30 quipus", emoji: "🎋🎋🎋", description: "15 min/día — regular" },
      { id: "50", label: "50 quipus", emoji: "🎋🎋🎋🎋", description: "25 min/día — serio" },
      { id: "100", label: "100 quipus", emoji: "🔥", description: "50 min/día — intenso" },
    ],
  },
  {
    id: "q_interests",
    field: "interests",
    type: "multi",
    kunturSays: "¿Qué temas te interesan más? (elige varios)",
    kunturMood: "enamorado",
    options: [
      { id: "saludos", label: "Saludos y conversación", emoji: "💬" },
      { id: "familia", label: "Familia", emoji: "👨‍👩‍👧" },
      { id: "naturaleza", label: "Naturaleza", emoji: "🌿" },
      { id: "comida", label: "Comida", emoji: "🍎" },
      { id: "animales", label: "Animales", emoji: "🦙" },
      { id: "numeros", label: "Números", emoji: "🔢" },
      { id: "viajes", label: "Viajes", emoji: "✈️" },
      { id: "cultura", label: "Cultura andina", emoji: "🏔️" },
      { id: "musica", label: "Música", emoji: "🎶" },
      { id: "trabajo", label: "Trabajo", emoji: "💼" },
    ],
  },
  {
    id: "q_reminder",
    field: "reminderTime",
    type: "time",
    kunturSays: "¿A qué hora te gustaría practicar? (opcional)",
    kunturMood: "timido",
    options: [],
  },
];

export interface SurveyAnswers {
  language: string;
  goal: string;
  level: string;
  pace: string;
  dailyGoal: number;
  reminderTime: string | null;
  interests: string[];
}

export const DEFAULT_SURVEY: SurveyAnswers = {
  language: "quechua",
  goal: "viajar",
  level: "principiante",
  pace: "medio",
  dailyGoal: 30,
  reminderTime: null,
  interests: [],
};

// Saludos personalizados de Kuntur según el plan del usuario
export function getKunturGreetingForPlan(plan: SurveyAnswers): string {
  const greetings: Record<string, string> = {
    viajar: "¡Aprendemos para tus viajes! ✈️",
    cultura: "¡Recuperemos tus raíces! 🦙",
    trabajo: "¡Para atender mejor a tu comunidad! 💼",
    estudio: "¡A investigar se ha dicho! 📚",
    curiosidad: "¡La curiosidad es el mejor maestro! ✨",
  };
  return greetings[plan.goal] || "¡Allinllachu! Soy Kuntur 🦅";
}

// Frases de Kuntur según el ritmo
export function getKunturPaceMessage(pace: string): string {
  const msgs: Record<string, string> = {
    relajado: "Vamos sin prisa, a tu ritmo 🐢",
    medio: "Constancia es la clave 🚶",
    intenso: "¡Aprendemos rápido! ⚡",
  };
  return msgs[pace] || "";
}
