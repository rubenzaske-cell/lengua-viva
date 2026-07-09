// Sistema de traducciones para Lengua Viva
// Traduce la interfaz al idioma nativo del usuario.

export type LanguageCode = "es" | "en" | "pt" | "fr" | "de" | "it" | "ja" | "zh" | "qu" | "ay";

export interface Translations {
  // Onboarding
  appName: string;
  appTagline: string;
  letsCreateProfile: string;
  whatsYourName: string;
  yourName: string;
  whatCountry: string;
  whatLanguage: string;
  learnFromYourLang: string;
  startLearning: string;
  creating: string;
  writeName: string;
  selectCountry: string;
  selectLanguage: string;
  progressSaved: string;

  // Encuesta
  surveyProgress: string;
  touchOptionToContinue: string;
  kunturWriting: string;
  skipQuestion: string;
  continueN: string;
  chooseTime: string;
  noReminder: string;
  touchTopics: string;
  selectedN: string;
  touchMoreOrContinue: string;

  // Loading
  creatingYourPlan: string;
  weavingQuipu: string;
  preparingLessons: string;
  loadingVocabulary: string;
  adjustingRhythm: string;
  finalTouches: string;
  almostReady: string;
  ready: string;
  loadingPlan: string;

  // Celebration
  planReady: string;
  whatYouWillAchieve: string;
  beginAdventure: string;

  // Ruta de aprendizaje
  learnPathXp: string;
  keepLearning: string;

  // Lecciones
  selectMeaning: string;
  selectWord: string;
  matchWords: string;
  translatePhrase: string;
  whatDidYouHear: string;
  check: string;
  continue: string;
  correct: string;
  almost: string;
  correctAnswer: string;
  skip: string;
  noHearts: string;
  buyMore: string;
  exitLesson: string;
  exitLessonQ: string;
  exitLessonDesc: string;
  keepLearningBtn: string;
  exit: string;
  saving: string;
  lessonComplete: string;
  perfect: string;
  keepItUp: string;
  quipus: string;
  intis: string;

  // TopBar
  streak: string;
  hearts: string;

  // Navigation
  navLearn: string;
  navLeagues: string;
  navAchievements: string;
  navShop: string;
  navProfile: string;

  // Perfil
  level: string;
  daysStreak: string;
  totalXp: string;
  crowns: string;
  myPlan: string;
  language: string;
  dailyGoal: string;
  objective: string;
  pace: string;
  yourLevel: string;
  reminder: string;
  interests: string;
  yourWeek: string;
  dailyGoalTitle: string;
  gainedToday: string;
  achievements: string;
  unlocked: string;
  seeAchievements: string;
  editName: string;
  save: string;
  cancel: string;

  // Tienda
  shop: string;
  intisAmount: string;
  heartsStatus: string;
  refillHearts: string;
  refillHeartsDesc: string;
  freezeStreak: string;
  freezeStreakDesc: string;
  threeFreezers: string;
  threeFreezersDesc: string;
  doubleXp: string;
  doubleXpDesc: string;
  extraHeart: string;
  extraHeartDesc: string;
  earnIntis: string;

  // Ligas
  topPromote: string;
  lastDemote: string;
  yourRank: string;
  ofPlayers: string;
  firstInLeague: string;
  shareToCompete: string;
  leagueWeek: string;
  leagueLadder: string;
  simulateWeek: string;
  closeWeekDesc: string;

  // Logros
  achievementsTitle: string;
  unlockedOf: string;

  // Frases motivadoras
  motQuechua: string;
  motTravel: string;
  motCulture: string;
  motWork: string;
  motStudy: string;
  motCuriosity: string;
  motBeginner: string;
  motBasic: string;
  motIntermediate: string;
  motAdvanced: string;
  motRelaxed: string;
  motMedium: string;
  motIntense: string;
  mot10: string;
  mot20: string;
  mot30: string;
  mot50: string;
  mot100: string;
  motReminder: string;
  motNoReminder: string;
  motInterests: string;
  motNoInterests: string;

