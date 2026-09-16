import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Crear nuevo curso o asignar profesor
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden gestionar cursos" }, { status: 403 });
    }

    const { code, title, description, teacherId } = await request.json();

    if (!code || !title) {
      return NextResponse.json({ error: "El código y el título del curso son requeridos" }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description?.trim() || null,
        teacherId: teacherId || null,
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear curso" }, { status: 500 });
  }
}

// Asignar o cambiar profesor de un curso existente
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden asignar profesores" }, { status: 403 });
    }

    const { courseId, teacherId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "ID del curso requerido" }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        teacherId: teacherId || null,
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al asignar profesor" }, { status: 500 });
  }
}
