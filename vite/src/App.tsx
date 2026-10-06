import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shared/components/Layout";
import GrammarUploadScreen from "./features/grammar/screens/GrammarUploadScreen";
import LoginScreen from "./features/auth/screens/LoginScreen";
import { useAuthStore } from "./shared/stores/useAuthStore";

export default function App(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Eğer giriş yapılmadıysa doğrudan login ekranını render et
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Tailwind Layout ile sarmalanan rotalar */}
        <Route element={<Layout />}>
          <Route path="/" element={<GrammarUploadScreen />} />
        </Route>

        {/* Tanımsız rotaları köke yönlendir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