  // Kuntur
  kunturGreeting: string;
  kunturAskLanguage: string;
  kunturAskGoal: string;
  kunturAskLevel: string;
  kunturAskPace: string;
  kunturAskDailyGoal: string;
  kunturAskInterests: string;
  kunturAskReminder: string;
}

const es: Translations = {
  appName: "Lengua Viva",
  appTagline: "Lenguas del Perú, vivas para siempre",
  letsCreateProfile: "Lenguas del Perú, vivas para siempre. ¡Creemos tu perfil!",
  whatsYourName: "¿Cómo te llamas?",
  yourName: "Tu nombre",
  whatCountry: "¿De qué país eres?",
  whatLanguage: "¿Qué idioma hablas?",
  learnFromYourLang: "Aprenderás las lenguas del Perú desde tu idioma",
  startLearning: "¡Empezar a aprender!",
  creating: "Creando...",
  writeName: "Escribe tu nombre para empezar",
  selectCountry: "Selecciona tu país",
  selectLanguage: "Selecciona tu idioma",
  progressSaved: "🔒 Tu progreso se guarda en esta base de datos. ¡Compártelo con tus amigos para competir en las ligas!",

  surveyProgress: "",
  touchOptionToContinue: "Toca una opción para continuar",
  kunturWriting: "Kuntur está tejiendo tu plan...",
  skipQuestion: "Saltar pregunta",
  continueN: "Continuar",
  chooseTime: "Elige una hora o sin recordatorio",
  noReminder: "Sin recordatorio",
  touchTopics: "Toca los temas que te interesan",
  selectedN: "seleccionados",
  touchMoreOrContinue: "toca más o presiona Continuar",

  creatingYourPlan: "Creando tu plan de Quechua",
  weavingQuipu: "Tejiendo tu quipu personalizado...",
  preparingLessons: "Preparando tus lecciones de quechua...",
  loadingVocabulary: "Cargando vocabulario andino...",
  adjustingRhythm: "Ajustando el ritmo a tu estilo...",
  finalTouches: "Últimos retoques...",
  almostReady: "Casi listo...",
  ready: "¡Listo!",
  loadingPlan: "Cargando tu plan...",

  planReady: "¡Tu plan está listo! 🎉",
  whatYouWillAchieve: "Esto es lo que lograrás en tu curso de Quechua:",
  beginAdventure: "🚀 Comenzar aventura",

  learnPathXp: "quipus tejidos",
  keepLearning: "Seguir aprendiendo",

  selectMeaning: "Selecciona el significado",
  selectWord: "Selecciona la palabra en quechua",
  matchWords: "Empareja las palabras",
  translatePhrase: "Traduce esta frase",
  whatDidYouHear: "¿Qué significa lo que escuchaste?",
  check: "Comprobar",
  continue: "Continuar",
  correct: "¡Correcto!",
  almost: "¡Casi!",
  correctAnswer: "Respuesta correcta:",
  skip: "Saltar",
  noHearts: "Sin corazones",
  buyMore: "Compra más en la tienda o espera a que se regeneren.",
  exitLesson: "Salir de la lección",
  exitLessonQ: "¿Salir de la lección?",
  exitLessonDesc: "Perderás tu progreso en esta lección si sales ahora.",
  keepLearningBtn: "Seguir aprendiendo",
  exit: "Salir",
  saving: "Guardando...",
  lessonComplete: "¡Lección completada!",
  perfect: "¡Perfecto!",
  keepItUp: "¡Buen trabajo, sigue así!",
  quipus: "Quipus",
  intis: "Intis",

  streak: "Racha",
  hearts: "Corazones",

  navLearn: "Aprender",
  navLeagues: "Ligas",
  navAchievements: "Logros",
  navShop: "Tienda",
  navProfile: "Perfil",

  level: "Nivel",
  daysStreak: "Días de racha",
  totalXp: "Quipus tejidos",
  crowns: "Coronas",
  myPlan: "Mi Plan Personalizado",
  language: "Lengua",
  dailyGoal: "Meta diaria",
  objective: "Objetivo",
  pace: "Ritmo",
  yourLevel: "Nivel",
  reminder: "Recordatorio",
  interests: "Intereses",
  yourWeek: "Tu semana",
  dailyGoalTitle: "Meta diaria",
  gainedToday: "Quipus tejidos hoy",
  achievements: "Logros",
  unlocked: "Desbloqueados",
  seeAchievements: "Ver logros",
  editName: "Editar nombre",
  save: "Guardar",
  cancel: "Cancelar",

  shop: "Tienda",
  intisAmount: "intis",
  heartsStatus: "Corazones",
  refillHearts: "Llenar Corazones",
  refillHeartsDesc: "Restaura todos tus corazones al instante",
  freezeStreak: "Congelar Racha",
  freezeStreakDesc: "Protege tu racha por un día perdido",
  threeFreezers: "3 Congeladores",
  threeFreezersDesc: "Tres congeladores de racha",
  doubleXp: "Doble Quipus (15 min)",
  doubleXpDesc: "Duplica tus quipus tejidos por 15 minutos",
  extraHeart: "Corazón Extra",
  extraHeartDesc: "Un corazón adicional permanente",
  earnIntis: "☀️ Gana intis completando lecciones y logros",

  topPromote: "ascienden",
  lastDemote: "descienden",
  yourRank: "Tu puesto",
  ofPlayers: "jugadores",
  firstInLeague: "¡Eres el primero en esta liga! Comparte la app con tus amigos para competir con jugadores reales.",
  leagueWeek: "Liga · Semana",
  leagueLadder: "Escalera de ligas",
  simulateWeek: "Simular fin de semana",
  closeWeekDesc: "Cierra la semana y recalcula tu liga según tu puesto",

  achievementsTitle: "Logros",
  unlockedOf: "de",

  motQuechua: "¡Quechua! El idioma del Tawantinsuyu te espera 🦙",
  motTravel: "¡Para tus viajes por los Andes! ✈️",
  motCulture: "¡Reconectando con tus raíces! 🦙",
  motWork: "¡Para servir mejor a tu comunidad! 💼",
  motStudy: "¡La sabiduría andina te llama! 📚",
  motCuriosity: "¡La curiosidad abre mundos! ✨",
  motBeginner: "¡Desde cero, como los grandes! 🌱",
  motBasic: "¡Ya tienes base, a potenciarla! 🌿",
  motIntermediate: "¡Vas por buen camino! 🌳",
  motAdvanced: "¡A perfeccionar tu maestría! 🏔️",
  motRelaxed: "Sin prisa, paso firme 🐢",
  motMedium: "Constancia es la clave 🚶",
  motIntense: "¡Aprendemos rápido! ⚡",
  mot10: "5 minutos al día cambian todo 🎋",
  mot20: "10 minutos, progreso constante 🎋",
  mot30: "15 minutos, dedicación real 🎋",
  mot50: "25 minutos, serio y comprometido 🎋",
  mot100: "¡Modo intenso activado! 🔥",
  motReminder: (n: string) => `Recordatorio a las ${n} 🕐`,
  motNoReminder: "Sin recordatorio, a tu ritmo 🌿",
  motInterests: (n: number) => `¡${n} temas que te apasionan! 🎯`,
  motNoInterests: "¡A explorar todos los temas! 🌿",

  kunturGreeting: "¡Allinllachu! Soy Kuntur 🦅",
  kunturAskLanguage: "¿Qué lengua del Perú quieres aprender? 🦅",
  kunturAskGoal: "¿Por qué quieres aprender esta lengua?",
  kunturAskLevel: "¿Cuánto sabes ya de esta lengua?",
  kunturAskPace: "¿Qué ritmo de aprendizaje prefieres?",
  kunturAskDailyGoal: "¿Cuántos quipus quieres tejer al día? 🎋",
  kunturAskInterests: "¿Qué temas te interesan más? (elige varios)",
  kunturAskReminder: "¿A qué hora te gustaría practicar? (opcional)",
} as unknown as Translations;

