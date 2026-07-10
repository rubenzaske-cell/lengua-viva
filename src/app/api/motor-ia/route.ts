import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { action, leccion, tema, nivel, preguntasAnteriores, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta, mensaje, contextoUsuario } = await request.json();

    // Si no hay API key, devolver respuesta de fallback
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return Response.json(getFallback(action, { mensaje, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta }));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    let result;

    switch (action) {
      case "generar_pregunta":
        prompt = `Eres un profesor experto de Quechua (Runasimi). Genera UNA pregunta DIFERENTE para enseñar "${tema}" en la lección "${leccion}".

Contexto:
- Nivel del estudiante: ${nivel}
- Preguntas anteriores que ya hizo (evita repetir): ${preguntasAnteriores?.join(", ") || "ninguna"}

Requisitos:
1. Si es PRINCIPIANTE: preguntas simples, vocabulario básico
2. Si es INTERMEDIO: frases cortas, gramática simple
3. Si es AVANZADO: conversaciones complejas, contexto cultural

Tipos posibles: "seleccionar", "escribir", "escuchar", "pronunciar"

Responde ÚNICAMENTE en JSON válido (sin markdown):
{
  "pregunta": "la pregunta clara y en español",
  "tipo": "seleccionar",
  "opciones": ["opción1", "opción2", "opción3", "opción4"],
  "respuestaCorrecta": "la respuesta correcta",
  "explicacion": "explicación breve de por qué",
  "pronunciacionQuechua": "cómo se pronuncia la respuesta en Quechua"
}`;
        break;

      case "corregir_pronunciacion":
        prompt = `Eres un corrector experto de pronunciación en quechua.

El usuario intentó decir: "${textoDelUsuario}"
Lo correcto es: "${textoEsperado}"

Analiza:
1. ¿Qué tan cerca estuvo? (0-100% de precisión)
2. ¿Sonó correcto?
3. ¿Qué necesita mejorar?

Responde ÚNICAMENTE en JSON:
{
  "precisión": 75,
  "correcto": false,
  "feedback": "Casi perfecto, solo ajusta la última sílaba",
  "sugerencia": "Pronuncia más lento: kee-CHU-a"
}`;
        break;

      case "generar_feedback":
        prompt = `Eres un profesor de Quechua motivador. El estudiante respondió:
Respuesta: "${respuestaUsuario}"
Esperado: "${respuestaCorrecta}"
Correcto: ${respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim()}
Tema: ${leccion}

${respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim()
  ? "¡Celebra! Genera feedback positivo y motivador."
  : "Corrige de forma amable. Explica por qué es incorrecto y cómo mejorar."}

Responde ÚNICAMENTE en JSON:
{
  "esCorrecto": ${respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim()},
  "puntos": ${respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim() ? 10 : 0},
  "feedback": "mensaje de feedback",
  "consejo": "consejo para mejorar",
  "palabrasClave": ["palabra1", "palabra2"]
}`;
        break;

      case "tutor_kuntur":
        // Nuevo: Kuntur como tutor conversacional
        prompt = `Eres Kuntur, un cóndor sabio andino que enseña quechua. Eres amigable, motivador y conoces la cultura andina profundamente.

Contexto del estudiante:
- Nombre: ${contextoUsuario?.nombre || "estudiante"}
- Nivel: ${contextoUsuario?.nivel || "principiante"}
- Racha: ${contextoUsuario?.racha || 0} días
- Quipus (XP): ${contextoUsuario?.xp || 0}
- Lección actual: ${contextoUsuario?.leccion || "principios"}

El estudiante te dice: "${mensaje}"

Responde como Kuntur de forma breve (máx 2-3 frases), cálida y con emojis andinos 🦙🏔️. Incluye:
- Una palabra o frase en quechua cuando sea relevante (con traducción)
- Un consejo práctico o motivación
- Mantén el tono de un sabio maestro andino

Responde ÚNICAMENTE en JSON:
{
  "respuesta": "tu respuesta como Kuntur",
  "palabraQuechua": "palabra en quechua enseñada (opcional)",
  "traduccion": "traducción de la palabra",
  "animo": true
}`;
        break;

      case "explicar_palabra":
        // Nuevo: explicar una palabra de quechua
        prompt = `Eres un diccionario cultural vivo de quechua. Explica la palabra: "${mensaje}"

Da:
1. Significado literal
2. Contexto cultural andino
3. Ejemplo de uso en frase
4. Pronunciación fonética

Responde ÚNICAMENTE en JSON:
{
  "palabra": "${mensaje}",
  "significado": "significado",
  "contextoCultural": "contexto",
  "ejemplo": "frase ejemplo en quechua",
  "traduccionEjemplo": "traducción al español",
  "pronunciacion": "pronunciación fonética"
}`;
        break;

      case "reto_diario":
        // Nuevo: genera un reto diario
        prompt = `Genera un reto diario de quechua para nivel ${nivel || "principiante"}.

Debe ser:
- Alcanzable en 5 minutos
- Educativo
- Diferente cada vez

Responde ÚNICAMENTE en JSON:
{
  "titulo": "título corto del reto",
  "descripcion": "qué debe hacer el estudiante",
  "tipo": "traducir|escribir|pronunciar|identificar",
  "pregunta": "la pregunta del reto",
  "respuesta": "respuesta correcta",
  "xp": 20
}`;
        break;

      default:
        return Response.json({ error: "Action not supported" }, { status: 400 });
    }

    result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonText);

    return Response.json(parsed);
  } catch (error) {
    console.error("Error en API de Motor IA:", error);
    return Response.json(
      { error: "Error processing request", fallback: true },
      { status: 500 }
    );
  }
}

