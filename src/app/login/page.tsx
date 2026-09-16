"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MathRenderer } from "@/components/math/MathRenderer";
import { ShieldCheck, UserCheck, GraduationCap, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    if (!loginEmail) {
      setError("Por favor ingresa un correo electrónico");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: password || "password123" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error de inicio de sesión");
      }

      // Redirect automatically based on detected role
      const role = data.user.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "PROFESSOR") router.push("/teacher");
      else router.push("/student");

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    handleLogin(undefined, demoEmail);
  };

  return (
    <div className="min-h-screen bg-mathweb-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mathweb-darkblue text-white font-extrabold text-3xl shadow-xl shadow-blue-900/20 mb-4">
          Σ
        </div>
        <h2 className="text-3xl font-extrabold text-mathweb-navy tracking-tight">
          MathLMS Canvas
        </h2>
        <div className="mt-2 text-sm text-slate-600">
          <MathRenderer content="Plataforma de Matemáticas Avanzadas con Fórmulas $\text{LaTeX}$" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@mathweb.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-mathweb-cobalt focus:border-mathweb-cobalt text-slate-900 placeholder-slate-400 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-mathweb-cobalt focus:border-mathweb-cobalt text-slate-900 placeholder-slate-400 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white bg-mathweb-cobalt hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Verificando rol..." : "Iniciar Sesión"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Demostración 1-Click con reconocimiento de roles */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Acceso Rápido de Demostración</span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDemoClick("admin@mathweb.com")}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-rose-900">
                      Entrar como Administrador
                    </div>
                    <div className="text-xs text-slate-500">Control total de usuarios y cursos</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick("profesor@mathweb.com")}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-900">
                      Entrar como Profesor
                    </div>
                    <div className="text-xs text-slate-500">Gestión de unidades y evaluaciones</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">PROFESOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick("estudiante@mathweb.com")}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900">
                      Entrar como Estudiante
                    </div>
                    <div className="text-xs text-slate-500">Revisar lecciones y responder quizzes</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">ESTUDIANTE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