// Función helper para interpolación
function interp(s: string, ...args: (string | number)[]): string {
  return s.replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)] ?? ""));
}

const en: Translations = {
  appName: "Lengua Viva",
  appTagline: "Languages of Peru, alive forever",
  letsCreateProfile: "Languages of Peru, alive forever. Let's create your profile!",
  whatsYourName: "What's your name?",
  yourName: "Your name",
  whatCountry: "What country are you from?",
  whatLanguage: "What language do you speak?",
  learnFromYourLang: "You'll learn Peru's languages from your language",
  startLearning: "Start learning!",
  creating: "Creating...",
  writeName: "Write your name to start",
  selectCountry: "Select your country",
  selectLanguage: "Select your language",
  progressSaved: "🔒 Your progress is saved in this database. Share it with your friends to compete in leagues!",

  surveyProgress: "",
  touchOptionToContinue: "Tap an option to continue",
  kunturWriting: "Kuntur is weaving your plan...",
  skipQuestion: "Skip question",
  continueN: "Continue",
  chooseTime: "Choose a time or no reminder",
  noReminder: "No reminder",
  touchTopics: "Tap the topics that interest you",
  selectedN: "selected",
  touchMoreOrContinue: "tap more or press Continue",

  creatingYourPlan: "Creating your Quechua plan",
  weavingQuipu: "Weaving your personalized quipu...",
  preparingLessons: "Preparing your Quechua lessons...",
  loadingVocabulary: "Loading Andean vocabulary...",
  adjustingRhythm: "Adjusting the rhythm to your style...",
  finalTouches: "Final touches...",
  almostReady: "Almost ready...",
  ready: "Ready!",
  loadingPlan: "Loading your plan...",

  planReady: "Your plan is ready! 🎉",
  whatYouWillAchieve: "Here's what you'll achieve in your Quechua course:",
  beginAdventure: "🚀 Begin adventure",

  learnPathXp: "quipus woven",
  keepLearning: "Keep learning",

  selectMeaning: "Select the meaning",
  selectWord: "Select the word in Quechua",
  matchWords: "Match the words",
  translatePhrase: "Translate this phrase",
  whatDidYouHear: "What does what you heard mean?",
  check: "Check",
  continue: "Continue",
  correct: "Correct!",
  almost: "Almost!",
  correctAnswer: "Correct answer:",
  skip: "Skip",
  noHearts: "No hearts",
  buyMore: "Buy more in the shop or wait for them to regenerate.",
  exitLesson: "Exit lesson",
  exitLessonQ: "Exit lesson?",
  exitLessonDesc: "You'll lose your progress in this lesson if you exit now.",
  keepLearningBtn: "Keep learning",
  exit: "Exit",
  saving: "Saving...",
  lessonComplete: "Lesson complete!",
  perfect: "Perfect!",
  keepItUp: "Great job, keep it up!",
  quipus: "Quipus",
  intis: "Intis",

  streak: "Streak",
  hearts: "Hearts",

  navLearn: "Learn",
  navLeagues: "Leagues",
  navAchievements: "Achievements",
  navShop: "Shop",
  navProfile: "Profile",

  level: "Level",
  daysStreak: "Day streak",
  totalXp: "Quipus woven",
  crowns: "Crowns",
  myPlan: "My Personalized Plan",
  language: "Language",
  dailyGoal: "Daily goal",
  objective: "Objective",
  pace: "Pace",
  yourLevel: "Level",
  reminder: "Reminder",
  interests: "Interests",
  yourWeek: "Your week",
  dailyGoalTitle: "Daily goal",
  gainedToday: "Quipus woven today",
  achievements: "Achievements",
  unlocked: "Unlocked",
  seeAchievements: "See achievements",
  editName: "Edit name",
  save: "Save",
  cancel: "Cancel",

  shop: "Shop",
  intisAmount: "intis",
  heartsStatus: "Hearts",
  refillHearts: "Refill Hearts",
  refillHeartsDesc: "Restore all your hearts instantly",
  freezeStreak: "Freeze Streak",
  freezeStreakDesc: "Protect your streak for a missed day",
  threeFreezers: "3 Freezers",
  threeFreezersDesc: "Three streak freezers",
  doubleXp: "Double Quipus (15 min)",
  doubleXpDesc: "Double your woven quipus for 15 minutes",
  extraHeart: "Extra Heart",
  extraHeartDesc: "One additional permanent heart",
  earnIntis: "☀️ Earn intis by completing lessons and achievements",

  topPromote: "promote",
  lastDemote: "demote",
  yourRank: "Your rank",
  ofPlayers: "players",
  firstInLeague: "You're the first in this league! Share the app with your friends to compete with real players.",
  leagueWeek: "League · Week",
  leagueLadder: "League ladder",
  simulateWeek: "Simulate week end",
  closeWeekDesc: "Close the week and recalculate your league based on your rank",

  achievementsTitle: "Achievements",
  unlockedOf: "of",

  motQuechua: "Quechua! The language of the Tawantinsuyu awaits 🦙",
  motTravel: "For your travels through the Andes! ✈️",
  motCulture: "Reconnecting with your roots! 🦙",
  motWork: "To better serve your community! 💼",
  motStudy: "Andean wisdom calls you! 📚",
  motCuriosity: "Curiosity opens worlds! ✨",
  motBeginner: "From scratch, like the greats! 🌱",
  motBasic: "You have a base, let's boost it! 🌿",
  motIntermediate: "You're on the right track! 🌳",
  motAdvanced: "Perfecting your mastery! 🏔️",
  motRelaxed: "No rush, steady step 🐢",
  motMedium: "Consistency is key 🚶",
  motIntense: "Let's learn fast! ⚡",
  mot10: "5 minutes a day changes everything 🎋",
  mot20: "10 minutes, steady progress 🎋",
  mot30: "15 minutes, real dedication 🎋",
  mot50: "25 minutes, serious and committed 🎋",
  mot100: "Intense mode activated! 🔥",
  motReminder: (n: string) => `Reminder at ${n} 🕐`,
  motNoReminder: "No reminder, at your pace 🌿",
  motInterests: (n: number) => `${n} topics that passion you! 🎯`,
  motNoInterests: "Let's explore all topics! 🌿",

  kunturGreeting: "Allinllachu! I'm Kuntur 🦅",
  kunturAskLanguage: "Which language of Peru do you want to learn? 🦅",
  kunturAskGoal: "Why do you want to learn this language?",
  kunturAskLevel: "How much do you already know?",
  kunturAskPace: "What learning pace do you prefer?",
  kunturAskDailyGoal: "How many quipus do you want to weave per day? 🎋",
  kunturAskInterests: "What topics interest you most? (choose several)",
  kunturAskReminder: "What time would you like to practice? (optional)",
} as unknown as Translations;

