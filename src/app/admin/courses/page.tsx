import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { CourseManagementClient } from "./CourseManagementClient";

export default async function AdminCoursesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
      enrollments: { include: { student: true } },
      units: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const professors = await prisma.user.findMany({
    where: { role: "PROFESSOR" },
    orderBy: { name: "asc" },
  });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <CanvasHeader user={user} title="Creación de Cursos & Matrículas" subtitle="Asignación de profesores y matriculación de estudiantes" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <CourseManagementClient
            initialCourses={courses}
            professors={professors}
            students={students}
          />
        </main>
      </div>
    </div>
  );
}
