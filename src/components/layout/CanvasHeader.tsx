"use client";

import React from "react";
import { SessionUser } from "@/lib/auth";
import { Bell, Search, BookOpenCheck } from "lucide-react";

interface HeaderProps {
  user: SessionUser;
  title?: string;
  subtitle?: string;
}

export const CanvasHeader: React.FC<HeaderProps> = ({ user, title, subtitle }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title || "Plataforma de Aprendizaje de Matemáticas"}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
          <BookOpenCheck className="w-4 h-4 text-mathweb-cobalt" />
          <span>Periodo Lectivo 2026</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-mathweb-darkblue text-white font-bold flex items-center justify-center text-sm shadow">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
