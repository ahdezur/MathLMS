"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Check, X } from "lucide-react";

export interface InlineDropdownOptions {
  dropdowns: string[][]; // Array of choices for each dropdown [[opt1, opt2], [optA, optB]]
}

export type InlineDropdownAnswer = {
  [dropdownIndex: number]: number; // Index chosen for dropdown
};

interface InlineDropdownProps {
  questionId: string;
  statement: string; // "Dada la función f(x) = x^2, su gráfica es una [[select:0]] y su dominio son los números [[select:1]]."
  options: InlineDropdownOptions;
  userAnswer?: InlineDropdownAnswer;
  onAnswerChange: (ans: InlineDropdownAnswer) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswer?: InlineDropdownAnswer;
}

export const InlineDropdownQuestion: React.FC<InlineDropdownProps> = ({
  statement,
  options,
  userAnswer = {},
  onAnswerChange,
  disabled = false,
  isCorrect = null,
  correctAnswer = {},
}) => {
  const handleSelectChange = (dropdownIdx: number, selectedIdx: number) => {
    if (disabled) return;
    onAnswerChange({
      ...userAnswer,
      [dropdownIdx]: selectedIdx,
    });
  };

  // Split statement by [[select:X]]
  const regex = /\[\[select:(\d+)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(statement)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = statement.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`}>
          <MathRenderer content={textBefore} />
        </span>
      );
    }

    const dropdownIdx = parseInt(match[1], 10);
    const dropdownChoices = options.dropdowns[dropdownIdx] || [];
    const selectedVal = userAnswer[dropdownIdx] ?? -1;
    const expectedVal = correctAnswer[dropdownIdx];
    const isThisDropdownCorrect = disabled && expectedVal !== undefined ? selectedVal === expectedVal : null;

    parts.push(
      <span key={`select-${dropdownIdx}`} className="inline-flex items-center mx-1 font-sans my-1">
        <select
          disabled={disabled}
          value={selectedVal}
          onChange={(e) => handleSelectChange(dropdownIdx, parseInt(e.target.value, 10))}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium shadow-sm transition-all focus:outline-none ${
            disabled
              ? isThisDropdownCorrect === true
                ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                : isThisDropdownCorrect === false
                ? "bg-rose-50 border-rose-500 text-rose-900 font-bold"
                : "bg-slate-100 border-slate-300"
              : "border-mathweb-cobalt bg-white text-mathweb-darkblue focus:ring-2 focus:ring-mathweb-cobalt"
          }`}
        >
          <option value={-1}>-- Seleccionar --</option>
          {dropdownChoices.map((choice, optIdx) => (
            <option key={optIdx} value={optIdx}>
              {choice}
            </option>
          ))}
        </select>
        {disabled && isThisDropdownCorrect === true && (
          <Check className="w-4 h-4 text-emerald-600 ml-1 inline" />
        )}
        {disabled && isThisDropdownCorrect === false && (
          <X className="w-4 h-4 text-rose-600 ml-1 inline" />
        )}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < statement.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        <MathRenderer content={statement.substring(lastIndex)} />
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-lg leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200">
        {parts}
      </div>
    </div>
  );
};
