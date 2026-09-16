"use client";

import React from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { Check, X } from "lucide-react";

export interface MatchingOptions {
  columnA: string[]; // Items to match
  columnB: string[]; // Choices for column B
  columnC?: string[]; // Optional 3rd column choices!
  columnAHeader?: string;
  columnBHeader?: string;
  columnCHeader?: string;
}

export type MatchingAnswer = {
  // Key is row index of Column A, value is object with b (index in Column B) and optional c (index in Column C)
  [rowIndex: number]: { b: number; c?: number };
};

interface MatchingProps {
  questionId: string;
  statement: string;
  options: MatchingOptions;
  userAnswer?: MatchingAnswer;
  onAnswerChange: (ans: MatchingAnswer) => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  correctAnswer?: MatchingAnswer;
}

export const MatchingQuestion: React.FC<MatchingProps> = ({
  statement,
  options,
  userAnswer = {},
  onAnswerChange,
  disabled = false,
  isCorrect = null,
  correctAnswer = {},
}) => {
  const hasColumnC = Boolean(options.columnC && options.columnC.length > 0);

  const handleSelectB = (rowIndex: number, bIdx: number) => {
    if (disabled) return;
    const current = userAnswer[rowIndex] || { b: -1 };
    onAnswerChange({
      ...userAnswer,
      [rowIndex]: { ...current, b: bIdx },
    });
  };

  const handleSelectC = (rowIndex: number, cIdx: number) => {
    if (disabled) return;
    const current = userAnswer[rowIndex] || { b: -1 };
    onAnswerChange({
      ...userAnswer,
      [rowIndex]: { ...current, c: cIdx },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-gray-800 text-lg font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
        <MathRenderer content={statement} />
        <p className="text-xs text-slate-500 mt-2 font-normal">
          * Asocia cada elemento de la {options.columnAHeader || "Columna A"} con su correspondiente en{" "}
          {options.columnBHeader || "Columna B"}
          {hasColumnC ? ` y ${options.columnCHeader || "Columna C"}` : ""}.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-sm font-semibold border-b border-slate-200">
              <th className="p-3 w-1/3">{options.columnAHeader || "Columna A"}</th>
              <th className="p-3 w-1/3">{options.columnBHeader || "Columna B"}</th>
              {hasColumnC && <th className="p-3 w-1/3">{options.columnCHeader || "Columna C"}</th>}
              {disabled && <th className="p-3 w-12 text-center">Estado</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {options.columnA.map((itemA, rowIdx) => {
              const currentAns = userAnswer[rowIdx];
              const selectedB = currentAns?.b ?? -1;
              const selectedC = currentAns?.c ?? -1;

              const expectedAns = correctAnswer[rowIdx];
              const isRowBCorrect = expectedAns ? selectedB === expectedAns.b : false;
              const isRowCCorrect = expectedAns && hasColumnC ? selectedC === expectedAns.c : true;
              const isRowFullyCorrect = isRowBCorrect && isRowCCorrect;

              return (
                <tr key={rowIdx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-800">
                    <MathRenderer content={itemA} />
                  </td>

                  <td className="p-3">
                    <select
                      disabled={disabled}
                      value={selectedB}
                      onChange={(e) => handleSelectB(rowIdx, parseInt(e.target.value, 10))}
                      className={`w-full p-2.5 rounded-lg border text-sm transition-all ${
                        disabled
                          ? "bg-slate-100 border-slate-300"
                          : "border-slate-300 focus:ring-2 focus:ring-mathweb-cobalt bg-white"
                      }`}
                    >
                      <option value={-1}>-- Seleccionar Pareja B --</option>
                      {options.columnB.map((itemB, bIdx) => (
                        <option key={bIdx} value={bIdx}>
                          {bIdx + 1}. {itemB.replace(/[\$\\]/g, "")}
                        </option>
                      ))}
                    </select>
                  </td>

                  {hasColumnC && (
                    <td className="p-3">
                      <select
                        disabled={disabled}
                        value={selectedC}
                        onChange={(e) => handleSelectC(rowIdx, parseInt(e.target.value, 10))}
                        className={`w-full p-2.5 rounded-lg border text-sm transition-all ${
                          disabled
                            ? "bg-slate-100 border-slate-300"
                            : "border-slate-300 focus:ring-2 focus:ring-mathweb-cobalt bg-white"
                        }`}
                      >
                        <option value={-1}>-- Seleccionar Pareja C --</option>
                        {options.columnC?.map((itemC, cIdx) => (
                          <option key={cIdx} value={cIdx}>
                            {cIdx + 1}. {itemC.replace(/[\$\\]/g, "")}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}

                  {disabled && (
                    <td className="p-3 text-center">
                      {isRowFullyCorrect ? (
                        <Check className="w-5 h-5 text-emerald-600 inline-block" />
                      ) : (
                        <X className="w-5 h-5 text-rose-600 inline-block" />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