// Respuestas de fallback cuando no hay API key o hay error
function getFallback(action: string, ctx: any) {
  switch (action) {
    case "tutor_kuntur": {
      // Respuestas variadas según lo que pregunte el usuario
      const msg = (ctx.mensaje || "").toLowerCase();
      const respuestas: any[] = [];

      // Si pregunta por agradecimientos
      if (msg.includes("gracias") || msg.includes("thank")) {
        respuestas.push({
          respuesta: "Para decir 'gracias' en quechua decimos 'Sulpayki' 🦙. ¡Úsala con tus amigos!",
          palabraQuechua: "Sulpayki",
          traduccion: "Gracias",
          animo: true,
        });
      }
      // Si pregunta por saludos
      if (msg.includes("hola") || msg.includes("saludo") || msg.includes("buenos")) {
        respuestas.push({
          respuesta: "¡Allinllachu! Así saludamos en quechua 🦅. Significa 'buenos días'. También puedes decir 'Ima hinalla kachkanki' para '¿cómo estás?'.",
          palabraQuechua: "Allinllachu",
          traduccion: "Buenos días / Hola",
          animo: true,
        });
      }
      // Si pide un consejo
      if (msg.includes("consejo") || msg.includes("recomend")) {
        respuestas.push({
          respuesta: "Mi consejo: practica 5 minutos cada día 🌱. La constancia vence al talento. ¡Tú puedes!",
          palabraQuechua: "Hak'ay",
          traduccion: "Esfuerzo / constancia",
          animo: true,
        });
      }
      // Si pregunta por una palabra específica
      if (msg.includes("qué es") || msg.includes("que es") || msg.includes("significa") || msg.includes("yachay")) {
        respuestas.push({
          respuesta: "¡Yachay significa 'saber' o 'conocimiento' en quechua! 📚 Es la raíz de 'yachaq' (sabio). Los incas valoraban mucho el yachay.",
          palabraQuechua: "Yachay",
          traduccion: "Saber / conocimiento",
          animo: true,
        });
      }
      // Si pide una palabra nueva
      if (msg.includes("palabra") || msg.includes("enseña") || msg.includes("enséñame")) {
        const palabras = [
          { r: "Te enseño 'Kuntur' 🦅, que significa 'cóndor'. ¡Como yo! Soy el rey de los Andes.", p: "Kuntur", t: "Cóndor" },
          { r: "Aprende 'Mama' 🤱, significa 'madre'. En los Andes, la Pachamama es la madre tierra.", p: "Mama", t: "Madre" },
          { r: "¿Sabías que 'Inti' ☀️ significa 'sol'? Era la deidad más importante del Tawantinsuyu.", p: "Inti", t: "Sol" },
          { r: "'Pacha' 🌍 significa 'tiempo' o 'mundo'. De ahí viene Pachamama (madre tierra).", p: "Pacha", t: "Tiempo / mundo / tierra" },
          { r: "'Sumaq' ✨ significa 'hermoso' o 'bueno'. Cuando algo te gusta, dices 'Sumaq!'", p: "Sumaq", t: "Hermoso / bueno" },
          { r: "'Ayllu' 👨‍👩‍👧‍👦 es la familia extendida o comunidad. Muy importante en la cultura andina.", p: "Ayllu", t: "Familia / comunidad" },
          { r: "'Chakra' 🌾 significa 'chacra' o 'campo de cultivo'. La base de la vida andina.", p: "Chakra", t: "Chacra / campo" },
          { r: "'Unu' 💧 significa 'agua'. Vital en los Andes, donde se worshipa al agua como ser vivo.", p: "Unu", t: "Agua" },
        ];
        const idx = Math.floor(Math.random() * palabras.length);
        const pw = palabras[idx];
        respuestas.push({
          respuesta: pw.r,
          palabraQuechua: pw.p,
          traduccion: pw.t,
          animo: true,
        });
      }
      // Si menciona racha
      if (msg.includes("racha") || msg.includes("streak")) {
        respuestas.push({
          respuesta: "¡Mantén viva tu racha! 🔥 Cada día que practicas, tu cerebro retiene más. ¡No rompas la cadena!",
          palabraQuechua: "Wiñay",
          traduccion: "Siempre / para siempre",
          animo: true,
        });
      }
      // Si menciona motivación o estoy triste
      if (msg.includes("triste") || msg.includes("difícil") || msg.includes("dificil") || msg.includes("no puedo")) {
        respuestas.push({
          respuesta: "No te rindas 🦙. Aprender un idioma toma tiempo. Cada error es un paso más hacia el dominio. ¡Tú puedes!",
          palabraQuechua: "Kallpa",
          traduccion: "Fuerza / energía",
          animo: true,
        });
      }

      // Si no coinció con nada, respuesta genérica variada
      if (respuestas.length === 0) {
        const genericas = [
          {
            respuesta: "Buena pregunta 🦅. Sigue practicando en las lecciones, cada palabra cuenta. ¿Quieres que te enseñe una palabra nueva?",
            palabraQuechua: "Yachay",
            traduccion: "Saber / conocimiento",
            animo: true,
          },
          {
            respuesta: "El quechua es una lengua milenaria y hermosa 🦙. Mientras más practiques, más te conectarás con la cultura andina.",
            palabraQuechua: "Runa Simi",
            traduccion: "Lengua del pueblo (quechua)",
            animo: true,
          },
          {
            respuesta: "Recuerda: en los Andes, aprender es un acto de respeto a los ancestros 🏔️. Cada palabra que aprendes honra su memoria.",
            palabraQuechua: "Ñawpa",
            traduccion: "Antiguo / ancestro",
            animo: true,
          },
          {
            respuesta: "Te recomiendo completar una lección diaria 🌱. La constancia es más importante que la velocidad.",
            palabraQuechua: "Hak'ay",
            traduccion: "Esfuerzo / constancia",
            animo: true,
          },
        ];
        const idx = Math.floor(Math.random() * genericas.length);
        respuestas.push(genericas[idx]);
      }

      // Devolver una respuesta aleatoria de las que coincidieron
      return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
    case "explicar_palabra":
      return {
        palabra: ctx.mensaje,
        significado: "Palabra en quechua",
        contextoCultural: "El quechua es una lengua milenaria del Tawantinsuyu",
        ejemplo: "Ejemplo",
        traduccionEjemplo: "Traducción",
        pronunciacion: "pronunciación",
      };
    case "reto_diario":
      return {
        titulo: "Traduce esta frase",
        descripcion: "Traduce la frase del español al quechua",
        tipo: "traducir",
        pregunta: "Hola, ¿cómo estás?",
        respuesta: "Ima allaLLanKanki",
        xp: 20,
      };
    case "generar_feedback":
      const correcto = ctx.respuestaUsuario?.toLowerCase().trim() === ctx.respuestaCorrecta?.toLowerCase().trim();
      return {
        esCorrecto: correcto,
        puntos: correcto ? 10 : 0,
        feedback: correcto ? "¡Sumaq! ¡Muy bien!" : "¡No te rindas! Inténtalo otra vez",
        consejo: correcto ? "Sigue así" : "Revisa la respuesta correcta",
        palabrasClave: [],
      };
    default:
      return { error: "Sin API key de Gemini" };
  }
}

// GET - estado del motor IA
export async function GET() {
  return Response.json({
    status: "ok",
    iaActiva: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    acciones: [
      "generar_pregunta",
      "corregir_pronunciacion",
      "generar_feedback",
      "tutor_kuntur",
      "explicar_palabra",
      "reto_diario",
    ],
  });
}
