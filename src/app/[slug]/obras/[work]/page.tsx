// src/app/[slug]/obras/[work]/page.tsx
// Ficha pública de una obra de un autor (businessType 'creator'): portada, sinopsis, índice y dónde comprarla.
// Qué capítulos se pueden leer lo decide maalca-api (WorkService.CanRead); los cerrados salen con candado.
// ?lang=en: índice con lo traducido y publicado (cada idioma con su URL, enlazadas con hreflang).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor, getPublicWork, getReaderClub, langQuery, readingLang } from '@/lib/creator';
import { readerToken } from '@/lib/reader-session';
import { stripRichTextToPlain } from '@/lib/sanitize-html';
import { WorkView } from '@/components/public/creator/WorkView';

interface PageProps {
  params: Promise<{ slug: string; work: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, work } = await params;
  const asked = readingLang((await searchParams).lang);
  const [author, data] = await Promise.all([getCreatorAuthor(slug), getPublicWork(slug, work, null, asked)]);
  if (!author || !data) return { title: 'Obra' };
  const lang = data.language ?? 'es';
  const en = lang === 'en';
  const title = `${(en && data.work.titleEn) || data.work.title} · ${author.name}`;
  const description = stripRichTextToPlain((en && data.work.synopsisEn) || data.work.synopsis || '').slice(0, 200) || author.name;
  const base = `https://maalca.com/${slug}/obras/${data.work.slug}`;
  const url = `${base}${langQuery(lang)}`;
  const hasEn = data.languages?.includes('en') ?? false;
  return {
    title,
    description,
    authors: [{ name: author.name }],
    alternates: { canonical: url, ...(hasEn ? { languages: { es: base, en: `${base}?lang=en` } } : {}) },
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

export default async function WorkPage({ params, searchParams }: PageProps) {
  const { slug, work } = await params;
  const asked = readingLang((await searchParams).lang);
  const token = await readerToken(slug);
  const [author, data, club] = await Promise.all([getCreatorAuthor(slug), getPublicWork(slug, work, token, asked), getReaderClub(slug)]);
  if (!author || !data) notFound();
  return <WorkView author={author} data={data} club={club} signedIn={Boolean(token)} />;
}
