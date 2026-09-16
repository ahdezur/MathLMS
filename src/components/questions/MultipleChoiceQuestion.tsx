"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Check, X } from "lucide-react";

interface MultipleChoiceProps {
  questionId: string;
  statement: string;
  options: string[];
  userAnswer?: number[];
  onAnswerChange: (indices: number[]) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswers?: number[];
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceProps> = ({
  statement,
  options,
  userAnswer = [],
  onAnswerChange,
  disabled = false,
  isCorrect = null,
  correctAnswers = [],
}) => {
  const toggleIndex = (idx: number) => {
    if (disabled) return;
    if (userAnswer.includes(idx)) {
      onAnswerChange(userAnswer.filter((i) => i !== idx));
    } else {
      onAnswerChange([...userAnswer, idx]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-lg font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        <MathRenderer content={statement} />
        <p className="text-xs text-slate-500 mt-2 font-normal">
          * Marca todas las casillas correctas que correspondan.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((optionText, idx) => {
          const isSelected = userAnswer.includes(idx);
          const isActuallyCorrect = correctAnswers.includes(idx);
          let containerClass = "border-slate-200 hover:border-mathweb-cobalt hover:bg-slate-50";

          if (isSelected) {
            containerClass = "border-mathweb-cobalt bg-blue-50/70 text-mathweb-darkblue ring-2 ring-mathweb-cobalt";
          }

          if (disabled && isCorrect !== null) {
            if (isSelected && isActuallyCorrect) {
              containerClass = "bg-emerald-50 border-emerald-500 text-emerald-900";
            } else if (isSelected && !isActuallyCorrect) {
              containerClass = "bg-rose-50 border-rose-500 text-rose-900";
            } else if (!isSelected && isActuallyCorrect) {
              containerClass = "bg-emerald-50/70 border-emerald-400 text-emerald-900 border-dashed font-medium";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => toggleIndex(idx)}
              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                disabled ? "cursor-not-allowed" : ""
              } ${containerClass}`}
            >
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-mathweb-cobalt bg-mathweb-cobalt text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div className="flex-1 text-base">
                <MathRenderer content={optionText} />
              </div>

              {disabled && isSelected && isActuallyCorrect && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
              {disabled && isSelected && !isActuallyCorrect && <X className="w-5 h-5 text-rose-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
