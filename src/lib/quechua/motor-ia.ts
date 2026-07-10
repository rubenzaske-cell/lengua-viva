import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface PreguntaDinamica {
  pregunta: string;
  tipo: "seleccionar" | "escribir" | "escuchar" | "pronunciar";
  opciones?: string[];
  respuestaCorrecta: string;
  explicacion: string;
  pronunciacionQuechua?: string;
}

export interface CorreccionPronunciacion {
  precisión: number;
  correcto: boolean;
  feedback: string;
  sugerencia: string;
}

export interface FeedbackInteligente {
  esCorrecto: boolean;
  puntos: number;
  feedback: string;
  consejo: string;
  palabrasClave: string[];
}

/**
 * Genera una pregunta dinámica para una lección específica
 * Cada pregunta es diferente según el nivel del usuario
 */
export async function generarPreguntaDinamica(
  leccion: string,
  tema: string,
  nivelUsuario: "principiante" | "intermedio" | "avanzado",
  preguntasAnteriores: string[] = []
): Promise<PreguntaDinamica> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Eres un profesor experto de Quechua (Runasimi). Genera UNA pregunta DIFERENTE para enseñar "${tema}" en la lección "${leccion}".

Contexto:
- Nivel del estudiante: ${nivelUsuario}
- Preguntas anteriores que ya hizo (evita repetir): ${preguntasAnteriores.join(", ") || "ninguna"}

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

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Limpiar markdown si existe
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    const pregunta = JSON.parse(jsonText);
    
    return pregunta as PreguntaDinamica;
  } catch (error) {
    console.error("Error generando pregunta:", error);
    throw new Error("No se pudo generar la pregunta. Intenta de nuevo.");
  }
}

/**
 * Corrige la pronunciación del usuario comparando con lo esperado
 */
export async function corregirPronunciacion(
  textoDelUsuario: string,
  textoEsperado: string,
  idioma: string = "quechua"
): Promise<CorreccionPronunciacion> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Eres un corrector experto de pronunciación ${idioma}.

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

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonText) as CorreccionPronunciacion;
  } catch (error) {
    console.error("Error corrigiendo pronunciación:", error);
    throw new Error("No se pudo evaluar la pronunciación.");
  }
}

/**
 * Genera feedback inteligente según la respuesta del usuario
 */
export async function generarFeedbackInteligente(
  respuestaUsuario: string,
  respuestaCorrecta: string,
  leccion: string,
  explicacion: string
): Promise<FeedbackInteligente> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const esCorrecta = respuestaUsuario.toLowerCase().trim() === respuestaCorrecta.toLowerCase().trim();

  const prompt = `Eres un profesor de Quechua motivador. El estudiante respondió:
Respuesta: "${respuestaUsuario}"
Esperado: "${respuestaCorrecta}"
Correcto: ${esCorrecta}
Tema: ${leccion}

${esCorrecta 
  ? "¡Celebra! Genera feedback positivo y motivador."
  : "Corrige de forma amable. Explica por qué es incorrecto y cómo mejorar."}

Responde ÚNICAMENTE en JSON:
{
  "esCorrecto": ${esCorrecta},
  "puntos": ${esCorrecta ? 10 : 0},
  "feedback": "mensaje de feedback",
  "consejo": "consejo para mejorar",
  "palabrasClave": ["palabra1", "palabra2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonText) as FeedbackInteligente;
  } catch (error) {
    console.error("Error generando feedback:", error);
    throw new Error("No se pudo generar el feedback.");
  }
}

/**
 * Genera una conversación interactiva para práctica
 */
export async function generarConversacion(
  tema: string,
  nivel: "principiante" | "intermedio" | "avanzado"
): Promise<{
  lineas: Array<{ rol: "kuntur" | "usuario"; texto: string; pronunciacion?: string }>;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Crea una mini conversación en Quechua sobre "${tema}" para nivel ${nivel}.

Formato: líneas alternadas entre Kuntur (maestro) y el usuario (aprendiz).
Total: 4-6 líneas máximo.

Responde ÚNICAMENTE en JSON:
{
  "lineas": [
    { "rol": "kuntur", "texto": "Hola, ¿cómo estás?", "pronunciacion": "Allinllachu?" },
    { "rol": "usuario", "texto": "[el estudiante responde]", "pronunciacion": "" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generando conversación:", error);
    throw new Error("No se pudo generar la conversación.");
  }
}

/**
 * Analiza el nivel de comprensión del usuario
 */
export async function analizarComprension(
  respuestasCorrectas: number,
  respuestasTotal: number,
  tiempoPromedio: number
): Promise<{
  nivelActual: "principiante" | "intermedio" | "avanzado";
  recomendacion: string;
  siguientePaso: string;
}> {
  const porcentaje = (respuestasCorrectas / respuestasTotal) * 100;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analiza el desempeño de un estudiante de Quechua:
- Respuestas correctas: ${respuestasCorrectas}/${respuestasTotal} (${porcentaje.toFixed(1)}%)
- Tiempo promedio por pregunta: ${tiempoPromedio}s

Basado en esto, determina su nivel y da recomendaciones.

Responde ÚNICAMENTE en JSON:
{
  "nivelActual": "principiante",
  "recomendacion": "Está progresando bien...",
  "siguientePaso": "Te recomiendo..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analizando comprensión:", error);
    throw new Error("No se pudo analizar el desempeño.");
  }
}
