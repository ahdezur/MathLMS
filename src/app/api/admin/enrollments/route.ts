import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden matricular estudiantes" }, { status: 403 });
    }

    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json({ error: "Estudiante y Curso son requeridos" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      update: {},
      create: {
        studentId,
        courseId,
      },
      include: {
        student: true,
        course: true,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al matricular estudiante" }, { status: 500 });
  }
}
