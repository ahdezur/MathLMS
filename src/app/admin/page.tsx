import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import Link from "next/link";
import { ShieldCheck, Users, BookOpen, BarChart3, UserPlus, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const usersCount = await prisma.user.count();
  const coursesCount = await prisma.course.count();
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const professorCount = await prisma.user.count({ where: { role: "PROFESSOR" } });

  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
      enrollments: true,
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <CanvasHeader user={user} title="Panel de Administración (Admin)" subtitle="Control global de usuarios, asignación de cursos y seguimiento" />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
                Administración General
              </span>
              <h2 className="text-3xl font-extrabold mt-2">{user.name}</h2>
              <p className="text-rose-100 mt-1 max-w-xl text-sm">
                Controla permisos de usuarios, asigna profesores a asignaturas y revisa las métricas de lectura y quizzes.
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Link
                href="/admin/users"
                className="px-5 py-3 rounded-xl bg-white text-rose-900 font-bold text-sm shadow hover:bg-rose-50 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-rose-600" />
                <span>Gestionar Usuarios</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{usersCount}</div>
                <div className="text-xs text-slate-500 font-medium">Usuarios Registrados</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{coursesCount}</div>
                <div className="text-xs text-slate-500 font-medium">Cursos de Matemáticas</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{professorCount}</div>
                <div className="text-xs text-slate-500 font-medium">Profesores Asignados</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{studentCount}</div>
                <div className="text-xs text-slate-500 font-medium">Alumnos Matriculados</div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Courses table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <span>Catálogo de Cursos & Estado de Asignaciones</span>
              </h3>

              <Link
                href="/admin/courses"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Crear / Matricular Curso</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Código</th>
                    <th className="p-3">Nombre del Curso</th>
                    <th className="p-3">Profesor Responsable</th>
                    <th className="p-3">Alumnos Matriculados</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{c.code}</td>
                      <td className="p-3 font-medium text-slate-900">{c.title}</td>
                      <td className="p-3 font-semibold text-slate-700">
                        {c.teacher ? (
                          <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            {c.teacher.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin profesor</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                          {c.enrollments.length} alumnos
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href="/admin/analytics"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition-all"
                        >
                          Ver Analíticas
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
