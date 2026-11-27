// src/app/[slug]/lectores/page.tsx — la cuenta del lector en la página de un autor (club de lectores).
// Con sesión: su estado (cartas, membresía), gestionar el pago y salir. Sin sesión: entrar, recibir las cartas
// y la membresía si el autor la ofrece. Lee la cookie del lector, así que siempre se pinta al momento.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCreatorAuthor, getReaderClub, getReaderMe } from '@/lib/creator';
import { readerToken } from '@/lib/reader-session';
import { ReaderAccountView } from '@/components/public/creator/ReaderAccountView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; aviso?: string; membresia?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getCreatorAuthor(slug);
  return { title: author ? `Lectores · ${author.name}` : 'Lectores', robots: { index: false } };
}

export default async function ReadersPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const author = await getCreatorAuthor(slug);
  if (!author) notFound();
  const token = await readerToken(slug);
  const [club, me] = await Promise.all([getReaderClub(slug), getReaderMe(slug, token)]);
  const flash = sp.ok ?? sp.aviso ?? (sp.membresia === 'cancelada' ? 'cancelada' : null);
  return <ReaderAccountView author={author} club={club} me={me} flash={flash ?? null} />;
}
