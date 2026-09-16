"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, ShieldCheck, UserCheck, GraduationCap, CheckCircle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function UserManagementClient({ initialUsers }: { initialUsers: UserData[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`¡Usuario "${data.user.name}" creado con rol ${data.user.role}!`);
      setName("");
      setEmail("");
      setRole("STUDENT");
      setPassword("password123");
      router.refresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-2xl">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserPlus className="w-5 h-5 text-rose-600" />
          <span>Crear Nuevo Usuario y Asignar Rol</span>
        </h3>

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="ej. Dra. Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="ada@mathweb.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Rol del Sistema</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="STUDENT">Estudiante (STUDENT)</option>
              <option value="PROFESSOR">Profesor (PROFESSOR)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Contraseña por Defecto</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 font-mono"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-5 h-5 text-rose-600" />
          <span>Directorio de Usuarios Registrados ({initialUsers.length})</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo Electrónico</th>
                <th className="p-3">Rol del Sistema</th>
                <th className="p-3">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialUsers.map((u) => {
                let roleBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
                let RoleIcon = GraduationCap;

                if (u.role === "ADMIN") {
                  roleBadge = "bg-rose-100 text-rose-800 border-rose-300";
                  RoleIcon = ShieldCheck;
                } else if (u.role === "PROFESSOR") {
                  roleBadge = "bg-amber-100 text-amber-800 border-amber-300";
                  RoleIcon = UserCheck;
                }

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadge}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
