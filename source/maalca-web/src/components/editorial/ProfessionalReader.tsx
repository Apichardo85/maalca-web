"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ProfessionalReaderProps {
  articleId: string;
  title: string;
  author: string;
  content: string;
  onClose: () => void;
}

export default function ProfessionalReader({
  articleId,
  title,
  author,
  content,
  onClose
}: ProfessionalReaderProps) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-1">{title}</h2>
            <p className="text-text-muted">Por {author}</p>
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center gap-2 mr-4">
            <span className="text-text-muted text-sm">A</span>
            <button
              onClick={() => setFontSize('small')}
              className={`px-2 py-1 rounded transition-all ${
                fontSize === 'small'
                  ? 'bg-brand-primary text-white font-semibold shadow-md'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`px-2 py-1 rounded transition-all ${
                fontSize === 'medium'
                  ? 'bg-brand-primary text-white font-semibold shadow-md'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-lg transition-all ${
                fontSize === 'large'
                  ? 'bg-brand-primary text-white font-semibold shadow-md'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              A
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors text-3xl font-light"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div
            className={`text-text-primary leading-relaxed ${fontSizeClasses[fontSize]}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-between">
          <div className="text-sm text-text-muted">
            Artículo ID: {articleId}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
