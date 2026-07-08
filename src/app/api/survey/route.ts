import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId, getSnapshot } from "@/lib/quechua/auth";
import { SURVEY_QUESTIONS, DEFAULT_SURVEY, type SurveyAnswers } from "@/lib/quechua/survey";

// GET /api/survey - devuelve las preguntas de la encuesta
export async function GET() {
  return NextResponse.json({
    questions: SURVEY_QUESTIONS,
    defaults: DEFAULT_SURVEY,
  });
}

// POST /api/survey - guarda las respuestas de la encuesta
export async function POST(req: NextRequest) {
  // Leer el body una sola vez
  const body = await req.json();

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    // Fallback: si la cookie se perdió, intentar con el userId del body
    if (body.userId) {
      const profile = await db.userProfile.findUnique({ where: { id: body.userId } });
      if (profile) {
        userId = profile.id;
      } else {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }
  }

  const answers: SurveyAnswers = {
    language: body.language || "quechua",
    goal: body.goal || "viajar",
    level: body.level || "principiante",
    pace: body.pace || "medio",
    dailyGoal: Number(body.dailyGoal) || 30,
    reminderTime: body.reminderTime || null,
    interests: Array.isArray(body.interests) ? body.interests : [],
  };

  // Upsert del survey
  await db.userSurvey.upsert({
    where: { userId },
    create: {
      userId,
      language: answers.language,
      goal: answers.goal,
      level: answers.level,
      pace: answers.pace,
      dailyGoal: answers.dailyGoal,
      reminderTime: answers.reminderTime,
      interests: answers.interests.join(","),
      completedAt: new Date(),
    },
    update: {
      language: answers.language,
      goal: answers.goal,
      level: answers.level,
      pace: answers.pace,
      dailyGoal: answers.dailyGoal,
      reminderTime: answers.reminderTime,
      interests: answers.interests.join(","),
      completedAt: new Date(),
    },
  });

  // Actualizar la meta diaria del UserState según la encuesta
  await db.userState.update({
    where: { userId },
    data: { dailyGoal: answers.dailyGoal },
  });

  const snapshot = await getSnapshot();
  return NextResponse.json({ ok: true, snapshot });
}
