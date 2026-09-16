import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CanvasSidebar } from "@/components/layout/CanvasSidebar";
import { CanvasHeader } from "@/components/layout/CanvasHeader";
import { CourseViewerClient } from "./CourseViewerClient";

export default async function StudentCoursePage({ params }: { params: { courseId: string } }) {
  const user = await getSessionUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              progresses: { where: { studentId: user.id } },
              quizzes: {
                include: {
                  questions: { orderBy: { order: "asc" } },
                  submissions: {
                    where: { studentId: user.id },
                    orderBy: { submittedAt: "desc" },
                    include: { questionResponses: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    redirect("/student");
  }

  // Collect read chapter IDs
  const initialReadChapterIds: string[] = [];
  course.units.forEach((u) => {
    u.chapters.forEach((c) => {
      if (c.progresses.length > 0 && c.progresses[0].isRead) {
        initialReadChapterIds.push(c.id);
      }
    });
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <CanvasSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <CanvasHeader user={user} title={course.title} subtitle={course.code} />
        <CourseViewerClient course={course} initialReadChapterIds={initialReadChapterIds} />
      </div>
    </div>
  );
}
