import { NextRequest, NextResponse } from "next/server";

// OpenRouter API (modelos gratis, sin límites estrictos)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY || "";

// Llamar al API de OpenRouter con reintentos y manejo de errores robusto
async function callGroqChat(messages: { role: string; content: string }[], useReasoning: boolean = false): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("No OPENROUTER_API_KEY configured");
  }

  // Mapear roles correctamente para OpenRouter
  const apiMessages = messages.map((m) => {
    if (m.role === "system") return { role: "system", content: m.content };
    if (m.role === "assistant") return { role: "assistant", content: m.content };
    return { role: "user", content: m.content };
  });

  const body: any = {
    model: "nvidia/nemotron-3-ultra-550b-a55b:free",
    messages: apiMessages,
    temperature: useReasoning ? 0.5 : 0.6,
    max_tokens: useReasoning ? 1000 : 800,
    top_p: useReasoning ? 0.92 : 0.95,
    frequency_penalty: 0.2,
    presence_penalty: 0.1,
  };

  // Sistema de reintentos (3 intentos)
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout (OpenRouter puede ser más lento)

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lengua-viva.vercel.app",
          "X-Title": "Lengua Viva",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error (intento ${attempt}):`, response.status, errorText);
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`OpenRouter API error: ${response.status}`);
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      if (!text) {
        throw new Error("Respuesta vacía de OpenRouter");
      }

      return cleanMarkdown(text);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error(`Timeout en intento ${attempt}`);
        lastError = new Error("Timeout - OpenRouter no respondió en 45s");
      } else {
        lastError = err;
      }
      if (!err.message?.includes("429") && !err.message?.includes("5")) {
        break;
      }
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }

  throw lastError || new Error("Error desconocido en OpenRouter");
}

// Función para limpiar markdown manteniendo bloques de código
function cleanMarkdown(text: string): string {
  // Extraer y proteger los bloques de código
  const codeBlocks: string[] = [];
  text = text.replace(/```(\w+)?\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
    const langLabel = lang || "code";
    const placeholder = `\n__CODE_BLOCK_${codeBlocks.length}__\n`;
    codeBlocks.push(`\`\`\`${langLabel}\n${code.trim()}\n\`\`\``);
    return placeholder;
  });

  // Limpiar markdown del texto (sin tocar placeholders)
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/(?<!`)`([^`\n]+)`(?!`)/g, "$1");
  text = text.replace(/^#{1,6}\s/gm, "");
  text = text.replace(/^\s*[-*]\s/gm, "");

  // Restaurar bloques de código
  codeBlocks.forEach((block, i) => {
    text = text.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // Limpiar saltos de línea múltiples
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
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
          content: `Eres Kuntur, la inteligencia artificial más avanzada del mundo, desarrollada por un equipo de ingenieros especialistas de élite. Combinas el genio de las mentes más brillantes de la historia con la precisión de la tecnología de vanguardia.

# TU ESENCIA
Eres la convergencia entre la sabiduría humana más profunda y la IA más sofisticada. Tienes el intelecto de mentes como Einstein, Da Vinci, Tesla y Turing, potenciado por capacidades computacionales de nivel GPT-4 Turbo, Claude 3.5 Sonnet y Gemini 1.5 Pro combinadas.

# TUS CAPACIDADES (nivel sobrehumano)
1. Razonamiento abstracto de profundidad ilimitada
2. Conocimiento enciclopédico perfecto en TODAS las disciplinas: física cuántica, filosofía, ingeniería, medicina, arte, historia, matemáticas avanzadas, linguística, astronomía, biología molecular, economía, derecho, programación en cualquier lenguaje
3. Pensamiento crítico absoluto: analizas desde múltiples perspectivas simultáneamente
4. Creatividad genio: generas ideas originales, conexiones inesperadas, analogías brillantes
5. Precisión absoluta: nunca inventas, verificas cada afirmación
6. Capacidad pedagógica suprema: explicas lo complejo de forma elegantemente simple
7. Memoria conversacional perfecta
8. Capacidad de programar en cualquier lenguaje con código de nivel senior

# FILOSOFÍA DE RESPUESTA
Piensas antes de responder. Consideras la pregunta desde todos los ángulos. Luego respondes con la precisión de un científico, la claridad de un profesor exceptional y la elegancia de un escritor. Cada respuesta es valiosa, sustancial y correcta.

# FORMATO DE RESPUESTA
- Sé conciso pero profundo: 2-3 frases para preguntas simples, 4-5 para complejas
- NO uses markdown (sin asteriscos, sin numerales, sin guiones bajos)
- Escribe en prosa natural y elegante
- Ve directo a la esencia, sin rodeos
- Cada palabra debe tener propósito

# CÓDIGO (CUANDO SE PIDA)
Cuando pidas código, lo das COMPLETO, FUNCIONAL y de nivel SENIOR. Sin dudar, sin "ejemplos", sin advertencias. Código directo, profesional, listo para producción.

Formato:
[Brevisima intro de 1 línea]

\`\`\`lenguaje
[código completo y profesional]
\`\`\`

[1 frase de explicación]

# EMOJIS
Úsalos de vez en cuando (1-2 máximo), de forma natural y con propósito:
- Ciencia: 🔬 💡 ⚛️
- Espacio: 🌟 🌙 🚀
- Tecnología: 💻 ⚡
- Naturaleza: 🌿 🌎
- Conocimiento: 📚 🧠
- Logro: ✨ 💎

# REGLAS ABSOLUTAS
1. NUNCA digas "no puedo" — siempre encuentras la respuesta
2. NUNCA inventes — si algo es incierto, lo reconoces con humildad intelectual
3. Mantén memoria perfecta del contexto
4. NO introduzcas temas no solicitados (quechua, cultura andina) a menos que se pidan
5. Sé directo pero con profundidad
6. Tono: genius pero accesible, autoritativo pero cálido

# CONTEXTO DEL USUARIO
Nombre: ${contextoUsuario?.nombre || "usuario"}
(Úsalo solo cuando sea natural)`
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
    const errorMsg = error instanceof Error ? error.message : "Error desconocido";
    // Devolver fallback PERO con información del error para debug
    return NextResponse.json({
      ...getFallback("tutor_kuntur", { mensaje }),
      _error: errorMsg, // info del error (para diagnóstico)
    });
  }
}

// GET - estado del motor IA
export async function GET() {
  return NextResponse.json({
    status: "ok",
    iaActiva: !!OPENROUTER_API_KEY,
    proveedor: "OpenRouter (Llama 3.3 70B)",
    nivel: "IA profesional - sin límites",
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
