import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { action, leccion, tema, nivel, preguntasAnteriores, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta } = await request.json();

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
Correcto: ${respuestaUsuario.toLowerCase().trim() === respuestaCorrecta.toLowerCase().trim()}
Tema: ${leccion}

${respuestaUsuario.toLowerCase().trim() === respuestaCorrecta.toLowerCase().trim() 
  ? "¡Celebra! Genera feedback positivo y motivador."
  : "Corrige de forma amable. Explica por qué es incorrecto y cómo mejorar."}

Responde ÚNICAMENTE en JSON:
{
  "esCorrecto": ${respuestaUsuario.toLowerCase().trim() === respuestaCorrecta.toLowerCase().trim()},
  "puntos": ${respuestaUsuario.toLowerCase().trim() === respuestaCorrecta.toLowerCase().trim() ? 10 : 0},
  "feedback": "mensaje de feedback",
  "consejo": "consejo para mejorar",
  "palabrasClave": ["palabra1", "palabra2"]
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
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
