"use client";

import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import { motion } from "framer-motion";

export default function SimpleLanguageToggle() {
  const { language, setLanguage } = useSimpleLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative p-2 rounded-full bg-surface-elevated border border-border hover:bg-surface-muted transition-colors"
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-sm font-medium text-text-primary">
        {language === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}
      </span>
    </motion.button>
  );
}
