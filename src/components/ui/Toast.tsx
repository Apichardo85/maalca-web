"use client";

import { motion, AnimatePresence } from 'framer-motion';
import type { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const toastColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto"
          >
            <div
              className={`${toastColors[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
              role="alert"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {toastIcons[toast.type]}
              </div>

              {/* Message */}
              <p className="flex-1 font-medium text-sm leading-tight">
                {toast.message}
              </p>

              {/* Close Button */}
              <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Cerrar notificación"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
