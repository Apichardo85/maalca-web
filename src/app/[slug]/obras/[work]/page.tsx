// src/app/[slug]/obras/[work]/page.tsx
// Ficha pública de una obra de un autor (businessType 'creator'): portada, sinopsis, índice y dónde comprarla.
// Qué capítulos se pueden leer lo decide maalca-api (WorkService.CanRead); los cerrados salen con candado.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor, getPublicWork } from '@/lib/creator';
import { stripRichTextToPlain } from '@/lib/sanitize-html';
import { WorkView } from '@/components/public/creator/WorkView';

interface PageProps {
  params: Promise<{ slug: string; work: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, work } = await params;
  const [author, data] = await Promise.all([getCreatorAuthor(slug), getPublicWork(slug, work)]);
  if (!author || !data) return { title: 'Obra' };
  const title = `${data.work.title} · ${author.name}`;
  const description = stripRichTextToPlain(data.work.synopsis ?? '').slice(0, 200) || author.name;
  const url = `https://maalca.com/${slug}/obras/${data.work.slug}`;
  return {
    title,
    description,
    authors: [{ name: author.name }],
    alternates: { canonical: url },
    openGraph: {
      type: 'book',
      url,
      siteName: author.name,
      title,
      description,
      ...(data.work.coverUrl ? { images: [{ url: data.work.coverUrl }] } : {}),
    },
    twitter: { card: data.work.coverUrl ? 'summary_large_image' : 'summary', title, description },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug, work } = await params;
  const [author, data] = await Promise.all([getCreatorAuthor(slug), getPublicWork(slug, work)]);
  if (!author || !data) notFound();
  return <WorkView author={author} data={data} />;
}
