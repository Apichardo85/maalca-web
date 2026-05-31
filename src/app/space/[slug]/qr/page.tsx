import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { QrPageContent } from './QrPageContent';

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

  return <QrPageContent slug={slug} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />;
}
