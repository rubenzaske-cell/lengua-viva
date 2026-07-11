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

// Detectar el estilo solicitado y construir prompt profesional
function buildProfessionalPrompt(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();

  // Detectar estilo anime/kawaii/chibi
  if (lower.includes("kawaii") || lower.includes("chibi") || lower.includes("anime") || lower.includes("manga")) {
    return `${userPrompt}, anime style, kawaii, chibi, big adorable eyes, soft pastel colors, cute, digital art illustration, high quality, detailed`;
  }

  // Detectar estilo realista/foto
  if (lower.includes("foto") || lower.includes("realista") || lower.includes("realistic") || lower.includes("real")) {
    return `${userPrompt}, photorealistic, ultra detailed, 8k resolution, professional photography, sharp focus, natural lighting, high resolution, DSLR quality`;
  }

  // Detectar logo
  if (lower.includes("logo")) {
    return `${userPrompt}, logo design, clean, minimalist, professional, vector style, high contrast, modern`;
  }

  // Detectar arte digital/dibujo
  if (lower.includes("dibujo") || lower.includes("dibuja") || lower.includes("art") || lower.includes("ilustración") || lower.includes("ilustracion")) {
    return `${userPrompt}, digital art, highly detailed, vibrant colors, professional illustration, trending on artstation, concept art`;
  }

  // Detectar paisaje
  if (lower.includes("paisaje") || lower.includes("landscape") || lower.includes("montaña") || lower.includes("montanas") || lower.includes("nature")) {
    return `${userPrompt}, beautiful landscape, scenic, atmospheric, golden hour lighting, ultra detailed, 4k, professional photography`;
  }

  // Detectar retrato/persona
  if (lower.includes("persona") || lower.includes("retrato") || lower.includes("portrait") || lower.includes("hombre") || lower.includes("mujer") || lower.includes("niño") || lower.includes("niña")) {
    return `${userPrompt}, portrait, detailed face, professional photography, soft lighting, 8k, sharp focus`;
  }

  // Default: alta calidad
  return `${userPrompt}, high quality, detailed, professional, vibrant colors, 4k, masterpiece, sharp focus`;
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        size: "1024x1024",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

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

// Generar imagen con Pollinations (respaldo)
async function generateWithPollinations(prompt: string): Promise<string> {
  const enhanced = buildProfessionalPrompt(prompt);
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

    // Construir prompt profesional
    const professionalPrompt = buildProfessionalPrompt(prompt);

    // Intentar primero con Z.ai (mejor calidad)
    const zaiImageUrl = await generateWithZai(professionalPrompt);

    if (zaiImageUrl) {
      return NextResponse.json({
        ok: true,
        imageUrl: zaiImageUrl,
        prompt: professionalPrompt,
        provider: "Z.ai (premium)",
      });
    }

    // Si Z.ai falla, usar Pollinations con prompt profesional
    const pollinationsUrl = await generateWithPollinations(prompt);
    return NextResponse.json({
      ok: true,
      imageUrl: pollinationsUrl,
      prompt: professionalPrompt,
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
    estilos: ["kawaii", "realista", "logo", "arte digital", "paisaje", "retrato"],
    gratis: true,
  });
}
