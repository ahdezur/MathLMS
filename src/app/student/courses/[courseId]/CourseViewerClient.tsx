"use client";

import React, { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { SingleChoiceQuestion } from "@/components/questions/SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "@/components/questions/MultipleChoiceQuestion";
import { MatchingQuestion } from "@/components/questions/MatchingQuestion";
import { InlineDropdownQuestion } from "@/components/questions/InlineDropdownQuestion";
import { StepOrderingQuestion } from "@/components/questions/StepOrderingQuestion";
import { CheckCircle, BookOpen, Award, ArrowRight, RotateCcw, ChevronRight } from "lucide-react";

interface QuestionData {
  id: string;
  type: string;
  statement: string;
  optionsJson: string;
  correctAnswerJson: string;
  explanation?: string | null;
}

interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  questions: QuestionData[];
  submissions: Array<{
    id: string;
    score: number;
    totalPoints: number;
    questionResponses: Array<{
      questionId: string;
      userAnswerJson: string;
      isCorrect: boolean;
    }>;
  }>;
}

interface ChapterData {
  id: string;
  title: string;
  content: string;
  progresses: Array<{ isRead: boolean }>;
  quizzes: QuizData[];
}

interface UnitData {
  id: string;
  title: string;
  chapters: ChapterData[];
}

interface CourseViewerClientProps {
  course: {
    id: string;
    code: string;
    title: string;
    units: UnitData[];
  };
  initialReadChapterIds: string[];
}

