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

    let messages: { role: string; content: string }[] = [];

    switch (action) {
      case "tutor_kuntur": {
        // Sistema: define claramente el rol
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
- Agua = Unu
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

        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "No pude procesar tu pregunta.";

        // Devolver texto plano simple — sin formato JSON
        return NextResponse.json({
          respuesta: text.trim(),
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

        const completion = await zai.chat.completions.create({
          messages,
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

        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
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

        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
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

        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
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

        const completion = await zai.chat.completions.create({
          messages,
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
    console.error("Error en Motor IA:", error);
    return NextResponse.json({
      respuesta: "En este momento no puedo responder. Intenta de nuevo 🦙",
      palabraQuechua: "",
      traduccion: "",
      animo: true,
    });
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
