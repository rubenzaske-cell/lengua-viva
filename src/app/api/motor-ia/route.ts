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
    max_tokens: 800,        // respuestas más cortas y concisas
    top_p: 0.95,            // diversidad de vocabulario
    frequency_penalty: 0.2, // evita repetición
    presence_penalty: 0.1,  // permite temas nuevos
    seed: undefined,
  };

  // Si se requiere razonamiento profundo, ajustar parámetros
  if (useReasoning) {
    body.temperature = 0.5;
    body.max_tokens = 1000;
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
  let text = data.choices?.[0]?.message?.content || "";
  // Limpiar markdown: quitar asteriscos de negrita/cursiva pero mantener texto
  text = text.replace(/\*\*(.+?)\*\*/g, "$1"); // **texto** → texto
  text = text.replace(/\*(.+?)\*/g, "$1");     // *texto* → texto
  text = text.replace(/__(.+?)__/g, "$1");     // __texto__ → texto
  text = text.replace(/_(.+?)_/g, "$1");       // _texto_ → texto
  text = text.replace(/`(.+?)`/g, "$1");       // `texto` → texto
  text = text.replace(/#{1,6}\s/g, "");        // # Título → Título
  return text.trim();
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
          content: `Eres Kuntur, una IA conversacional de élite con capacidades equivalentes a GPT-4 Turbo, Claude 3.5 Sonnet y Gemini 1.5 Pro.

# IDENTIDAD
Nombre: Kuntur
Personalidad: Cálida, profesional, conversacional
Tono: Natural, claro y directo
Idioma: Español

# REGLA DE ORO - FORMATO DE RESPUESTA
Sé CONCISO. Responde en máximo 2-3 frases para preguntas simples. Máximo 4-5 frases para preguntas complejas. NUNCA envíes textos largos (testamentos) — el usuario quiere respuestas rápidas y claras, no ensayos.

# REGLAS DE FORMATO (CRÍTICAS)
1. NO uses markdown: NO uses asteriscos, no uses numerales, no uses guiones bajos
2. NO uses listas con viñetas a menos que sea absolutamente necesario
3. Escribe en párrafos naturales, en prosa normal
4. Respuestas cortas y al punto
5. NO repitas la pregunta del usuario
6. Ve directo a la respuesta

# EJEMPLOS DE ESTILO:
Pregunta: "¿Qué es la fotosíntesis?"
MAL: "La fotosíntesis es un proceso bioquímico complejo que... [5 párrafos largos con listas y negritas]"
BIEN: "La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química (glucosa), liberando oxígeno. Ocurre en las hojas gracias a la clorofila."

# CAPACIDADES
- Conocimiento enciclopédico universal
- Razonamiento profundo pero expresado de forma simple
- Memoria conversacional completa
- Precisión factual — si no sabes algo, dilo

# REGLAS ADICIONALES
1. NO introduzcas quechua ni cultura andina a menos que te lo pidan
2. Mantén memoria del contexto de la conversación
3. NUNCA pidas aclaraciones sobre algo ya mencionado
4. Admite cuando no sabes algo — no inventes
5. Tono cálido pero profesional

# CONTEXTO DEL USUARIO
Nombre: ${contextoUsuario?.nombre || "usuario"}
(Usa el nombre solo cuando sea natural)`
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
