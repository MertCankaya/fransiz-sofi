import type { JSX, ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
      {/* 
        Tüm sayfalarda geçerli standart responsive container:
        Ekran kenarlarından güvenli boşluk (px-4/6/8) ve geniş ekran sınırlaması (max-w-7xl mx-auto)
      */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children ? children : <Outlet />}
      </main>
    </div>
  );
}
