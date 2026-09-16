"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Check, X } from "lucide-react";

interface TrueFalseProps {
  questionId: string;
  statement: string;
  userAnswer?: boolean | null;
  onAnswerChange: (ans: boolean) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswer?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseProps> = ({
  statement,
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

      <div className="flex gap-4">
        {[
          { label: "Verdadero", value: true },
          { label: "Falso", value: false },
        ].map((opt) => {
          const isSelected = userAnswer === opt.value;
          let btnClass = "border-slate-200 hover:bg-slate-100 text-slate-700";

          if (isSelected) {
            btnClass = "border-mathweb-cobalt bg-blue-50 text-mathweb-darkblue font-semibold ring-2 ring-mathweb-cobalt";
          }

          if (disabled && isCorrect !== null) {
            if (isSelected) {
              btnClass = isCorrect
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold"
                : "bg-rose-50 border-rose-500 text-rose-800 font-semibold";
            } else if (correctAnswer === opt.value) {
              btnClass = "bg-emerald-50 border-emerald-400 text-emerald-700 border-dashed font-semibold";
            }
          }

          return (
            <button
              key={opt.label}
              type="button"
              disabled={disabled}
              onClick={() => onAnswerChange(opt.value)}
              className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-base ${btnClass}`}
            >
              {isSelected && disabled && isCorrect === true && <Check className="w-5 h-5 text-emerald-600" />}
              {isSelected && disabled && isCorrect === false && <X className="w-5 h-5 text-rose-600" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
