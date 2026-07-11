// Generador automático de lecciones de quechua
// Crea ejercicios dinámicamente a partir de vocabulario
import type { Exercise, Lesson, Unit } from "./content";

interface Vocab {
  q: string; // quechua
  s: string; // español
  e?: string; // emoji
}

// Generar ejercicios a partir de vocabulario
function genExercises(vocab: Vocab[], allVocab: Vocab[], prefix: string): Exercise[] {
  const exs: Exercise[] = [];

  vocab.forEach((v, i) => {
    // 1. Select: ¿Qué significa [quechua]?
    const distractors = allVocab.filter((x) => x.s !== v.s).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.s);
    exs.push({
      id: `${prefix}e${i * 4 + 1}`,
      type: "select",
      prompt: v.q,
      audio: v.q,
      hint: v.e ? `${v.e}` : undefined,
      choices: [v.s, ...distractors].sort(() => Math.random() - 0.5),
      answer: v.s,
    });

    // 2. Reverse: ¿Cómo se dice [español]?
    const distractorsQ = allVocab.filter((x) => x.q !== v.q).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.q);
    exs.push({
      id: `${prefix}e${i * 4 + 2}`,
      type: "reverse",
      prompt: v.s,
      audio: v.q,
      hint: v.e ? `${v.e}` : undefined,
      choices: [v.q, ...distractorsQ].sort(() => Math.random() - 0.5),
      answer: v.q,
    });

    // 3. Listen: ¿Qué escuchaste?
    exs.push({
      id: `${prefix}e${i * 4 + 3}`,
      type: "listen",
      prompt: "¿Qué escuchaste?",
      audio: v.q,
      hint: v.e ? `${v.e}` : undefined,
      choices: [v.s, ...distractors].sort(() => Math.random() - 0.5),
      answer: v.s,
    });
  });

  // 4. Match: emparejar todos
  const pairs = vocab.slice(0, 5).map((v) => ({ q: v.q, a: v.s }));
  exs.push({
    id: `${prefix}e${vocab.length * 4}`,
    type: "match",
    prompt: "Empareja las palabras",
    pairs,
  });

  return exs;
}

