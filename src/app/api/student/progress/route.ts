import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { chapterId } = await request.json();
    if (!chapterId) {
      return NextResponse.json({ error: "ID de capítulo requerido" }, { status: 400 });
    }

    const progress = await prisma.chapterProgress.upsert({
      where: {
        studentId_chapterId: {
          studentId: user.id,
          chapterId: chapterId,
        },
      },
      update: {
        isRead: true,
        readAt: new Date(),
      },
      create: {
        studentId: user.id,
        chapterId: chapterId,
        isRead: true,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar lectura" }, { status: 500 });
  }
}
