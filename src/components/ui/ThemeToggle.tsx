"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Check localStorage on mount
    const savedTheme = localStorage.getItem("ciri-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light-theme");
      localStorage.setItem("ciri-theme", "dark");
    } else {
      root.classList.add("light-theme");
      localStorage.setItem("ciri-theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`px-3 py-2 rounded-lg border text-sm transition-all duration-300 font-serif ${
        isDark 
          ? "border-red-600/50 text-red-400 hover:bg-red-600/10" 
          : "border-amber-600/50 text-amber-600 hover:bg-amber-600/10"
      }`}
      aria-label="Cambiar tema"
    >
      {isDark ? t('theme.paperCream') : t('theme.darkMode')}
    </button>
  );
}