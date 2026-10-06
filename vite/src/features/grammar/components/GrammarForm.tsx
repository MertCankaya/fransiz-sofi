import { useState } from "react";
import type { FormEvent, KeyboardEvent, JSX } from "react";
import type { GrammarFormData, GrammarItem, GrammarExample } from "../types";
import type { LanguageKey } from "../../../shared/utils/speech";
import InteractiveText from "./InteractiveText";
import GrammarJsonModal from "./GrammarJsonModal";
import { speakText } from "../../../shared/utils/speech";
import { useGrammarStore } from "../store/grammarStore";

interface GrammarFormProps {
  currentLang: LanguageKey;
  initialItem: GrammarItem | null;
  onSubmit: (data: GrammarFormData) => Promise<void>;
  isSubmitting: boolean;
  onValidationError: (message: string) => void;
}

const EMPTY_EXAMPLES: GrammarExample[] = Array.from({ length: 7 }, () => ({
  tr: "",
  target: "",
}));

const formatInitialExamples = (exList?: GrammarExample[]): GrammarExample[] => {
  if (!exList || exList.length === 0) return EMPTY_EXAMPLES;
  const loaded = [...exList];
  while (loaded.length < 7) {
    loaded.push({ tr: "", target: "" });
  }
  return loaded.slice(0, 7);
};

