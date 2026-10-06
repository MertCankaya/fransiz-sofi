export type LanguageKey =
  | "french"
  | "german"
  | "english"
  | "spanish"
  | "italian"
  | "russian"
  | "arabic";

const LANG_CODE_MAP: Record<LanguageKey, string> = {
  french: "fr-FR",
  german: "de-DE",
  english: "en-US",
  spanish: "es-ES",
  italian: "it-IT",
  russian: "ru-RU",
  arabic: "ar-SA",
};

export function speakText(text: string, lang: LanguageKey = "french"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Tarayıcınız Web Speech API desteklemiyor.");
    return;
  }

  const clean = text.trim();
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = LANG_CODE_MAP[lang] || "fr-FR";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}
