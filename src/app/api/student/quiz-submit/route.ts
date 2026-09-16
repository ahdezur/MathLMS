import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { quizId, answers } = await request.json(); // answers is { [questionId]: userAnswerObject }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 });
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    const questionResults: Array<{
      questionId: string;
      userAnswerJson: string;
      isCorrect: boolean;
      points: number;
    }> = [];

    for (const q of quiz.questions) {
      const qPoints = 1.0;
      totalPoints += qPoints;

      const userAns = answers[q.id];
      const correctAns = JSON.parse(q.correctAnswerJson);
      let isCorrect = false;

      if (userAns !== undefined && userAns !== null) {
        if (q.type === "true_false" || q.type === "single_choice") {
          isCorrect = userAns === correctAns;
        } else if (q.type === "multiple_choice") {
          const userArr = (userAns as number[]).sort();
          const correctArr = (correctAns as number[]).sort();
          isCorrect =
            userArr.length === correctArr.length &&
            userArr.every((val, idx) => val === correctArr[idx]);
        } else if (q.type === "matching") {
          // Compare matching pairs
          isCorrect = true;
          for (const rowKey in correctAns) {
            const expectedRow = correctAns[rowKey];
            const userRow = userAns[rowKey];
            if (!userRow || userRow.b !== expectedRow.b) {
              isCorrect = false;
              break;
            }
            if (expectedRow.c !== undefined && userRow.c !== expectedRow.c) {
              isCorrect = false;
              break;
            }
          }
        } else if (q.type === "inline_dropdown") {
          isCorrect = true;
          for (const dropKey in correctAns) {
            if (userAns[dropKey] !== correctAns[dropKey]) {
              isCorrect = false;
              break;
            }
          }
        } else if (q.type === "step_ordering") {
          const userOrder = userAns as number[];
          const correctOrder = correctAns as number[];
          isCorrect =
            userOrder.length === correctOrder.length &&
            userOrder.every((val, idx) => val === correctOrder[idx]);
        }
      }

      const pointsForQ = isCorrect ? qPoints : 0;
      earnedPoints += pointsForQ;

      questionResults.push({
        questionId: q.id,
        userAnswerJson: JSON.stringify(userAns ?? null),
        isCorrect,
        points: pointsForQ,
      });
    }

    // Save submission & question responses in database
    const submission = await prisma.quizSubmission.create({
      data: {
        quizId: quiz.id,
        studentId: user.id,
        score: earnedPoints,
        totalPoints: totalPoints,
        questionResponses: {
          create: questionResults.map((res) => ({
            questionId: res.questionId,
            userAnswerJson: res.userAnswerJson,
            isCorrect: res.isCorrect,
            earnedPoints: res.points,
          })),
        },
      },
      include: {
        questionResponses: true,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score: earnedPoints,
      totalPoints,
      percentage: Math.round((earnedPoints / (totalPoints || 1)) * 100),
      questionResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al enviar respuestas" }, { status: 500 });
  }
}
