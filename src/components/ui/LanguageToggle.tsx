"use client";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
export function LanguageToggle() {
  const { language, setLanguage } = useSimpleLanguage();
  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="px-3 py-1.5 rounded-lg border text-sm transition-all duration-300 font-serif border-[var(--ciri-brand,#dc2626)]/40 text-[var(--ciri-brand,#dc2626)] hover:bg-[var(--ciri-brand,#dc2626)]/10"
      style={{
        borderColor: 'color-mix(in srgb, var(--ciri-brand, #dc2626) 40%, transparent)',
        color: 'var(--ciri-brand, #dc2626)',
      }}
      aria-label="Change language"
    >
      {language === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
