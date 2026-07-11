import { NextRequest, NextResponse } from "next/server";

// Hugging Face API - GRATIS con token gratuito
// Modelos disponibles: FLUX.1-schnell, Stable Diffusion XL, etc.
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || "";

// Detectar el estilo solicitado y construir prompt profesional ULTRA DETALLADO
function buildProfessionalPrompt(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();

  // Estilo anime/kawaii/chibi
  if (lower.includes("kawaii") || lower.includes("chibi") || lower.includes("anime") || lower.includes("manga")) {
    return `${userPrompt}, anime style illustration, kawaii aesthetic, chibi proportions, big sparkling adorable eyes, soft pastel color palette, cute expression, high quality digital art, detailed shading, professional anime illustration, trending on pixiv, masterpiece`;
  }

  // Estilo realista/fotográfico
  if (lower.includes("foto") || lower.includes("realista") || lower.includes("realistic") || lower.includes("fotorrealista") || lower.includes("fotografía")) {
    return `${userPrompt}, ultra photorealistic, hyperrealistic, 8k ultra HD resolution, professional photography, DSLR camera, sharp focus, natural soft lighting, shallow depth of field, professional color grading, award-winning photography, highly detailed`;
  }

  // Estilo logo
  if (lower.includes("logo")) {
    return `${userPrompt}, professional logo design, clean minimalist vector style, modern aesthetic, high contrast, scalable, corporate identity, premium quality, flat design`;
  }

  // Estilo arte digital
  if (lower.includes("arte digital") || lower.includes("digital art") || lower.includes("concept art")) {
    return `${userPrompt}, professional digital art, concept art, highly detailed, vibrant rich colors, dramatic lighting, trending on artstation, award-winning illustration, epic composition, 4k quality`;
  }

  // Estilo dibujo/ilustración
  if (lower.includes("dibujo") || lower.includes("dibuja") || lower.includes("ilustración") || lower.includes("ilustracion") || lower.includes("sketch") || lower.includes("bosquejo")) {
    return `${userPrompt}, hand-drawn illustration, detailed pencil sketch style, artistic line work, professional drawing, cross-hatching shading, traditional art technique`;
  }

  // Estilo acuarela
  if (lower.includes("acuarela") || lower.includes("watercolor")) {
    return `${userPrompt}, beautiful watercolor painting, soft flowing colors, delicate brushstrokes, traditional watercolor technique, artistic, paper texture, vibrant yet soft palette`;
  }

  // Estilo óleo/pintura
  if (lower.includes("óleo") || lower.includes("oleo") || lower.includes("pintura") || lower.includes("painting") || lower.includes("cuadro")) {
    return `${userPrompt}, oil painting on canvas, classical fine art style, rich textured brushstrokes, dramatic chiaroscuro lighting, museum quality artwork, Renaissance-inspired technique`;
  }

  // Estilo pixel art
  if (lower.includes("pixel") || lower.includes("pixel art") || lower.includes("8bit") || lower.includes("8-bit")) {
    return `${userPrompt}, detailed pixel art, 16-bit retro game style, vibrant limited color palette, crisp pixels, professional pixel art illustration, retro video game aesthetic`;
  }

  // Estilo 3D render
  if (lower.includes("3d") || lower.includes("render") || lower.includes("blender") || lower.includes("cinema 4d")) {
    return `${userPrompt}, high-quality 3D render, octane render, cinema 4d, ultra detailed, realistic materials and textures, professional studio lighting, 8k resolution, photorealistic 3D`;
  }

  // Estilo cyberpunk
  if (lower.includes("cyberpunk") || lower.includes("cyber") || lower.includes("futurista") || lower.includes("futuristic") || lower.includes("neon")) {
    return `${userPrompt}, cyberpunk aesthetic, neon glowing lights, futuristic dystopian city, dark atmospheric mood, Blade Runner inspired, holographic elements, rain-slicked streets, ultra detailed sci-fi`;
  }

  // Estilo fantasía
  if (lower.includes("fantasía") || lower.includes("fantasia") || lower.includes("fantasy") || lower.includes("mágico") || lower.includes("magico") || lower.includes("dragón") || lower.includes("dragon")) {
    return `${userPrompt}, epic fantasy art, magical ethereal atmosphere, mystical glowing light, detailed concept art, trending on artstation, dramatic composition, otherworldly, masterpiece`;
  }

  // Estilo minimalista
  if (lower.includes("minimalista") || lower.includes("minimalist") || lower.includes("simple") || lower.includes("limpio")) {
    return `${userPrompt}, minimalist design, clean simple composition, lots of negative space, elegant modern aesthetic, subtle colors, professional graphic design`;
  }

  // Estilo vintage/retro
  if (lower.includes("vintage") || lower.includes("retro") || lower.includes("antiguo") || lower.includes("clásico") || lower.includes("clasico")) {
    return `${userPrompt}, vintage retro aesthetic, aged film grain, warm nostalgic colors, classic 1970s style, analog photography look, weathered texture`;
  }

  // Estilo cartoon
  if (lower.includes("cartoon") || lower.includes("caricatura") || lower.includes("dibujos animados")) {
    return `${userPrompt}, cartoon animation style, bold outlines, vibrant saturated colors, playful fun design, professional animation studio quality, expressive character`;
  }

  // Estilo gótico
  if (lower.includes("gótico") || lower.includes("gotico") || lower.includes("gothic") || lower.includes("oscuro") || lower.includes("dark")) {
    return `${userPrompt}, dark gothic atmosphere, moody dramatic lighting, deep shadows, mysterious eerie mood, Victorian gothic architecture, highly detailed dark fantasy`;
  }

  // Estilo pop art
  if (lower.includes("pop art") || lower.includes("pop-art") || lower.includes("warhol")) {
    return `${userPrompt}, bold pop art style, vibrant primary colors, comic book halftone dots, Andy Warhol inspired, high contrast, retro advertising aesthetic`;
  }

  // Estilo surrealista
  if (lower.includes("surrealista") || lower.includes("surreal") || lower.includes("dalí") || lower.includes("dali") || lower.includes("onírico")) {
    return `${userPrompt}, surrealist dreamlike art, Salvador Dali inspired, impossible impossible compositions, melting forms, imaginative bizarre imagery, fine art quality`;
  }

  // Estilo paisaje
  if (lower.includes("paisaje") || lower.includes("landscape") || lower.includes("montaña") || lower.includes("montanas") || lower.includes("nature") || lower.includes("naturaleza")) {
    return `${userPrompt}, breathtaking landscape, golden hour warm lighting, atmospheric depth, ultra detailed, 4k professional nature photography, panoramic view, award-winning`;
  }

  // Estilo retrato
  if (lower.includes("persona") || lower.includes("retrato") || lower.includes("portrait") || lower.includes("hombre") || lower.includes("mujer") || lower.includes("niño") || lower.includes("niña")) {
    return `${userPrompt}, professional portrait photography, detailed facial features, soft studio lighting, shallow depth of field, 8k resolution, sharp focus on eyes, magazine quality`;
  }

  // Estilo comida
  if (lower.includes("comida") || lower.includes("food") || lower.includes("plato") || lower.includes("postre") || lower.includes("pizza") || lower.includes("hamburguesa")) {
    return `${userPrompt}, professional food photography, appetizing presentation, natural lighting, shallow depth of field, detailed texture, magazine quality, mouthwatering`;
  }

  // Estilo arquitectura
  if (lower.includes("casa") || lower.includes("edificio") || lower.includes("arquitectura") || lower.includes("architecture") || lower.includes("construcción")) {
    return `${userPrompt}, architectural photography, dramatic angles, professional lighting, ultra detailed, 8k resolution, modern architectural design, award-winning`;
  }

  // Default: ultra alta calidad
  return `${userPrompt}, ultra high quality, highly detailed, professional, vibrant colors, 4k, masterpiece, sharp focus, beautiful composition, award-winning`;
}

