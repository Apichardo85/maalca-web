'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { generateQrDataUrl, generateQrSvgDataUrl } from '@/lib/qr';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { QrCopyButton } from './QrCopyButton';
import { BusinessCard } from './BusinessCard';

interface Props {
  slug: string;
  publicUrl: string;
  qrTargetUrl: string;
  qrDataUrl: string;
  primaryColor: string;
  business: PublicTemplateProps['business'];
}

export function QrTab({ slug, publicUrl, qrTargetUrl, qrDataUrl, primaryColor, business }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  // qrDataUrl (server prop) is the plain black fallback shown on first paint — generateQrDataUrl
  // is async, so it can't run synchronously during render. Re-generated here in the business's
  // primaryColor once mounted, and again whenever the color changes (swatch is a live preview).
  const [dataUrl, setDataUrl] = useState(qrDataUrl);
  const [svgDataUrl, setSvgDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(qrTargetUrl, { darkColor: primaryColor }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    generateQrSvgDataUrl(qrTargetUrl, { darkColor: primaryColor }).then((url) => {
      if (!cancelled) setSvgDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [qrTargetUrl, primaryColor]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="self-start text-sm font-semibold text-gray-900 dark:text-white">
        {getText('Tu código QR', 'Your QR code')}
      </h2>
      <p className="mt-1 self-start text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Comparte este código para que tus clientes accedan a tu catálogo.',
          'Share this code so your customers can access your catalog.',
        )}
      </p>

      <div className="mt-6 flex flex-col items-center rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <div className="rounded-xl bg-white p-3 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={`${getText('Código QR para', 'QR code for')} ${publicUrl}`}
            width={216}
            height={216}
            className="block"
          />
        </div>

        <p className="mt-5 break-all text-center text-xs text-gray-400 dark:text-neutral-500">
          {publicUrl}
        </p>

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
          <div className="flex gap-3">
            <a
              href={dataUrl}
              download={`qr-${slug}.png`}
              className="flex-1 rounded-full bg-gray-100 dark:bg-neutral-800 px-4 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-neutral-200 transition hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              {getText('Descargar PNG', 'Download PNG')}
            </a>
            <a
              href={svgDataUrl ?? undefined}
              download={`qr-${slug}.svg`}
              aria-disabled={!svgDataUrl}
              className={`flex-1 rounded-full bg-gray-100 dark:bg-neutral-800 px-4 py-2.5 text-center text-sm font-medium text-gray-700 dark:text-neutral-200 transition hover:bg-gray-200 dark:hover:bg-neutral-700 ${
                svgDataUrl ? '' : 'pointer-events-none opacity-50'
              }`}
            >
              {getText('Descargar SVG', 'Download SVG')}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full">
        <h2 className="self-start text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Tarjeta de negocio', 'Business card')}
        </h2>
        <p className="mt-1 self-start text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Una tarjeta lista para compartir con tu logo, contacto y QR.',
            'A ready-to-share card with your logo, contact info and QR.',
          )}
        </p>
        <div className="mt-6 flex justify-center">
          <BusinessCard business={business} qrDataUrl={dataUrl} />
        </div>
      </div>
    </div>
  );
}
