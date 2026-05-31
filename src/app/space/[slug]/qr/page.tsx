import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { QrCopyButton } from './QrCopyButton';

export default async function QRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/${slug}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 240, margin: 1 });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-sm px-6 py-12">
        <h1 className="text-2xl font-bold text-white">Tu código QR</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Comparte este código para que tus clientes accedan a tu catálogo.
        </p>

        <div className="mt-8 flex flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          {/* QR image */}
          <div className="rounded-xl bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`Código QR para ${publicUrl}`}
              width={216}
              height={216}
              className="block"
            />
          </div>

          {/* URL */}
          <p className="mt-5 break-all text-center text-xs text-neutral-500">{publicUrl}</p>

          {/* Actions */}
          <div className="mt-6 flex w-full flex-col gap-3">
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full border border-neutral-700 px-4 py-2.5 text-center text-sm font-medium text-neutral-300 transition hover:bg-neutral-800"
            >
              Ver mi página →
            </a>
            <QrCopyButton text={publicUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