export default function GrammarForm({
  currentLang,
  initialItem,
  onSubmit,
  isSubmitting,
  onValidationError,
}: GrammarFormProps): JSX.Element {
  const items = useGrammarStore((state) => state.items);

  // Prop değişimini takip etmek için önceki item referansı
  const [prevInitialItem, setPrevInitialItem] = useState<GrammarItem | null>(
    initialItem,
  );

  const [topic, setTopic] = useState<string>(() => initialItem?.topic ?? "");
  const [order, setOrder] = useState<string>(() => {
    if (initialItem?.order !== undefined && initialItem?.order !== null) {
      return String(initialItem.order);
    }
    return String(items.length + 1);
  });
  const [definition, setDefinition] = useState<string>(
    () => initialItem?.definition ?? "",
  );
  const [examples, setExamples] = useState<GrammarExample[]>(() =>
    formatInitialExamples(initialItem?.examples),
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  // React Resmi Deseni: useEffect KULLANMADAN prop değişiminde state'i render anında senkronize et
  if (initialItem !== prevInitialItem) {
    setPrevInitialItem(initialItem);
    setTopic(initialItem?.topic ?? "");
    setOrder(
      initialItem?.order !== undefined && initialItem?.order !== null
        ? String(initialItem.order)
        : String(items.length + 1),
    );
    setDefinition(initialItem?.definition ?? "");
    setExamples(formatInitialExamples(initialItem?.examples));
    setHasAttemptedSubmit(false);
  }

  const handleExampleChange = (
    index: number,
    field: "tr" | "target",
    value: string,
  ) => {
    setExamples((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleWrapWithBrackets = () => {
    setDefinition((prev) => `${prev} [[kelime]]`);
  };

  const handleJsonImport = (importedData: GrammarFormData) => {
    setTopic(importedData.topic);
    setOrder(String(importedData.order ?? items.length + 1));
    setDefinition(importedData.definition);
    setExamples(importedData.examples);
    setHasAttemptedSubmit(false);
  };

  const parsedOrder = parseInt(order, 10);

  const validate = (): boolean => {
    const isTopicValid = topic.trim().length > 0;
    const isOrderValid = !isNaN(parsedOrder) && parsedOrder > 0;
    const isDefinitionValid = definition.trim().length > 0;
    const areExamplesValid = examples.every(
      (ex) => ex.tr.trim().length > 0 && ex.target.trim().length > 0,
    );

    return (
      isTopicValid && isOrderValid && isDefinitionValid && areExamplesValid
    );
  };

  const executeSubmit = async () => {
    setHasAttemptedSubmit(true);

    if (!validate()) {
      onValidationError(
        "Lütfen konu başlığı, geçerli bir konu sırası numarası, gramer tanımı ve 7 adet TR/Hedef Dil örneğinin tamamını doldurun.",
      );
      return;
    }

    await onSubmit({
      topic: topic.trim(),
      order: Math.floor(parsedOrder),
      definition: definition.trim(),
      examples: examples.map((ex) => ({
        tr: ex.tr.trim(),
        target: ex.target.trim(),
      })),
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      if (e.target instanceof HTMLTextAreaElement && e.shiftKey) {
        return;
      }
      e.preventDefault();
      executeSubmit();
    }
  };

  const isOrderInvalid =
    hasAttemptedSubmit &&
    (order.trim() === "" || isNaN(parsedOrder) || parsedOrder <= 0);

  return (
    <>
      <GrammarJsonModal
        isOpen={isJsonModalOpen}
        currentLang={currentLang}
        onClose={() => setIsJsonModalOpen(false)}
        onImport={handleJsonImport}
      />

      <form
        onKeyDown={handleKeyDown}
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          executeSubmit();
        }}
        className="flex-1 space-y-6 rounded-xl border border-zinc-900/60 bg-zinc-950/80 p-6 backdrop-blur-md shadow-2xl"
      >
        {/* Üst Başlık */}
        <div className="border-b border-zinc-900/80 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100 capitalize">
              {initialItem
                ? `${currentLang} Konusunu Güncelle`
                : `Yeni ${currentLang} Konusu Tanımla`}
            </h3>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-mono text-xs text-zinc-500">
                Enter = Kaydet / Shift+Enter = Alt Satır
              </span>

              <button
                type="button"
                onClick={() => setIsJsonModalOpen(true)}
                title="Gemini JSON İçe Aktar"
                className="group flex items-center gap-1.5 rounded-lg border border-zinc-800/40 bg-zinc-950 px-3 py-1.5 font-mono text-sm font-semibold text-zinc-400 transition hover:border-zinc-700/60 hover:bg-zinc-900/80 hover:text-zinc-200 active:scale-95 shadow-sm"
              >
                <span className="text-zinc-500 group-hover:text-zinc-300">
                  {"{ }"}
                </span>
                <span>JSON</span>
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-zinc-400">
            Hedef dildeki kelimeleri{" "}
            <code className="text-zinc-300 bg-zinc-900/60 border border-zinc-800/30 px-1.5 py-0.5 rounded font-mono text-xs">
              [[kelime]]
            </code>{" "}
            içine alarak konuşma sentezleyicisine bağlayabilirsiniz.
          </p>
        </div>

        {/* Konu Başlığı ve Sıra Numarası */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-3">
            <label className="text-sm font-mono font-medium text-zinc-300">
              Gramer Konusu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: Geçmiş Zaman Kullanımı"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition border ${
                hasAttemptedSubmit && !topic.trim()
                  ? "border-rose-900/80 bg-rose-950/20 focus:border-rose-700"
                  : "border-zinc-900/80 focus:border-zinc-700"
              }`}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-sm font-mono font-medium text-zinc-300">
              Sıra No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1"
              value={order}
              onKeyDown={(e) => {
                if (
                  [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                    "Enter",
                  ].includes(e.key) ||
                  e.ctrlKey ||
                  e.metaKey
                ) {
                  return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, "");
                setOrder(numericOnly);
              }}
              className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                isOrderInvalid
                  ? "border-rose-900/80 bg-rose-950/20 focus:border-rose-700"
                  : "border-zinc-900/80 focus:border-zinc-700"
              }`}
            />
          </div>
        </div>

        {/* Tanım ve Canlı Önizleme */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-mono font-medium text-zinc-300">
              Gramer Tanımı ve Kurallar <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleWrapWithBrackets}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition underline underline-offset-4"
            >
              + [[Kelime Tokeni]] Ekle
            </button>
          </div>

          <textarea
            rows={3}
            placeholder="Örn: Fiil çekimlerinde [[fiil]] köküne dikkat edilir..."
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            className={`w-full rounded-lg bg-zinc-950 p-3.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition border resize-none ${
              hasAttemptedSubmit && !definition.trim()
                ? "border-rose-900/80 bg-rose-950/20 focus:border-rose-700"
                : "border-zinc-900/80 focus:border-zinc-700"
            }`}
          />

          <div className="rounded-lg border border-zinc-900/80 bg-black/40 p-3.5">
            <div className="flex items-center justify-between mb-2 border-b border-zinc-900/60 pb-1.5">
              <span className="font-mono text-xs uppercase text-zinc-500 tracking-wider">
                Canlı Ses ve Metin Önizlemesi ({currentLang})
              </span>
              <span className="text-xs text-zinc-600 font-mono">
                Token'a tıkla ve dinle
              </span>
            </div>
            <InteractiveText text={definition} lang={currentLang} />
          </div>
        </div>

        {/* 7 Örnek Bölümü */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2">
            <h4 className="text-sm font-mono font-semibold tracking-wide text-zinc-300">
              Örnek Cümleler (Zorunlu 7 Adet)
            </h4>
            <span className="font-mono text-xs text-zinc-500">
              TR & {currentLang.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2.5">
            {examples.map((example, index) => {
              const isTrEmpty = hasAttemptedSubmit && !example.tr.trim();
              const isTargetEmpty =
                hasAttemptedSubmit && !example.target.trim();

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg  p-3 sm:flex-row sm:items-center"
                >
                  <span className="w-7 font-mono text-sm font-bold text-zinc-500">
                    #{index + 1}
                  </span>

                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Örnek ${index + 1} (Türkçe)`}
                      value={example.tr}
                      onChange={(e) =>
                        handleExampleChange(index, "tr", e.target.value)
                      }
                      className={`w-full rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition border ${
                        isTrEmpty
                          ? "border-rose-900/80 bg-rose-950/20 focus:border-rose-700"
                          : "border-zinc-900/70 focus:border-zinc-700"
                      }`}
                    />
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      placeholder={`Hedef Cümle ${index + 1} (${currentLang})`}
                      value={example.target}
                      onChange={(e) =>
                        handleExampleChange(index, "target", e.target.value)
                      }
                      className={`w-full rounded-md bg-zinc-950 pl-3 pr-8 py-2 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition border ${
                        isTargetEmpty
                          ? "border-rose-900/80 bg-rose-950/20 focus:border-rose-700"
                          : "border-zinc-900/70 focus:border-zinc-700"
                      }`}
                    />
                    {example.target.trim() && (
                      <button
                        type="button"
                        onClick={() => speakText(example.target, currentLang)}
                        title="Cümleyi dinle"
                        className="absolute right-2 text-zinc-500 hover:text-zinc-200 transition p-1"
                      >
                        <svg
                          className="w-4 h-4"
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 py-3 text-sm font-semibold tracking-wider text-zinc-950 uppercase transition hover:bg-white active:scale-[0.99] disabled:opacity-50 shadow-md"
          >
            {isSubmitting
              ? "İşleniyor..."
              : initialItem
                ? "Konuyu Güncelle"
                : "Kaydı Tamamla ve Ekle"}
          </button>
        </div>
      </form>
    </>
  );
}
