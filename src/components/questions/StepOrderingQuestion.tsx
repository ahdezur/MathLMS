"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { ArrowUp, ArrowDown, Check, X, GripVertical } from "lucide-react";

export interface StepOrderingOptions {
  steps: string[]; // List of step statements in random order or initial pool order
}

export type StepOrderingAnswer = number[]; // Ordered indices of steps

interface StepOrderingProps {
  questionId: string;
  statement: string;
  options: StepOrderingOptions;
  userAnswer?: StepOrderingAnswer;
  onAnswerChange: (orderedIndices: StepOrderingAnswer) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswer?: StepOrderingAnswer; // Expected order of indices, e.g. [0, 1, 2, 3]
}

export const StepOrderingQuestion: React.FC<StepOrderingProps> = ({
  statement,
  options,
  userAnswer,
  onAnswerChange,
  disabled = false,
  isCorrect = null,
  correctAnswer = [],
}) => {
  // If userAnswer is not initialized, default to original step indices order
  const currentOrder =
    userAnswer && userAnswer.length === options.steps.length
      ? userAnswer
      : options.steps.map((_, idx) => idx);

  const moveStep = (indexInCurrent: number, direction: "up" | "down") => {
    if (disabled) return;
    const targetIndex = direction === "up" ? indexInCurrent - 1 : indexInCurrent + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const temp = newOrder[indexInCurrent];
    newOrder[indexInCurrent] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onAnswerChange(newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-lg font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        <MathRenderer content={statement} />
        <p className="text-xs text-slate-500 mt-2 font-normal">
          * Utiliza los botones de subir/bajar para ordenar lógicamente cada paso de la resolución matemática.
        </p>
      </div>

      <div className="space-y-2.5">
        {currentOrder.map((stepIdx, pos) => {
          const stepText = options.steps[stepIdx];
          const expectedStepAtPos = correctAnswer[pos];
          const isPosCorrect = disabled && expectedStepAtPos !== undefined ? stepIdx === expectedStepAtPos : null;

          let itemClass = "bg-white border-slate-200 hover:border-mathweb-cobalt";
          if (disabled && isPosCorrect !== null) {
            itemClass = isPosCorrect
              ? "bg-emerald-50/70 border-emerald-500 text-emerald-950"
              : "bg-rose-50/70 border-rose-500 text-rose-950";
          }

          return (
            <div
              key={stepIdx}
              className={`p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${itemClass}`}
            >
              <div className="flex items-center gap-1 text-slate-400">
                <GripVertical className="w-5 h-5" />
                <span className="w-6 h-6 rounded-full bg-mathweb-darkblue text-white font-bold text-xs flex items-center justify-center">
                  {pos + 1}
                </span>
              </div>

              <div className="flex-1 text-base font-medium">
                <MathRenderer content={stepText} />
              </div>

              {disabled ? (
                <div className="px-2">
                  {isPosCorrect === true && <Check className="w-5 h-5 text-emerald-600" />}
                  {isPosCorrect === false && <X className="w-5 h-5 text-rose-600" />}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pos === 0}
                    onClick={() => moveStep(pos, "up")}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Subir paso"
                  >
                    <ArrowUp className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    disabled={pos === currentOrder.length - 1}
                    onClick={() => moveStep(pos, "down")}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Bajar paso"
                  >
                    <ArrowDown className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
