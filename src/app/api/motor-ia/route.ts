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
    case "tutor_kuntur":
      return {
        respuesta: `¡Allinllachu! Sigue practicando, cada palabra cuenta 🦙. Recuerda: la constancia es la clave del aprendizaje.`,
        palabraQuechua: "Yachay",
        traduccion: "Saber/conocimiento",
        animo: true,
      };
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
