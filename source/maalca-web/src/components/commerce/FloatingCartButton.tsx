'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCartButtonProps {
  itemCount: number;
  onClick: () => void;
  brandColor?: string;
}

export function FloatingCartButton({
  itemCount,
  onClick,
  brandColor = 'red-600'
}: FloatingCartButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-8 right-8 bg-${brandColor} text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-${brandColor}/90 transition-colors`}
    >
      {/* Cart Icon */}
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>

      {/* Item Count Badge */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
