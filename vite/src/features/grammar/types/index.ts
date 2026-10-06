import type { LanguageKey } from "../../../shared/utils/speech";

export interface LanguageOption {
  key: LanguageKey;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { key: "french", label: "Français", flag: "🇫🇷" },
  { key: "german", label: "Deutsch", flag: "🇩🇪" },
  { key: "english", label: "English", flag: "🇬🇧" },
  { key: "spanish", label: "Español", flag: "🇪🇸" },
  { key: "italian", label: "Italiano", flag: "🇮🇹" },
  { key: "russian", label: "Русский", flag: "🇷🇺" },
  { key: "arabic", label: "العربية", flag: "🇸🇦" },
];

export interface GrammarExample {
  tr: string;
  target: string; // 7 dilde de ortak hedef cümle
}

export interface GrammarItem {
  id: string;
  language: LanguageKey;
  topic: string;
  order: number;
  definition: string;
  examples: GrammarExample[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarFormData {
  topic: string;
  order: number;
  definition: string;
  examples: GrammarExample[];
}
