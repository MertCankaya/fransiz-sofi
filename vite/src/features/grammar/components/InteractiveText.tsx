import type { JSX } from "react";
import { speakText, type LanguageKey } from "../../../shared/utils/speech";

interface InteractiveTextProps {
  text: string;
  lang: LanguageKey;
}

export default function InteractiveText({
  text,
  lang,
}: InteractiveTextProps): JSX.Element {
  if (!text.trim()) {
    return (
      <span className="text-zinc-600 italic">
        Önizleme yapılacak içerik yok.
      </span>
    );
  }

  const parts = text.split(/(\[\[.*?\]\])/g);

  return (
    <p className="text-xs leading-relaxed text-zinc-300 select-text">
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const token = part.slice(2, -2).trim();
          if (!token) return null;

          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                speakText(token, lang);
              }}
              title={`Telaffuz için tıkla: ${token}`}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-800/90 text-zinc-100 font-mono text-[11px] font-medium transition hover:border-zinc-500 hover:bg-zinc-700 active:scale-95 shadow-sm"
            >
              <span>{token}</span>
              <svg
                className="w-3 h-3 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
