import React, { useState } from "react";
import { useAuthStore } from "../../../shared/stores/useAuthStore";

export default function LoginScreen(): React.JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-gray-900 p-8 shadow-2xl border border-gray-800"
      >
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">
          Elsine Giriş
        </h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          Kullanıcı adı ve şifrenizi girin.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400 border border-red-900">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
            placeholder="fr_admin vb."
            className="w-full rounded-lg bg-gray-950 px-4 py-3 text-white placeholder-gray-600 border border-gray-800 focus:border-indigo-500 focus:outline-none"
            required
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="••••••••"
            className="w-full rounded-lg bg-gray-950 px-4 py-3 text-white placeholder-gray-600 border border-gray-800 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 focus:outline-none disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
