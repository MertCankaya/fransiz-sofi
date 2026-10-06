import type { JSX } from "react";
import type { GrammarItem } from "../types";
import { SUPPORTED_LANGUAGES } from "../types";
import type { LanguageKey } from "../../../shared/utils/speech";

// Çoklu dil seçiciyi aktif/pasif eden Feature Flag
// İleride diğer 6 dili açmak istediğinde tek yapman gereken burayı 'true' yapmaktır.
const SHOW_LANGUAGE_SELECTOR = false;

interface GrammarSidebarProps {
  currentLang: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
  items: GrammarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isLoading: boolean;
}

export default function GrammarSidebar({
  currentLang,
  onLanguageChange,
  items,
  selectedId,
  onSelect,
  onNew,
  isLoading,
}: GrammarSidebarProps): JSX.Element {
  return (
    <aside
      className="flex w-full flex-col border border-zinc-800/80 bg-zinc-900/60 p-4 rounded-xl backdrop-blur-sm 
        lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:h-screen lg:w-80 lg:z-30 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:border-zinc-800 lg:bg-zinc-950/95 lg:p-6"
    >
      {/* 
        Çoklu Dil Seçici Bloğu:
        SHOW_LANGUAGE_SELECTOR = false olduğunda gizlenir, kod arkada hazır bekler.
      */}
      {SHOW_LANGUAGE_SELECTOR ? (
        <div className="mb-5 space-y-2 border-b border-zinc-800 pb-4">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Çalışılan Dil
          </label>
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-7 lg:grid-cols-4">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = lang.key === currentLang;
              return (
                <button
                  key={lang.key}
                  type="button"
                  onClick={() => onLanguageChange(lang.key)}
                  className={`flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-mono transition border ${
                    isActive
                      ? "border-zinc-500 bg-zinc-100 text-zinc-950 font-bold"
                      : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                  title={lang.label}
                >
                  <span>{lang.flag}</span>
                  <span className="text-[10px] uppercase">
                    {lang.key.slice(0, 2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Dil seçimi kapalıyken gösterilen sade noir durum rozeti */
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Fransa">
              🇫🇷
            </span>
            <div>
              <p className="text-md font-semibold text-zinc-200 tracking-tight">
                Français Grammaire
              </p>
            </div>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
            AKTİF
          </span>
        </div>
      )}

      {/* Üst Bar: Başlık ve Yeni Butonu */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div>
          <h2 className="text-md font-semibold tracking-normal text-zinc-100 capitalize">
            Gramer Konuları
          </h2>
          <span className="text-[13px] font-mono text-zinc-500">
            {items.length} konu kayıtlı
          </span>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-md font-semibold text-zinc-950 transition hover:bg-white active:scale-95"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yeni
        </button>
      </div>

      {/* Konu Listesi */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {isLoading && items.length === 0 ? (
          <div className="py-8 text-center text-md text-zinc-500">
            Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-md text-zinc-600">
            Henüz kayıtlı konu bulunmuyor.
          </div>
        ) : (
          items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full text-left rounded-lg p-3 transition-all duration-150 border ${
                  isSelected
                    ? "border-zinc-500 bg-zinc-800/90 text-zinc-100 shadow-sm"
                    : "border-zinc-800/60 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-md font-medium tracking-tight truncate">
                    {item.topic || "İsimsiz Konu"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">
                  {item.definition || "Tanım girilmemiş."}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
