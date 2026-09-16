"use client";

import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function renderMathInText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Split by $$...$$ for block math, then $...$ for inline math
  const parts: React.ReactNode[] = [];
  
  // Regex to match block math $$...$$ or inline math $...$
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    const isBlock = matchedStr.startsWith("$$") && matchedStr.endsWith("$$");
    const latex = isBlock
      ? matchedStr.substring(2, matchedStr.length - 2)
      : matchedStr.substring(1, matchedStr.length - 1);

    try {
      const html = katex.renderToString(latex, {
        displayMode: isBlock,
        throwOnError: false,
      });

      parts.push(
        <span
          key={`math-${match.index}`}
          className={isBlock ? "block my-2 text-center overflow-x-auto py-1" : "inline-block px-0.5"}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (e) {
      parts.push(matchedStr);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  return <div className={`inline-math-container ${className}`}>{renderMathInText(content)}</div>;
};
