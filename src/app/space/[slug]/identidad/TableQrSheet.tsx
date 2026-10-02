'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { generateBrandedQrDataUrl } from '@/lib/qr';

interface Props {
  publicUrl: string;
  businessName: string;
  logoUrl?: string | null;
  primaryColor: string;
}

const MAX_TABLES = 60;

// Hoja de QR por mesa (solo Restaurante): cada QR apunta a /{slug}?mesa=N, así el pedido llega
// con la mesa ya identificada. Se genera en el cliente y se imprime con el diálogo del navegador
// (o se guarda como PDF) — sin servicio extra.
export function TableQrSheet({ publicUrl, businessName, logoUrl, primaryColor }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [count, setCount] = useState(10);
  const [qrs, setQrs] = useState<{ table: number; src: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const n = Math.min(Math.max(count, 1), MAX_TABLES);
    Promise.all(
      Array.from({ length: n }, (_, i) => i + 1).map(async (table) => ({
        table,
        src: await generateBrandedQrDataUrl(`${publicUrl}?mesa=${table}`, {
          width: 400,
          darkColor: primaryColor,
          logoUrl,
          caption: `${businessName} · ${getText('Mesa', 'Table')} ${table}`,
        }),
      })),
    ).then((list) => {
      if (!cancelled) setQrs(list);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, publicUrl, businessName, logoUrl, primaryColor, language]);

  return (
    <section className="mx-auto mt-2 w-full max-w-5xl p-6 pt-0 print:max-w-none print:p-0">
      <div className="print:hidden">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('QR por mesa', 'Table QR codes')}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Imprime un QR por mesa: el cliente escanea, pide desde su teléfono y el pedido llega con el número de mesa.',
            'Print one QR per table: the guest scans, orders from their phone, and the order arrives with the table number.',
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-200">
            {getText('Número de mesas', 'Number of tables')}
            <input
              type="number"
              min={1}
              max={MAX_TABLES}
              value={count}
              onChange={(e) => setCount(Math.min(Math.max(Number(e.target.value) || 1, 1), MAX_TABLES))}
              className="w-20 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900"
          >
            {getText('Imprimir / guardar PDF', 'Print / save as PDF')}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:mt-0 print:grid-cols-2 print:gap-6">
        {qrs.map(({ table, src }) => (
          <div key={table} className="break-inside-avoid rounded-xl border border-gray-200 dark:border-neutral-800 bg-white p-2 print:border-gray-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${getText('Mesa', 'Table')} ${table}`} className="w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
