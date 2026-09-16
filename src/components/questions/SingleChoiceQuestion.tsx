"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Check, X } from "lucide-react";

interface SingleChoiceProps {
  questionId: string;
  statement: string;
  options: string[];
  userAnswer?: number | null;
  onAnswerChange: (index: number) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswer?: number;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceProps> = ({
  statement,
  options,
  userAnswer,
  onAnswerChange,
  disabled = false,
  isCorrect = null,
  correctAnswer,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-lg font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        <MathRenderer content={statement} />
      </div>

      <div className="space-y-3">
        {options.map((optionText, idx) => {
          const isSelected = userAnswer === idx;
          let containerClass = "border-slate-200 hover:border-mathweb-cobalt hover:bg-slate-50";

          if (isSelected) {
            containerClass = "border-mathweb-cobalt bg-blue-50/70 text-mathweb-darkblue ring-2 ring-mathweb-cobalt";
          }

          if (disabled && isCorrect !== null) {
            if (isSelected) {
              containerClass = isCorrect
                ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500"
                : "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500";
            } else if (correctAnswer === idx) {
              containerClass = "bg-emerald-50/70 border-emerald-400 text-emerald-900 border-dashed font-medium";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => !disabled && onAnswerChange(idx)}
              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                disabled ? "cursor-not-allowed" : ""
              } ${containerClass}`}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm ${
                  isSelected
                    ? "border-mathweb-cobalt bg-mathweb-cobalt text-white"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>

              <div className="flex-1 text-base">
                <MathRenderer content={optionText} />
              </div>

              {disabled && isSelected && isCorrect === true && <Check className="w-6 h-6 text-emerald-600 shrink-0" />}
              {disabled && isSelected && isCorrect === false && <X className="w-6 h-6 text-rose-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
