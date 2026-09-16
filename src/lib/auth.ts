import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
}

export const DEMO_USERS = [
  {
    email: "admin@mathweb.com",
    name: "Administrador MathWeb",
    role: "ADMIN",
    password: "password123",
  },
  {
    email: "profesor@mathweb.com",
    name: "Prof. Roberto Gauss",
    role: "PROFESSOR",
    password: "password123",
  },
  {
    email: "estudiante@mathweb.com",
    name: "Estudiante Sofía Euler",
    role: "STUDENT",
    password: "password123",
  },
  {
    email: "estudiante2@mathweb.com",
    name: "Estudiante Carlos Newton",
    role: "STUDENT",
    password: "password123",
  },
];

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("mathlms_session")?.value;
    if (!sessionToken) return null;
    const user = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf-8"));
    return user as SessionUser;
  } catch {
    return null;
  }
}

export function createSessionToken(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}
