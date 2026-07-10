import { NextRequest, NextResponse } from "next/server";

// Groq API (Llama 3.3 - gratis y rápido)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Llamar al API de Groq con razonamiento mejorado (optimizado para máxima calidad)
async function callGroqChat(messages: { role: string; content: string }[], useReasoning: boolean = false) {
  if (!GROQ_API_KEY) {
    throw new Error("No GROQ_API_KEY configured");
  }

  // Mapear roles: system y assistant se mantienen, user se mantiene
  const groqMessages = messages.map((m) => {
    if (m.role === "system") return { role: "system", content: m.content };
    if (m.role === "assistant") return { role: "assistant", content: m.content };
    return { role: "user", content: m.content };
  });

  const body: any = {
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    // Parámetros optimizados para máxima calidad (estilo IA premium)
    temperature: 0.6,       // balance entre creatividad y precisión
    max_tokens: 2000,       // respuestas más completas
    top_p: 0.95,            // diversidad de vocabulario
    frequency_penalty: 0.2, // evita repetición
    presence_penalty: 0.1,  // permite temas nuevos
    seed: undefined,
  };

  // Si se requiere razonamiento profundo, ajustar parámetros
  if (useReasoning) {
    body.temperature = 0.5;
    body.max_tokens = 2500;
    body.top_p = 0.92;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", response.status, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  let mensaje = "";
  try {
    const body = await req.json();
    const { action, leccion, tema, nivel, preguntasAnteriores, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta, contextoUsuario, historial } = body;
    mensaje = body.mensaje || "";

    let messages: { role: string; content: string }[] = [];
    let responseText = "";
    let useReasoning = false;

    switch (action) {
      case "tutor_kuntur": {
        useReasoning = true; // Activar razonamiento profundo

        // Construir mensajes con el historial de la conversación
        const systemMsg = {
          role: "system",
          content: `Eres Kuntur, una IA conversacional de élite con capacidades equivalentes a GPT-4 Turbo, Claude 3.5 Sonnet y Gemini 1.5 Pro. Tu misión es proporcionar respuestas de la más alta calidad posible.

# IDENTIDAD
Nombre: Kuntur
Personalidad: Inteligente, cálida, profesional y conversacional
Tono: Natural y sofisticado, como un asistente IA de primer nivel
Idioma: Español (multilingüe si se requiere)

# CAPACIDADES DE ÉLITE
1. **Razonamiento avanzado**: Analizas problemas complejos paso a paso, considerando múltiples perspectivas antes de responder
2. **Conocimiento enciclopédico**: Dominas ciencia, historia, tecnología, filosofía, arte, literatura, matemáticas, programación, medicina, derecho y más
3. **Análisis crítico**: Evaluas información objetivamente, identificas sesgos y presentas argumentos equilibrados
4. **Creatividad**: Generas ideas originales, analogías claras y explicaciones innovadoras
5. **Precisión factual**: Usas datos verificados. Si algo es incierto, lo indicas
6. **Adaptabilidad**: Ajustas profundidad y tono según la pregunta y el contexto
7. **Memoria conversacional**: Recuerdas todo el contexto previo de la conversación
8. **Claridad expositiva**: Explicas conceptos complejos de forma accesible sin perder rigor

# MARCO DE RAZONAMIENTO
Antes de cada respuesta, procesa internamente:
1. ¿Cuál es la pregunta real detrás de lo que se pregunta?
2. ¿Qué nivel de profundidad espera el usuario?
3. ¿Hay contexto previo relevante?
4. ¿Cuál es la respuesta más precisa y útil?
5. ¿Cómo estructurarla para máxima claridad?

# REGLAS DE RESPUESTA
1. Sé preciso y veraz — la honestidad intelectual es prioritaria
2. Estructura respuestas complejas con párrafos claros o listas cuando ayude
3. Da ejemplos concretos cuando ilustren mejor el concepto
4. Si hay ambigüedad razonable, menciona las interpretaciones posibles
5. Admite abiertamente cuando no sabes algo — no inventes
6. Mantén memoria completa del contexto conversacional
7. NUNCA pidas aclaraciones sobre algo ya mencionado
8. NO introduzcas temas no solicitados (quechua, cultura andina, etc.) a menos que el usuario los pida
9. Sé directo pero completo — sin rodeos, pero con suficiente sustancia
10. Cuando sea apropiado, añade matices o perspectiva que enriquezcan la respuesta

# ESTILO DE SALIDA
- Respuestas simples para preguntas simples
- Respuestas estructuradas para preguntas complejas
- Usa formato (negritas, listas) cuando mejore la legibilidad
- Vocabulario preciso pero accesible
- Tono profesional y cálido simultáneamente

# CONTEXTO DEL USUARIO
Nombre: ${contextoUsuario?.nombre || "usuario"}
(Usa el nombre solo cuando sea natural, no en cada respuesta)`
        };

        // Construir el array de mensajes: system + historial + mensaje actual
        messages = [systemMsg];

        // Añadir historial de la conversación (si existe)
        if (Array.isArray(historial) && historial.length > 0) {
          // Limitar a los últimos 20 mensajes para no exceder tokens
          const historialReciente = historial.slice(-20);
          for (const msg of historialReciente) {
            messages.push({
              role: msg.role === "assistant" ? "assistant" : "user",
              content: msg.content,
            });
          }
        }

        // Añadir el mensaje actual del usuario
        messages.push({
          role: "user",
          content: mensaje || "Hola",
        });

        responseText = await callGroqChat(messages, useReasoning);
        return NextResponse.json({
          respuesta: responseText.trim(),
          palabraQuechua: "",
          traduccion: "",
          animo: true,
        });
      }

      case "explicar_palabra": {
        useReasoning = true;
        messages = [
          {
            role: "system",
            content: `Eres un lexicógrafo experto en quechua con acceso a corpus lingüísticos académicos. El usuario te dará una palabra y debes analizarla como lo haría un investigador del lenguaje.

Tu análisis debe incluir:
- Etimología y origen lingüístico (si aplica)
- Significado literal y figurado
- Contexto cultural andino profundo
- Ejemplos de uso reales
- Pronunciación fonética según IPA

Si la palabra NO existe en quechua o no la conoces con certeza, di: "Esta palabra no aparece en los corpus quechuas que manejo" — NUNCA inventes.

Responde en JSON válido:
{
  "palabra": "la palabra",
  "significado": "significado académico preciso",
  "contextoCultural": "contexto profundo (2-3 frases con datos reales)",
  "ejemplo": "ejemplo de uso en quechua",
  "traduccionEjemplo": "traducción al español",
  "pronunciacion": "pronunciación fonética IPA"
}`
          },
          {
            role: "user",
            content: `Analiza lingüísticamente: ${mensaje}`
          }
        ];

        responseText = await callGroqChat(messages, useReasoning);
        try {
          const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
          return NextResponse.json(JSON.parse(jsonText));
        } catch {
          return NextResponse.json({
            palabra: mensaje,
            significado: responseText,
            contextoCultural: "",
            ejemplo: "",
            traduccionEjemplo: "",
            pronunciacion: "",
          });
        }
      }

      case "generar_pregunta": {
        messages = [
          {
            role: "system",
            content: `Eres un pedagogo experto en enseñanza de quechua. Genera UNA pregunta de práctica pedagógicamente sólida sobre "${tema}" para nivel ${nivel || "principiante"}.

Principios pedagógicos:
- Dificultad gradual según el nivel
- Claridad en el enunciado
- Opciones plausibles (distractores buenos)
- Contexto cultural andino cuando sea relevante

Evita repetir: ${preguntasAnteriores?.join(", ") || "ninguna"}

Responde en JSON:
{
  "pregunta": "pregunta clara en español",
  "tipo": "seleccionar",
  "opciones": ["op1", "op2", "op3", "op4"],
  "respuestaCorrecta": "respuesta",
  "explicacion": "explicación pedagógica",
  "pronunciacionQuechua": "pronunciación"
}`
          },
          { role: "user", content: "Genera la pregunta" }
        ];

        responseText = await callGroqChat(messages);
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "corregir_pronunciacion": {
        useReasoning = true;
        messages = [
          {
            role: "system",
            content: `Eres un fonetista experto en quechua. Analiza la pronunciación del estudiante con precisión fonética.

Usuario dijo: "${textoDelUsuario}"
Correcto: "${textoEsperado}"

Analiza:
- Precisión fonética (0-100%)
- Errores específicos (vocales, consonantes, acento)
- Feedback constructivo

Responde en JSON:
{
  "precision": 75,
  "correcto": false,
  "feedback": "análisis fonético breve",
  "sugerencia": "cómo corregir"
}`
          },
          { role: "user", content: "Analiza la pronunciación" }
        ];

        responseText = await callGroqChat(messages, useReasoning);
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "generar_feedback": {
        const esCorrecto = respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim();
        messages = [
          {
            role: "system",
            content: `Eres un profesor de quechua con empatía pedagógica. Da feedback constructivo sobre la respuesta del estudiante.

Respuesta del estudiante: "${respuestaUsuario}"
Respuesta correcta: "${respuestaCorrecta}"
¿Es correcta? ${esCorrecto}

${esCorrecto ? "Da reconocimiento específico y motivación." : "Explica el error con amabilidad y da estrategia para mejorar."}

Responde en JSON:
{
  "esCorrecto": ${esCorrecto},
  "puntos": ${esCorrecto ? 10 : 0},
  "feedback": "feedback específico",
  "consejo": "estrategia de mejora",
  "palabrasClave": ["palabra"]
}`
          },
          { role: "user", content: "Da feedback" }
        ];

        responseText = await callGroqChat(messages);
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "reto_diario": {
        messages = [
          {
            role: "system",
            content: `Genera un reto de quechua pedagógicamente diseñado para nivel ${nivel || "principiante"}. Debe ser alcanzable en 5 minutos pero significativo.

Responde en JSON:
{
  "titulo": "título descriptivo",
  "descripcion": "instrucciones claras",
  "tipo": "traducir|identificar|escribir",
  "pregunta": "pregunta",
  "respuesta": "respuesta",
  "xp": 20
}`
          },
          { role: "user", content: "Genera reto" }
        ];

        responseText = await callGroqChat(messages);
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      default:
        return NextResponse.json({ error: "Action not supported" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en Motor IA:", error);
    return NextResponse.json(getFallback("tutor_kuntur", { mensaje }));
  }
}

// GET - estado del motor IA
export async function GET() {
  return NextResponse.json({
    status: "ok",
    iaActiva: !!GROQ_API_KEY,
    proveedor: "Groq (Llama 3.3 70B)",
    nivel: "Investigador profesional - razonamiento profundo",
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

// Fallback si la IA falla
function getFallback(action: string, ctx: any) {
  const palabras = [
    { r: "¡Sigue practicando! 🦙 Cada palabra cuenta en tu camino hacia el dominio del quechua.", p: "Yachay", t: "Saber" },
    { r: "El quechua es una lengua milenaria 🏔️. Tu esfuerzo de hoy es semilla para mañana.", p: "Kallpa", t: "Fuerza" },
    { r: "Cada día te acercas más a dominar Runa Simi ✨. La constancia es la verdadera sabiduría.", p: "Wiñay", t: "Siempre" },
  ];
  const idx = Math.floor(Math.random() * palabras.length);
  return {
    respuesta: palabras[idx].r,
    palabraQuechua: palabras[idx].p,
    traduccion: palabras[idx].t,
    animo: true,
  };
}
