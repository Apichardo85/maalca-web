"use client";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
interface SimpleLanguageToggleProps {
  variant?: 'light' | 'dark';
  /** ISO-2 de la bandera junto a "ES" (ej. "MX"). Sin valor = RD, como siempre. */
  spanishFlag?: string | null;
}
// Emoji de bandera desde ISO-2 (indicadores regionales). Valida A-Z; cae a RD si no es valido.
function flagEmoji(code?: string | null): string {
  const c = (code ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '🇩🇴';
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}
export default function SimpleLanguageToggle({ variant = 'light', spanishFlag }: SimpleLanguageToggleProps) {
  const { language, setLanguage } = useSimpleLanguage();
  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };
  const styles = variant === 'dark'
    ? {
        button: "relative flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 active:scale-95",
        text: "text-sm font-medium text-white"
      }
    : {
        button: "relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        text: "text-sm font-medium text-gray-700"
      };
  return (
    <button
      onClick={toggleLanguage}
      className={styles.button}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={styles.text}>
        {language === 'es' ? '🇺🇸 EN' : `${flagEmoji(spanishFlag)} ES`}
      </span>
    </button>
  );
}
