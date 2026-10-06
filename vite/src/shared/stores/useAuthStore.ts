import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  username: string | null;
  password: string | null; // Backend X-Username ve X-Password header'ları istediği için saklıyoruz
  tables: string[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: null,
      password: null,
      tables: [],
      isAuthenticated: false,

      login: async (username, password) => {
        const response = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Giriş başarısız.");
        }

        // Başarılı giriş sonrası state güncellenir ve persist middleware otomatik kaydeder
        set({
          username: data.username,
          password: password,
          tables: data.tables || [],
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          username: null,
          password: null,
          tables: [],
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "elsine-auth-storage", // localStorage'da saklanacağı anahtar kelime
    },
  ),
);
