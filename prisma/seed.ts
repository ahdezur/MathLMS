import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando carga de datos iniciales para MathLMS...");

  // 1. Crear Usuarios Demo
  const admin = await prisma.user.upsert({
    where: { email: "admin@mathweb.com" },
    update: {},
    create: {
      email: "admin@mathweb.com",
      name: "Administrador MathWeb",
      password: "password123",
      role: "ADMIN",
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "profesor@mathweb.com" },
    update: {},
    create: {
      email: "profesor@mathweb.com",
      name: "Prof. Roberto Gauss",
      password: "password123",
      role: "PROFESSOR",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "estudiante@mathweb.com" },
    update: {},
    create: {
      email: "estudiante@mathweb.com",
      name: "Estudiante Sofía Euler",
      password: "password123",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "estudiante2@mathweb.com" },
    update: {},
    create: {
      email: "estudiante2@mathweb.com",
      name: "Estudiante Carlos Newton",
      password: "password123",
      role: "STUDENT",
    },
  });

  console.log("✅ Usuarios creados: Admin, Profesor, 2 Estudiantes.");

  // 2. Crear Curso de Matemáticas
  const course = await prisma.course.upsert({
    where: { code: "MATH-101" },
    update: { teacherId: professor.id },
    create: {
      code: "MATH-101",
      title: "Álgebra Superior y Funciones Reales",
      description: "Curso fundamental con LaTeX, expresiones algebraicas, ecuaciones y análisis de funciones.",
      teacherId: professor.id,
    },
  });

  // Matricular Estudiantes
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student1.id, courseId: course.id } },
    update: {},
    create: { studentId: student1.id, courseId: course.id },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student2.id, courseId: course.id } },
    update: {},
    create: { studentId: student2.id, courseId: course.id },
  });

  // 3. Crear Unidad 1
  const unit1 = await prisma.unit.create({
    data: {
      title: "Unidad 1: Fundamentos de Álgebra y Ecuaciones",
      order: 1,
      courseId: course.id,
    },
  });

  // Capítulo 1.1
  const chapter1 = await prisma.chapter.create({
    data: {
      title: "Capítulo 1.1: Ecuaciones Cuadráticas y su Discriminante",
      order: 1,
      unitId: unit1.id,
      content: `
# Ecuaciones Cuadráticas en $\\mathbb{R}$

Una **ecuación cuadrática** con coeficientes reales es una expresión de la forma:

$$ax^2 + bx + c = 0, \\quad a \\neq 0$$

## Fórmula General de Resolución
Para encontrar las raíces $x_1, x_2$, utilizamos la fórmula cuadrática dada por:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### El Discriminante $\\Delta$
El discriminante se define como:

$$\\Delta = b^2 - 4ac$$

* Si $\\Delta > 0$, la ecuación posee **dos soluciones reales distintas**.
* Si $\\Delta = 0$, la ecuación posee **una solución real doble** $x = -\\frac{b}{2a}$.
* Si $\\Delta < 0$, la ecuación **no posee soluciones reales** (sus soluciones son complejas conjugadas).

---
*Revisa la fórmula y realiza la evaluación interactiva al final del capítulo.*
      `,
    },
  });

  // Registrar lectura previa para Sofía Euler
  await prisma.chapterProgress.create({
    data: {
      studentId: student1.id,
      chapterId: chapter1.id,
      isRead: true,
    },
  });

  // 4. Crear Quiz con las 6 preguntas
  const quiz = await prisma.quiz.create({
    data: {
      title: "Evaluación Interactiva: Ecuaciones y Funciones",
      description: "Demuestra tus conocimientos resolviendo estos ejercicios que cubren todos los formatos requeridos.",
      chapterId: chapter1.id,
      questions: {
        create: [
          {
            type: "true_false",
            statement: "Si el discriminante de la ecuación cuadrática es $\\Delta = 0$, entonces la ecuación posee exactamente una solución real de multiplicidad 2.",
            optionsJson: JSON.stringify(["Verdadero", "Falso"]),
            correctAnswerJson: JSON.stringify(true),
            explanation: "¡Correcto! Cuando $\\Delta = b^2 - 4ac = 0$, la solución es única $x = -\\frac{b}{2a}$.",
            order: 1,
          },
          {
            type: "single_choice",
            statement: "¿Cuál es el valor del discriminante $\\Delta$ para la ecuación $x^2 - 6x + 9 = 0$?",
            optionsJson: JSON.stringify(["$$\\Delta = 36$$", "$$\\Delta = 0$$", "$$\\Delta = -12$$", "$$\\Delta = 18$$"]),
            correctAnswerJson: JSON.stringify(1),
            explanation: "$$\\Delta = (-6)^2 - 4(1)(9) = 36 - 36 = 0$$.",
            order: 2,
          },
          {
            type: "multiple_choice",
            statement: "Selecciona **todas** las ecuaciones cuadráticas que tienen soluciones reales distintas ($\\Delta > 0$):",
            optionsJson: JSON.stringify([
              "$$x^2 - 5x + 6 = 0$$",
              "$$x^2 + 4 = 0$$",
              "$$2x^2 - 8x + 2 = 0$$",
              "$$x^2 + 2x + 5 = 0$$",
            ]),
            correctAnswerJson: JSON.stringify([0, 2]),
            explanation: "Para $x^2 - 5x + 6 = 0$, $\\Delta = 1 > 0$. Para $2x^2 - 8x + 2 = 0$, $\\Delta = 48 > 0$.",
            order: 3,
          },
          {
            type: "matching",
            statement: "Relaciona cada Función Cuadrática con la Propiedad de su Gráfica y el Número de Raíces Reales:",
            optionsJson: JSON.stringify({
              columnAHeader: "Ecuación $$f(x)$$",
              columnBHeader: "Vértice de la Parábola",
              columnCHeader: "Tipo de Raíces Reales",
              columnA: ["$$f(x) = x^2 - 4$$", "$$f(x) = (x - 3)^2$$", "$$f(x) = x^2 + 5$$"],
              columnB: ["Vértice en (0, -4)", "Vértice en (3, 0)", "Vértice en (0, 5)"],
              columnC: ["Dos raíces reales", "Una raíz real doble", "Sin raíces reales"],
            }),
            correctAnswerJson: JSON.stringify({
              0: { b: 0, c: 0 },
              1: { b: 1, c: 1 },
              2: { b: 2, c: 2 },
            }),
            explanation: "Asociación perfecta de vértices y comportamiento del discriminante.",
            order: 4,
          },
          {
            type: "inline_dropdown",
            statement: "El valor absoluto del número $\\sqrt{16}$ es [[select:0]] y corresponde a un número [[select:1]]. Además, la función $f(x) = x^3$ es una función [[select:2]].",
            optionsJson: JSON.stringify({
              dropdowns: [
                ["2", "4", "8", "16"],
                ["Par", "Impar", "Irracional"],
                ["Impar", "Par", "Constante"],
              ],
            }),
            correctAnswerJson: JSON.stringify({
              0: 1,
              1: 0,
              2: 0,
            }),
            explanation: "$\\sqrt{16} = 4$ (par) y $f(x) = x^3$ es impar.",
            order: 5,
          },
          {
            type: "step_ordering",
            statement: "Ordena los pasos algebraicos para resolver la ecuación cuadrática $$2x^2 - 8x + 6 = 0$$:",
            optionsJson: JSON.stringify({
              steps: [
                "Igualar cada factor a cero: $$x - 3 = 0 \\lor x - 1 = 0$$",
                "Dividir toda la ecuación entre 2: $$x^2 - 4x + 3 = 0$$",
                "Obtener el conjunto solución: $$S = \\{1, 3\\}$$",
                "Factorizar el trinomio: $$(x - 3)(x - 1) = 0$$",
              ],
            }),
            correctAnswerJson: JSON.stringify([1, 3, 0, 2]),
            explanation: "1º Dividir entre 2 -> 2º Factorizar -> 3º Igualar a cero -> 4º Solución.",
            order: 6,
          },
        ],
      },
    },
    include: {
      questions: true,
    },
  });

  // Simular envío de Sofía Euler
  await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      studentId: student1.id,
      score: 6.0,
      totalPoints: 6.0,
      questionResponses: {
        create: quiz.questions.map((q) => ({
          questionId: q.id,
          userAnswerJson: q.correctAnswerJson,
          isCorrect: true,
          earnedPoints: 1.0,
        })),
      },
    },
  });

  console.log("✅ Carga de datos completada exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
