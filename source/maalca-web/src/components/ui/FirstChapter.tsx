"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

interface FirstChapterProps {
  title: string;
  content: string;
}

export default function FirstChapter({ title, content }: FirstChapterProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button 
        className="w-full border border-red-600/50 text-red-400 hover:bg-red-600/10 rounded-md px-3 py-2 text-sm transition-colors duration-300 font-serif"
        onClick={() => setOpen(true)}
      >
        {t('works.readChapter')}
      </button>
      
      {open && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="max-w-4xl w-full bg-slate-900 text-stone-100 rounded-2xl border border-red-800/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-800/20">
              <div>
                <h3 className="font-serif text-2xl font-bold text-red-400">{title}</h3>
                <p className="text-slate-400 text-sm">{t('chapter.preview')}</p>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-slate-400 hover:text-red-400 text-2xl font-light transition-colors duration-300"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-lg prose-invert max-w-none">
                <div className="font-serif leading-relaxed text-slate-200 whitespace-pre-line">
                  {content}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-red-800/20 p-6 bg-slate-800/50">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-slate-400 text-sm italic">
                  {t('chapter.liked')}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
                  >
                    {t('chapter.close')}
                  </button>
                  <a 
                    href="https://www.amazon.com/Amaranta-Ciriaco-Alejandro-Pichardo-Santana/dp/841915122X"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-stone-100 rounded-lg text-sm transition-colors font-medium"
                  >
                    {t('chapter.buyAmazon')}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}