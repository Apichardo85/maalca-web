"use client";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
interface SimpleLanguageToggleProps {
  variant?: 'light' | 'dark';
}
export default function SimpleLanguageToggle({ variant = 'light' }: SimpleLanguageToggleProps) {
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
        {language === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}
      </span>
    </button>
  );
}
