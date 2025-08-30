"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./buttons";
import { useAnalytics } from "@/hooks/useAnalytics";

interface SimpleReaderProps {
  bookId: string;
  title: string;
  author?: string;
  content: string; // HTML content to display
  onClose?: () => void;
}

export default function SimpleReader({ 
  bookId, 
  title, 
  author = "CiriWhispers", 
  content,
  onClose 
}: SimpleReaderProps) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { trackEvent } = useAnalytics('ciriwhispers');

  // Auto-hide controls
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, showControls]);

  // Track reader opened
  useEffect(() => {
    trackEvent({
      action: 'reader_opened',
      category: 'engagement',
      label: bookId
    });
  }, [bookId, trackEvent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeTheme = (theme: 'light' | 'sepia' | 'dark') => {
    setCurrentTheme(theme);
    trackEvent({
      action: 'theme_change',
      category: 'customization',
      label: theme
    });
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(200, prev + 10));
  const decreaseFontSize = () => setFontSize(prev => Math.max(60, prev - 10));

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleClose = () => {
    trackEvent({
      action: 'reader_closed',
      category: 'engagement',
      label: `${bookId}_progress_${progress}`
    });
    
    if (onClose) onClose();
  };

  const handleMouseMove = () => {
    if (isFullscreen) setShowControls(true);
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'sepia':
        return {
          backgroundColor: '#F7F1E3',
          color: '#5B4636'
        };
      case 'dark':
        return {
          backgroundColor: '#0F172A',
          color: '#E2E8F0'
        };
      default:
        return {
          backgroundColor: '#FAFAFA',
          color: '#2D3748'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={getThemeStyles()}
      onMouseMove={handleMouseMove}
    >
      {/* Header Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/10 backdrop-blur-sm border-b border-gray-300/20 p-4"
          >
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              {/* Book Info */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-serif text-lg font-bold">{title}</h1>
                  <p className="text-sm opacity-70">por {author}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Theme Controls */}
                <div className="flex items-center gap-1 bg-black/10 rounded-lg p-1">
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'light' ? 'bg-black/20' : 'opacity-70 hover:opacity-100'
                    }`}
                    title="Tema claro"
                  >
                    ☀️
                  </button>
                  <button
                    onClick={() => changeTheme('sepia')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'sepia' ? 'bg-black/20' : 'opacity-70 hover:opacity-100'
                    }`}
                    title="Tema sepia"
                  >
                    🟫
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'dark' ? 'bg-black/20' : 'opacity-70 hover:opacity-100'
                    }`}
                    title="Tema oscuro"
                  >
                    🌙
                  </button>
                </div>

                {/* Font Size Controls */}
                <div className="flex items-center gap-1 bg-black/10 rounded-lg p-1">
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 rounded text-sm opacity-70 hover:opacity-100 transition-all"
                    title="Reducir texto"
                  >
                    A-
                  </button>
                  <span className="px-2 text-xs opacity-70 min-w-[3rem] text-center">
                    {fontSize}%
                  </span>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 rounded text-sm opacity-70 hover:opacity-100 transition-all"
                    title="Aumentar texto"
                  >
                    A+
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded opacity-70 hover:opacity-100 transition-all"
                  title={isFullscreen ? "Salir pantalla completa (F)" : "Pantalla completa (F)"}
                >
                  {isFullscreen ? "⤓" : "⤴"}
                </button>

                <button
                  onClick={handleClose}
                  className="p-2 rounded text-red-500 hover:text-red-400 transition-all"
                  title="Cerrar lector (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div 
          className="max-w-4xl mx-auto p-8 leading-relaxed"
          style={{ 
            fontSize: `${fontSize}%`,
            fontFamily: 'Georgia, "Times New Roman", serif'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Footer Info (only when controls visible) */}
      <AnimatePresence>
        {showControls && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/10 backdrop-blur-sm border-t border-gray-300/20 p-3"
          >
            <div className="flex items-center justify-center text-xs opacity-70 space-x-4">
              <span>📖 Lector Digital CiriWhispers</span>
              <span>•</span>
              <span>Esc para cerrar</span>
              <span>•</span>
              <span>F para pantalla completa</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}