// Generar imagen con Hugging Face (FLUX.1-schnell - CALIDAD PROFESIONAL)
async function generateWithHuggingFace(prompt: string): Promise<string | null> {
  if (!HF_TOKEN) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 1024,
          num_inference_steps: 4, // FLUX schnell es rápido
          guidance_scale: 7.5,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Hugging Face error:", response.status);
      return null;
    }

    // La respuesta es una imagen binaria
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convertir a base64 data URL
    const base64 = buffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error("Hugging Face failed:", err);
    return null;
  }
}

// Generar imagen con Pollinations (calidad optimizada al máximo)
async function generateWithPollinations(prompt: string): Promise<string> {
  // Prompt en inglés para mejor comprensión del modelo
  const englishPrompt = translateToEnglish(prompt);
  const encodedPrompt = encodeURIComponent(englishPrompt);
  const seed = Math.floor(Math.random() * 1000000);

  // Usar todas las opciones de calidad disponibles
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true&private=true&model=flux`;
  return url;
}

// Traducir prompt al inglés para mejor calidad (el modelo FLUX entiende mejor inglés)
function translateToEnglish(prompt: string): string {
  // Si el prompt ya está en inglés o tiene keywords en inglés, dejarlo
  if (/[a-zA-Z]{3,}/.test(prompt) && !prompt.match(/[áéíóúñ¿¡]/)) {
    return prompt;
  }

  // Traducciones comunes español → inglés
  const translations: Record<string, string> = {
    "cóndor": "condor",
    "andino": "andean",
    "andina": "andean",
    "montaña": "mountain",
    "montañas": "mountains",
    "atardecer": "sunset",
    "amanecer": "sunrise",
    "gato": "cat",
    "perro": "dog",
    "paisaje": "landscape",
    "persona": "person",
    "hombre": "man",
    "mujer": "woman",
    "niño": "boy",
    "niña": "girl",
    "casa": "house",
    "edificio": "building",
    "comida": "food",
    "pizza": "pizza",
    "dibujo": "drawing",
    "pintura": "painting",
    "acuarela": "watercolor",
    "realista": "realistic",
    "fotografía": "photography",
    "anime": "anime",
    "kawaii": "kawaii",
    "chibi": "chibi",
    "cyberpunk": "cyberpunk",
    "fantasía": "fantasy",
    "fantasia": "fantasy",
    "dragón": "dragon",
    "dragon": "dragon",
    "mágico": "magical",
    "magico": "magical",
    "futurista": "futuristic",
    "vintage": "vintage",
    "retro": "retro",
    "minimalista": "minimalist",
    "gótico": "gothic",
    "gotico": "gothic",
    "oscuro": "dark",
    "vibrante": "vibrant",
    "hermoso": "beautiful",
    "hermosa": "beautiful",
    "lindo": "cute",
    "linda": "cute",
    "adorable": "adorable",
    "majestuoso": "majestic",
    "majestuosa": "majestic",
    "volando": "flying",
    "sobre": "over",
    "bajo": "under",
    "cielo": "sky",
    "nube": "cloud",
    "nubes": "clouds",
    "sol": "sun",
    "luna": "moon",
    "estrellas": "stars",
    "río": "river",
    "rio": "river",
    "lago": "lake",
    "mar": "sea",
    "océano": "ocean",
    "oceano": "ocean",
    "bosque": "forest",
    "árbol": "tree",
    "arbol": "tree",
    "flor": "flower",
    "flores": "flowers",
    "animal": "animal",
    "animales": "animals",
    "pájaro": "bird",
    "pajaro": "bird",
    "águila": "eagle",
    "aguila": "eagle",
    "león": "lion",
    "leon": "lion",
    "tigre": "tiger",
    "lobo": "wolf",
    "zorro": "fox",
    "caballo": "horse",
    "vaca": "cow",
    "oveja": "sheep",
    "cerdo": "pig",
    "conejo": "rabbit",
    "ratón": "mouse",
    "raton": "mouse",
    "pez": "fish",
    "tiburón": "shark",
    "tiburon": "shark",
    "ballena": "whale",
    "delfín": "dolphin",
    "delfin": "dolphin",
    "tortuga": "turtle",
    "serpiente": "snake",
    "lagarto": "lizard",
    "mariposa": "butterfly",
    "abeja": "bee",
    "araña": "spider",
    "arana": "spider",
  };

  let translated = prompt.toLowerCase();
  for (const [esp, eng] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${esp}\\b`, "gi");
    translated = translated.replace(regex, eng);
  }

  return translated;
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
        professionalPrompt = `${prompt}, ${styleKeywords}`;
      }
    }

    // 1. Intentar primero con Hugging Face (CALIDAD PROFESIONAL)
    const hfImageUrl = await generateWithHuggingFace(professionalPrompt);

    if (hfImageUrl) {
      return NextResponse.json({
        ok: true,
        imageUrl: hfImageUrl,
        prompt: professionalPrompt,
        provider: "Hugging Face FLUX.1-schnell (profesional)",
      });
    }

    // 2. Si Hugging Face falla, usar Pollinations (respaldo)
    const pollinationsUrl = await generateWithPollinations(professionalPrompt);
    return NextResponse.json({
      ok: true,
      imageUrl: pollinationsUrl,
      prompt: professionalPrompt,
      provider: "Pollinations (respaldo)",
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
    proveedores: [
      "Hugging Face FLUX.1-schnell (profesional)",
      "Pollinations (respaldo)"
    ],
    hfConfigurado: !!HF_TOKEN,
    estilos: [
      "kawaii/anime", "realista/foto", "logo", "arte digital", "dibujo",
      "acuarela", "óleo/pintura", "pixel art", "3D render", "cyberpunk",
      "fantasía", "minimalista", "vintage/retro", "cartoon", "gótico",
      "pop art", "surrealista", "paisaje", "retrato", "comida", "arquitectura"
    ],
    gratis: true,
  });
}
