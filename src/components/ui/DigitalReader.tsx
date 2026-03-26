"use client";

import { useEffect, useRef, useState } from "react";
import { ReactReader } from "react-reader";
import { Button } from "./buttons";
import { useAnalytics } from "@/hooks/useAnalytics";

interface DigitalReaderProps {
  bookId: string;
  title: string;
  author?: string;
  url: string;
  onClose?: () => void;
  className?: string;
}

export default function DigitalReader({
  bookId,
  title,
  author = "CiriWhispers",
  url,
  onClose,
  className = "",
}: DigitalReaderProps) {
  const [location, setLocation] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(`reader_progress_${bookId}`) || ""
      : ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [fontSize, setFontSize] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renditionRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { trackEvent } = useAnalytics("ciriwhispers");

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const reset = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    document.addEventListener("mousemove", reset);
    document.addEventListener("keydown", reset);
    reset();
    return () => {
      document.removeEventListener("mousemove", reset);
      document.removeEventListener("keydown", reset);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  // Font size
  useEffect(() => {
    renditionRef.current?.themes.fontSize(`${fontSize}%`);
  }, [fontSize]);

  const handleLocationChanged = (loc: string) => {
    setLocation(loc);
    localStorage.setItem(`reader_progress_${bookId}`, loc);
  };

  const getRendition = (rendition: any) => {
    renditionRef.current = rendition;
    rendition.themes.register("ciri-light", {
      body: { background: "#FAFAFA", color: "#2D3748", "font-family": "Georgia, serif", "line-height": "1.6" },
      "h1, h2, h3": { color: "#C53030" },
    });
    rendition.themes.register("ciri-sepia", {
      body: { background: "#F7F1E3", color: "#5B4636", "font-family": "Georgia, serif", "line-height": "1.6" },
      "h1, h2, h3": { color: "#C05621" },
    });
    rendition.themes.register("ciri-dark", {
      body: { background: "#0F172A", color: "#E2E8F0", "font-family": "Georgia, serif", "line-height": "1.6" },
      "h1, h2, h3": { color: "#F87171" },
      a: { color: "#60A5FA" },
    });
    rendition.themes.fontSize(`${fontSize}%`);
    rendition.themes.select(`ciri-${currentTheme}`);
    setIsLoading(false);
    trackEvent({ action: "reader_opened", category: "engagement", label: bookId });
  };

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    renditionRef.current?.themes.select(`ciri-${theme}`);
  };

  const handleClose = () => {
    trackEvent({ action: "reader_closed", category: "engagement", label: bookId });
    onClose?.();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "f" || e.key === "F") setIsFullscreen((p) => !p);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col transition-opacity duration-300 ${className}`}
    >
      {/* Header */}
      <div
        className={`bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 p-4 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="font-serif text-lg font-bold text-stone-100">{title}</h1>
            <p className="text-sm text-slate-400">por {author}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Themes */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              {(["light", "sepia", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => changeTheme(t)}
                  className={`p-2 rounded text-sm transition-all ${
                    currentTheme === t ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t === "light" ? "☀️" : t === "sepia" ? "🟫" : "🌙"}
                </button>
              ))}
            </div>

            {/* Font size */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setFontSize((p) => Math.max(60, p - 10))}
                className="p-2 rounded text-sm text-slate-400 hover:text-white"
              >
                A-
              </button>
              <span className="px-2 text-xs text-slate-400 min-w-[3rem] text-center">{fontSize}%</span>
              <button
                onClick={() => setFontSize((p) => Math.min(200, p + 10))}
                className="p-2 rounded text-sm text-slate-400 hover:text-white"
              >
                A+
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen((p) => !p)}
              className="text-slate-400 hover:text-white"
            >
              {isFullscreen ? "⤓" : "⤴"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-red-400 hover:text-red-300">
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-100 font-serif">Abriendo el laberinto...</p>
            <p className="text-slate-400 text-sm mt-2">Cargando &ldquo;{title}&rdquo;</p>
          </div>
        </div>
      )}

      {/* Reader */}
      <div className={`flex-1 min-h-0 transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={getRendition}
          swipeable={true}
          showToc={true}
        />
      </div>

      {/* Footer */}
      {showControls && !isFullscreen && (
        <div className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 p-3 transition-opacity duration-300">
          <div className="flex items-center justify-center text-xs text-slate-500 space-x-4">
            <span>📖 Lector Digital CiriWhispers</span>
            <span>•</span>
            <span>Esc para cerrar</span>
            <span>•</span>
            <span>F para pantalla completa</span>
          </div>
        </div>
      )}
    </div>
  );
}
