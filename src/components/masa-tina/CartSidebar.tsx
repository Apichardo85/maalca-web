"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/buttons';
import { useTranslation } from '@/hooks/useSimpleLanguage';
import type { CartItem } from '@/hooks/useCart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onIncrementQuantity: (id: string) => void;
  onDecrementQuantity: (id: string) => void;
  onClearCart: () => void;
  onWhatsAppCheckout: () => void;
  getTotal: () => number;
}

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onIncrementQuantity,
  onDecrementQuantity,
  onClearCart,
  onWhatsAppCheckout,
  getTotal,
}: CartSidebarProps) {
  const { t } = useTranslation();

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

  // Prevent body scroll when sidebar is open
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotal();

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

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-label="Carrito de compras"
            aria-modal="true"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-amber-200 bg-amber-50">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">
                    {t("cocinatina.cart.title")}
                  </h2>
                  {cart.length > 0 && (
                    <p className="text-sm text-amber-700 mt-1">
                      {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-amber-900 transition-colors"
                  aria-label="Cerrar carrito"
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

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <span className="text-8xl mb-4 opacity-50">🛒</span>
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">
                      {t("cocinatina.cart.empty")}
                    </h3>
                    <p className="text-amber-700 mb-6">
                      {t("cocinatina.cart.emptyDescription")}
                    </p>
                    <Button
                      onClick={onClose}
                      variant="primary"
                      className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                    >
                      Explorar el Menú
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                      >
                        {/* Item Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-amber-900 mb-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-amber-700 line-clamp-2">
                              {item.description}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors ml-3"
                            aria-label={`Eliminar ${item.name} del carrito`}
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onDecrementQuantity(item.id)}
                              className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition-colors"
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>
                            <span className="w-12 text-center font-bold text-amber-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onIncrementQuantity(item.id)}
                              className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold flex items-center justify-center transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-amber-700">
                              ${item.price} c/u
                            </p>
                            <p className="text-lg font-bold text-amber-900">
                              ${item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear Cart Button */}
                    {cart.length > 0 && (
                      <button
                        onClick={onClearCart}
                        className="w-full text-red-600 hover:text-red-700 font-medium text-sm py-2 underline"
                      >
                        {t("cocinatina.cart.clearCart")}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with Total & Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-amber-200 bg-amber-50 p-6 space-y-4">
                  {/* Total */}
                  <div className="flex items-center justify-between text-2xl font-bold text-amber-900">
                    <span>{t("cocinatina.cart.total")}:</span>
                    <span>${total}</span>
                  </div>

                  {/* Checkout Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={onWhatsAppCheckout}
                      variant="primary"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4"
                      aria-label="Finalizar pedido por WhatsApp"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-2xl">📱</span>
                        <span>{t("cocinatina.cart.sendOrder")}</span>
                      </span>
                    </Button>

                    <p className="text-xs text-center text-amber-700">
                      Te redirigiremos a WhatsApp para completar tu pedido
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
