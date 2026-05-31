'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export function QrCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="w-full rounded-full bg-gray-100 dark:bg-neutral-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-200 transition hover:bg-gray-200 dark:hover:bg-neutral-700"
    >
      {copied ? getText('✓ Link copiado', '✓ Link copied') : getText('Copiar link', 'Copy link')}
    </button>
  );
}
