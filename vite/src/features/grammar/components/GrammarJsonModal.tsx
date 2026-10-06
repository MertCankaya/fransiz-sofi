import { useState } from "react";
import type { JSX } from "react";
import type { GrammarFormData, GrammarExample } from "../types";
import type { LanguageKey } from "../../../shared/utils/speech";

interface GrammarJsonModalProps {
  isOpen: boolean;
  currentLang: LanguageKey;
  onClose: () => void;
  onImport: (data: GrammarFormData) => void;
}

export default function GrammarJsonModal({
  isOpen,
  currentLang,
  onClose,
  onImport,
}: GrammarJsonModalProps): JSX.Element | null {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const SCHEMA_TEMPLATE = `{
  "topic": "Gramer Konusu Başlığı",
  "order": 1,
  "definition": "Kurallar ve açıklamalar. Hedef dildeki kelimeleri [[kelime]] formatında yazın.",
  "examples": [
    { "tr": "Türkçe Cümle 1", "target": "Hedef Dildeki Cümle 1" },
    { "tr": "Türkçe Cümle 2", "target": "Hedef Dildeki Cümle 2" },
    { "tr": "Türkçe Cümle 3", "target": "Hedef Dildeki Cümle 3" },
    { "tr": "Türkçe Cümle 4", "target": "Hedef Dildeki Cümle 4" },
    { "tr": "Türkçe Cümle 5", "target": "Hedef Dildeki Cümle 5" },
    { "tr": "Türkçe Cümle 6", "target": "Hedef Dildeki Cümle 6" },
    { "tr": "Türkçe Cümle 7", "target": "Hedef Dildeki Cümle 7" }
  ]
}`;

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleApply = () => {
    setErrorMessage(null);
    const trimmed = jsonInput.trim();

    if (!trimmed) {
      setErrorMessage("Lütfen JSON metnini yapıştırın.");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error("Geçersiz JSON: Kök öğe obje { ... } olmalıdır.");
      }

      const candidate = parsed as Record<string, unknown>;

      if (typeof candidate.topic !== "string" || !candidate.topic.trim()) {
        throw new Error('Eksik alan: "topic" alanı zorunludur.');
      }

      // Sıra numarası kontrolü: Sayı veya sayısal string ise al, yoksa varsayılan 1 yap
      let parsedOrder = 1;
      if (typeof candidate.order === "number" && !isNaN(candidate.order)) {
        parsedOrder = Math.max(1, Math.floor(candidate.order));
      } else if (typeof candidate.order === "string") {
        const num = parseInt(candidate.order, 10);
        if (!isNaN(num) && num > 0) {
          parsedOrder = num;
        }
      }

      if (
        typeof candidate.definition !== "string" ||
        !candidate.definition.trim()
      ) {
        throw new Error('Eksik alan: "definition" alanı zorunludur.');
      }

      if (!Array.isArray(candidate.examples)) {
        throw new Error('Eksik alan: "examples" bir dizi olmalıdır.');
      }

      const parsedExamples: GrammarExample[] = candidate.examples.map(
        (item: unknown, index: number) => {
          if (typeof item !== "object" || item === null) {
            throw new Error(`Örnek #${index + 1} geçersiz bir nesne.`);
          }
          const ex = item as Record<string, unknown>;
          return {
            tr: typeof ex.tr === "string" ? ex.tr.trim() : "",
            target:
              typeof ex.target === "string"
                ? ex.target.trim()
                : typeof ex.fr === "string"
                  ? ex.fr.trim()
                  : "",
          };
        },
      );

      while (parsedExamples.length < 7) {
        parsedExamples.push({ tr: "", target: "" });
      }

      onImport({
        topic: candidate.topic.trim(),
        order: parsedOrder,
        definition: candidate.definition.trim(),
        examples: parsedExamples.slice(0, 7),
      } as GrammarFormData);

      setJsonInput("");
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "JSON okuma hatası oluştu.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
              {"{ }"}
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-100 capitalize">
                {currentLang} JSON Aktar
              </h3>
              <p className="text-[11px] text-zinc-500">
                Gemini'den alınan çıktıyı yapıştırın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTemplate}
              className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-mono text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
            >
              {copied ? "✓ Kopyalandı" : "Şablonu Kopyala"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 transition hover:text-zinc-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <textarea
            rows={13}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={SCHEMA_TEMPLATE}
            className={`w-full rounded-lg bg-zinc-900/80 p-3.5 font-mono text-xs text-zinc-100 placeholder-zinc-700 outline-none transition border resize-none ${
              errorMessage
                ? "border-rose-600 bg-rose-950/10 focus:border-rose-500"
                : "border-zinc-800 focus:border-zinc-600"
            }`}
          />
          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium">
              ⚠ {errorMessage}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white active:scale-95"
          >
            Forma Aktar
          </button>
        </div>
      </div>
    </div>
  );
}
