// src/app/[slug]/lectores/baja/page.tsx — darse de baja de las cartas. Pide un clic (no se da de baja solo al
// abrir el enlace: los filtros de correo abren enlaces por su cuenta y darían de baja a gente sin querer).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor } from '@/lib/creator';
import { UnsubscribeView } from '@/components/public/creator/UnsubscribeView';

export const metadata: Metadata = { title: 'Baja de las cartas', robots: { index: false } };

export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ t?: string }> }) {
  const { slug } = await params;
  const { t } = await searchParams;
  const author = await getCreatorAuthor(slug);
  if (!author) notFound();
  return <UnsubscribeView author={author} token={t ?? ''} />;
}
