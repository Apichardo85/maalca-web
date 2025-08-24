"use client";

import { useLanguage } from "@/hooks/useLanguage";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="px-3 py-2 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 text-sm transition-all duration-300 font-serif"
      aria-label="Change language"
    >
      {language === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}
    </button>
  );
}