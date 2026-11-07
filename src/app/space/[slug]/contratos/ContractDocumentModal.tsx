'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { type ContractDocument, readApiError } from '@/lib/receivables';

/**
 * Visor del contrato ya llenado. "Imprimir / PDF" usa el diálogo de impresión del navegador (que también guarda
 * como PDF): el CSS de impresión deja visible solo la hoja, sin el resto de la pantalla.
 */
export function ContractDocumentModal({ slug, contractId, onClose }: { slug: string; contractId: string; onClose: () => void }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [doc, setDoc] = useState<ContractDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/space/${slug}/contracts/${contractId}/document`, { cache: 'no-store' });
        if (!res.ok) throw new Error(await readApiError(res, getText('No se pudo cargar el contrato.', "Couldn't load the contract.")));
        const data: ContractDocument = await res.json();
        if (!cancelled) setDoc(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : getText('No se pudo cargar el contrato.', "Couldn't load the contract."));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, contractId]);

  const color = doc?.businessColor || '#045AFE';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 print:static print:bg-transparent print:p-0">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #contract-sheet, #contract-sheet * { visibility: visible !important; }
          #contract-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
        }
      `}</style>
      <div className="w-full max-w-2xl">
        <div className="mb-3 flex justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!doc}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
          >
            {getText('Imprimir / PDF', 'Print / PDF')}
          </button>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800">
            {getText('Cerrar', 'Close')}
          </button>
        </div>

        {error && <p className="rounded-xl bg-white p-6 text-sm text-red-600">{error}</p>}
        {!doc && !error && <p className="rounded-xl bg-white p-6 text-sm text-gray-500">{getText('Cargando…', 'Loading…')}</p>}

        {doc && (
          <div id="contract-sheet" className="rounded-xl bg-white p-8 text-gray-900 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b-2 pb-4" style={{ borderColor: color }}>
              <div className="flex items-center gap-3">
                {doc.businessLogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={doc.businessLogoUrl} alt="" className="h-14 w-auto max-w-[8rem] object-contain" />
                )}
                <div>
                  <p className="text-base font-bold" style={{ color }}>{doc.businessName}</p>
                  {doc.businessPhone && <p className="text-xs text-gray-600">{doc.businessPhone}</p>}
                  {doc.businessAddress && <p className="text-xs text-gray-600">{doc.businessAddress}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{getText('Fecha', 'Date')}</p>
                <p className="text-sm font-semibold">{doc.date}</p>
                {doc.contractNumber && <p className="mt-1 text-sm font-bold text-red-700">No. {doc.contractNumber}</p>}
              </div>
            </div>

            <h2 className="mt-6 text-center text-2xl font-extrabold tracking-wide">{doc.title}</h2>
            <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-relaxed">{doc.body}</p>

            <div className="mt-16 grid grid-cols-2 gap-10 text-center text-xs">
              <div>
                <div className="border-t border-gray-800 pt-1">{getText('Firma autorizada', 'Authorized signature')}</div>
              </div>
              <div>
                <div className="border-t border-gray-800 pt-1">{getText('Firma cliente', 'Customer signature')}</div>
                <div className="mt-0.5 text-gray-500">{doc.customerName}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
