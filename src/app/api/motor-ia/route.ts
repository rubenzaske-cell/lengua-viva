import { NextRequest, NextResponse } from "next/server";

// Groq API (Llama 3.3 - gratis y rápido)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Llamar al API de Groq (compatible con OpenAI)
async function callGroqChat(messages: { role: string; content: string }[]) {
  if (!GROQ_API_KEY) {
    throw new Error("No GROQ_API_KEY configured");
  }

  // Convertir "system" a "system" (Groq lo soporta)
  const groqMessages = messages.map((m) => ({
    role: m.role === "assistant" || m.role === "system" ? "system" : "user",
    content: m.content,
  }));

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 500,
    }),
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
    const { action, leccion, tema, nivel, preguntasAnteriores, textoDelUsuario, textoEsperado, respuestaUsuario, respuestaCorrecta, contextoUsuario } = body;
    mensaje = body.mensaje || "";

    let messages: { role: string; content: string }[] = [];
    let responseText = "";

    switch (action) {
      case "tutor_kuntur": {
        messages = [
          {
            role: "system",
            content: `Eres un profesor experto en quechua (Runasimi) y cultura andina del Perú. Respondes en español de forma clara, breve y precisa.

REGLAS ESTRICTAS:
1. Responde EXCLUSIVAMENTE a lo que el usuario pregunta. No divagues ni cambies de tema.
2. Sé conciso: máximo 3 frases.
3. Si el usuario pregunta cómo decir algo en quechua, dale la palabra/frase correcta en quechua y su significado en español.
4. Si pide un consejo, da un consejo práctico sobre aprendizaje.
5. Si pide traducción, traduce exactamente lo que pidió.
6. Si NO estás seguro de una traducción, di "No estoy seguro de esa traducción" — NO inventes palabras.
7. Usa emojis andinos ocasionalmente 🦙🏔️ pero sin exagerar.

VOCABULARIO QUECHUA BÁSICO (usa estas traducciones correctas):
- Hola = Allinllachu / Imaynallam
- Gracias = Sulpayki / Payllasunki
- Buen día = Allin p'unchaw
- Buenas noches = Allin tuta
- Madre = Mama
- Padre = Tayta
- Sol = Inti
- Luna = Killa
- Agua = Unu
- Fuego = Nina
- Tierra = Pacha
- Casa = Wasi
- Comida = Mikhuy
- Amor = Khuyay
- Saber = Yachay
- Uno = Huk, Dos = Iskay, Tres = Kimsa, Cuatro = Tawa, Cinco = Pisqa
- Familia = Ayllu
- Hermoso = Sumaq
- Cóndor = Kuntur
- Noche = Tuta
- Día = P'unchaw

Datos del estudiante (solo para contexto, NO los menciones a menos que sea relevante):
- Nombre: ${contextoUsuario?.nombre || "estudiante"}
- Nivel: ${contextoUsuario?.nivel || "principiante"}
- Racha: ${contextoUsuario?.racha || 0} días
- XP: ${contextoUsuario?.xp || 0}`
          },
          {
            role: "user",
            content: mensaje || "Hola"
          }
        ];

        responseText = await callGroqChat(messages);
        return NextResponse.json({
          respuesta: responseText.trim(),
          palabraQuechua: "",
          traduccion: "",
          animo: true,
        });
      }

      case "explicar_palabra": {
        messages = [
          {
            role: "system",
            content: `Eres un diccionario experto en quechua. El usuario te dará una palabra y debes explicarla de forma clara y precisa.

Si la palabra NO existe en quechua o no la conoces, di claramente: "No encuentro esa palabra en quechua".

Responde en JSON válido:
{
  "palabra": "la palabra",
  "significado": "significado en español",
  "contextoCultural": "1-2 frases de contexto andino",
  "ejemplo": "ejemplo de uso en quechua",
  "traduccionEjemplo": "traducción al español",
  "pronunciacion": "pronunciación fonética"
}`
          },
          {
            role: "user",
            content: `Explica la palabra: ${mensaje}`
          }
        ];

        responseText = await callGroqChat(messages);
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
            content: `Eres un profesor de quechua. Genera UNA pregunta de práctica sobre "${tema}" para nivel ${nivel || "principiante"}.

Evita repetir: ${preguntasAnteriores?.join(", ") || "ninguna"}

Responde en JSON:
{
  "pregunta": "pregunta en español",
  "tipo": "seleccionar",
  "opciones": ["op1", "op2", "op3", "op4"],
  "respuestaCorrecta": "respuesta",
  "explicacion": "por qué",
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
        messages = [
          {
            role: "system",
            content: `Eres corrector de pronunciación en quechua. Compara lo que el usuario dijo vs lo correcto.

Usuario dijo: "${textoDelUsuario}"
Correcto: "${textoEsperado}"

Responde en JSON:
{
  "precision": 75,
  "correcto": false,
  "feedback": "feedback breve",
  "sugerencia": "cómo mejorar"
}`
          },
          { role: "user", content: "Corrige" }
        ];

        responseText = await callGroqChat(messages);
        const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return NextResponse.json(JSON.parse(jsonText));
      }

      case "generar_feedback": {
        const esCorrecto = respuestaUsuario?.toLowerCase().trim() === respuestaCorrecta?.toLowerCase().trim();
        messages = [
          {
            role: "system",
            content: `Eres profesor de quechua. Da feedback sobre la respuesta del estudiante.

Respuesta: "${respuestaUsuario}"
Correcta: "${respuestaCorrecta}"
¿Es correcta? ${esCorrecto}

${esCorrecto ? "Celebra brevemente." : "Corrige amablemente."}

Responde en JSON:
{
  "esCorrecto": ${esCorrecto},
  "puntos": ${esCorrecto ? 10 : 0},
  "feedback": "feedback",
  "consejo": "consejo",
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
            content: `Genera un reto de quechua para nivel ${nivel || "principiante"}. Que sea alcanzable en 5 minutos.

Responde en JSON:
{
  "titulo": "título",
  "descripcion": "qué hacer",
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
    proveedor: "Groq (Llama 3.3)",
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
