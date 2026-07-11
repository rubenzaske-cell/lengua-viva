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

  // Estilo anime/kawaii/chibi
  if (lower.includes("kawaii") || lower.includes("chibi") || lower.includes("anime") || lower.includes("manga")) {
    return `${userPrompt}, anime style, kawaii, chibi, big adorable eyes, soft pastel colors, cute, digital art illustration, high quality, detailed`;
  }

  // Estilo realista/fotográfico
  if (lower.includes("foto") || lower.includes("realista") || lower.includes("realistic") || lower.includes("fotorrealista") || lower.includes("fotografía")) {
    return `${userPrompt}, photorealistic, ultra detailed, 8k resolution, professional photography, sharp focus, natural lighting, high resolution, DSLR quality`;
  }

  // Estilo logo
  if (lower.includes("logo")) {
    return `${userPrompt}, logo design, clean, minimalist, professional, vector style, high contrast, modern`;
  }

  // Estilo arte digital
  if (lower.includes("arte digital") || lower.includes("digital art") || lower.includes("concept art")) {
    return `${userPrompt}, digital art, highly detailed, vibrant colors, professional illustration, trending on artstation, concept art`;
  }

  // Estilo dibujo/ilustración
  if (lower.includes("dibujo") || lower.includes("dibuja") || lower.includes("ilustración") || lower.includes("ilustracion") || lower.includes("sketch") || lower.includes("bosquejo")) {
    return `${userPrompt}, hand drawn illustration, sketch style, artistic, detailed line work, professional drawing`;
  }

  // Estilo acuarela
  if (lower.includes("acuarela") || lower.includes("watercolor")) {
    return `${userPrompt}, watercolor painting, soft colors, artistic, flowing, delicate brushstrokes, traditional art`;
  }

  // Estilo óleo/pintura
  if (lower.includes("óleo") || lower.includes("oleo") || lower.includes("pintura") || lower.includes("painting") || lower.includes("cuadro")) {
    return `${userPrompt}, oil painting, classical art style, rich textures, dramatic lighting, museum quality, detailed brushstrokes`;
  }

  // Estilo pixel art
  if (lower.includes("pixel") || lower.includes("pixel art") || lower.includes("8bit") || lower.includes("8-bit")) {
    return `${userPrompt}, pixel art, retro game style, 8-bit, pixelated, vibrant colors, detailed pixel work`;
  }

  // Estilo 3D render
  if (lower.includes("3d") || lower.includes("render") || lower.includes("blender") || lower.includes("cinema 4d")) {
    return `${userPrompt}, 3D render, octane render, cinema 4d, ultra detailed, realistic materials, professional lighting, 8k`;
  }

  // Estilo cyberpunk
  if (lower.includes("cyberpunk") || lower.includes("cyber") || lower.includes("futurista") || lower.includes("futuristic") || lower.includes("neon")) {
    return `${userPrompt}, cyberpunk style, neon lights, futuristic, sci-fi, dark atmosphere, glowing elements, blade runner aesthetic`;
  }

  // Estilo fantasía
  if (lower.includes("fantasía") || lower.includes("fantasia") || lower.includes("fantasy") || lower.includes("mágico") || lower.includes("magico") || lower.includes("dragón") || lower.includes("dragon")) {
    return `${userPrompt}, fantasy art, magical, ethereal, mystical atmosphere, detailed, concept art, trending on artstation`;
  }

  // Estilo minimalista
  if (lower.includes("minimalista") || lower.includes("minimalist") || lower.includes("simple") || lower.includes("limpio")) {
    return `${userPrompt}, minimalist design, clean, simple, elegant, lots of negative space, modern aesthetic`;
  }

  // Estilo vintage/retro
  if (lower.includes("vintage") || lower.includes("retro") || lower.includes("antiguo") || lower.includes("clásico") || lower.includes("clasico")) {
    return `${userPrompt}, vintage style, retro aesthetic, nostalgic, film grain, aged colors, classic look`;
  }

  // Estilo cartoon
  if (lower.includes("cartoon") || lower.includes("caricatura") || lower.includes("dibujos animados")) {
    return `${userPrompt}, cartoon style, animated, vibrant colors, fun, playful, professional animation style`;
  }

  // Estilo gótico
  if (lower.includes("gótico") || lower.includes("gotico") || lower.includes("gothic") || lower.includes("oscuro") || lower.includes("dark")) {
    return `${userPrompt}, gothic style, dark atmosphere, moody lighting, dramatic shadows, mysterious, detailed`;
  }

  // Estilo pop art
  if (lower.includes("pop art") || lower.includes("pop-art") || lower.includes("warhol")) {
    return `${userPrompt}, pop art style, bold colors, comic book aesthetic, Andy Warhol inspired, vibrant, high contrast`;
  }

  // Estilo surrealista
  if (lower.includes("surrealista") || lower.includes("surreal") || lower.includes("dalí") || lower.includes("dali") || lower.includes("onírico")) {
    return `${userPrompt}, surrealist art, dreamlike, Salvador Dali inspired, imaginative, unusual compositions, artistic`;
  }

  // Estilo paisaje
  if (lower.includes("paisaje") || lower.includes("landscape") || lower.includes("montaña") || lower.includes("montanas") || lower.includes("nature") || lower.includes("naturaleza")) {
    return `${userPrompt}, beautiful landscape, scenic, atmospheric, golden hour lighting, ultra detailed, 4k, professional photography`;
  }

  // Estilo retrato
  if (lower.includes("persona") || lower.includes("retrato") || lower.includes("portrait") || lower.includes("hombre") || lower.includes("mujer") || lower.includes("niño") || lower.includes("niña")) {
    return `${userPrompt}, portrait, detailed face, professional photography, soft lighting, 8k, sharp focus`;
  }

  // Estilo comida
  if (lower.includes("comida") || lower.includes("food") || lower.includes("plato") || lower.includes("postre") || lower.includes("pizza") || lower.includes("hamburguesa")) {
    return `${userPrompt}, food photography, appetizing, professional lighting, detailed, magazine quality, shallow depth of field`;
  }

  // Estilo arquitectura
  if (lower.includes("casa") || lower.includes("edificio") || lower.includes("arquitectura") || lower.includes("architecture") || lower.includes("construcción")) {
    return `${userPrompt}, architectural photography, professional, detailed, dramatic angles, professional lighting, 8k`;
  }

  // Default: alta calidad general (sin forzar realista)
  return `${userPrompt}, high quality, detailed, professional, vibrant colors, 4k, masterpiece, sharp focus, beautiful composition`;
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
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);

  // Usar flux que es el modelo más potente de Pollinations
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, style } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Construir prompt profesional
    let professionalPrompt = buildProfessionalPrompt(prompt);

    // Si el usuario seleccionó un estilo específico, añadir sus keywords
    if (style && style !== "auto") {
      const styleMap: Record<string, string> = {
        "realista": "photorealistic, ultra detailed, 8k, professional photography, sharp focus, natural lighting, DSLR quality",
        "anime": "anime style, kawaii, chibi, big adorable eyes, soft pastel colors, cute, digital art illustration",
        "digital-art": "digital art, highly detailed, vibrant colors, professional illustration, trending on artstation, concept art",
        "pintura": "oil painting, classical art style, rich textures, dramatic lighting, museum quality, detailed brushstrokes",
        "acuarela": "watercolor painting, soft colors, artistic, flowing, delicate brushstrokes, traditional art",
        "3d": "3D render, octane render, cinema 4d, ultra detailed, realistic materials, professional lighting, 8k",
        "cyberpunk": "cyberpunk style, neon lights, futuristic, sci-fi, dark atmosphere, glowing elements, blade runner aesthetic",
        "fantasia": "fantasy art, magical, ethereal, mystical atmosphere, detailed, concept art, trending on artstation",
        "pixel": "pixel art, retro game style, 8-bit, pixelated, vibrant colors, detailed pixel work",
        "cartoon": "cartoon style, animated, vibrant colors, fun, playful, professional animation style",
        "minimalista": "minimalist design, clean, simple, elegant, lots of negative space, modern aesthetic",
        "vintage": "vintage style, retro aesthetic, nostalgic, film grain, aged colors, classic look",
        "gotico": "gothic style, dark atmosphere, moody lighting, dramatic shadows, mysterious, detailed",
        "pop-art": "pop art style, bold colors, comic book aesthetic, Andy Warhol inspired, vibrant, high contrast",
        "surrealista": "surrealist art, dreamlike, Salvador Dali inspired, imaginative, unusual compositions, artistic",
      };

      const styleKeywords = styleMap[style];
      if (styleKeywords) {
        // Si el estilo es específico, reemplazar el prompt profesional con el estilo forzado
        professionalPrompt = `${prompt}, ${styleKeywords}`;
      }
    }

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
    const pollinationsUrl = await generateWithPollinations(professionalPrompt);
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
    estilos: [
      "kawaii/anime", "realista/foto", "logo", "arte digital", "dibujo",
      "acuarela", "óleo/pintura", "pixel art", "3D render", "cyberpunk",
      "fantasía", "minimalista", "vintage/retro", "cartoon", "gótico",
      "pop art", "surrealista", "paisaje", "retrato", "comida", "arquitectura"
    ],
    gratis: true,
  });
}
