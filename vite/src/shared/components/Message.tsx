import React, { useEffect } from "react";

export type MessageStatus = "success" | "error" | "info";

export interface MessageProps {
  status: MessageStatus;
  message: string;
  onClose?: () => void;
  autoCloseDuration?: number; // ms cinsinden, varsayılan 4000ms
}

export default function Message({
  status,
  message,
  onClose,
  autoCloseDuration = 4000,
}: MessageProps): React.JSX.Element {
  useEffect(() => {
    if (!autoCloseDuration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  // Noir paletine uygun, abartıdan uzak durum stilleri
  const statusStyles: Record<
    MessageStatus,
    { border: string; badge: string; text: string; label: string }
  > = {
    success: {
      border: "border-emerald-600/60",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      text: "text-zinc-200",
      label: "BAŞARILI",
    },
    error: {
      border: "border-rose-600/60",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      text: "text-zinc-200",
      label: "HATA",
    },
    info: {
      border: "border-amber-600/60",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      text: "text-zinc-200",
      label: "BİLGİ",
    },
  };

  const currentStyle = statusStyles[status];

  return (
    <aside
      aria-label="Bildirim"
      className={`fixed top-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-lg border bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ${currentStyle.border}`}
    >
      <span
        className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider ${currentStyle.badge}`}
      >
        {currentStyle.label}
      </span>

      <div className="flex-1">
        <p
          className={`text-xs font-medium leading-relaxed ${currentStyle.text}`}
        >
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-zinc-500 transition-colors hover:text-zinc-200"
          aria-label="Kapat"
        >
          <svg
            className="h-4 w-4"
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
      )}
    </aside>
  );
}