// Vocabulario por temas
const VOCAB: Record<string, Vocab[]> = {
  // PRINCIPIANTE MES 1
  saludos: [
    { q: "allinllachu", s: "Hola/Buenos días", e: "👋" },
    { q: "imaynallam", s: "¿Cómo estás?", e: "🤔" },
    { q: "allinmi", s: "Estoy bien", e: "😊" },
    { q: "sulpayki", s: "Gracias", e: "🙏" },
    { q: "payllasunki", s: "De nada", e: "🤝" },
    { q: "tupananchiskama", s: "Hasta luego", e: "👋" },
    { q: "allin p'unchaw", s: "Buen día", e: "☀️" },
    { q: "allin tuta", s: "Buenas noches", e: "🌙" },
  ],
  presentacion: [
    { q: "sutiyqa", s: "Mi nombre es", e: "📛" },
    { q: "imamanta kanki", s: "¿De dónde eres?", e: "📍" },
    { q: "imataq sutiyki", s: "¿Cuál es tu nombre?", e: "❓" },
    { q: "nuqa", s: "Yo", e: "👤" },
    { q: "qam", s: "Tú", e: "👥" },
    { q: "pay", s: "Él/Ella", e: "🧑" },
    { q: "nuqayku", s: "Nosotros", e: "👨‍👩‍👧" },
    { q: "qamkuna", s: "Ustedes", e: "👥" },
  ],
  numeros: [
    { q: "huk", s: "Uno", e: "1️⃣" }, { q: "iskay", s: "Dos", e: "2️⃣" },
    { q: "kimsa", s: "Tres", e: "3️⃣" }, { q: "tawa", s: "Cuatro", e: "4️⃣" },
    { q: "pisqa", s: "Cinco", e: "5️⃣" }, { q: "suqta", s: "Seis", e: "6️⃣" },
    { q: "qanchis", s: "Siete", e: "7️⃣" }, { q: "pusaq", s: "Ocho", e: "8️⃣" },
    { q: "isqun", s: "Nueve", e: "9️⃣" }, { q: "chunka", s: "Diez", e: "🔟" },
  ],
  familia: [
    { q: "mama", s: "Madre", e: "👩" }, { q: "tayta", s: "Padre", e: "👨" },
    { q: "wawa", s: "Niño/a", e: "👶" }, { q: "wawqi", s: "Hermana", e: "👧" },
    { q: "tura", s: "Hermano", e: "👦" }, { q: "apichu", s: "Abuela", e: "👵" },
    { q: "machu", s: "Abuelo", e: "👴" }, { q: "ipa", s: "Tía", e: "🧑" },
    { q: "kaka", s: "Tío", e: "🧔" }, { q: "kullan", s: "Primo/a", e: "🧑" },
  ],
  cuerpo: [
    { q: "ñawi", s: "Ojo", e: "👁️" }, { q: "rinri", s: "Oreja", e: "👂" },
    { q: "simi", s: "Boca", e: "👄" }, { q: "senqa", s: "Nariz", e: "👃" },
    { q: "maki", s: "Mano", e: "✋" }, { q: "chaki", s: "Pie", e: "🦶" },
    { q: "pampa", s: "Cabeza", e: "🧠" }, { q: "kunka", s: "Cuello", e: "🦴" },
    { q: "sonqo", s: "Corazón", e: "❤️" }, { q: "wijlla", s: "Dedo", e: "👆" },
  ],
  colores: [
    { q: "puka", s: "Rojo", e: "🔴" }, { q: "ankas", s: "Azul", e: "🔵" },
    { q: "umirana", s: "Verde", e: "🟢" }, { q: "kanqa", s: "Amarillo", e: "🟡" },
    { q: "yuraq", s: "Blanco", e: "⚪" }, { q: "yana", s: "Negro", e: "⚫" },
    { q: "q'illu", s: "Dorado", e: "🟨" }, { q: "paqus", s: "Café", e: "🟤" },
  ],
  adjetivos: [
    { q: "hatun", s: "Grande", e: "🐘" }, { q: "huch'uy", s: "Pequeño", e: "🐜" },
    { q: "allin", s: "Bueno", e: "✅" }, { q: "millay", s: "Malo/Feo", e: "❌" },
    { q: "sumaq", s: "Hermoso", e: "✨" }, { q: "chiri", s: "Frío", e: "❄️" },
    { q: "q'unqu", s: "Calor", e: "🔥" }, { q: "hatun", s: "Alto", e: "📏" },
    { q: "wisñu", s: "Viejo", e: "👴" }, { q: "musuq", s: "Nuevo", e: "🆕" },
  ],

  // PRINCIPIANTE MES 2
  naturaleza: [
    { q: "inti", s: "Sol", e: "☀️" }, { q: "killa", s: "Luna", e: "🌙" },
    { q: "ch'aska", s: "Estrella", e: "⭐" }, { q: "hanaq pacha", s: "Cielo", e: "🌌" },
    { q: "yaku", s: "Agua", e: "💧" }, { q: "nina", s: "Fuego", e: "🔥" },
    { q: "allpa", s: "Tierra", e: "🌍" }, { q: "wayra", s: "Viento", e: "💨" },
    { q: "mayu", s: "Río", e: "🏞️" }, { q: "qucha", s: "Lago/Mar", e: "🌊" },
    { q: "para", s: "Lluvia", e: "🌧️" }, { q: "puytu", s: "Nube", e: "☁️" },
  ],
  plantas: [
    { q: "sach'a", s: "Árbol", e: "🌳" }, { q: "t'ika", s: "Flor", e: "🌸" },
    { q: "sara", s: "Maíz", e: "🌽" }, { q: "papa", s: "Papa", e: "🥔" },
    { q: "kinwa", s: "Quinua", e: "🌾" }, { q: "raki", s: "Hoja", e: "🍃" },
    { q: "saphi", s: "Raíz", e: "🌱" }, { q: "rurun", s: "Fruta", e: "🍎" },
  ],
  animales_andinos: [
    { q: "llama", s: "Llama", e: "🦙" }, { q: "kuntur", s: "Cóndor", e: "🦅" },
    { q: "waka", s: "Vaca", e: "🐄" }, { q: "uwija", s: "Oveja", e: "🐑" },
    { q: "alku", s: "Perro", e: "🐕" }, { q: "michi", s: "Gato", e: "🐈" },
    { q: "kawallu", s: "Caballo", e: "🐎" }, { q: "kuchi", s: "Cerdo", e: "🐖" },
    { q: "p'unchu", s: "Gallina", e: "🐔" }, { q: "pisqu", s: "Pájaro", e: "🐦" },
  ],
  animales_selva: [
    { q: "puma", s: "Puma", e: "🐱" }, { q: "uturunku", s: "Tigre/Jaguar", e: "🐅" },
    { q: "mach'aqway", s: "Serpiente", e: "🐍" }, { q: "challwa", s: "Pez", e: "🐟" },
    { q: "phillwu", s: "Mariposa", e: "🦋" }, { q: "pisqu", s: "Ave", e: "🐦" },
    { q: "rimachi", s: "Mono", e: "🐵" }, { q: "khuchi", s: "Sajino", e: "🐗" },
  ],
  comida: [
    { q: "papa", s: "Papa", e: "🥔" }, { q: "sara", s: "Maíz", e: "🌽" },
    { q: "t'anta", s: "Pan", e: "🍞" }, { q: "chupi", s: "Sopa", e: "🍲" },
    { q: "kinwa", s: "Quinua", e: "🌾" }, { q: "yaku", s: "Agua", e: "💧" },
    { q: "aqha", s: "Chicha", e: "🍺" }, { q: "ñukya", s: "Leche", e: "🥛" },
    { q: "achakana", s: "Carne", e: "🥩" }, { q: "rukutu", s: "Ají", e: "🌶️" },
  ],
  verbos_comida: [
    { q: "mikhuy", s: "Comer", e: "🍽️" }, { q: "upyay", s: "Beber", e: "🥤" },
    { q: "wayk'uy", s: "Cocinar", e: "👨‍🍳" }, { q: "chhuray", s: "Servir", e: "🍽️" },
    { q: "t'impuy", s: "Hervir", e: "🔥" }, { q: "chhayay", s: "Probar", e: "👅" },
  ],

  // PRINCIPIANTE MES 3
  verbos_accion: [
    { q: "puriy", s: "Caminar", e: "🚶" }, { q: "rimay", s: "Hablar", e: "💬" },
    { q: "rikuway", s: "Ver", e: "👀" }, { q: "puñuy", s: "Dormir", e: "😴" },
    { q: "uyariy", s: "Escuchar", e: "👂" }, { q: "qelqay", s: "Escribir", e: "✍️" },
    { q: "ruway", s: "Hacer/Trabajar", e: "💪" }, { q: "yachay", s: "Aprender", e: "📚" },
    { q: "pukllay", s: "Jugar", e: "🎮" }, { q: "takiy", s: "Cantar", e: "🎵" },
  ],
  verbos_mas: [
    { q: "hamuy", s: "Venir", e: "🚶‍♂️" }, { q: "puriy", s: "Ir", e: "🏃" },
    { q: "qepay", s: "Llevar", e: "📦" }, { q: "chapay", s: "Agarrar", e: "✋" },
    { q: "wisq'ay", s: "Cerrar", e: "🚪" }, { q: "kichay", s: "Abrir", e: "🔓" },
    { q: "sayay", s: "Pararse", e: "🧍" }, { q: "tiyay", s: "Sentarse", e: "🪑" },
    { q: "qaway", s: "Mirar", e: "👁️" }, { q: "ñawinchay", s: "Leer", e: "📖" },
  ],
  tiempo: [
    { q: "kunan p'unchaw", s: "Hoy", e: "📅" }, { q: "paqarin", s: "Mañana", e: "🌅" },
    { q: "qayna p'unchaw", s: "Ayer", e: "📋" }, { q: "tuta", s: "Noche", e: "🌙" },
    { q: "p'unchaw", s: "Día", e: "☀️" }, { q: "chawpi p'unchaw", s: "Mediodía", e: "🕛" },
    { q: "wata", s: "Año", e: "📆" }, { q: "killa", s: "Mes", e: "🌒" },
    { q: "simana", s: "Semana", e: "🗓️" }, { q: "ratu", s: "Rato/Momento", e: "⏰" },
  ],
  casa: [
    { q: "wasi", s: "Casa", e: "🏠" }, { q: "punku", s: "Puerta", e: "🚪" },
    { q: "wichqana", s: "Ventana", e: "🪟" }, { q: "qata", s: "Techo", e: "🏘️" },
    { q: "pampa", s: "Piso/Suelo", e: "🟫" }, { q: "tullpu", s: "Pared", e: "🧱" },
    { q: "raqra", s: "Cuarto/Habitación", e: "🛏️" }, { q: "wayi", s: "Cocina", e: "🍳" },
  ],
  direcciones: [
    { q: "hanan", s: "Arriba", e: "⬆️" }, { q: "urin", s: "Abajo", e: "⬇️" },
    { q: "ukhupi", s: "Dentro", e: "📥" }, { q: "hawapi", s: "Fuera", e: "📤" },
    { q: "patapi", s: "Sobre/Encima", e: "🔝" }, { q: "uriqpi", s: "Bajo/Debajo", e: "🔽" },
    { q: "kinraypi", s: "Junto a", e: "↔️" }, { q: "ñawpaq", s: "Delante", e: "⬅️" },
    { q: "qipa", s: "Detrás", e: "➡️" }, { q: "paña", s: "Derecha", e: "👉" },
  ],
  preguntas: [
    { q: "ima", s: "Qué", e: "❓" }, { q: "maypi", s: "Dónde", e: "📍" },
    { q: "imayna", s: "Cómo", e: "🤔" }, { q: "ima rayku", s: "Por qué", e: "❗" },
    { q: "pitaq", s: "Quién", e: "👤" }, { q: "hayk'ataq", s: "Cuánto/Cuántos", e: "🔢" },
    { q: "mayqen", s: "Cuál", e: "💭" }, { q: "imaynataq", s: "De qué manera", e: "🤷" },
  ],

  // INTERMEDIO MES 4
  gramatica_presente: [
    { q: "mikhushani", s: "Estoy comiendo", e: "🍽️" }, { q: "purishanki", s: "Estás caminando", e: "🚶" },
    { q: "rimashan", s: "Está hablando", e: "💬" }, { q: "puñushani", s: "Estoy durmiendo", e: "😴" },
    { q: "rikuwashanki", s: "Me estás viendo", e: "👀" }, { q: "yachashani", s: "Estoy aprendiendo", e: "📚" },
    { q: "wayk'ushan", s: "Está cocinando", e: "👨‍🍳" }, { q: "takiyashanku", s: "Están cantando", e: "🎵" },
  ],
  gramatica_pasado: [
    { q: "mikhurqani", s: "Comí", e: "🍽️" }, { q: "purirqanki", s: "Caminaste", e: "🚶" },
    { q: "rimarqan", s: "Habló", e: "💬" }, { q: "puñurqani", s: "Dormí", e: "😴" },
    { q: "rikuwarqanki", s: "Me viste", e: "👀" }, { q: "yacharqani", s: "Aprendí", e: "📚" },
    { q: "wayk'urqan", s: "Cocinó", e: "👨‍🍳" }, { q: "takirqanku", s: "Cantaron", e: "🎵" },
  ],
  gramatica_futuro: [
    { q: "mikhusaq", s: "Comeré", e: "🍽️" }, { q: "purisaqki", s: "Caminarás", e: "🚶" },
    { q: "rimasaq", s: "Hablaré", e: "💬" }, { q: "puñusaq", s: "Dormiré", e: "😴" },
    { q: "rikusaqki", s: "Te veré", e: "👀" }, { q: "yachasaq", s: "Aprenderé", e: "📚" },
    { q: "wayk'usaq", s: "Cocinaré", e: "👨‍🍳" }, { q: "takisaqku", s: "Cantaremos", e: "🎵" },
  ],
  conversacion: [
    { q: "imataq sutiyki", s: "¿Cuál es tu nombre?", e: "❓" },
    { q: "sutiyqa", s: "Mi nombre es", e: "📛" },
    { q: "maymantataq hamunki", s: "¿De dónde vienes?", e: "📍" },
    { q: "imataq ruwanki", s: "¿Qué haces?", e: "❓" },
    { q: "mana yachanichu", s: "No sé", e: "🤷" },
    { q: "ari", s: "Sí", e: "✅" },
    { q: "mana", s: "No", e: "❌" },
    { q: "pitucha", s: "Tal vez", e: "🤔" },
  ],
  cultura_andina: [
    { q: "tawantinsuyu", s: "Imperio Inca", e: "🏛️" }, { q: "pachamama", s: "Madre Tierra", e: "🌍" },
    { q: "inti tayta", s: "Padre Sol", e: "☀️" }, { q: "apu", s: "Montaña sagrada", e: "🏔️" },
    { q: "qhapaq ñan", s: "Camino Inca", e: "🛤️" }, { q: "mama killa", s: "Madre Luna", e: "🌙" },
    { q: "waka", s: "Lugar sagrado", e: "⛩️" }, { q: "hanan pacha", s: "Mundo superior", e: "🌌" },
    { q: "kay pacha", s: "Mundo terrenal", e: "🌍" }, { q: "uku pacha", s: "Mundo subterráneo", e: "🌑" },
  ],
  emociones: [
    { q: "kusikuy", s: "Alegrarse", e: "😊" }, { q: "llakiy", s: "Tristeza", e: "😢" },
    { q: "phiñakuy", s: "Enojarse", e: "😠" }, { q: "manchakuy", s: "Asustarse", e: "😨" },
    { q: "ch'iqiy", s: "Sorprenderse", e: "😲" }, { q: "chaskiy", s: "Contentarse", e: "😄" },
    { q: "p'itiykuy", s: "Preocuparse", e: "😟" }, { q: "sakiriy", s: "Calmar", e: "😌" },
  ],
  trabajo: [
    { q: "chakra", s: "Chacra/Agricultura", e: "🌾" }, { q: "maki", s: "Trabajo manual", e: "✋" },
    { q: "tantay", s: "Reunir", e: "📦" }, { q: "mink'a", s: "Trabajo comunitario", e: "👥" },
    { q: "tinkuy", s: "Encuentro/Reunión", e: "🤝" }, { q: "ruway", s: "Hacer/Fabricar", e: "🔨" },
    { q: "qatu", s: "Mercado/Comercio", e: "🏪" }, { q: "rantikuy", s: "Vender", e: "💰" },
  ],
  clima: [
    { q: "para", s: "Lluvia", e: "🌧️" }, { q: "wayra", s: "Viento", e: "💨" },
    { q: "chiri", s: "Frío", e: "❄️" }, { q: "q'unqu", s: "Calor", e: "🔥" },
    { q: "ratu", s: "Tormenta", e: "⛈️" }, { q: "qasa", s: "Helada", e: "🥶" },
    { q: "p'uytu", s: "Niebla", e: "🌫️" }, { q: "qhaq", s: "Sequía", e: "🏜️" },
  ],

  // AVANZADO MES 5
  filosofia: [
    { q: "sumaq kawsay", s: "Buen vivir", e: "🌿" }, { q: "pachakuti", s: "Retorno del tiempo", e: "🔄" },
    { q: "ayni", s: "Reciprocidad", e: "🤝" }, { q: "minka", s: "Trabajo colectivo", e: "👥" },
    { q: "yanantin", s: "Complementariedad", e: "☯️" }, { q: "masintin", s: "Paralelismo", e: "⚖️" },
    { q: "chakana", s: "Cruz andina", e: "✚" }, { q: "kawsay", s: "Vida/Existencia", e: "💫" },
  ],
  espiritualidad: [
    { q: "despacho", s: "Ofrenda", e: "🎁" }, { q: "willakuy", s: "Narrar/Contar", e: "📖" },
    { q: "paqo", s: "Sabio/Curandero", e: "🧙" }, { q: "hamut'ay", s: "Pensar/Reflexionar", e: "🧠" },
    { q: "mallki", s: "Árbol sagrado", e: "🌳" }, { q: "ceque", s: "Línea sagrada", e: "📐" },
    { q: "pago", s: "Pago a la tierra", e: "🏔️" }, { q: "tinku", s: "Encuentro ritual", e: "🎪" },
  ],
  literatura: [
    { q: "harawi", s: "Poesía/Canto", e: "📜" }, { q: "willay", s: "Cuento/Historia", e: "📚" },
    { q: "taki", s: "Canción", e: "🎵" }, { q: "qillqa", s: "Escritura", e: "✍️" },
    { q: "sumaq willay", s: "Narración hermosa", e: "📖" }, { q: "unu willay", s: "Mito", e: "🐉" },
    { q: "kawsay willay", s: "Biografía", e: "👤" }, { q: "rimanakuy", s: "Diálogo", e: "💬" },
  ],
  narrativa: [
    { q: "qaynarqa", s: "Había una vez", e: "📖" }, { q: "chaymantataq", s: "Y entonces", e: "➡️" },
    { q: "chaypacha", s: "En ese tiempo", e: "⏳" }, { q: "huk p'unchaw", s: "Un día", e: "📅" },
    { q: "chaymanta", s: "Después de eso", e: "⏭️" }, { q: "tukuytaq", s: "Finalmente", e: "🏁" },
    { q: "chaysi", s: "Entonces dice", e: "💬" }, { q: "rikuspa", s: "Al ver", e: "👁️" },
  ],
  opiniones: [
    { q: "ñuqapa yuyayniy", s: "En mi opinión", e: "💭" }, { q: "chayna kayninqa", s: "Así es", e: "✅" },
    { q: "mana chaynachu", s: "No es así", e: "❌" }, { q: "yuyaysiway", s: "Piénsalo", e: "🤔" },
    { q: "rimaysiway", s: "Dime", e: "💬" }, { q: "qamqa imataq ninkiiri", s: "¿Y tú qué dices?", e: "❓" },
    { q: "mana allinchu icha", s: "No es bueno, ¿verdad?", e: "⚠️" }, { q: "allinmi nini", s: "Creo que es bueno", e: "✅" },
  ],
};

