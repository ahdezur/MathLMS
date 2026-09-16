import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden crear usuarios" }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nombre, correo y rol son requeridos" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password || "password123",
        role: role,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 });
  }
}
