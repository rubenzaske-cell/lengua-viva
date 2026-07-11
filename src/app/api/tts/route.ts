import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Configuración de Z.ai (igual que motor-ia)
async function getConfig() {
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

// Llamar al API de TTS de Z.ai con fetch directo
async function generateTTS(text: string, voice: string = "tongtong", speed: number = 0.9): Promise<Buffer> {
  const config = await getConfig();
  const url = `${config.baseUrl}/audio/tts`;

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
      input: text,
      voice,
      speed,
      response_format: "mp3",
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("TTS API error:", response.status, errorText);
    throw new Error(`TTS API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(new Uint8Array(arrayBuffer));
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Limitar a 1024 caracteres
    const truncatedText = text.slice(0, 1024);

    const audioBuffer = await generateTTS(
      truncatedText,
      voice || "tongtong",
      speed || 0.9
    );

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400", // cache 24h
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: "No se pudo generar el audio" },
      { status: 500 }
    );
  }
}

// GET - estado del TTS
export async function GET() {
  return NextResponse.json({
    status: "ok",
    ttsActivo: true,
    proveedor: "Z.ai TTS",
    voces: ["tongtong", "chuichui", "xiaochen", "jam", "kazi", "douji", "luodo"],
  });
}