export function CourseViewerClient({ course, initialReadChapterIds }: CourseViewerClientProps) {
  const [readIds, setReadIds] = useState<string[]>(initialReadChapterIds);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    course.units[0]?.chapters[0]?.id || ""
  );

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active chapter
  let activeChapter: ChapterData | null = null;
  for (const u of course.units) {
    for (const c of u.chapters) {
      if (c.id === activeChapterId) {
        activeChapter = c;
        break;
      }
    }
  }

  const isRead = activeChapter ? readIds.includes(activeChapter.id) : false;

  const handleMarkAsRead = async () => {
    if (!activeChapter || isRead) return;
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: activeChapter.id }),
      });
      if (res.ok) {
        setReadIds((prev) => [...prev, activeChapter!.id]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartQuiz = (quiz: QuizData) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: quizAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuizResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex min-w-0 bg-slate-50">
      {/* Course units & chapters sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">{course.code}</span>
          <h2 className="font-bold text-lg leading-tight mt-1">{course.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {course.units.map((unit, uIdx) => (
            <div key={unit.id} className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">
                Unidad {uIdx + 1}: {unit.title.replace(/^Unidad \d+:?\s*/i, "")}
              </h3>
              <div className="space-y-1">
                {unit.chapters.map((chapter) => {
                  const chapterIsRead = readIds.includes(chapter.id);
                  const isActive = chapter.id === activeChapterId && !activeQuiz;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        setActiveChapterId(chapter.id);
                        setActiveQuiz(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-mathweb-cobalt text-white shadow-md font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      {chapterIsRead && (
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-300" : "text-emerald-600"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        {activeQuiz ? (
          /* QUIZ VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="border-b border-slate-200 pb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-mathweb-cobalt bg-blue-50 px-3 py-1 rounded-full">
                  Evaluación Interactiva
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeQuiz.title}</h2>
                {activeQuiz.description && (
                  <p className="text-sm text-slate-600 mt-1">{activeQuiz.description}</p>
                )}
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Volver al Capítulo
              </button>
            </div>

            {/* Quiz Result Banner */}
            {quizResult && (
              <div
                className={`p-6 rounded-2xl border ${
                  quizResult.percentage >= 60
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-amber-50 border-amber-300 text-amber-950"
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      ¡Evaluación Completada! Puntaje: {quizResult.score} / {quizResult.totalPoints} (
                      {quizResult.percentage}%)
                    </h3>
                    <p className="text-sm mt-1">
                      {quizResult.percentage >= 60
                        ? "Excelente dominio de los conceptos matemáticos."
                        : "Revisa las respuestas incorrectas y vuelve a practicar."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuizResult(null);
                      setQuizAnswers({});
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 font-semibold text-xs rounded-xl shadow border border-slate-200 hover:bg-slate-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-10 divide-y divide-slate-100">
              {activeQuiz.questions.map((q, idx) => {
                const options = JSON.parse(q.optionsJson);
                const correctAnswer = JSON.parse(q.correctAnswerJson);
                const qResult = quizResult?.questionResults?.find((r: any) => r.questionId === q.id);
                const isCorrect = qResult ? qResult.isCorrect : null;

                return (
                  <div key={q.id} className="pt-8 first:pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                        Pregunta {idx + 1} de {activeQuiz.questions.length} • {q.type.replace("_", " ")}
                      </span>
                      {qResult && (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isCorrect ? "Correcto (+1.0 pt)" : "Incorrecto (0 pt)"}
                        </span>
                      )}
                    </div>

                    {/* Question Renderer by Type */}
                    {q.type === "true_false" && (
                      <TrueFalseQuestion
                        questionId={q.id}
                        statement={q.statement}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswer={correctAnswer}
                      />
                    )}

                    {q.type === "single_choice" && (
                      <SingleChoiceQuestion
                        questionId={q.id}
                        statement={q.statement}
                        options={options}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswer={correctAnswer}
                      />
                    )}

                    {q.type === "multiple_choice" && (
                      <MultipleChoiceQuestion
                        questionId={q.id}
                        statement={q.statement}
                        options={options}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswers={correctAnswer}
                      />
                    )}

                    {q.type === "matching" && (
                      <MatchingQuestion
                        questionId={q.id}
                        statement={q.statement}
                        options={options}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswer={correctAnswer}
                      />
                    )}

                    {q.type === "inline_dropdown" && (
                      <InlineDropdownQuestion
                        questionId={q.id}
                        statement={q.statement}
                        options={options}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswer={correctAnswer}
                      />
                    )}

                    {q.type === "step_ordering" && (
                      <StepOrderingQuestion
                        questionId={q.id}
                        statement={q.statement}
                        options={options}
                        userAnswer={quizAnswers[q.id]}
                        onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                        disabled={Boolean(quizResult)}
                        isCorrect={isCorrect}
                        correctAnswer={correctAnswer}
                      />
                    )}

                    {/* Explanation */}
                    {quizResult && q.explanation && (
                      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-sm text-blue-900 mt-3">
                        <strong className="font-bold">Explicación Matemática:</strong>{" "}
                        <MathRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            {!quizResult && (
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitQuiz}
                  className="py-3.5 px-8 rounded-xl bg-mathweb-cobalt hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 text-base transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Calificando..." : "Enviar Respuestas"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : activeChapter ? (
          /* CHAPTER VIEW */
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Materia del Capítulo</span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">{activeChapter.title}</h1>
                </div>

                <button
                  onClick={handleMarkAsRead}
                  disabled={isRead}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    isRead
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-900 hover:bg-emerald-600 text-white"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRead ? "Leído" : "Marcar como Leído"}</span>
                </button>
              </div>

              {/* LaTeX Content Body */}
              <div className="prose max-w-none text-slate-800 leading-relaxed text-base space-y-4">
                <MathRenderer content={activeChapter.content} />
              </div>
            </div>

            {/* Chapter Quizzes Section */}
            {activeChapter.quizzes.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Evaluación Interactiva del Capítulo</span>
                </h3>
                {activeChapter.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {quiz.questions.length} ejercicios interactivos (V/F, Alternativas, Términos Pareados 3 col, Dropdowns, Pasos).
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-5 py-2.5 rounded-xl bg-mathweb-cobalt hover:bg-blue-700 text-white font-bold text-sm shadow flex items-center gap-2 transition-all"
                    >
                      <span>Iniciar Quiz</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">Selecciona un capítulo de la izquierda.</div>
        )}
      </div>
    </div>
  );
}