const pt: Translations = {
  ...en,
  appTagline: "Línguas do Peru, vivas para sempre",
  letsCreateProfile: "Línguas do Peru, vivas para sempre. Vamos criar seu perfil!",
  whatsYourName: "Qual é o seu nome?",
  whatCountry: "De que país você é?",
  whatLanguage: "Que língua você fala?",
  learnFromYourLang: "Você aprenderá as línguas do Peru a partir do seu idioma",
  startLearning: "Começar a aprender!",
  touchOptionToContinue: "Toque numa opção para continuar",
  kunturWriting: "Kuntur está tecendo seu plano...",
  creatingYourPlan: "Criando seu plano de Quechua",
  loadingPlan: "Carregando seu plano...",
  planReady: "Seu plano está pronto! 🎉",
  beginAdventure: "🚀 Começar aventura",
  navLearn: "Aprender",
  navLeagues: "Ligas",
  navAchievements: "Conquistas",
  navShop: "Loja",
  navProfile: "Perfil",
  level: "Nível",
  streak: "Sequência",
  hearts: "Corações",
  check: "Verificar",
  continue: "Continuar",
  correct: "Correto!",
  almost: "Quase!",
  skip: "Pular",
  shop: "Loja",
  intis: "Intis",
  quipus: "Quipus",
  keepLearning: "Continuar aprendendo",
  save: "Salvar",
  cancel: "Cancelar",
  achievementsTitle: "Conquistas",
  yourRank: "Sua posição",
  ofPlayers: "jogadores",
} as unknown as Translations;

