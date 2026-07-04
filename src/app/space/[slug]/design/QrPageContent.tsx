'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { QrCopyButton } from './QrCopyButton';

interface Props {
  slug: string;
  publicUrl: string;
  qrDataUrl: string;
}

export function QrPageContent({ slug, publicUrl, qrDataUrl }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-sm px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Diseñar mi Espacio', 'Design my Space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {getText('Tu código QR', 'Your QR code')}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Comparte este código para que tus clientes accedan a tu catálogo.',
            'Share this code so your customers can access your catalog.',
          )}
        </p>

        <div className="mt-8 flex flex-col items-center rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm dark:shadow-none">
          {/* QR image — white bg always so QR is scannable */}
          <div className="rounded-xl bg-white p-3 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`${getText('Código QR para', 'QR code for')} ${publicUrl}`}
              width={216}
              height={216}
              className="block"
            />
          </div>

          {/* URL */}
          <p className="mt-5 break-all text-center text-xs text-gray-400 dark:text-neutral-500">
            {publicUrl}
          </p>

          {/* Actions */}
          <div className="mt-6 flex w-full flex-col gap-3">
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full border border-gray-200 dark:border-neutral-700 px-4 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-neutral-300 transition hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              {getText('Ver mi página →', 'View my page →')}
            </a>
            <QrCopyButton text={publicUrl} />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-neutral-500">
          {getText(
            'Más secciones (Configuración, Canales) llegan próximamente aquí.',
            'More sections (Settings, Channels) are coming here soon.',
          )}
        </p>
      </div>
    </div>
  );
}
