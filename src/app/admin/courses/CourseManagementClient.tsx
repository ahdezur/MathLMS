"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, UserCheck, GraduationCap, PlusCircle, CheckCircle, Sparkles } from "lucide-react";

interface CourseData {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  teacherId?: string | null;
  teacher?: { id: string; name: string; email: string } | null;
  enrollments: Array<{ id: string; student: { id: string; name: string; email: string } }>;
  units: Array<{ id: string }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CourseManagementProps {
  initialCourses: CourseData[];
  professors: UserData[];
  students: UserData[];
}

export function CourseManagementClient({
  initialCourses,
  professors,
  students,
}: CourseManagementProps) {
  const router = useRouter();

  // Create course form state
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Assign teacher state
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");

  // Enroll student state
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          description,
          teacherId: selectedTeacherId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`¡Curso "${data.course.title}" creado exitosamente!`);
      setCode("");
      setTitle("");
      setDescription("");
      setSelectedTeacherId("");
      router.refresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Assign Teacher
  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCourseId) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: assignCourseId,
          teacherId: assignTeacherId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`¡Profesor asignado correctamente al curso "${data.course.code}"!`);
      setAssignCourseId("");
      setAssignTeacherId("");
      router.refresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enroll Student
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollCourseId) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: enrollStudentId,
          courseId: enrollCourseId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`¡Estudiante "${data.enrollment.student.name}" matriculado correctamente!`);
      setEnrollStudentId("");
      setEnrollCourseId("");
      router.refresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CARD 1: Crear Nuevo Curso */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <PlusCircle className="w-5 h-5 text-rose-600" />
            <span>1. Crear Nuevo Curso</span>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Código del Curso</label>
              <input
                type="text"
                required
                placeholder="ej. MATH-201"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nombre del Curso</label>
              <input
                type="text"
                required
                placeholder="ej. Cálculo Diferencial e Integral"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Descripción</label>
              <textarea
                placeholder="Breve resumen del contenido..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Asignar Profesor (Opcional)</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="">-- Sin Profesor por ahora --</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              Crear Curso
            </button>
          </form>
        </div>

        {/* CARD 2: Asignar Profesor a Curso Existente */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <span>2. Asignar Profesor a Curso</span>
          </div>

          <form onSubmit={handleAssignTeacher} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seleccionar Curso</label>
              <select
                required
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">-- Seleccionar Curso --</option>
                {initialCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seleccionar Profesor Responsable</label>
              <select
                value={assignTeacherId}
                onChange={(e) => setAssignTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">-- Sin Profesor (Quitar Asignación) --</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              Guardar Asignación
            </button>
          </form>
        </div>

        {/* CARD 3: Matricular Estudiante */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>3. Matricular Estudiante</span>
          </div>

          <form onSubmit={handleEnrollStudent} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seleccionar Estudiante</label>
              <select
                required
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Seleccionar Estudiante --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seleccionar Curso a Matricular</label>
              <select
                required
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Seleccionar Curso --</option>
                {initialCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              Matricular Alumno
            </button>
          </form>
        </div>
      </div>

      {/* TABLE of Courses and Enrolled Students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-mathweb-cobalt" />
          <span>Matriz Actual de Cursos, Profesores y Estudiantes Matriculados</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Código</th>
                <th className="p-3">Curso</th>
                <th className="p-3">Profesor Asignado</th>
                <th className="p-3">Estudiantes Matriculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{c.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{c.title}</td>
                  <td className="p-3">
                    {c.teacher ? (
                      <span className="font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                        {c.teacher.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Sin Profesor</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.enrollments.length === 0 ? (
                        <span className="text-slate-400 italic text-xs">Sin alumnos matriculados</span>
                      ) : (
                        c.enrollments.map(({ student }) => (
                          <span
                            key={student.id}
                            className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-md"
                          >
                            {student.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