const fr: Translations = {
  ...en,
  appTagline: "Langues du Pérou, vivantes pour toujours",
  letsCreateProfile: "Langues du Pérou, vivantes pour toujours. Créons votre profil!",
  whatsYourName: "Comment tu t'appelles?",
  whatCountry: "De quel pays es-tu?",
  whatLanguage: "Quelle langue parles-tu?",
  learnFromYourLang: "Vous apprendrez les langues du Pérou depuis votre langue",
  startLearning: "Commencer à apprendre!",
  touchOptionToContinue: "Touchez une option pour continuer",
  kunturWriting: "Kuntur tisse votre plan...",
  creatingYourPlan: "Création de votre plan de Quechua",
  loadingPlan: "Chargement de votre plan...",
  planReady: "Votre plan est prêt! 🎉",
  beginAdventure: "🚀 Commencer l'aventure",
  navLearn: "Apprendre",
  navLeagues: "Ligues",
  navAchievements: "Trophées",
  navShop: "Boutique",
  navProfile: "Profil",
  level: "Niveau",
  streak: "Série",
  hearts: "Cœurs",
  check: "Vérifier",
  continue: "Continuer",
  correct: "Correct!",
  almost: "Presque!",
  skip: "Passer",
  shop: "Boutique",
  keepLearning: "Continuer à apprendre",
  save: "Enregistrer",
  cancel: "Annuler",
} as unknown as Translations;

