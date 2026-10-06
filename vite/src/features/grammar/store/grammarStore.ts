import { create } from "zustand";
import type { GrammarItem, GrammarFormData } from "../types";
import type { LanguageKey } from "../../../shared/utils/speech";
import type { MessageStatus } from "../../../shared/components/Message";
import { useAuthStore } from "../../../shared/stores/useAuthStore";

interface ToastState {
  status: MessageStatus;
  message: string;
}

interface GrammarStore {
  currentLang: LanguageKey;
  items: GrammarItem[];
  selectedId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  toast: ToastState | null;

  setCurrentLang: (lang: LanguageKey) => void;
  setSelectedId: (id: string | null) => void;
  fetchItems: () => Promise<void>;
  createItem: (data: GrammarFormData) => Promise<string | null>;
  updateItem: (id: string, data: GrammarFormData) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setToast: (toast: ToastState | null) => void;
  clearToast: () => void;
}

const getAuthHeaders = (): HeadersInit => {
  const { username, password } = useAuthStore.getState();
  return {
    "Content-Type": "application/json",
    ...(username ? { "X-Username": username } : {}),
    ...(password ? { "X-Password": password } : {}),
  };
};

// Konuları 'order' değerine göre (küçükten büyüğe) kararlı sıralayan yardımcı fonksiyon
const sortGrammarItems = (items: GrammarItem[]): GrammarItem[] => {
  return [...items].sort((a, b) => {
    const orderA =
      (a as GrammarItem & { order?: number }).order ?? Number.MAX_SAFE_INTEGER;
    const orderB =
      (b as GrammarItem & { order?: number }).order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Sıra numaraları eşitse veya yoksa oluşturulma tarihine göre en yeniyi üste al
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
};

export const useGrammarStore = create<GrammarStore>((set, get) => ({
  currentLang: "french",
  items: [],
  selectedId: null,
  isLoading: false,
  isSubmitting: false,
  toast: null,

  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  setSelectedId: (id) => set({ selectedId: id }),

  setCurrentLang: (lang) => {
    set({ currentLang: lang, selectedId: null, items: [] });
    get().fetchItems();
  },

  fetchItems: async () => {
    const { currentLang } = get();
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/grammar/${currentLang}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Veriler sunucudan çekilemedi.");
      }
      const data: GrammarItem[] = await response.json();
      set({ items: sortGrammarItems(data) });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Bağlantı hatası oluştu.";
      set({
        toast: {
          status: "error",
          message: `${currentLang} listesi yüklenemedi: ${msg}`,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createItem: async (data: GrammarFormData) => {
    const { currentLang } = get();
    set({ isSubmitting: true });
    try {
      const response = await fetch(`/api/grammar/${currentLang}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Kayıt eklenemedi.");
      }

      const created: GrammarItem = await response.json();
      set((state) => ({
        items: sortGrammarItems([created, ...state.items]),
        selectedId: created.id,
        toast: { status: "success", message: "Konu başarıyla kaydedildi." },
      }));
      return created.id;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Kayıt sırasında hata oluştu.";
      set({ toast: { status: "error", message: msg } });
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateItem: async (id: string, data: GrammarFormData) => {
    const { currentLang } = get();
    set({ isSubmitting: true });
    try {
      const response = await fetch(
        `/api/grammar/${currentLang}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Güncelleme başarısız oldu.");
      }

      const updated: GrammarItem = await response.json();
      set((state) => ({
        items: sortGrammarItems(
          state.items.map((item) => (item.id === id ? updated : item)),
        ),
        toast: { status: "success", message: "Konu başarıyla güncellendi." },
      }));
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Güncelleme hatası oluştu.";
      set({ toast: { status: "error", message: msg } });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteItem: async (id: string) => {
    const { currentLang } = get();
    set({ isSubmitting: true });
    try {
      const response = await fetch(
        `/api/grammar/${currentLang}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Silme işlemi başarısız oldu.");
      }

      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        toast: { status: "success", message: "Konu başarıyla silindi." },
      }));
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Silme işlemi sırasında hata oluştu.";
      set({ toast: { status: "error", message: msg } });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
