import React from "react";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata = {
  title: "MathLMS - Sistema de Aprendizaje de Matemáticas Canvas",
  description: "LMS ligero tipo Canvas enfocado en Matemáticas con KaTeX, roles de usuario y ejercicios interactivos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
