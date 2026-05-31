'use client';

import { useState } from 'react';

export function QrCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="w-full rounded-full bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
    >
      {copied ? '✓ Link copiado' : 'Copiar link'}
    </button>
  );
}
