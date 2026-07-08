// Encuesta de personalización del plan de aprendizaje
// Kuntur hace las preguntas estilo Duolingo y el usuario responde según sus gustos.

export interface SurveyOption {
  id: string;
  label: Record<string, string>; // traducciones por idioma
  emoji: string;
  description?: Record<string, string>; // traducciones por idioma
}

export interface SurveyQuestion {
  id: string;
  field: "language" | "goal" | "level" | "pace" | "dailyGoal" | "reminderTime" | "interests";
  type: "single" | "multi" | "time";
  kunturSays: Record<string, string>; // traducciones por idioma
  kunturMood: "feliz" | "guino" | "timido" | "sorprendido" | "enamorado";
  options: SurveyOption[]; // cada opción tiene label y description por idioma
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

// Helper: tr = { es: "...", en: "...", ... }
const tr = (es: string, en: string, pt?: string, fr?: string, de?: string, it?: string, ja?: string, zh?: string): Record<string, string> => {
  const r: Record<string, string> = { es, en };
  if (pt) r.pt = pt;
  if (fr) r.fr = fr;
  if (de) r.de = de;
  if (it) r.it = it;
  if (ja) r.ja = ja;
  if (zh) r.zh = zh;
  // Quechua y Aimara usan español como fallback
  r.qu = es;
  r.ay = es;
  return r;
};

const soon = tr("(próximamente)", "(coming soon)", "(em breve)", "(bientôt)", "(bald)", "(prossimamente)", "(もうすぐ)", "(即将推出)");

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q_language",
    field: "language",
    type: "single",
    kunturSays: tr(
      "¿Qué lengua del Perú quieres aprender? 🦅",
      "Which language of Peru do you want to learn? 🦅",
      "Qual língua do Peru você quer aprender? 🦅",
      "Quelle langue du Pérou voulez-vous apprendre? 🦅",
      "Welche Sprache Perus möchtest du lernen? 🦅",
      "Quale lingua del Perù vuoi imparare? 🦅",
      "ペルーのどの言語を学びたいですか？🦅",
      "你想学秘鲁的哪种语言？🦅",
    ),
    kunturMood: "feliz",
    options: PERUVIAN_LANGUAGES.map((l) => ({
      id: l.id,
      label: tr(l.name, l.name, l.name, l.name, l.name, l.name, l.name, l.name),
      emoji: l.emoji,
      description: tr(
        l.region + (l.available ? "" : " (próximamente)"),
        l.region + (l.available ? "" : " (coming soon)"),
        l.region + (l.available ? "" : " (em breve)"),
        l.region + (l.available ? "" : " (bientôt)"),
        l.region + (l.available ? "" : " (bald)"),
        l.region + (l.available ? "" : " (prossimamente)"),
        l.region + (l.available ? "" : " (もうすぐ)"),
        l.region + (l.available ? "" : " (即将推出)"),
      ),
    })),
  },
  {
    id: "q_goal",
    field: "goal",
    type: "single",
    kunturSays: tr(
      "¿Por qué quieres aprender esta lengua?",
      "Why do you want to learn this language?",
      "Por que você quer aprender esta língua?",
      "Pourquoi voulez-vous apprendre cette langue?",
      "Warum möchtest du diese Sprache lernen?",
      "Perché vuoi imparare questa lingua?",
      "なぜこの言語を学びたいですか？",
      "你为什么想学这门语言？",
    ),
    kunturMood: "guino",
    options: [
      { id: "viajar", emoji: "✈️", label: tr("Para viajar", "To travel", "Para viajar", "Pour voyager", "Zum Reisen", "Per viaggiare", "旅行のため", "为了旅行"), description: tr("Conocer comunidades y lugares", "Meet communities and places", "Conhecer comunidades e lugares", "Rencontrer des communautés", "Gemeinschaften kennenlernen", "Conoscere comunità", "コミュニティに出会う", "结识社区") },
      { id: "cultura", emoji: "🦙", label: tr("Conectar con mis raíces", "Connect with my roots", "Conectar com minhas raízes", "Connecter avec mes racines", "Mit meinen Wurzeln verbinden", "Connettermi alle mie radici", "ルーツとつながる", "与我的根源相连"), description: tr("Recuperar la lengua de mis abuelos", "Recover my grandparents' language", "Recuperar a língua dos meus avós", "Retrouver la langue de mes aïeux", "Die Sprache meiner Großeltern zurückgewinnen", "Recuperare la lingua dei nonni", "祖父母の言葉を取り戻す", "恢复祖辈的语言") },
      { id: "trabajo", emoji: "💼", label: tr("Para mi trabajo", "For my work", "Para o meu trabalho", "Pour mon travail", "Für meine Arbeit", "Per il mio lavoro", "仕事のため", "为了工作"), description: tr("Atender a comunidades", "Serve communities", "Atender comunidades", "Servir les communautés", "Gemeinschaften dienen", "Servire le comunità", "コミュニティに奉仕する", "服务社区") },
      { id: "estudio", emoji: "📚", label: tr("Por estudio", "For study", "Por estudo", "Pour étudier", "Zum Studieren", "Per studio", "勉強のため", "为了学习"), description: tr("Investigación o academia", "Research or academia", "Pesquisa ou academia", "Recherche ou academia", "Forschung oder Akademie", "Ricerca o accademia", "研究や学術", "研究或学术") },
      { id: "curiosidad", emoji: "✨", label: tr("Por curiosidad", "Out of curiosity", "Por curiosidade", "Par curiosité", "Aus Neugier", "Per curiosità", "好奇心から", "出于好奇"), description: tr("Aprender algo nuevo", "Learn something new", "Aprender algo novo", "Apprendre quelque chose de nouveau", "Etwas Neues lernen", "Imparare qualcosa di nuovo", "新しいことを学ぶ", "学习新东西") },
    ],
  },
  {
    id: "q_level",
    field: "level",
    type: "single",
    kunturSays: tr(
      "¿Cuánto sabes ya de esta lengua?",
      "How much do you already know?",
      "Quanto você já sabe?",
      "Combien connaissez-vous déjà?",
      "Wie viel weißt du schon?",
      "Quanto già sai?",
      "どのくらい知っていますか？",
      "你已经知道多少了？",
    ),
    kunturMood: "timido",
    options: [
      { id: "principiante", emoji: "🌱", label: tr("Nada, principiante", "Nothing, beginner", "Nada, iniciante", "Rien, débutant", "Nichts, Anfänger", "Niente, principiante", "ゼロ、初心者", "零基础，初学者"), description: tr("Empiezo desde cero", "Starting from scratch", "Começo do zero", "Je commence de zéro", "Ich fange bei null an", "Inizio da zero", "ゼロから始める", "从零开始") },
      { id: "basico", emoji: "🌿", label: tr("Algo básico", "Some basics", "Algum básico", "Quelques bases", "Einige Grundlagen", "Qualche base", "少し基礎", "一些基础"), description: tr("Conozco algunas palabras", "I know some words", "Conheço algumas palavras", "Je connais quelques mots", "Ich kenne einige Wörter", "Conosco alcune parole", "いくつかの言葉を知っている", "认识一些词") },
      { id: "intermedio", emoji: "🌳", label: tr("Intermedio", "Intermediate", "Intermediário", "Intermédiaire", "Fortgeschritten", "Intermedio", "中級", "中级"), description: tr("Puedo armar frases", "I can build sentences", "Posso formar frases", "Je peux former des phrases", "Ich kann Sätze bilden", "Posso formare frasi", "文を作れる", "能造句") },
      { id: "avanzado", emoji: "🏔️", label: tr("Avanzado", "Advanced", "Avançado", "Avancé", "Fortgeschritten", "Avanzato", "上級", "高级"), description: tr("Quiero perfeccionar", "I want to perfect", "Quero aperfeiçoar", "Je veux perfectionner", "Ich will perfektionieren", "Voglio perfezionare", "完璧にしたい", "想精进") },
    ],
  },
  {
    id: "q_pace",
    field: "pace",
    type: "single",
    kunturSays: tr(
      "¿Qué ritmo de aprendizaje prefieres?",
      "What learning pace do you prefer?",
      "Qual ritmo de aprendizado você prefere?",
      "Quel rythme d'apprentissage préférez-vous?",
      "Welches Lerntempo bevorzugst du?",
      "Quale ritmo di apprendimento preferisci?",
      "どの学習ペースが好きですか？",
      "你偏好什么学习节奏？",
    ),
    kunturMood: "feliz",
    options: [
      { id: "relajado", emoji: "🐢", label: tr("Relajado", "Relaxed", "Relaxado", "Détendu", "Entspannt", "Rilassato", "リラックス", "轻松"), description: tr("Poco a poco, sin presión", "Little by little, no pressure", "Pouco a pouco, sem pressão", "Peu à peu, sans pression", "Schritt für Schritt, kein Druck", "Poco a poco, senza pressione", "ゆっくり、プレッシャーなく", "循序渐进，无压力") },
      { id: "medio", emoji: "🚶", label: tr("Medio", "Medium", "Médio", "Moyen", "Mittel", "Medio", "中程度", "中等"), description: tr("Constante y equilibrado", "Steady and balanced", "Constante e equilibrado", "Constant et équilibré", "Stetig und ausgewogen", "Costante e equilibrato", "一定でバランス良く", "稳定平衡") },
      { id: "intenso", emoji: "⚡", label: tr("Intenso", "Intense", "Intenso", "Intense", "Intensiv", "Intenso", "集中的", "高强度"), description: tr("Aprendo rápido todos los días", "I learn fast every day", "Aprendo rápido todos os dias", "J'apprends vite chaque jour", "Ich lerne schnell jeden Tag", "Imparo velocemente ogni giorno", "毎日早く学ぶ", "每天快速学习") },
    ],
  },
  {
    id: "q_dailyGoal",
    field: "dailyGoal",
    type: "single",
    kunturSays: tr(
      "¿Cuántos quipus quieres tejer al día? 🎋",
      "How many quipus do you want to weave per day? 🎋",
      "Quantos quipus você quer tecer por dia? 🎋",
      "Combien de quipus voulez-vous tisser par jour? 🎋",
      "Wie viele Quipus möchtest du pro Tag weben? 🎋",
      "Quanti quipu vuoi tessere al giorno? 🎋",
      "1日に何個のキプを作りたいですか？🎋",
      "你每天想织多少个结绳？🎋",
    ),
    kunturMood: "sorprendido",
    options: [
      { id: "10", emoji: "🎋", label: tr("10 quipus", "10 quipus", "10 quipus", "10 quipus", "10 Quipus", "10 quipu", "10キプ", "10个结绳"), description: tr("5 min/día — suave", "5 min/day — light", "5 min/dia — leve", "5 min/jour — léger", "5 Min/Tag — leicht", "5 min/giorno — leggero", "5分/日 —軽い", "5分钟/天 — 轻松") },
      { id: "20", emoji: "🎋🎋", label: tr("20 quipus", "20 quipus", "20 quipus", "20 quipus", "20 Quipus", "20 quipu", "20キプ", "20个结绳"), description: tr("10 min/día — casual", "10 min/day — casual", "10 min/dia — casual", "10 min/jour — décontracté", "10 Min/Tag — locker", "10 min/giorno — casual", "10分/日 —カジュアル", "10分钟/天 — 休闲") },
      { id: "30", emoji: "🎋🎋🎋", label: tr("30 quipus", "30 quipus", "30 quipus", "30 quipus", "30 Quipus", "30 quipu", "30キプ", "30个结绳"), description: tr("15 min/día — regular", "15 min/day — regular", "15 min/dia — regular", "15 min/jour — régulier", "15 Min/Tag — regelmäßig", "15 min/giorno — regolare", "15分/日 —普通", "15分钟/天 — 常规") },
      { id: "50", emoji: "🎋🎋🎋🎋", label: tr("50 quipus", "50 quipus", "50 quipus", "50 quipus", "50 Quipus", "50 quipu", "50キプ", "50个结绳"), description: tr("25 min/día — serio", "25 min/day — serious", "25 min/dia — sério", "25 min/jour — sérieux", "25 Min/Tag — ernst", "25 min/giorno — serio", "25分/日 —真剣", "25分钟/天 — 认真") },
      { id: "100", emoji: "🔥", label: tr("100 quipus", "100 quipus", "100 quipus", "100 quipus", "100 Quipus", "100 quipu", "100キプ", "100个结绳"), description: tr("50 min/día — intenso", "50 min/day — intense", "50 min/dia — intenso", "50 min/jour — intense", "50 Min/Tag — intensiv", "50 min/giorno — intenso", "50分/日 —集中", "50分钟/天 — 高强度") },
    ],
  },
  {
    id: "q_interests",
    field: "interests",
    type: "multi",
    kunturSays: tr(
      "¿Qué temas te interesan más? (elige varios)",
      "What topics interest you most? (choose several)",
      "Quais tópicos te interessam mais? (escolha vários)",
      "Quels sujets vous intéressent le plus? (choisissez-en plusieurs)",
      "Welche Themen interessieren dich am meisten? (wähle mehrere)",
      "Quali argomenti ti interessano di più? (scegline diversi)",
      "どのトピックに最も興味がありますか？（複数選択）",
      "你最感兴趣哪些主题？（选择多个）",
    ),
    kunturMood: "enamorado",
    options: [
      { id: "saludos", emoji: "💬", label: tr("Saludos y conversación", "Greetings & conversation", "Saudações e conversa", "Salutations et conversation", "Begrüßungen & Konversation", "Saluti e conversazione", "挨拶と会話", "问候与对话") },
      { id: "familia", emoji: "👨‍👩‍👧", label: tr("Familia", "Family", "Família", "Famille", "Familie", "Famiglia", "家族", "家庭") },
      { id: "naturaleza", emoji: "🌿", label: tr("Naturaleza", "Nature", "Natureza", "Nature", "Natur", "Natura", "自然", "自然") },
      { id: "comida", emoji: "🍎", label: tr("Comida", "Food", "Comida", "Nourriture", "Essen", "Cibo", "食べ物", "食物") },
      { id: "animales", emoji: "🦙", label: tr("Animales", "Animals", "Animais", "Animaux", "Tiere", "Animali", "動物", "动物") },
      { id: "numeros", emoji: "🔢", label: tr("Números", "Numbers", "Números", "Nombres", "Zahlen", "Numeri", "数字", "数字") },
      { id: "viajes", emoji: "✈️", label: tr("Viajes", "Travel", "Viagens", "Voyages", "Reisen", "Viaggi", "旅行", "旅行") },
      { id: "cultura", emoji: "🏔️", label: tr("Cultura andina", "Andean culture", "Cultura andina", "Culture andine", "Andine Kultur", "Cultura andina", "アンデス文化", "安第斯文化") },
      { id: "musica", emoji: "🎶", label: tr("Música", "Music", "Música", "Musique", "Musik", "Musica", "音楽", "音乐") },
      { id: "trabajo", emoji: "💼", label: tr("Trabajo", "Work", "Trabalho", "Travail", "Arbeit", "Lavoro", "仕事", "工作") },
    ],
  },
  {
    id: "q_reminder",
    field: "reminderTime",
    type: "time",
    kunturSays: tr(
      "¿A qué hora te gustaría practicar? (opcional)",
      "What time would you like to practice? (optional)",
      "A que hora você gostaria de praticar? (opcional)",
      "À quelle heure aimeriez-vous pratiquer? (optionnel)",
      "Um welche Uhrzeit möchtest du üben? (optional)",
      "A che ora vorresti esercitarti? (opzionale)",
      "何時に練習したいですか？（任意）",
      "你想在什么时间练习？（可选）",
    ),
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
