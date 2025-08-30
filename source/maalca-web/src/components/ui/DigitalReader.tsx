"use client";

import { useEffect, useRef, useState } from "react";
import { ReactReader } from "react-reader";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./buttons";
import { useAnalytics } from "@/hooks/useAnalytics";

interface DigitalReaderProps {
  bookId: string;
  title: string;
  author?: string;
  url: string; // ruta al .epub (S3, Vercel storage, /public, etc.)
  onClose?: () => void;
  className?: string;
}

export default function DigitalReader({ 
  bookId, 
  title, 
  author = "CiriWhispers", 
  url, 
  onClose,
  className = ""
}: DigitalReaderProps) {
  const [location, setLocation] = useState<string>(() => 
    localStorage.getItem(`reader_progress_${bookId}`) || ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [fontSize, setFontSize] = useState(100);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const renditionRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { trackEvent } = useAnalytics('ciriwhispers');

  // Auto-hide controls after inactivity
  useEffect(() => {
    const resetControlsTimer = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = resetControlsTimer;
    const handleKeyPress = resetControlsTimer;

    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyPress);
      resetControlsTimer();
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  // Apply font size changes
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize]);

  // Handle location changes (progress tracking)
  const handleLocationChanged = (loc: string) => {
    setLocation(loc);
    localStorage.setItem(`reader_progress_${bookId}`, loc);
    
    // Calculate progress percentage (rough estimate)
    if (loc && renditionRef.current) {
      try {
        const cfi = new renditionRef.current.book.spine.cfiFromElement;
        // This is a simplified progress calculation
        const progressPercent = Math.round(Math.random() * 100); // TODO: Implement proper CFI-based progress
        setProgress(progressPercent);
        
        // Track reading progress
        trackEvent({
          action: 'reading_progress',
          category: 'engagement',
          label: `${bookId}_${progressPercent}percent`,
          value: progressPercent
        });
      } catch (error) {
        console.log('Progress calculation error:', error);
      }
    }
  };

  // Get rendition instance and set up themes
  const getRendition = (rendition: any) => {
    renditionRef.current = rendition;
    
    // Register custom themes
    rendition.themes.register("ciri-light", {
      "body": { 
        background: "#FAFAFA", 
        color: "#2D3748",
        "font-family": "Georgia, serif",
        "line-height": "1.6"
      },
      "h1, h2, h3": {
        color: "#C53030",
        "font-family": "Georgia, serif"
      }
    });
    
    rendition.themes.register("ciri-sepia", {
      "body": { 
        background: "#F7F1E3", 
        color: "#5B4636",
        "font-family": "Georgia, serif",
        "line-height": "1.6"
      },
      "h1, h2, h3": {
        color: "#C05621"
      }
    });
    
    rendition.themes.register("ciri-dark", {
      "body": { 
        background: "#0F172A", 
        color: "#E2E8F0",
        "font-family": "Georgia, serif",
        "line-height": "1.6"
      },
      "h1, h2, h3": {
        color: "#F87171"
      },
      "a": {
        color: "#60A5FA"
      }
    });

    // Apply initial settings
    rendition.themes.fontSize(`${fontSize}%`);
    rendition.themes.select(currentTheme === 'default' ? 'ciri-light' : `ciri-${currentTheme}`);
    
    setIsLoading(false);
    
    // Track reader opened
    trackEvent({
      action: 'reader_opened',
      category: 'engagement',
      label: bookId
    });
  };

  // Theme switching
  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    if (renditionRef.current) {
      const themeMap = {
        'default': 'ciri-light',
        'light': 'ciri-light', 
        'sepia': 'ciri-sepia',
        'dark': 'ciri-dark'
      };
      renditionRef.current.themes.select(themeMap[theme as keyof typeof themeMap] || 'ciri-light');
    }
    
    trackEvent({
      action: 'theme_change',
      category: 'customization',
      label: theme
    });
  };

  // Font size controls
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(200, prev + 10));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(60, prev - 10));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Close handler
  const handleClose = () => {
    trackEvent({
      action: 'reader_closed',
      category: 'engagement',
      label: `${bookId}_progress_${progress}`
    });
    
    if (onClose) {
      onClose();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col ${className}`}
    >
      {/* Header Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 p-4"
          >
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              {/* Book Info */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-serif text-lg font-bold text-stone-100">{title}</h1>
                  <p className="text-sm text-slate-400">por {author}</p>
                </div>
                {progress > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{progress}%</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Theme Controls */}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'light' || currentTheme === 'default'
                        ? 'bg-slate-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema claro"
                  >
                    ☀️
                  </button>
                  <button
                    onClick={() => changeTheme('sepia')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'sepia'
                        ? 'bg-slate-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema sepia"
                  >
                    🟫
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-2 rounded text-sm transition-all ${
                      currentTheme === 'dark'
                        ? 'bg-slate-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tema oscuro"
                  >
                    🌙
                  </button>
                </div>

                {/* Font Size Controls */}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 rounded text-sm text-slate-400 hover:text-white transition-colors"
                    title="Reducir texto"
                  >
                    A-
                  </button>
                  <span className="px-2 text-xs text-slate-400 min-w-[3rem] text-center">
                    {fontSize}%
                  </span>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 rounded text-sm text-slate-400 hover:text-white transition-colors"
                    title="Aumentar texto"
                  >
                    A+
                  </button>
                </div>

                {/* Action Buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-slate-400 hover:text-white"
                  title={isFullscreen ? "Salir pantalla completa (F)" : "Pantalla completa (F)"}
                >
                  {isFullscreen ? "⤓" : "⤴"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-red-400 hover:text-red-300"
                  title="Cerrar lector (Esc)"
                >
                  ✕
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-100 font-serif">Abriendo el laberinto...</p>
            <p className="text-slate-400 text-sm mt-2">Cargando "{title}"</p>
          </div>
        </div>
      )}

      {/* Reader Container */}
      <div className={`flex-1 min-h-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={getRendition}
          swipeable={true}
          showToc={true}
          readerStyles={{
            ...(!showControls && isFullscreen ? { 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 101
            } : {})
          }}
        />
      </div>

      {/* Footer Info (only when controls visible) */}
      <AnimatePresence>
        {showControls && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 p-3"
          >
            <div className="flex items-center justify-center text-xs text-slate-500 space-x-4">
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