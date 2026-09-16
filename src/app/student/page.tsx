import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { MathRenderer } from "@/components/math/MathRenderer";
import Link from "next/link";
import { BookOpen, CheckCircle, ArrowRight, Award } from "lucide-react";

export default async function StudentDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: {
          teacher: true,
          units: {
            include: {
              chapters: {
                include: {
                  progresses: { where: { studentId: user.id } },
                  quizzes: {
                    include: {
                      submissions: { where: { studentId: user.id } },
                    },
                  },
                },
              },
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
        <CanvasHeader user={user} title="Dashboard de Estudiante (Canvas)" subtitle="Tus cursos matriculados y avance de lecciones" />

        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 bg-gradient-to-r from-mathweb-darkblue to-mathweb-cobalt rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                Bienvenido de nuevo
              </span>
              <h2 className="text-3xl font-extrabold mt-2">{user.name}</h2>
              <p className="text-blue-100 mt-1 max-w-xl text-sm">
                Explora el material en LaTeX, completa las evaluaciones interactivas y realiza el seguimiento de tus lecturas.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-4xl font-bold">
              <MathRenderer content="$\int$" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-mathweb-cobalt" />
            <span>Cursos Asignados ({enrollments.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(({ course }) => {
              // Calculate reading progress
              let totalChapters = 0;
              let readChapters = 0;
              let totalQuizzes = 0;
              let completedQuizzes = 0;

              course.units.forEach((u) => {
                u.chapters.forEach((c) => {
                  totalChapters++;
                  if (c.progresses.length > 0 && c.progresses[0].isRead) {
                    readChapters++;
                  }
                  c.quizzes.forEach((q) => {
                    totalQuizzes++;
                    if (q.submissions.length > 0) completedQuizzes++;
                  });
                });
              });

              const readPercentage = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-28 bg-gradient-to-br from-slate-900 via-mathweb-darkblue to-mathweb-cobalt p-5 flex flex-col justify-between text-white">
                      <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-md w-fit">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-lg leading-snug line-clamp-1">{course.title}</h4>
                    </div>

                    <div className="p-5 space-y-4">
                      <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>

                      <div className="text-xs text-slate-500 font-medium">
                        Profesor: <span className="text-slate-800 font-semibold">{course.teacher?.name || "Por asignar"}</span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-600">Progreso de Lectura</span>
                          <span className="text-mathweb-cobalt">{readPercentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mathweb-cobalt rounded-full transition-all duration-500"
                            style={{ width: `${readPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          {readChapters} / {totalChapters} Capítulos Leídos
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Award className="w-4 h-4 text-amber-500" />
                          {completedQuizzes} Quizzes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-mathweb-cobalt text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Ingresar al Curso</span>
                      <ArrowRight className="w-4 h-4" />
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
