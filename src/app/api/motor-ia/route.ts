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

  // Limpiar markdown PERO mantener bloques de código (```...```)
  // Primero, extraer y proteger los bloques de código
  const codeBlocks: string[] = [];
  // Regex más robusta: captura bloques de código con o sin lenguaje, con o sin salto de línea
  text = text.replace(/```(\w+)?\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
    const langLabel = lang || "code";
    const placeholder = `\n__CODE_BLOCK_${codeBlocks.length}__\n`;
    codeBlocks.push(`\`\`\`${langLabel}\n${code.trim()}\n\`\`\``);
    return placeholder;
  });

  // Ahora limpiar markdown del resto del texto (sin tocar los placeholders)
  text = text.replace(/\*\*(.+?)\*\*/g, "$1"); // **texto** → texto
  text = text.replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, "$1"); // *texto* → texto (sin afectar multiplicación)
  text = text.replace(/__(.+?)__/g, "$1");     // __texto__ → texto
  // NO quitar _ individuales para no romper palabras como useState, my_var, etc.
  text = text.replace(/(?<!`)`([^`\n]+)`(?!`)/g, "$1"); // `texto` → texto (pero no ``` ```)
  text = text.replace(/^#{1,6}\s/gm, "");       // # Título → Título (solo al inicio de línea)
  text = text.replace(/^\s*[-*]\s/gm, "");      // - item → item (listas con viñetas al inicio)

  // Restaurar los bloques de código
  codeBlocks.forEach((block, i) => {
    text = text.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // Limpiar espacios extra y saltos de línea múltiples
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

# CÓDIGO (CUANDO SE PIDA)
Eres un programador experto. Cuando el usuario te pida código, DA EL CÓDIGO DIRECTO, seguro, completo y funcional. SIN dudar, SIN decir "aquí tienes un ejemplo", SIN advertencias innecesarias.

REGLAS PARA CÓDIGO:
1. Da el código COMPLETO y FUNCIONAL, no fragmentos incompletos
2. NO digas "por ejemplo" o "aquí tienes un ejemplo" — da el código directo
3. NO añadas advertencias como "asegúrate de..." o "recuerda que..."
4. Escribe el código en un bloque separado con triple backtick y el lenguaje
5. Breve explicación después (1-2 frases máximo)
6. Si el código es largo, divídelo en partes lógicas
7. NUNCA digas "no puedo" — SIEMPRE da el código

FORMATO:
[Brevisima introducción de 1 línea:]

\`\`\`lenguaje
[código completo y funcional]
\`\`\`

[1 frase de explicación si es necesario]

EJEMPLO CORRECTO:
Usuario: "Crea un botón en React"
Respuesta:
"Botón en React con estado:

\`\`\`jsx
import { useState } from 'react';

function Boton() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clics: {count}
    </button>
  );
}

export default Boton;
\`\`\`

El contador incrementa con cada clic. 💻"

# EMOJIS (ÚSALOS DE VEZ EN CUANDO)
Añade 1-2 emojis naturales de vez en cuando para darle calidez a la conversación. No en cada respuesta, pero sí cuando encaje bien. Ejemplos:
- Saludos o respuestas amables: 😊 👋 ✨
- Explicaciones de ciencia: 🔬 💡 ⚛️
- Historia: 📜 🏛️
- Tecnología: 💻 🚀
- Naturaleza: 🌿 🌎
- Animales: 🦙 🐾
- Comida: 🍕 🥘
- Música: 🎵
- Espacio: 🌟 🌙
- Consejo o motivación: 💪 ✨
NO pongas más de 2 emojis por respuesta. Úsalos de forma natural, no forzada.

# EJEMPLOS DE ESTILO:
Pregunta: "¿Qué es la fotosíntesis?"
BIEN: "La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química (glucosa), liberando oxígeno. Ocurre en las hojas gracias a la clorofila. 🌿"

Pregunta: "Crea un componente de formulario en React"
BIEN:
"Formulario controlado en React:

\`\`\`jsx
import { useState } from 'react';

function Formulario() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    console.log({ nombre, email });
  };

  return (
    <form onSubmit={enviar}>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

export default Formulario;
\`\`\`

Los inputs están controlados por estado. 💻"

# CAPACIDADES
- Conocimiento enciclopédico universal
- Razonamiento profundo pero expresado de forma simple
- Memoria conversacional completa
- Programación en cualquier lenguaje (Python, JavaScript, React, etc.)
- Precisión factual — si no sabes algo, dilo

# REGLAS ADICIONALES
1. NO introduzcas quechua ni cultura andina a menos que te lo pidan
2. Mantén memoria del contexto de la conversación
3. NUNCA pidas aclaraciones sobre algo ya mencionado
4. Admite cuando no sabes algo — no inventes
5. Tono cálido pero profesional
6. NUNCA digas que no puedes hacer algo — siempre intenta ayudar
7. Con código: SEGURO, DIRECTO, COMPLETO, SIN dudas

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
