import { useEffect, useMemo } from "react";
import type { JSX } from "react";
import { useSearchParams } from "react-router-dom";
import { useGrammarStore } from "../store/grammarStore";
import GrammarSidebar from "../components/GrammarSidebar";
import GrammarForm from "../components/GrammarForm";
import Message from "../../../shared/components/Message";
import type { GrammarFormData } from "../types";
import type { LanguageKey } from "../../../shared/utils/speech";

export default function GrammarUploadScreen(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const {
    currentLang,
    setCurrentLang,
    items,
    fetchItems,
    createItem,
    updateItem,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    clearToast,
  } = useGrammarStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const handleLanguageChange = (lang: LanguageKey) => {
    setSearchParams({});
    setCurrentLang(lang);
    setToast({
      status: "info",
      message: `${lang.toUpperCase()} dili seçildi. İlgili tablo yüklendi.`,
    });
  };

  const handleSelectTopic = (id: string) => {
    setSearchParams({ id });
  };

  const handleNewTopic = () => {
    setSearchParams({});
    setToast({
      status: "info",
      message: `Yeni ${currentLang} konusu oluşturma formu hazırlandı.`,
    });
  };

  const handleFormSubmit = async (formData: GrammarFormData) => {
    if (selectedId) {
      await updateItem(selectedId, formData);
    } else {
      const newId = await createItem(formData);
      if (newId) {
        setSearchParams({ id: newId });
      }
    }
  };

  return (
    <div className="relative flex flex-1 flex-col gap-6 lg:flex-row lg:items-start">
      {toast && (
        <Message
          status={toast.status}
          message={toast.message}
          onClose={clearToast}
        />
      )}

      {/* Sabit Sol Kenar Sidebar */}
      <GrammarSidebar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        items={items}
        selectedId={selectedId}
        onSelect={handleSelectTopic}
        onNew={handleNewTopic}
        isLoading={isLoading}
      />

      {/* Ortalanmış Form Alanı */}
      <div className="flex flex-1 justify-center lg:pl-80">
        <div className="w-full max-w-3xl">
          <GrammarForm
            key={`${currentLang}-${selectedItem?.id ?? "new-form"}`}
            currentLang={currentLang}
            initialItem={selectedItem}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onValidationError={(msg) =>
              setToast({ status: "error", message: msg })
            }
          />
        </div>
      </div>
    </div>
  );
}
