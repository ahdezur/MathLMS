import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { UserManagementClient } from "./UserManagementClient";

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <CanvasSidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <CanvasHeader user={user} title="Gestión de Usuarios & Permisos de Roles" subtitle="Crear usuarios y modificar roles (Admin, Profesor, Estudiante)" />

        <main className="p-8 max-w-7xl mx-auto w-full">
          <UserManagementClient
            initialUsers={allUsers.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt.toISOString(),
            }))}
          />
        </main>
      </div>
    </div>
  );
}
