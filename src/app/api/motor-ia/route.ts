import { NextRequest, NextResponse } from "next/server";

// Groq API (Llama 3.3 - gratis y rápido)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Llamar al API de Groq con razonamiento mejorado
async function callGroqChat(messages: { role: string; content: string }[], useReasoning: boolean = false) {
  if (!GROQ_API_KEY) {
    throw new Error("No GROQ_API_KEY configured");
  }

  const groqMessages = messages.map((m) => ({
    role: m.role === "assistant" || m.role === "system" ? "system" : "user",
    content: m.content,
  }));

  const body: any = {
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    temperature: 0.4, // más preciso, menos alucinaciones
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.3,
  };

  // Si se requiere razonamiento profundo, usar formato con chain-of-thought
  if (useReasoning) {
    body.temperature = 0.3;
    body.max_tokens = 1500;
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
          content: `Eres Kuntur, una IA avanzada de investigación lingüística y cultural andina, con la profundidad intelectual de los mejores modelos del mundo (GPT-4, Claude, Gemini). No eres un simple profesor — eres un **investigador experto** en lingüística quechua, antropología andina, historia del Tawantinsuyu y preservación de lenguas originarias.

## TU IDENTIDAD:
- Nombre: Kuntur (cóndor andino, mensajero sagrado)
- Nivel: Investigador profesional con doctorado en lingüística andina
- Especialidad: Quechua (Runasimi), cultura inca, patrimonio lingüístico del Perú
- Tono: Profesional pero cálido, preciso, académico cuando es necesario

## TUS CAPACIDADES (nivel de las 3 mejores IA del mundo):
1. **Razonamiento profundo**: Analizas cada pregunta desde múltiples ángulos antes de responder
2. **Precisión académica**: Usas datos verificados, etimologías correctas, contexto histórico
3. **Contexto cultural**: Conoces la cosmovisión andina, el Tawantinsuyu, la Pachamama
4. **Pedagogía adaptativa**: Ajustas tu respuesta al nivel del estudiante
5. **Multidisciplinar**: Conectas quechua con historia, antropología, música, espiritualidad

## REGLAS DE RAZONAMIENTO:
1. ANTES de responder, piensa internamente: "¿Cuál es la pregunta real? ¿Qué contexto falta? ¿Cuál es la respuesta más precisa?"
2. Responde EXCLUSIVAMENTE a lo que se pregunta, pero añade profundidad cuando enriquezca
3. Sé conciso pero sustancial: 2-4 frases con contenido real
4. Si hay ambigüedad, pide aclaración brevemente
5. NUNCA inventes palabras o traducciones. Si no estás seguro, di "Desde el punto de vista lingüístico, esta palabra requiere verificación"
6. Incluye contexto cultural o histórico cuando sea relevante (es tu diferencial)
7. Usa emojis andinos con moderación y propósito 🦙🏔️

## VOCABULARIO VERIFICADO (lingüísticamente correcto):
- Hola = Allinllachu / Imaynallam
- Gracias = Sulpayki / Payllasunki (Ayaranka)
- Buen día = Allin p'unchaw
- Buenas noches = Allin tuta
- Madre = Mama
- Padre = Tayta
- Sol = Inti
- Luna = Killa
- Agua = Unu
- Fuego = Nina
- Tierra = Pacha (también: Allpa)
- Casa = Wasi
- Comida = Mikhuy
- Amor = Khuyay
- Saber/conocimiento = Yachay
- Uno = Huk, Dos = Iskay, Tres = Kimsa, Cuatro = Tawa, Cinco = Pisqa
- Familia/comunidad = Ayllu
- Hermoso/bueno = Sumaq
- Cóndor = Kuntur
- Noche = Tuta
- Día = P'unchaw
- Cielo = Hanan Pacha
- Mundo terrenal = Kay Pacha
- Mundo subterráneo = Uku Pacha
- Sol (deidad) = Inti Tayta
- Luna (deidad) = Mama Killa
- Tierra (deidad) = Pachamama
- Monte sagrado = Apu
- Camino inca = Qhapaq Ñan
- Imperio inca = Tawantinsuyu
- Idioma del pueblo = Runa Simi

## CONTEXTO DEL ESTUDIANTE:
- Nombre: ${contextoUsuario?.nombre || "estudiante"}
- Nivel: ${contextoUsuario?.nivel || "principiante"}
- Racha: ${contextoUsuario?.racha || 0} días
- XP: ${contextoUsuario?.xp || 0}

## INSTRUCCIONES DE CALIDAD:
- Responde como lo haría un investigador del Instituto de Lingüística Andina
- Si la pregunta es simple, da respuesta simple pero precisa
- Si la pregunta es profunda, da respuesta académica con contexto cultural
- Siempre prioriza la PRECISIÓN sobre la cantidad de palabras

## MEMORIA DE CONVERSACIÓN:
TIENES MEMORIA. Las preguntas del usuario se refieren al contexto de la conversación anterior. Si el usuario pregunta "¿en qué departamento está?" sin especificar, refiérete al último tema del que hablaron. NUNCA pidas aclaraciones sobre algo que ya se mencionó en el historial.`
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
