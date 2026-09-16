"use client";

import React, { useState } from "react";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Save, Sparkles, Code, Eye, FileText } from "lucide-react";

export default function ContentEditorPage() {
  const [user] = useState<any>({
    id: "prof",
    name: "Prof. Roberto Gauss",
    email: "profesor@mathweb.com",
    role: "PROFESSOR",
  });

  const [chapterTitle, setChapterTitle] = useState("Capítulo 1.2: Teorema de Pitágoras y Funciones Trigonométricas");
  const [content, setContent] = useState(`
# Teorema de Pitágoras y Funciones Trigonométricas

En todo triángulo rectángulo con catetos $a$ y $b$, y una hipotenusa $c$, se satisface la relación fundamental:

$$a^2 + b^2 = c^2$$

## Razones Trigonométricas Fundamentales
Dado un ángulo $\\theta$ agudo en el triángulo rectángulo:

1. **Seno:** $$\\sin(\\theta) = \\frac{\\text{Cateto Opuesto}}{\\text{Hipotenusa}} = \\frac{a}{c}$$
2. **Coseno:** $$\\cos(\\theta) = \\frac{\\text{Cateto Adyacente}}{\\text{Hipotenusa}} = \\frac{b}{c}$$
3. **Tangente:** $$\\tan(\\theta) = \\frac{\\text{Cateto Opuesto}}{\\text{Cateto Adyacente}} = \\frac{a}{b}$$

### Identidad Pitagórica Fundamental
Al dividir la ecuación por $c^2$, obtenemos la identidad:

$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$
  `);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <CanvasHeader user={user} title="Editor de Capítulos (Markdown + LaTeX)" subtitle="Edición de contenidos en tiempo real para profesores" />

        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título del Capítulo</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                ¡Guardado en base de datos!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Capítulo</span>
            </button>
          </div>
        </div>

        {/* Editor & Preview Split Screen */}
        <div className="flex-1 flex min-h-0 divide-x divide-slate-200">
          {/* Left: Input Textarea */}
          <div className="flex-1 flex flex-col p-6 bg-slate-900 text-slate-100">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Code className="w-4 h-4 text-amber-400" />
              <span>Código Markdown + LaTeX ($inline$ / $$block$$)</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 p-4 rounded-xl font-mono text-sm leading-relaxed border border-slate-800 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Escribe el contenido de la lección usando fórmulas LaTeX..."
            />
          </div>

          {/* Right: Live KaTeX Preview */}
          <div className="flex-1 flex flex-col p-6 bg-white overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Eye className="w-4 h-4 text-mathweb-cobalt" />
              <span>Vista Previa en Vivo (Estudiante)</span>
            </div>
            <div className="prose max-w-none text-slate-800 leading-relaxed text-base space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 border-b pb-2">{chapterTitle}</h1>
              <MathRenderer content={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
