import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { MathRenderer } from "@/components/math/MathRenderer";
import { CheckCircle, XCircle, Clock, Award, BookOpen, User, ChevronDown } from "lucide-react";

export default async function TeacherAnalyticsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "PROFESSOR") {
    redirect("/login");
  }

  // Fetch taught courses with complete student reading progress & quiz submissions
  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              chapterProgresses: {
                include: { chapter: true },
              },
              quizSubmissions: {
                include: {
                  quiz: true,
                  questionResponses: {
                    include: { question: true },
                  },
                },
                orderBy: { submittedAt: "desc" },
              },
            },
          },
        },
      },
      units: {
        include: {
          chapters: {
            include: {
              quizzes: true,
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
        <CanvasHeader user={user} title="Matriz de Seguimiento de Alumnos" subtitle="Revisión de lecturas de capítulos y resultados detallados de ejercicios" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-10">
          {courses.map((course) => {
            // All chapters in course
            const allChapters: Array<{ id: string; title: string }> = [];
            course.units.forEach((u) => {
              u.chapters.forEach((c) => {
                allChapters.push({ id: c.id, title: c.title });
              });
            });

            return (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase">
                      {course.code}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{course.title}</h2>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    {course.enrollments.length} Estudiantes Matriculados
                  </div>
                </div>

                {/* 1. SEGUIMIENTO DE LECTURA (Chapters Read by Student) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-mathweb-cobalt" />
                    <span>1. Registro de Lecturas de Capítulos y Acceso</span>
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-3">Estudiante</th>
                          <th className="p-3">Estado General</th>
                          {allChapters.map((chap) => (
                            <th key={chap.id} className="p-3 text-center min-w-[160px]">
                              {chap.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {course.enrollments.map(({ student }) => {
                          const readCount = student.chapterProgresses.filter(
                            (cp) => cp.isRead && allChapters.some((ac) => ac.id === cp.chapterId)
                          ).length;

                          return (
                            <tr key={student.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-extrabold">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div>{student.name}</div>
                                    <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800">
                                  {readCount} / {allChapters.length} leídos
                                </span>
                              </td>

                              {allChapters.map((chap) => {
                                const prog = student.chapterProgresses.find((cp) => cp.chapterId === chap.id);

                                return (
                                  <td key={chap.id} className="p-3 text-center">
                                    {prog && prog.isRead ? (
                                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Leído ({new Date(prog.readAt).toLocaleDateString()})</span>
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>No ingresado</span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. REVISIÓN DE RESULTADOS Y RESPUESTAS A EJERCICIOS */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>2. Desglose Detallado de Respuestas y Calificaciones de Ejercicios</span>
                  </h3>

                  {course.enrollments.map(({ student }) => {
                    return (
                      <div key={student.id} className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-mathweb-darkblue text-white font-bold flex items-center justify-center">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{student.name}</h4>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-500">Evaluaciones Realizadas</span>
                            <div className="text-sm font-extrabold text-mathweb-cobalt">
                              {student.quizSubmissions.length} intento(s)
                            </div>
                          </div>
                        </div>

                        {student.quizSubmissions.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">El estudiante aún no ha enviado ejercicios de evaluación.</p>
                        ) : (
                          <div className="space-y-4">
                            {student.quizSubmissions.map((sub) => (
                              <div key={sub.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span>{sub.quiz.title}</span>
                                    <span className="text-slate-400 font-normal">
                                      ({new Date(sub.submittedAt).toLocaleString()})
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-extrabold text-slate-900 text-sm bg-slate-100 px-3 py-1 rounded-lg">
                                      Nota: {sub.score} / {sub.totalPoints} pts
                                    </span>
                                    <span
                                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                                        sub.score / (sub.totalPoints || 1) >= 0.6
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {Math.round((sub.score / (sub.totalPoints || 1)) * 100)}%
                                    </span>
                                  </div>
                                </div>

                                {/* Question by question audit */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Auditoría de Respuestas del Alumno:
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {sub.questionResponses.map((qr, qIdx) => (
                                      <div
                                        key={qr.id}
                                        className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                                          qr.isCorrect
                                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                                            : "bg-rose-50/50 border-rose-200 text-rose-950"
                                        }`}
                                      >
                                        {qr.isCorrect ? (
                                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold truncate">
                                            Pregunta {qIdx + 1}: <MathRenderer content={qr.question.statement} />
                                          </div>
                                          <div className="text-[11px] text-slate-600 mt-1 truncate">
                                            Respuesta elegida:{" "}
                                            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">
                                              {qr.userAnswerJson}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
