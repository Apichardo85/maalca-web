"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/buttons';
import { useTranslation } from '@/hooks/useSimpleLanguage';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
  onCartClick: () => void;
  onWhatsAppClick: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  cartCount,
  onCartClick,
  onWhatsAppClick,
}: MobileMenuProps) {
  const { t } = useTranslation();

  const menuLinks = [
    { href: '#menu', label: t('cocinatina.nav.menu'), icon: '🍽️' },
    { href: '#suscripciones', label: t('cocinatina.nav.subscriptions'), icon: '📦' },
    { href: '#experiencias', label: t('cocinatina.nav.experiences'), icon: '🎉' },
    { href: '#nosotros', label: t('cocinatina.nav.about'), icon: '👨‍🍳' },
  ];

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = (href: string) => {
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-amber-50 shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-label="Menú de navegación"
            aria-modal="true"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-amber-200 bg-amber-100">
                <h2 className="font-serif text-2xl font-bold text-amber-900">
                  {t("cocinatina.hero.title")}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-amber-900 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6" role="navigation" aria-label="Navegación principal">
                <ul className="space-y-2">
                  {menuLinks.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 transition-colors text-left group"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {link.icon}
                        </span>
                        <span className="text-lg font-medium text-amber-900">
                          {link.label}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Action Buttons */}
              <div className="p-6 space-y-3 border-t border-amber-200 bg-amber-100">
                {/* Cart Button */}
                <Button
                  onClick={() => {
                    onCartClick();
                    onClose();
                  }}
                  variant="primary"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-amber-50 relative"
                  aria-label={`Ver carrito con ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">🛒</span>
                    <span>{t("cocinatina.nav.cart")}</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </Button>

                {/* WhatsApp Button */}
                <Button
                  onClick={() => {
                    onWhatsAppClick();
                    onClose();
                  }}
                  variant="outline"
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  aria-label="Contactar por WhatsApp"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">📱</span>
                    <span>WhatsApp</span>
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