const de: Translations = {
  ...en,
  appTagline: "Sprachen Perus, für immer lebendig",
  letsCreateProfile: "Sprachen Perus, für immer lebendig. Lass uns dein Profil erstellen!",
  whatsYourName: "Wie heißt du?",
  whatCountry: "Aus welchem Land kommst du?",
  whatLanguage: "Welche Sprache sprichst du?",
  learnFromYourLang: "Du wirst Perus Sprachen aus deiner Sprache lernen",
  startLearning: "Mit dem Lernen beginnen!",
  touchOptionToContinue: "Tippe auf eine Option zum Fortfahren",
  kunturWriting: "Kuntur webt deinen Plan...",
  creatingYourPlan: "Deinen Quechua-Plan erstellen",
  loadingPlan: "Deinen Plan laden...",
  planReady: "Dein Plan ist fertig! 🎉",
  beginAdventure: "🚀 Abenteuer beginnen",
  navLearn: "Lernen",
  navLeagues: "Ligen",
  navAchievements: "Erfolge",
  navShop: "Laden",
  navProfile: "Profil",
  level: "Stufe",
  streak: "Serie",
  hearts: "Herzen",
  check: "Prüfen",
  continue: "Weiter",
  correct: "Richtig!",
  almost: "Fast!",
  skip: "Überspringen",
  shop: "Laden",
  keepLearning: "Weiterlernen",
  save: "Speichern",
  cancel: "Abbrechen",
} as unknown as Translations;

