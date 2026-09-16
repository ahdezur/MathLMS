import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { MathRenderer } from "@/components/math/MathRenderer";
import { CheckCircle, XCircle, Clock, Award, BookOpen } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
      enrollments: {
        include: {
          student: {
            include: {
              chapterProgresses: { include: { chapter: true } },
              quizSubmissions: {
                include: {
                  quiz: true,
                  questionResponses: { include: { question: true } },
                },
                orderBy: { submittedAt: "desc" },
              },
            },
          },
        },
      },
      units: {
        include: {
          chapters: { include: { quizzes: true } },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <CanvasHeader user={user} title="Analítica Global de la Plataforma (Admin)" subtitle="Supervisión de lectura de capítulos y resultados de ejercicios por estudiante" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-10">
          {courses.map((course) => {
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
                    <span className="text-xs font-bold bg-rose-100 text-rose-900 px-3 py-1 rounded-full uppercase">
                      {course.code}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{course.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">Profesor: {course.teacher?.name || "Sin asignar"}</p>
                  </div>
                </div>

                {/* 1. SEGUIMIENTO DE LECTURA */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-mathweb-cobalt" />
                    <span>1. Registro de Lecturas de Capítulos (Auditoría Admin)</span>
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-3">Estudiante</th>
                          <th className="p-3">Lecturas</th>
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
                              <td className="p-3 font-bold text-slate-900">{student.name}</td>
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
                                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Leído ({new Date(prog.readAt).toLocaleDateString()})</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400">No leído</span>
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

                {/* 2. REVISIÓN DE RESPUESTAS Y EJERCICIOS */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-rose-600" />
                    <span>2. Desglose de Respuestas Correctas/Incorrectas</span>
                  </h3>

                  {course.enrollments.map(({ student }) => (
                    <div key={student.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="font-bold text-slate-900 flex items-center justify-between text-sm">
                        <span>{student.name} ({student.email})</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {student.quizSubmissions.length} entregas realizadas
                        </span>
                      </div>

                      {student.quizSubmissions.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-lg p-3 border border-slate-200 text-xs space-y-2">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{sub.quiz.title}</span>
                            <span className="text-rose-700 font-mono">
                              Puntaje: {sub.score} / {sub.totalPoints} pts ({Math.round((sub.score / (sub.totalPoints || 1)) * 100)}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            {sub.questionResponses.map((qr, idx) => (
                              <div
                                key={qr.id}
                                className={`p-2 rounded border flex items-center gap-2 ${
                                  qr.isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-rose-50 border-rose-300 text-rose-950"
                                }`}
                              >
                                {qr.isCorrect ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                                <div className="truncate">
                                  <span className="font-bold">P{idx + 1}:</span> <MathRenderer content={qr.question.statement} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