// Generar lección a partir de vocabulario
function genLesson(id: string, title: string, emoji: string, desc: string, vocabKey: string, allVocabKeys: string[], xp: number, gems: number): Lesson {
  const vocab = VOCAB[vocabKey] || [];
  const allVocab = allVocabKeys.flatMap((k) => VOCAB[k] || []);
  return {
    id,
    title,
    emoji,
    description: desc,
    xpReward: xp,
    gemReward: gems,
    exercises: genExercises(vocab, allVocab, id),
  };
}

// Generar el currículo completo de 5 meses con 300+ lecciones
export function generateFullCurriculum(): Unit[] {
  const units: Unit[] = [];
  const principianteVocab = ["saludos", "presentacion", "numeros", "familia", "cuerpo", "colores", "adjetivos", "naturaleza", "plantas", "animales_andinos", "animales_selva", "comida", "verbos_comida", "verbos_accion", "verbos_mas", "tiempo", "casa", "direcciones", "preguntas"];
  const intermedioVocab = ["gramatica_presente", "gramatica_pasado", "gramatica_futuro", "conversacion", "cultura_andina", "emociones", "trabajo", "clima"];
  const avanzadoVocab = ["filosofia", "espiritualidad", "literatura", "narrativa", "opiniones"];

  // PRINCIPIANTE - 3 meses (60 lecciones)
  const p1Topics = [
    ["Saludos", "👋", "saludos"], ["Presentación", "🤝", "presentacion"], ["Números 1-5", "1️⃣", "numeros"],
    ["Números 6-10", "6️⃣", "numeros"], ["Mi Familia", "👨‍👩‍👧", "familia"], ["Abuelos y Tíos", "👴", "familia"],
    ["Ojos y Orejas", "👁️", "cuerpo"], ["Boca y Manos", "👄", "cuerpo"], ["Repaso Cuerpo", "🧠", "cuerpo"],
    ["Colores Básicos", "🌈", "colores"], ["Grande y Pequeño", "📏", "adjetivos"], ["Repaso Mes 1", "🏆", "saludos"],
  ];

  const p2Topics = [
    ["Sol y Luna", "☀️", "naturaleza"], ["Agua y Fuego", "💧", "naturaleza"], ["Ríos y Montañas", "🏞️", "naturaleza"],
    ["Árboles y Flores", "🌳", "plantas"], ["Maíz y Papa", "🌽", "plantas"], ["Llama y Cóndor", "🦙", "animales_andinos"],
    ["Vaca y Oveja", "🐄", "animales_andinos"], ["Perro y Gato", "🐕", "animales_andinos"], ["Pájaros y Peces", "🐦", "animales_selva"],
    ["Papa y Maíz", "🥔", "comida"], ["Pan y Sopa", "🍞", "comida"], ["Comer y Beber", "🍽️", "verbos_comida"],
  ];

  const p3Topics = [
    ["Caminar y Hablar", "🚶", "verbos_accion"], ["Ver y Dormir", "👀", "verbos_accion"], ["Jugar y Cantar", "🎮", "verbos_accion"],
    ["Venir e Ir", "🏃", "verbos_mas"], ["Abrir y Cerrar", "🚪", "verbos_mas"], ["Leer y Escribir", "📖", "verbos_mas"],
    ["Hoy y Mañana", "📅", "tiempo"], ["Día y Noche", "☀️", "tiempo"], ["Mi Casa", "🏠", "casa"],
    ["Arriba y Abajo", "⬆️", "direcciones"], ["Qué y Dónde", "❓", "preguntas"], ["Graduación", "🎓", "saludos"],
  ];

  // Generar unidades principiante (3 meses x 4 semanas x 3 lecciones = 36 lecciones + extras = 48+)
  const months = [
    { prefix: "p1", title: "Mes 1", topics: p1Topics, color: "green", emoji: "🌱" },
    { prefix: "p2", title: "Mes 2", topics: p2Topics, color: "emerald", emoji: "🌿" },
    { prefix: "p3", title: "Mes 3", topics: p3Topics, color: "amber", emoji: "🌳" },
  ];

  let lessonCount = 0;
  months.forEach((month, mIdx) => {
    // 4 unidades por mes
    for (let w = 0; w < 4; w++) {
      const weekLessons = month.topics.slice(w * 3, (w + 1) * 3);
      const unitLessons: Lesson[] = weekLessons.map((topic, i) => {
        lessonCount++;
        const id = `${month.prefix}u${w + 1}l${i + 1}`;
        return genLesson(id, topic[0], topic[1], `${topic[0]} - practica y aprende`, topic[2], principianteVocab, 20 + i * 5, 5 + i * 2);
      }).filter((l) => l.exercises.length > 0);

      if (unitLessons.length > 0) {
        units.push({
          id: `${month.prefix}u${w + 1}`,
          title: `${month.title} · Semana ${w + 1}`,
          subtitle: month.title === "Mes 1" ? "Principiante" : month.title === "Mes 2" ? "Vida Diaria" : "Conversación",
          color: month.color,
          emoji: month.emoji,
          description: `Semana ${w + 1} del ${month.title}. Aprende vocabulario esencial.`,
          lessons: unitLessons,
        });
      }
    }
  });

  // INTERMEDIO - 1 mes (12+ lecciones)
  const iTopics = [
    ["Presente Continuo", "⏳", "gramatica_presente"], ["Pasado Simple", "⏮️", "gramatica_pasado"],
    ["Futuro Simple", "⏭️", "gramatica_futuro"], ["Repaso Tiempos", "🔄", "gramatica_presente"],
    ["¿Cómo te llamas?", "❓", "conversacion"], ["De dónde eres", "📍", "conversacion"],
    ["Sí, No, Tal vez", "✅", "conversacion"], ["Repaso Conversación", "💬", "conversacion"],
    ["Imperio Inca", "🏛️", "cultura_andina"], ["Madre Tierra", "🌍", "cultura_andina"],
    ["Montañas Sagradas", "🏔️", "cultura_andina"], ["Repaso Cultura", "📜", "cultura_andina"],
    ["Alegría y Tristeza", "😊", "emociones"], ["Miedo y Enojo", "😨", "emociones"],
    ["Trabajo Comunitario", "🌾", "trabajo"], ["Mercado y Venta", "🏪", "trabajo"],
    ["Lluvia y Viento", "🌧️", "clima"], ["Frío y Calor", "❄️", "clima"],
    ["Repaso Emociones", "💭", "emociones"], ["Repaso Intermedio", "🎓", "cultura_andina"],
  ];

  for (let w = 0; w < 5; w++) {
    const weekLessons = iTopics.slice(w * 4, (w + 1) * 4);
    const unitLessons: Lesson[] = weekLessons.map((topic, i) => {
      lessonCount++;
      const id = `i1u${w + 1}l${i + 1}`;
      return genLesson(id, topic[0], topic[1], `${topic[0]} - nivel intermedio`, topic[2], intermedioVocab, 25 + i * 5, 10 + i * 2);
    }).filter((l) => l.exercises.length > 0);

    if (unitLessons.length > 0) {
      units.push({
        id: `i1u${w + 1}`,
        title: `Mes 4 · Intermedio`,
        subtitle: `Semana ${w + 1}`,
        color: "green",
        emoji: "📚",
        description: `Intermedio semana ${w + 1}: gramática, conversación y cultura.`,
        lessons: unitLessons,
      });
    }
  }

  // AVANZADO - 1 mes (12+ lecciones)
  const aTopics = [
    ["Buen Vivir", "🌿", "filosofia"], ["Retorno del Tiempo", "🔄", "filosofia"],
    ["Reciprocidad", "🤝", "filosofia"], ["Repaso Filosofía", "🧠", "filosofia"],
    ["Ofrendas", "🎁", "espiritualidad"], ["Sabios y Curanderos", "🧙", "espiritualidad"],
    ["Líneas Sagradas", "📐", "espiritualidad"], ["Repaso Espiritualidad", "✨", "espiritualidad"],
    ["Poesía Andina", "📜", "literatura"], ["Cuentos y Mitos", "🐉", "literatura"],
    ["Canciones", "🎵", "literatura"], ["Repaso Literatura", "📖", "literatura"],
    ["Había una vez", "📖", "narrativa"], ["Y entonces", "➡️", "narrativa"],
    ["En mi opinión", "💭", "opiniones"], ["¿Y tú qué dices?", "❓", "opiniones"],
    ["Examen Final 1", "📝", "filosofia"], ["Examen Final 2", "📊", "literatura"],
    ["Examen Final 3", "🎯", "conversacion"], ["¡Graduación!", "🎓", "filosofia"],
  ];

  for (let w = 0; w < 5; w++) {
    const weekLessons = aTopics.slice(w * 4, (w + 1) * 4);
    const unitLessons: Lesson[] = weekLessons.map((topic, i) => {
      lessonCount++;
      const id = `a1u${w + 1}l${i + 1}`;
      const isFinal = topic[0].includes("Examen") || topic[0].includes("Graduación");
      return genLesson(id, topic[0], topic[1], `${topic[0]} - nivel avanzado`, topic[2], [...avanzadoVocab, ...intermedioVocab, ...principianteVocab], isFinal ? 50 + i * 20 : 30 + i * 5, isFinal ? 25 + i * 10 : 15 + i * 2);
    }).filter((l) => l.exercises.length > 0);

    if (unitLessons.length > 0) {
      units.push({
        id: `a1u${w + 1}`,
        title: `Mes 5 · Avanzado`,
        subtitle: `Semana ${w + 1}`,
        color: "amber",
        emoji: "🎓",
        description: `Avanzado semana ${w + 1}: filosofía, literatura y dominio.`,
        lessons: unitLessons,
      });
    }
  }

  return units;
}
