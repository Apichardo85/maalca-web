// src/app/[slug]/obras/[work]/[capitulo]/page.tsx
// Lector de un capítulo. El texto se pinta en el servidor (nunca un archivo descargable) y solo existe si
// maalca-api dice que hoy se puede leer. Un capítulo cerrado devuelve 404 desde el API: si el capítulo existe
// en el índice de la obra, se muestra la página "está en el libro / para miembros" (sin el texto, noindex);
// si no existe, notFound().
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor, getPublicChapter, getPublicWork, getReaderClub, langQuery, readingLang } from '@/lib/creator';
import { readerToken } from '@/lib/reader-session';
import { sanitizeLiteraryHtml } from '@/lib/sanitize-html';
import { ReaderView } from '@/components/public/creator/ReaderView';
import { LockedChapterView } from '@/components/public/creator/LockedChapterView';

interface PageProps {
  params: Promise<{ slug: string; work: string; capitulo: string }>;
  // ?lang=en: el capítulo traducido si está publicado; si no, el original con un aviso.
  searchParams: Promise<{ lang?: string | string[] }>;
}

function parseNumber(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, work, capitulo } = await params;
  const asked = readingLang((await searchParams).lang);
  const n = parseNumber(capitulo);
  if (n === null) return { title: 'Lector' };
  const [author, ch] = await Promise.all([getCreatorAuthor(slug), getPublicChapter(slug, work, n, null, asked)]);
  if (!author) return { title: 'Lector' };
  if (ch) {
    const base = `https://maalca.com/${slug}/obras/${ch.workSlug}/${ch.number}`;
    const hasEn = ch.languages?.includes('en') ?? false;
    return {
      title: `${ch.title} · ${ch.workTitle} · ${author.name}`,
      // Pedido en inglés sin traducción publicada: es el original, así que su URL canónica es la española.
      alternates: { canonical: `${base}${langQuery(ch.language ?? 'es')}`, ...(hasEn ? { languages: { es: base, en: `${base}?lang=en` } } : {}) },
    };
  }
  // Cerrado: título para quien lo comparte, pero fuera de los buscadores (no hay texto que indexar).
  const data = await getPublicWork(slug, work);
  const ref = data?.chapters.find((c) => c.number === n);
  if (!data || !ref) return { title: 'Lector' };
  return {
    title: `${ref.title} · ${data.work.title} · ${author.name}`,
    robots: { index: false, follow: true },
  };
}

export default async function ChapterPage({ params, searchParams }: PageProps) {
  const { slug, work, capitulo } = await params;
  const asked = readingLang((await searchParams).lang);
  const n = parseNumber(capitulo);
  if (n === null) notFound();
  const token = await readerToken(slug);
  const [author, ch] = await Promise.all([getCreatorAuthor(slug), getPublicChapter(slug, work, n, token, asked)]);
  if (!author) notFound();
  if (ch) {
    return <ReaderView signedIn={Boolean(token)} author={author} chapter={ch} asked={asked} html={sanitizeLiteraryHtml(ch.contentHtml ?? '')} />;
  }

  const [data, club] = await Promise.all([getPublicWork(slug, work, token, asked), getReaderClub(slug)]);
  const ref = data?.chapters.find((c) => c.number === n);
  if (!data || !ref || ref.readable) notFound();
  return <LockedChapterView author={author} data={data} chapter={ref} club={club} signedIn={Boolean(token)} />;
}
