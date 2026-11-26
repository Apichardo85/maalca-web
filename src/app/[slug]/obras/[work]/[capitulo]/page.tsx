// src/app/[slug]/obras/[work]/[capitulo]/page.tsx
// Lector de un capítulo. El texto se pinta en el servidor (nunca un archivo descargable) y solo existe si
// maalca-api dice que hoy se puede leer: un capítulo cerrado devuelve 404 desde el API y aquí notFound().
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor, getPublicChapter } from '@/lib/creator';
import { sanitizeLiteraryHtml } from '@/lib/sanitize-html';
import { ReaderView } from '@/components/public/creator/ReaderView';

interface PageProps {
  params: Promise<{ slug: string; work: string; capitulo: string }>;
}

function parseNumber(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, work, capitulo } = await params;
  const n = parseNumber(capitulo);
  if (n === null) return { title: 'Lector' };
  const [author, ch] = await Promise.all([getCreatorAuthor(slug), getPublicChapter(slug, work, n)]);
  if (!author || !ch) return { title: 'Lector' };
  return {
    title: `${ch.title} · ${ch.workTitle} · ${author.name}`,
    alternates: { canonical: `https://maalca.com/${slug}/obras/${ch.workSlug}/${ch.number}` },
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, work, capitulo } = await params;
  const n = parseNumber(capitulo);
  if (n === null) notFound();
  const [author, ch] = await Promise.all([getCreatorAuthor(slug), getPublicChapter(slug, work, n)]);
  if (!author || !ch) notFound();
  return <ReaderView author={author} chapter={ch} html={sanitizeLiteraryHtml(ch.contentHtml ?? '')} />;
}
