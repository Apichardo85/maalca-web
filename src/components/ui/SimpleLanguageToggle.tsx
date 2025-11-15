"use client";

import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import { motion } from "framer-motion";

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
        button: "relative flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-colors",
        text: "text-sm font-medium text-white"
      }
    : {
        button: "relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg",
        text: "text-sm font-medium text-gray-700"
      };

  return (
    <motion.button
      onClick={toggleLanguage}
      className={styles.button}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className={styles.text}>
        {language === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}
      </span>
    </motion.button>
  );
}