const it: Translations = {
  ...en,
  appTagline: "Lingue del Perù, vive per sempre",
  letsCreateProfile: "Lingue del Perù, vive per sempre. Creiamo il tuo profilo!",
  whatsYourName: "Come ti chiami?",
  whatCountry: "Di che paese sei?",
  whatLanguage: "Che lingua parli?",
  learnFromYourLang: "Imparerai le lingue del Perù dalla tua lingua",
  startLearning: "Inizia a imparare!",
  touchOptionToContinue: "Tocca un'opzione per continuare",
  kunturWriting: "Kuntur sta tessendo il tuo piano...",
  creatingYourPlan: "Creazione del tuo piano Quechua",
  loadingPlan: "Caricamento del tuo piano...",
  planReady: "Il tuo piano è pronto! 🎉",
  beginAdventure: "🚀 Inizia l'avventura",
  navLearn: "Impara",
  navLeagues: "Leghe",
  navAchievements: "Traguardi",
  navShop: "Negozio",
  navProfile: "Profilo",
  level: "Livello",
  streak: "Serie",
  hearts: "Cuori",
  check: "Verifica",
  continue: "Continua",
  correct: "Corretto!",
  almost: "Quasi!",
  skip: "Salta",
  shop: "Negozio",
  keepLearning: "Continua a imparare",
  save: "Salva",
  cancel: "Annulla",
} as unknown as Translations;

const ja: Translations = {
  ...en,
  appTagline: "ペルーの言語、永遠に生きて",
  letsCreateProfile: "ペルーの言語、永遠に生きて。プロフィールを作りましょう！",
  whatsYourName: "名前は何ですか？",
  whatCountry: "どこの国から来ましたか？",
  whatLanguage: "何語を話しますか？",
  learnFromYourLang: "あなたの言語からペルーの言語を学びます",
  startLearning: "学習を始める！",
  touchOptionToContinue: "続けるにはオプションをタップ",
  kunturWriting: "クントゥルがあなたの計画を編んでいます...",
  creatingYourPlan: "ケチュアの計画を作成中",
  loadingPlan: "計画を読み込み中...",
  planReady: "計画が完成しました！🎉",
  beginAdventure: "🚀 冒険を始める",
  navLearn: "学ぶ",
  navLeagues: "リーグ",
  navAchievements: "実績",
  navShop: "ショップ",
  navProfile: "プロフィール",
  level: "レベル",
  streak: "連続",
  hearts: "ハート",
  check: "確認",
  continue: "続ける",
  correct: "正解！",
  almost: "惜しい！",
  skip: "スキップ",
  shop: "ショップ",
  keepLearning: "学習を続ける",
  save: "保存",
  cancel: "キャンセル",
} as unknown as Translations;

const zh: Translations = {
  ...en,
  appTagline: "秘鲁语言，永远活着",
  letsCreateProfile: "秘鲁语言，永远活着。让我们创建你的个人资料！",
  whatsYourName: "你叫什么名字？",
  whatCountry: "你来自哪个国家？",
  whatLanguage: "你说什么语言？",
  learnFromYourLang: "你将从你的语言学习秘鲁的语言",
  startLearning: "开始学习！",
  touchOptionToContinue: "点击一个选项继续",
  kunturWriting: "孔杜尔正在编织你的计划...",
  creatingYourPlan: "正在创建你的克丘亚语计划",
  loadingPlan: "正在加载你的计划...",
  planReady: "你的计划准备好了！🎉",
  beginAdventure: "🚀 开始冒险",
  navLearn: "学习",
  navLeagues: "联赛",
  navAchievements: "成就",
  navShop: "商店",
  navProfile: "个人资料",
  level: "等级",
  streak: "连续",
  hearts: "爱心",
  check: "检查",
  continue: "继续",
  correct: "正确！",
  almost: "差一点！",
  skip: "跳过",
  shop: "商店",
  keepLearning: "继续学习",
  save: "保存",
  cancel: "取消",
} as unknown as Translations;

// Quechua y Aimara usan español como fallback
const qu: Translations = { ...es };
const ay: Translations = { ...es };

const ALL_TRANSLATIONS: Record<string, Translations> = {
  es, en, pt, fr, de, it, ja, zh, qu, ay,
};

export function getTranslations(lang: string): Translations {
  return ALL_TRANSLATIONS[lang] || es;
}
