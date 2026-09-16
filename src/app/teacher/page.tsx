import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import Link from "next/link";
import { BookOpen, BarChart3, PlusCircle, Users, Eye } from "lucide-react";

export default async function TeacherDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== "PROFESSOR") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    include: {
      enrollments: { include: { student: true } },
      units: {
        include: {
          chapters: {
            include: {
              progresses: true,
              quizzes: { include: { submissions: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <CanvasHeader user={user} title="Panel de Profesor" subtitle="Gestión de Unidades, Capítulos LaTeX y Analíticas" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
                Perfil Docente
              </span>
              <h2 className="text-3xl font-extrabold mt-2">{user.name}</h2>
              <p className="text-amber-100 mt-1 max-w-xl text-sm">
                Diseña contenido con sintaxis LaTeX y supervisa las lecturas y resultados de tus estudiantes en tiempo real.
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Link
                href="/teacher/editor"
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm shadow hover:bg-amber-50 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Nuevo Capítulo LaTeX</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>Mis Cursos Asignados ({courses.length})</span>
            </h3>

            <Link
              href="/teacher/analytics"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ver Matriz de Lectura y Ejercicios</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              let totalChapters = 0;
              course.units.forEach((u) => {
                totalChapters += u.chapters.length;
              });

              return (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-xl text-slate-900 mt-2">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{course.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-y border-slate-100 py-4 text-center">
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">{course.units.length}</div>
                      <div className="text-xs text-slate-500 font-medium">Unidades</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">{totalChapters}</div>
                      <div className="text-xs text-slate-500 font-medium">Capítulos</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">{course.enrollments.length}</div>
                      <div className="text-xs text-slate-500 font-medium">Alumnos</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/teacher/editor"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center transition-all"
                    >
                      Editar Contenido
                    </Link>
                    <Link
                      href="/teacher/analytics"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Revisar Progreso Alumnos</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
