'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { CartItem, ShoppingCart } from '@/lib/types/commerce.types';

interface ShoppingCartSidebarProps {
  cart: ShoppingCart;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  language?: 'es' | 'en';
  brandColor?: string;
}

export function ShoppingCartSidebar({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  language = 'es',
  brandColor = 'red-600'
}: ShoppingCartSidebarProps) {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  {language === 'es' ? 'Tu Carrito' : 'Your Cart'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {itemCount} {itemCount === 1
                    ? language === 'es' ? 'artículo' : 'item'
                    : language === 'es' ? 'artículos' : 'items'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-400 text-lg">
                    {language === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {language === 'es' ? 'Agrega productos para comenzar' : 'Add products to get started'}
                  </p>
                </div>
              ) : (
                cart.items.map((item) => {
                  const name = language === 'es' ? item.product.name : item.product.nameEn;
                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 bg-gray-800 rounded-lg p-4"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm line-clamp-2">{name}</h3>
                        <p className="text-gray-400 text-xs mt-1">{item.product.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-${brandColor} font-bold`}>
                            ${item.product.price.toFixed(2)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-700 rounded">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-white hover:bg-gray-700 transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-white text-sm">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-white hover:bg-gray-700 transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors self-start"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer with Totals */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-800 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-400">
                  <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>{language === 'es' ? 'Impuestos' : 'Tax'}</span>
                  <span>${cart.tax.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>{language === 'es' ? 'Envío' : 'Shipping'}</span>
                  <span>
                    {cart.shipping === 0
                      ? language === 'es' ? 'Gratis' : 'Free'
                      : `$${cart.shipping.toFixed(2)}`}
                  </span>
                </div>

                {/* Free Shipping Progress */}
                {cart.shipping > 0 && cart.subtotal < 50 && (
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-xs text-gray-400 mb-2">
                      {language === 'es'
                        ? `Agrega $${(50 - cart.subtotal).toFixed(2)} más para envío gratis`
                        : `Add $${(50 - cart.subtotal).toFixed(2)} more for free shipping`}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-${brandColor} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min((cart.subtotal / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Discount */}
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-500 text-sm">
                    <span>{language === 'es' ? 'Descuento' : 'Discount'}</span>
                    <span>-${cart.discount.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-white text-xl font-bold pt-4 border-t border-gray-800">
                  <span>{language === 'es' ? 'Total' : 'Total'}</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={onCheckout}
                  className={`w-full bg-${brandColor} text-white py-4 rounded-md font-bold text-lg hover:bg-${brandColor}/90 transition-all hover:scale-[1.02]`}
                >
                  {language === 'es' ? 'Proceder al Pago' : 'Proceed to Checkout'}
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {language === 'es' ? 'Continuar comprando' : 'Continue shopping'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
