"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface ProfessionalReaderProps {
  bookId: string;
  title: string;
  author: string;
  content: string;
  onClose: () => void;
}

interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  backgroundColor: string;
  textColor: string;
  theme: 'light' | 'dark' | 'sepia';
  margin: number;
}

interface Bookmark {
  id: string;
  chapter: number;
  position: number;
  timestamp: Date;
  note?: string;
}

interface Highlight {
  id: string;
  text: string;
  position: number;
  color: string;
  note?: string;
  timestamp: Date;
}

export default function ProfessionalReader({ 
  bookId, 
  title, 
  author, 
  content, 
  onClose 
}: ProfessionalReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    fontFamily: 'serif',
    lineHeight: 1.6,
    backgroundColor: '#0f172a',
    textColor: '#e2e8f0',
    theme: 'dark',
    margin: 60
  });

  const themes = {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      accent: '#dc2626',
      headerBg: '#f8fafc',
      borderColor: '#e2e8f0',
      sidebarBg: 'rgba(248, 250, 252, 0.95)',
      buttonBg: '#f1f5f9',
      buttonHover: '#e2e8f0'
    },
    dark: {
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
      accent: '#dc2626',
      headerBg: '#1e293b',
      borderColor: '#334155',
      sidebarBg: 'rgba(30, 41, 59, 0.95)',
      buttonBg: '#334155',
      buttonHover: '#475569'
    },
    sepia: {
      backgroundColor: '#f7f0e4',
      textColor: '#8b4513',
      accent: '#b45309',
      headerBg: '#f0e6d2',
      borderColor: '#d4c5a0',
      sidebarBg: 'rgba(240, 230, 210, 0.95)',
      buttonBg: '#e8ddc7',
      buttonHover: '#ddd2b8'
    }
  };

  const fontFamilies = {
    serif: 'Playfair Display, serif',
    'sans-serif': 'Inter, sans-serif',
    mono: 'Monaco, monospace'
  };

  // Parse content into chapters
  const chapters = content.split(/(?=<h[1-2])/g).filter(chapter => chapter.trim());

  // Update progress based on scroll
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    setProgress(newProgress);
  }, []);

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle text selection for highlighting
  const handleTextSelection = useCallback((e: MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString());
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  }, []);

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      element.addEventListener('mouseup', handleTextSelection);
      return () => element.removeEventListener('mouseup', handleTextSelection);
    }
  }, [handleTextSelection]);

  // Bookmark functions
  const addBookmark = () => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      chapter: currentChapter,
      position: progress,
      timestamp: new Date()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  // Highlight functions
  const addHighlight = (color: string) => {
    if (!selectedText) return;
    
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: selectedText,
      position: progress,
      color,
      timestamp: new Date()
    };
    
    setHighlights(prev => [...prev, newHighlight]);
    setShowHighlightMenu(false);
    setSelectedText('');
  };

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(highlight => highlight.id !== id));
  };

  // Settings functions
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const applyTheme = (theme: 'light' | 'dark' | 'sepia') => {
    const themeColors = themes[theme];
    updateSettings({
      theme,
      backgroundColor: themeColors.backgroundColor,
      textColor: themeColors.textColor
    });
  };

  const getCurrentTheme = () => themes[settings.theme];

  // Navigation functions
  const goToChapter = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      goToChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      goToChapter(currentChapter - 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        prevChapter();
      } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        nextChapter();
      } else if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        addBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentChapter, chapters.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
    >
      <div 
        ref={readerRef}
        className="h-full flex flex-col"
        style={{ 
          backgroundColor: settings.backgroundColor,
          color: settings.textColor
        }}
      >
        {/* Header */}
        <header 
          className="flex-shrink-0 px-6 py-4 border-b"
          style={{ 
            backgroundColor: getCurrentTheme().headerBg,
            borderColor: getCurrentTheme().borderColor
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="transition-colors"
                style={{
                  color: getCurrentTheme().textColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = getCurrentTheme().accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = getCurrentTheme().textColor;
                }}
              >
                ← Cerrar
              </Button>
              <div>
                <h1 className="font-serif text-xl font-bold">{title}</h1>
                <p className="text-sm text-slate-400">{author}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Progress */}
              <div 
                className="text-sm"
                style={{ color: getCurrentTheme().textColor + '80' }}
              >
                {Math.round(progress)}%
              </div>

              {/* Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="transition-colors hover:bg-opacity-20"
                style={{
                  color: getCurrentTheme().textColor + '80',
                  backgroundColor: 'transparent'
                }}
              >
                📚
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHighlights(!showHighlights)}
                className="transition-colors hover:bg-opacity-20"
                style={{
                  color: getCurrentTheme().textColor + '80',
                  backgroundColor: 'transparent'
                }}
              >
                🖍️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={addBookmark}
                className="transition-colors hover:bg-opacity-20"
                style={{
                  color: getCurrentTheme().textColor + '80',
                  backgroundColor: 'transparent'
                }}
              >
                📖
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="transition-colors hover:bg-opacity-20"
                style={{
                  color: getCurrentTheme().textColor + '80',
                  backgroundColor: 'transparent'
                }}
              >
                ⚙️
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            className="w-full rounded-full h-1 mt-3"
            style={{ backgroundColor: getCurrentTheme().borderColor }}
          >
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: getCurrentTheme().accent
              }}
            />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 relative">
            <div 
              ref={contentRef}
              className="h-full overflow-y-auto px-4 py-8"
              style={{ 
                fontSize: `${settings.fontSize}px`,
                fontFamily: fontFamilies[settings.fontFamily as keyof typeof fontFamilies],
                lineHeight: settings.lineHeight,
                paddingLeft: `${settings.margin}px`,
                paddingRight: `${settings.margin}px`
              }}
            >
              <div 
                className="max-w-4xl mx-auto prose prose-lg"
                style={{ color: settings.textColor }}
                dangerouslySetInnerHTML={{ 
                  __html: chapters[currentChapter] || '<p>Capítulo no disponible</p>' 
                }}
              />
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevChapter}
                disabled={currentChapter === 0}
                className="backdrop-blur-sm border transition-colors"
                style={{
                  backgroundColor: getCurrentTheme().buttonBg + 'CC',
                  borderColor: getCurrentTheme().borderColor,
                  color: getCurrentTheme().textColor
                }}
              >
                ← Anterior
              </Button>
              <span 
                className="text-sm backdrop-blur-sm px-3 py-1 rounded border"
                style={{
                  backgroundColor: getCurrentTheme().buttonBg + 'CC',
                  borderColor: getCurrentTheme().borderColor,
                  color: getCurrentTheme().textColor + '80'
                }}
              >
                {currentChapter + 1} / {chapters.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextChapter}
                disabled={currentChapter === chapters.length - 1}
                className="backdrop-blur-sm border transition-colors"
                style={{
                  backgroundColor: getCurrentTheme().buttonBg + 'CC',
                  borderColor: getCurrentTheme().borderColor,
                  color: getCurrentTheme().textColor
                }}
              >
                Siguiente →
              </Button>
            </div>
          </main>

          {/* Sidebar Panels */}
          <AnimatePresence>
            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 p-6 overflow-y-auto"
              >
                <h3 className="font-serif text-lg font-bold mb-6">Configuración</h3>
                
                {/* Theme */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Tema</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(themes).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => applyTheme(theme as 'light' | 'dark' | 'sepia')}
                        className={`p-2 rounded text-xs capitalize transition-colors ${
                          settings.theme === theme 
                            ? 'text-white' 
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor: settings.theme === theme 
                            ? getCurrentTheme().accent 
                            : getCurrentTheme().buttonBg,
                          color: settings.theme === theme 
                            ? '#ffffff' 
                            : getCurrentTheme().textColor
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Tamaño de fuente: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Fuente</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    className="w-full border rounded px-3 py-2 transition-colors"
                    style={{
                      backgroundColor: getCurrentTheme().buttonBg,
                      borderColor: getCurrentTheme().borderColor,
                      color: getCurrentTheme().textColor
                    }}
                  >
                    <option value="serif">Serif (Playfair)</option>
                    <option value="sans-serif">Sans-serif (Inter)</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>

                {/* Line Height */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Interlineado: {settings.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Margins */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Márgenes: {settings.margin}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="10"
                    value={settings.margin}
                    onChange={(e) => updateSettings({ margin: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Bookmarks Panel */}
            {showBookmarks && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 p-6 overflow-y-auto"
              >
                <h3 className="font-serif text-lg font-bold mb-6">Marcadores</h3>
                
                {bookmarks.length === 0 ? (
                  <p className="text-slate-400 text-sm">No hay marcadores aún</p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="bg-slate-700/50 p-3 rounded border border-slate-600/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Capítulo {bookmark.chapter + 1}
                          </span>
                          <button
                            onClick={() => removeBookmark(bookmark.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-xs text-slate-400">
                          {Math.round(bookmark.position)}% - {bookmark.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Highlights Panel */}
            {showHighlights && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 p-6 overflow-y-auto"
              >
                <h3 className="font-serif text-lg font-bold mb-6">Subrayados</h3>
                
                {highlights.length === 0 ? (
                  <p className="text-slate-400 text-sm">No hay subrayados aún</p>
                ) : (
                  <div className="space-y-3">
                    {highlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="bg-slate-700/50 p-3 rounded border border-slate-600/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: highlight.color }}
                          />
                          <button
                            onClick={() => removeHighlight(highlight.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm mb-2 italic">"{highlight.text}"</p>
                        <div className="text-xs text-slate-400">
                          {highlight.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Highlight Menu */}
        <AnimatePresence>
          {showHighlightMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bg-slate-800 border border-slate-600 rounded-lg p-2 z-50"
              style={{
                left: menuPosition.x - 100,
                top: menuPosition.y - 60
              }}
            >
              <div className="flex space-x-2">
                {['#fbbf24', '#ef4444', '#22c55e', '#3b82f6'].map((color) => (
                  <button
                    key={color}
                    onClick={() => addHighlight(color)}
                    className="w-6 h-6 rounded-full border-2 border-white/20 hover:border-white/40"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}