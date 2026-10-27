"use client";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

interface SimpleLanguageToggleProps {
  variant?: 'light' | 'dark';
  /** Compat: se ignora. Antes elegía la bandera junto a "ES"; ahora el toggle no usa banderas. */
  spanishFlag?: string | null;
}

// Segmentado ES | EN con el idioma activo resaltado — se entiende de un vistazo cuál está puesto
// y cuál se elige, en vez de una sola etiqueta "bandera + idioma destino" que no decía el estado.
export default function SimpleLanguageToggle({ variant = 'light' }: SimpleLanguageToggleProps) {
  const { language, setLanguage } = useSimpleLanguage();

  const isDark = variant === 'dark';
  const base = "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors";
  const active = isDark ? "bg-white text-gray-900" : "bg-brand-primary text-white";
  const idle = isDark ? "text-white/80 hover:text-white" : "text-text-secondary hover:text-text-primary";

  const segment = (lang: 'es' | 'en', label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(lang)}
      aria-pressed={language === lang}
      aria-label={lang === 'es' ? 'Español' : 'English'}
      className={`${base} ${language === lang ? active : idle}`}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ${
        isDark ? "bg-white/15 border border-white/25" : "bg-surface border border-border"
      }`}
    >
      {segment('es', 'ES')}
      {segment('en', 'EN')}
    </div>
  );
}
