import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Configuración de Z.ai
async function getZaiConfig() {
  try {
    const configPath = path.join(process.cwd(), ".z-ai-config");
    const configStr = await fs.readFile(configPath, "utf-8");
    return JSON.parse(configStr);
  } catch {
    return {
      baseUrl: "https://internal-api.z.ai/v1",
      apiKey: "Z.ai",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODkzNDRhN2YtYTQ5Mi00ZGI1LWFiN2EtZjA2MDhiMDU5MjUxIiwiY2hhdF9pZCI6ImNoYXQtODY4MDQ0NGEtYjYxNS00MGI3LWI4MDAtMTZhMjM4MjI3MGJkIiwicGxhdGZvcm0iOiJ6YWkifQ.nSuNOlDQbr_k3gUF6vC2_IDOSPFKrHOOKf0B8WWxZP8",
    };
  }
}

// Mejorar el prompt para generar imágenes de mejor calidad
function enhancePrompt(prompt: string): string {
  // Detectar el tipo de imagen para añadir keywords apropiados
  const lower = prompt.toLowerCase();

  let enhanced = prompt;

  // Detectar estilo realista
  if (lower.includes("foto") || lower.includes("realista") || lower.includes("realistic") || lower.includes("real")) {
    enhanced += ", photorealistic, ultra detailed, 8k, professional photography, sharp focus, natural lighting, high resolution";
  }
  // Detectar estilo arte/dibujo
  else if (lower.includes("dibujo") || lower.includes("dibuja") || lower.includes("art") || lower.includes("ilustración") || lower.includes("illustration")) {
    enhanced += ", digital art, highly detailed, vibrant colors, professional illustration, trending on artstation";
  }
  // Detectar logo
  else if (lower.includes("logo")) {
    enhanced += ", logo design, clean, minimalist, professional, vector style, high contrast";
  }
  // Detectar anime
  else if (lower.includes("anime") || lower.includes("manga")) {
    enhanced += ", anime style, high quality, detailed, studio ghibli inspired, vibrant";
  }
  // Default: alta calidad general
  else {
    enhanced += ", high quality, detailed, professional, vibrant colors, 4k, masterpiece";
  }

  return enhanced;
}

// Generar imagen con Z.ai (mejor calidad)
async function generateWithZai(prompt: string): Promise<string | null> {
  try {
    const config = await getZaiConfig();
    const url = `${config.baseUrl}/images/generations`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
      "X-Z-AI-From": "Z",
    };
    if (config.token) {
      headers["X-Token"] = config.token;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      console.error("Z.ai image error:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    return imageUrl || null;
  } catch (err) {
    console.error("Z.ai image failed:", err);
    return null;
  }
}

// Generar imagen con Pollinations (respaldo, siempre funciona)
async function generateWithPollinations(prompt: string): Promise<string> {
  const enhanced = enhancePrompt(prompt);
  const encodedPrompt = encodeURIComponent(enhanced);
  const seed = Math.floor(Math.random() * 1000000);

  // Usar flux que es el modelo más potente de Pollinations
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Mejorar el prompt
    const enhancedPrompt = enhancePrompt(prompt);

    // Intentar primero con Z.ai (mejor calidad)
    const zaiImageUrl = await generateWithZai(enhancedPrompt);

    if (zaiImageUrl) {
      return NextResponse.json({
        ok: true,
        imageUrl: zaiImageUrl,
        prompt: enhancedPrompt,
        provider: "Z.ai (premium)",
      });
    }

    // Si Z.ai falla, usar Pollinations
    const pollinationsUrl = await generateWithPollinations(prompt);
    return NextResponse.json({
      ok: true,
      imageUrl: pollinationsUrl,
      prompt: enhancedPrompt,
      provider: "Pollinations FLUX",
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "No se pudo generar la imagen" },
      { status: 500 }
    );
  }
}

// GET - estado
export async function GET() {
  return NextResponse.json({
    status: "ok",
    proveedores: ["Z.ai (premium)", "Pollinations FLUX (fallback)"],
    gratis: true,
  });
}
