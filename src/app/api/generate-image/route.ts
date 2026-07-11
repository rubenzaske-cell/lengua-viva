import { NextRequest, NextResponse } from "next/server";

// API para generar imágenes usando Pollinations (gratis, sin API key)
async function generateImageWithPollinations(prompt: string): Promise<string> {
  // Pollinations es un servicio gratis que genera imágenes desde texto
  // Devuelve la URL directa de la imagen
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Mejorar el prompt para mejores resultados
    const enhancedPrompt = `${prompt}, high quality, detailed, professional, vibrant colors`;

    const imageUrl = await generateImageWithPollinations(enhancedPrompt);

    return NextResponse.json({
      ok: true,
      imageUrl,
      prompt: enhancedPrompt,
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
    proveedor: "Pollinations (FLUX)",
    gratis: true,
  });
}
