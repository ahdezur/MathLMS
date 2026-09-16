import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, DEMO_USERS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es requerido" }, { status: 400 });
    }

    // Check DB first
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // If not in DB, check demo accounts and seed if needed
    if (!user) {
      const demoMatch = DEMO_USERS.find(
        (d) => d.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (demoMatch) {
        user = await prisma.user.create({
          data: {
            email: demoMatch.email,
            name: demoMatch.name,
            password: demoMatch.password,
            role: demoMatch.role,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Role recognition is stored in user.role ("ADMIN" | "PROFESSOR" | "STUDENT")
    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "PROFESSOR" | "STUDENT",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("mathlms_session", sessionToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 });
  }
}
