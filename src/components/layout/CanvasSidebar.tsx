"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/auth";
import { MathRenderer } from "@/components/math/MathRenderer";
import {
  BookOpen,
  Users,
  Award,
  BarChart3,
  LogOut,
  FolderPlus,
  Compass,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  user: SessionUser;
}

export const CanvasSidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (user.role) {
      case "ADMIN":
        return [
          { href: "/admin", label: "Dashboard Admin", icon: BarChart3 },
          { href: "/admin/courses", label: "Cursos & Asignaciones", icon: BookOpen },
          { href: "/admin/users", label: "Control Usuarios & Matriculas", icon: Users },
          { href: "/admin/analytics", label: "Analítica de Lectura y Quizzes", icon: Award },
        ];
      case "PROFESSOR":
        return [
          { href: "/teacher", label: "Mis Cursos", icon: BookOpen },
          { href: "/teacher/editor", label: "Creador de Contenido", icon: FolderPlus },
          { href: "/teacher/analytics", label: "Seguimiento Alumnos", icon: BarChart3 },
        ];
      case "STUDENT":
      default:
        return [
          { href: "/student", label: "Mis Cursos (Canvas)", icon: Compass },
          { href: "/student/progress", label: "Mi Progreso y Notas", icon: GraduationCap },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const roleColors = {
    ADMIN: "bg-rose-500 text-white",
    PROFESSOR: "bg-amber-500 text-white",
    STUDENT: "bg-emerald-500 text-white",
  };

  return (
    <aside className="w-64 bg-mathweb-navy text-white min-h-screen flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mathweb-cobalt flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/30">
            Σ
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">MathLMS</h1>
            <p className="text-xs text-slate-400">Canvas Edition Math</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-1">{user.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-mathweb-cobalt text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 text-sm font-medium transition-all border border-slate-700 hover:border-rose-800"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
