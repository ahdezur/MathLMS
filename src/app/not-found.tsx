import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-mathweb-darkblue text-white font-bold text-3xl flex items-center justify-center mb-4 shadow-lg">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Página no encontrada</h1>
      <p className="text-sm text-slate-600 mt-2 max-w-md">
        La sección o lección de matemáticas que buscas no existe o ha sido movida.
      </p>

      <Link
        href="/login"
        className="mt-6 px-6 py-3 rounded-xl bg-mathweb-cobalt hover:bg-blue-700 text-white font-bold text-sm shadow transition-all flex items-center gap-2"
      >
        <BookOpen className="w-4 h-4" />
        <span>Volver a la Plataforma</span>
      </Link>
    </div>
  );
}
