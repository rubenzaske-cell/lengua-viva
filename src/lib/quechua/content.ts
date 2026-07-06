// RunaSimi - Currículo de Quechua
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

// Palabras y frases reales en Quechua (Runa Simi / Quechua chanka)
export const CURRICULUM: Unit[] = [
  {
    id: "u1",
    title: "Unidad 1",
    subtitle: "Fundamentos",
    color: "green",
    emoji: "🌱",
    description: "Saludos y palabras básicas para empezar tu camino en el quechua.",
    lessons: [
      {
        id: "u1l1",
        title: "Saludos",
        emoji: "👋",
        description: "Aprende a saludar y presentarte",
        xpReward: 15,
        gemReward: 5,
        exercises: [
          {
            id: "u1l1e1",
            type: "select",
            prompt: "allinllachu",
            hint: "Saludo común en quechua",
            audio: "allinllachu",
            choices: ["Hola", "Adiós", "Gracias", "Perdón"],
            answer: "Hola",
          },
          {
            id: "u1l1e2",
            type: "reverse",
            prompt: "¿Cómo se dice «Gracias»?",
            choices: ["añay", "ari", "mana", "suti"],
            answer: "añay",
          },
          {
            id: "u1l1e3",
            type: "match",
            prompt: "Empareja las palabras",
            pairs: [
              { q: "allinllachu", a: "Hola" },
              { q: "añay", a: "Gracias" },
              { q: "tupananchiskama", a: "Adiós" },
              { q: "ari", a: "Sí" },
            ],
          },
          {
            id: "u1l1e4",
            type: "bank",
            prompt: "Mi nombre es Carlos",
            hint: "sutiymi = mi nombre es",
            words: ["sutiymi", "Carlos", "mana", "allinllachu", "añay"],
            answer: ["sutiymi", "Carlos"],
          },
          {
            id: "u1l1e5",
            type: "listen",
            prompt: "Escucha y elige el significado",
            audio: "añay",
            choices: ["Gracias", "Hola", "Sí", "Adiós"],
            answer: "Gracias",
          },
          {
            id: "u1l1e6",
            type: "select",
            prompt: "imata sutiyki",
            hint: "Pregunta para conocer a alguien",
            audio: "imata sutiyki",
            choices: ["¿Cómo te llamas?", "¿Cómo estás?", "¿De dónde eres?", "¿Cuántos años tienes?"],
            answer: "¿Cómo te llamas?",
          },
        ],
      },
      {
        id: "u1l2",
        title: "Sí y No",
        emoji: "✅",
        description: "Afirmaciones y negaciones básicas",
        xpReward: 15,
        gemReward: 5,
        exercises: [
          {
            id: "u1l2e1",
            type: "select",
            prompt: "ari",
            audio: "ari",
            choices: ["Sí", "No", "Tal vez", "Siempre"],
            answer: "Sí",
          },
          {
            id: "u1l2e2",
            type: "select",
            prompt: "mana",
            audio: "mana",
            choices: ["No", "Sí", "Nunca", "Quizá"],
            answer: "No",
          },
          {
            id: "u1l2e3",
            type: "match",
            prompt: "Empareja afirmaciones",
            pairs: [
              { q: "ari", a: "Sí" },
              { q: "mana", a: "No" },
              { q: "mana ni", a: "Tampoco" },
              { q: "ari chaymi", a: "Así es" },
            ],
          },
          {
            id: "u1l2e4",
            type: "reverse",
            prompt: "¿Cómo se dice «No»?",
            choices: ["mana", "ari", "allin", "manaña"],
            answer: "mana",
          },
          {
            id: "u1l2e5",
            type: "bank",
            prompt: "No, gracias",
            words: ["mana", "añay", "ari", "allinllachu"],
            answer: ["mana", "añay"],
          },
          {
            id: "u1l2e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "ari",
            choices: ["Sí", "No", "Gracias", "Hola"],
            answer: "Sí",
          },
        ],
      },
      {
        id: "u1l3",
        title: "Familia",
        emoji: "👨‍👩‍👧",
        description: "Miembros de la familia",
        xpReward: 20,
        gemReward: 5,
        exercises: [
          {
            id: "u1l3e1",
            type: "select",
            prompt: "warmi",
            audio: "warmi",
            choices: ["Mujer", "Hombre", "Niño", "Madre"],
            answer: "Mujer",
          },
          {
            id: "u1l3e2",
            type: "select",
            prompt: "qhari",
            audio: "qhari",
            choices: ["Hombre", "Mujer", "Padre", "Niño"],
            answer: "Hombre",
          },
          {
            id: "u1l3e3",
            type: "select",
            prompt: "wawa",
            audio: "wawa",
            choices: ["Niño/a", "Adulto", "Anciano", "Joven"],
            answer: "Niño/a",
          },
          {
            id: "u1l3e4",
            type: "match",
            prompt: "Empareja la familia",
            pairs: [
              { q: "warmi", a: "Mujer" },
              { q: "qhari", a: "Hombre" },
              { q: "wawa", a: "Niño/a" },
              { q: "mama", a: "Madre" },
              { q: "tayta", a: "Padre" },
            ],
          },
          {
            id: "u1l3e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Padre»?",
            choices: ["tayta", "mama", "wawa", "qhari"],
            answer: "tayta",
          },
          {
            id: "u1l3e6",
            type: "bank",
            prompt: "Mi madre cocina",
            hint: "mama = madre, wayk'uq = cocinera",
            words: ["mama", "wayk'uq", "wawa", "qhari", "añay"],
            answer: ["mama", "wayk'uq"],
          },
          {
            id: "u1l3e7",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "wawa",
            choices: ["Niño/a", "Mujer", "Hombre", "Madre"],
            answer: "Niño/a",
          },
        ],
      },
      {
        id: "u1l4",
        title: "Números 1-5",
        emoji: "🔢",
        description: "Contar del uno al cinco",
        xpReward: 20,
        gemReward: 5,
        exercises: [
          {
            id: "u1l4e1",
            type: "select",
            prompt: "huk",
            audio: "huk",
            choices: ["Uno", "Dos", "Tres", "Cinco"],
            answer: "Uno",
          },
          {
            id: "u1l4e2",
            type: "select",
            prompt: "iskay",
            audio: "iskay",
            choices: ["Dos", "Uno", "Cuatro", "Cinco"],
            answer: "Dos",
          },
          {
            id: "u1l4e3",
            type: "select",
            prompt: "kimsa",
            audio: "kimsa",
            choices: ["Tres", "Cinco", "Uno", "Dos"],
            answer: "Tres",
          },
          {
            id: "u1l4e4",
            type: "match",
            prompt: "Empareja los números",
            pairs: [
              { q: "huk", a: "1" },
              { q: "iskay", a: "2" },
              { q: "kimsa", a: "3" },
              { q: "tawa", a: "4" },
              { q: "phisqa", a: "5" },
            ],
          },
          {
            id: "u1l4e5",
            type: "reverse",
            prompt: "¿Cómo se dice «5»?",
            choices: ["phisqa", "tawa", "kimsa", "iskay"],
            answer: "phisqa",
          },
          {
            id: "u1l4e6",
            type: "bank",
            prompt: "Tres mujeres",
            words: ["kimsa", "warmi", "qhari", "huk", "wawa"],
            answer: ["kimsa", "warmi"],
          },
        ],
      },
    ],
  },
  {
    id: "u2",
    title: "Unidad 2",
    subtitle: "La Naturaleza",
    color: "emerald",
    emoji: "🌿",
    description: "El sol, la luna, el agua y los elementos del mundo andino.",
    lessons: [
      {
        id: "u2l1",
        title: "Sol y Luna",
        emoji: "☀️",
        description: "Inti y Killa, astros sagrados",
        xpReward: 20,
        gemReward: 5,
        exercises: [
          {
            id: "u2l1e1",
            type: "select",
            prompt: "inti",
            audio: "inti",
            choices: ["Sol", "Luna", "Estrella", "Cielo"],
            answer: "Sol",
          },
          {
            id: "u2l1e2",
            type: "select",
            prompt: "killa",
            audio: "killa",
            choices: ["Luna", "Sol", "Nube", "Noche"],
            answer: "Luna",
          },
          {
            id: "u2l1e3",
            type: "match",
            prompt: "Empareja los astros",
            pairs: [
              { q: "inti", a: "Sol" },
              { q: "killa", a: "Luna" },
              { q: "chaska", a: "Estrella" },
              { q: "pacha", a: "Tierra" },
            ],
          },
          {
            id: "u2l1e4",
            type: "reverse",
            prompt: "¿Cómo se dice «Sol»?",
            choices: ["inti", "killa", "pacha", "wayra"],
            answer: "inti",
          },
          {
            id: "u2l1e5",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "inti",
            choices: ["Sol", "Luna", "Tierra", "Viento"],
            answer: "Sol",
          },
          {
            id: "u2l1e6",
            type: "bank",
            prompt: "El sol brilla",
            hint: "lliphiq = que brilla",
            words: ["inti", "lliphiq", "killa", "wawa", "mana"],
            answer: ["inti", "lliphiq"],
          },
        ],
      },
      {
        id: "u2l2",
        title: "Agua y Fuego",
        emoji: "💧",
        description: "Elementos esenciales de la vida",
        xpReward: 20,
        gemReward: 5,
        exercises: [
          {
            id: "u2l2e1",
            type: "select",
            prompt: "yaku",
            audio: "yaku",
            choices: ["Agua", "Fuego", "Aire", "Tierra"],
            answer: "Agua",
          },
          {
            id: "u2l2e2",
            type: "select",
            prompt: "nina",
            audio: "nina",
            choices: ["Fuego", "Agua", "Viento", "Piedra"],
            answer: "Fuego",
          },
          {
            id: "u2l2e3",
            type: "select",
            prompt: "wayra",
            audio: "wayra",
            choices: ["Viento", "Agua", "Sol", "Luna"],
            answer: "Viento",
          },
          {
            id: "u2l2e4",
            type: "match",
            prompt: "Empareja los elementos",
            pairs: [
              { q: "yaku", a: "Agua" },
              { q: "nina", a: "Fuego" },
              { q: "wayra", a: "Viento" },
              { q: "rumi", a: "Piedra" },
            ],
          },
          {
            id: "u2l2e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Agua»?",
            choices: ["yaku", "nina", "wayra", "rumi"],
            answer: "yaku",
          },
          {
            id: "u2l2e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "nina",
            choices: ["Fuego", "Agua", "Viento", "Sol"],
            answer: "Fuego",
          },
          {
            id: "u2l2e7",
            type: "bank",
            prompt: "Fuego y agua",
            words: ["nina", "yaku", "inti", "wawa", "ari"],
            answer: ["nina", "yaku"],
          },
        ],
      },
      {
        id: "u2l3",
        title: "Día y Noche",
        emoji: "🌗",
        description: "El tiempo que pasa",
        xpReward: 20,
        gemReward: 5,
        exercises: [
          {
            id: "u2l3e1",
            type: "select",
            prompt: "p'unchaw",
            audio: "p'unchaw",
            choices: ["Día", "Noche", "Tarde", "Mañana"],
            answer: "Día",
          },
          {
            id: "u2l3e2",
            type: "select",
            prompt: "tuta",
            audio: "tuta",
            choices: ["Noche", "Día", "Mediodía", "Amanecer"],
            answer: "Noche",
          },
          {
            id: "u2l3e3",
            type: "match",
            prompt: "Empareja el tiempo",
            pairs: [
              { q: "p'unchaw", a: "Día" },
              { q: "tuta", a: "Noche" },
              { q: "chawpi", a: "Medio" },
              { q: "pacha", a: "Tiempo" },
            ],
          },
          {
            id: "u2l3e4",
            type: "reverse",
            prompt: "¿Cómo se dice «Noche»?",
            choices: ["tuta", "p'unchaw", "chawpi", "killa"],
            answer: "tuta",
          },
          {
            id: "u2l3e5",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "tuta",
            choices: ["Noche", "Día", "Tiempo", "Sol"],
            answer: "Noche",
          },
          {
            id: "u2l3e6",
            type: "bank",
            prompt: "Buenos días",
            hint: "allin = bueno",
            words: ["allin", "p'unchaw", "tuta", "mana", "wawa"],
            answer: ["allin", "p'unchaw"],
          },
        ],
      },
      {
        id: "u2l4",
        title: "Animales",
        emoji: "🦙",
        description: "Animales de los Andes",
        xpReward: 25,
        gemReward: 5,
        exercises: [
          {
            id: "u2l4e1",
            type: "select",
            prompt: "llama",
            audio: "llama",
            choices: ["Llama", "Perro", "Gato", "Vaca"],
            answer: "Llama",
          },
          {
            id: "u2l4e2",
            type: "select",
            prompt: "allqu",
            audio: "allqu",
            choices: ["Perro", "Gato", "Llama", "Caballo"],
            answer: "Perro",
          },
          {
            id: "u2l4e3",
            type: "select",
            prompt: "misimichiq",
            audio: "misimichiq",
            choices: ["Gato", "Perro", "Pájaro", "Pez"],
            answer: "Gato",
          },
          {
            id: "u2l4e4",
            type: "match",
            prompt: "Empareja los animales",
            pairs: [
              { q: "llama", a: "Llama" },
              { q: "allqu", a: "Perro" },
              { q: "pisqu", a: "Pájaro" },
              { q: "hatun", a: "Grande" },
            ],
          },
          {
            id: "u2l4e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Perro»?",
            choices: ["allqu", "llama", "pisqu", "wawa"],
            answer: "allqu",
          },
          {
            id: "u2l4e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "allqu",
            choices: ["Perro", "Gato", "Llama", "Pájaro"],
            answer: "Perro",
          },
          {
            id: "u2l4e7",
            type: "bank",
            prompt: "El perro grande",
            words: ["allqu", "hatun", "wawa", "mana", "inti"],
            answer: ["allqu", "hatun"],
          },
        ],
      },
    ],
  },
  {
    id: "u3",
    title: "Unidad 3",
    subtitle: "Vida Diaria",
    color: "amber",
    emoji: "🍞",
    description: "Comida, acciones y objetos del día a día.",
    lessons: [
      {
        id: "u3l1",
        title: "Comida",
        emoji: "🍎",
        description: "Alimentos básicos",
        xpReward: 25,
        gemReward: 5,
        exercises: [
          {
            id: "u3l1e1",
            type: "select",
            prompt: "tanta",
            audio: "tanta",
            choices: ["Pan", "Agua", "Carne", "Leche"],
            answer: "Pan",
          },
          {
            id: "u3l1e2",
            type: "select",
            prompt: "papa",
            audio: "papa",
            choices: ["Papa", "Maíz", "Trigo", "Arroz"],
            answer: "Papa",
          },
          {
            id: "u3l1e3",
            type: "select",
            prompt: "sara",
            audio: "sara",
            choices: ["Maíz", "Papa", "Pan", "Fruta"],
            answer: "Maíz",
          },
          {
            id: "u3l1e4",
            type: "match",
            prompt: "Empareja los alimentos",
            pairs: [
              { q: "tanta", a: "Pan" },
              { q: "papa", a: "Papa" },
              { q: "sara", a: "Maíz" },
              { q: "yaku", a: "Agua" },
            ],
          },
          {
            id: "u3l1e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Pan»?",
            choices: ["tanta", "papa", "sara", "yaku"],
            answer: "tanta",
          },
          {
            id: "u3l1e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "sara",
            choices: ["Maíz", "Papa", "Pan", "Agua"],
            answer: "Maíz",
          },
          {
            id: "u3l1e7",
            type: "bank",
            prompt: "Pan y agua",
            words: ["tanta", "yaku", "sara", "papa", "ari"],
            answer: ["tanta", "yaku"],
          },
        ],
      },
      {
        id: "u3l2",
        title: "Verbos",
        emoji: "🏃",
        description: "Acciones cotidianas",
        xpReward: 25,
        gemReward: 5,
        exercises: [
          {
            id: "u3l2e1",
            type: "select",
            prompt: "mikhuy",
            audio: "mikhuy",
            choices: ["Comer", "Beber", "Dormir", "Caminar"],
            answer: "Comer",
          },
          {
            id: "u3l2e2",
            type: "select",
            prompt: "puñuy",
            audio: "puñuy",
            choices: ["Dormir", "Comer", "Hablar", "Correr"],
            answer: "Dormir",
          },
          {
            id: "u3l2e3",
            type: "select",
            prompt: "puriy",
            audio: "puriy",
            choices: ["Caminar", "Dormir", "Comer", "Ver"],
            answer: "Caminar",
          },
          {
            id: "u3l2e4",
            type: "match",
            prompt: "Empareja las acciones",
            pairs: [
              { q: "mikhuy", a: "Comer" },
              { q: "puñuy", a: "Dormir" },
              { q: "puriy", a: "Caminar" },
              { q: "rimay", a: "Hablar" },
            ],
          },
          {
            id: "u3l2e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Comer»?",
            choices: ["mikhuy", "puñuy", "puriy", "rimay"],
            answer: "mikhuy",
          },
          {
            id: "u3l2e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "puñuy",
            choices: ["Dormir", "Comer", "Caminar", "Hablar"],
            answer: "Dormir",
          },
          {
            id: "u3l2e7",
            type: "bank",
            prompt: "Quiero comer pan",
            hint: "muna = querer",
            words: ["tanta", "mikhuy", "muna", "puñuy", "mana"],
            answer: ["tanta", "mikhuy", "muna"],
          },
        ],
      },
      {
        id: "u3l3",
        title: "Adjetivos",
        emoji: "📐",
        description: "Grande, pequeño, bueno",
        xpReward: 25,
        gemReward: 5,
        exercises: [
          {
            id: "u3l3e1",
            type: "select",
            prompt: "hatun",
            audio: "hatun",
            choices: ["Grande", "Pequeño", "Bueno", "Malo"],
            answer: "Grande",
          },
          {
            id: "u3l3e2",
            type: "select",
            prompt: "huch'uy",
            audio: "huch'uy",
            choices: ["Pequeño", "Grande", "Fuerte", "Débil"],
            answer: "Pequeño",
          },
          {
            id: "u3l3e3",
            type: "select",
            prompt: "sumaq",
            audio: "sumaq",
            choices: ["Hermoso", "Feo", "Triste", "Feliz"],
            answer: "Hermoso",
          },
          {
            id: "u3l3e4",
            type: "match",
            prompt: "Empareja los adjetivos",
            pairs: [
              { q: "hatun", a: "Grande" },
              { q: "huch'uy", a: "Pequeño" },
              { q: "sumaq", a: "Hermoso" },
              { q: "allin", a: "Bueno" },
            ],
          },
          {
            id: "u3l3e5",
            type: "reverse",
            prompt: "¿Cómo se dice «Grande»?",
            choices: ["hatun", "huch'uy", "sumaq", "allin"],
            answer: "hatun",
          },
          {
            id: "u3l3e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "sumaq",
            choices: ["Hermoso", "Grande", "Bueno", "Pequeño"],
            answer: "Hermoso",
          },
          {
            id: "u3l3e7",
            type: "bank",
            prompt: "Casa grande",
            hint: "wasi = casa",
            words: ["hatun", "wasi", "wawa", "mana", "yaku"],
            answer: ["hatun", "wasi"],
          },
        ],
      },
      {
        id: "u3l4",
        title: "Frases Útiles",
        emoji: "💬",
        description: "Conversación práctica",
        xpReward: 30,
        gemReward: 10,
        exercises: [
          {
            id: "u3l4e1",
            type: "select",
            prompt: "imaynallam kachkanki",
            hint: "Pregunta amistosa",
            audio: "imaynallam kachkanki",
            choices: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "¿Qué haces?"],
            answer: "¿Cómo estás?",
          },
          {
            id: "u3l4e2",
            type: "select",
            prompt: "allinllam kachkani",
            audio: "allinllam kachkani",
            choices: ["Estoy bien", "Estoy mal", "No sé", "Adiós"],
            answer: "Estoy bien",
          },
          {
            id: "u3l4e3",
            type: "match",
            prompt: "Empareja las frases",
            pairs: [
              { q: "imaynallam kachkanki", a: "¿Cómo estás?" },
              { q: "allinllam kachkani", a: "Estoy bien" },
              { q: "allinllachu", a: "Hola" },
              { q: "tupananchiskama", a: "Adiós" },
            ],
          },
          {
            id: "u3l4e4",
            type: "reverse",
            prompt: "¿Cómo se dice «Estoy bien»?",
            choices: ["allinllam kachkani", "imaynallam kachkanki", "tupananchiskama", "allinllachu"],
            answer: "allinllam kachkani",
          },
          {
            id: "u3l4e5",
            type: "bank",
            prompt: "Estoy muy bien, gracias",
            words: ["allinllam", "kachkani", "añay", "mana", "wawa"],
            answer: ["allinllam", "kachkani", "añay"],
          },
          {
            id: "u3l4e6",
            type: "listen",
            prompt: "Escucha y elige",
            audio: "imaynallam kachkanki",
            choices: ["¿Cómo estás?", "Hola", "Gracias", "Adiós"],
            answer: "¿Cómo estás?",
          },
          {
            id: "u3l4e7",
            type: "bank",
            prompt: "Hasta pronto, amigo",
            hint: "masi = amigo",
            words: ["tupananchiskama", "masi", "mana", "yaku", "wawa"],
            answer: ["tupananchiskama", "masi"],
          },
        ],
      },
    ],
  },
];

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
  { id: "xp_100", name: "Centurión", description: "Acumula 100 XP", emoji: "⭐", target: 100, metric: "xp", tier: "bronze" },
  { id: "xp_500", name: "Estrella", description: "Acumula 500 XP", emoji: "🌟", target: 500, metric: "xp", tier: "silver" },
  { id: "xp_1000", name: "Leyenda", description: "Acumula 1000 XP", emoji: "💫", target: 1000, metric: "xp", tier: "gold" },
  { id: "streak_3", name: "En Racha", description: "Mantén una racha de 3 días", emoji: "🔥", target: 3, metric: "streak", tier: "bronze" },
  { id: "streak_7", name: "Semana Perfecta", description: "Mantén una racha de 7 días", emoji: "📅", target: 7, metric: "streak", tier: "silver" },
  { id: "streak_30", name: "Inquebrantable", description: "Mantén una racha de 30 días", emoji: "💎", target: 30, metric: "streak", tier: "gold" },
  { id: "perfect_1", name: "Impecable", description: "Completa una lección sin errores", emoji: "✨", target: 1, metric: "perfect", tier: "bronze" },
  { id: "perfect_5", name: "Perfeccionista", description: "Completa 5 lecciones sin errores", emoji: "🏆", target: 5, metric: "perfect", tier: "gold" },
  { id: "gems_100", name: "Ahorrador", description: "Acumula 100 gemas", emoji: "💠", target: 100, metric: "gems", tier: "silver" },
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
  { id: "double_xp", name: "Doble XP (15 min)", description: "Duplica tu XP por 15 minutos", emoji: "⚡", cost: 450, type: "boost" },
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
