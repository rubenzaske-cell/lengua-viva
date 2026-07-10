import { NextRequest, NextResponse } from "next/server";

// Usar el SDK de Z.ai (IA potente, sin necesidad de API key)
let zaiInstance: any = null;
async function getZAI() {
  if (!zaiInstance) {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { action, leccion, tema, nivel, preguntasAnteriores, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta, mensaje, contextoUsuario } = await req.json();

    const zai = await getZAI();

    let prompt = "";
    let systemPrompt = "";
    let result;

    switch (action) {
      case "tutor_kuntur": {
        // Kuntur como tutor conversacional con IA real
        systemPrompt = `Eres Kuntur, un cóndor sabio andino que enseña quechua. Eres amigable, motivador y conoces profundamente la cultura andina, el Tawantinsuyu y las tradiciones peruanas.

Contexto del estudiante:
- Nombre: ${contextoUsuario?.nombre || "estudiante"}
- Nivel: ${contextoUsuario?.nivel || "principiante"}
- Racha actual: ${contextoUsuario?.racha || 0} días
- Quipus (XP) ganados: ${contextoUsuario?.xp || 0}
- Lengua que aprende: ${contextoUsuario?.leccion || "quechua"}

El estudiante te dice: "${mensaje}"

Responde como Kuntur de forma BREVE (máximo 2-3 frases), cálida y con emojis andinos 🦙🏔️✨. Debes:
- Responder de forma natural y conversacional
- Incluir una palabra o frase en quechua cuando sea relevante (con su traducción entre paréntesis)
- Dar un consejo práctico o motivación
- Mantener el tono de un sabio maestro andino

Responde ÚNICAMENTE en JSON válido (sin markdown):
{
  "respuesta": "tu respuesta como Kuntur (2-3 frases)",
  "palabraQuechua": "palabra en quechua enseñada",
  "traduccion": "traducción al español",
  "animo": true
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: systemPrompt },
            { role: "user", content: mensaje || "Hola" },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        try {
          const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
          return NextResponse.json(JSON.parse(jsonText));
        } catch {
          return NextResponse.json({
            respuesta: text,
            palabraQuechua: "",
            traduccion: "",
            animo: true,
          });
        }
      }

      case "explicar_palabra": {
        systemPrompt = `Eres un diccionario cultural vivo de quechua. Explica la palabra: "${mensaje}"

Da información precisa y culturalmente correcta. Responde ÚNICAMENTE en JSON:
{
  "palabra": "${mensaje}",
  "significado": "significado literal",
  "contextoCultural": "contexto cultural andino (1-2 frases)",
  "ejemplo": "frase ejemplo en quechua",
  "traduccionEjemplo": "traducción al español",
  "pronunciacion": "pronunciación fonética"
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: systemPrompt },
            { role: "user", content: `Explica: ${mensaje}` },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        try {
          const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
          return NextResponse.json(JSON.parse(jsonText));
        } catch {
          return NextResponse.json({
            palabra: mensaje,
            significado: text,
            contextoCultural: "",
            ejemplo: "",
            traduccionEjemplo: "",
            pronunciacion: "",
          });
        }
      }

      case "generar_pregunta": {
        prompt = `Eres un profesor experto de Quechua (Runasimi). Genera UNA pregunta DIFERENTE para enseñar "${tema}" en la lección "${leccion}".

Contexto:
- Nivel del estudiante: ${nivel}
- Preguntas anteriores (evita repetir): ${preguntasAnteriores?.join(", ") || "ninguna"}

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
  "explicacion": "explicación breve",
  "pronunciacionQuechua": "pronunciación"
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: prompt },
            { role: "user", content: "Genera la pregunta" },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "corregir_pronunciacion": {
        prompt = `Eres un corrector experto de pronunciación en quechua.

El usuario intentó decir: "${textoDelUsuario}"
Lo correcto es: "${textoEsperado}"

Analiza:
1. ¿Qué tan cerca estuvo? (0-100% de precisión)
2. ¿Sonó correcto?
3. ¿Qué necesita mejorar?

Responde ÚNICAMENTE en JSON:
{
  "precision": 75,
  "correcto": false,
  "feedback": "Casi perfecto, ajusta la última sílaba",
  "sugerencia": "Pronuncia más lento: kee-CHU-a"
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: prompt },
            { role: "user", content: "Corrige la pronunciación" },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "generar_feedback": {
        const esCorrecto = respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim();
        prompt = `Eres un profesor de Quechua motivador. El estudiante respondió:
Respuesta: "${respuestaUsuario}"
Esperado: "${respuestaCorrecta}"
Correcto: ${esCorrecto}
Tema: ${leccion}

${esCorrecto ? "¡Celebra! Genera feedback positivo y motivador." : "Corrige de forma amable. Explica por qué es incorrecto y cómo mejorar."}

Responde ÚNICAMENTE en JSON:
{
  "esCorrecto": ${esCorrecto},
  "puntos": ${esCorrecto ? 10 : 0},
  "feedback": "mensaje de feedback",
  "consejo": "consejo para mejorar",
  "palabrasClave": ["palabra1", "palabra2"]
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: prompt },
            { role: "user", content: "Genera feedback" },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "reto_diario": {
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

        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: prompt },
            { role: "user", content: "Genera reto diario" },
          ],
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      default:
        return NextResponse.json({ error: "Action not supported" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en API de Motor IA:", error);
    return NextResponse.json(
      getFallback("tutor_kuntur", { mensaje }),
      { status: 200 }
    );
  }
}

// GET - estado del motor IA
export async function GET() {
  return NextResponse.json({
    status: "ok",
    iaActiva: true,
    proveedor: "Z.ai",
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

// Fallback simple si la IA falla
function getFallback(action: string, ctx: any) {
  const palabras = [
    { r: "¡Sigue practicando! 🦙 Cada palabra cuenta.", p: "Yachay", t: "Saber" },
    { r: "El quechua es hermoso 🏔️. ¡No te rindas!", p: "Kallpa", t: "Fuerza" },
    { r: "Cada día te acercas más a dominar el quechua ✨.", p: "Wiñay", t: "Siempre" },
  ];
  const idx = Math.floor(Math.random() * palabras.length);
  return {
    respuesta: palabras[idx].r,
    palabraQuechua: palabras[idx].p,
    traduccion: palabras[idx].t,
    animo: true,
  };
}
