import { redirect } from 'next/navigation';

// Personal + Equipo se unificaron en una sola pantalla — ver /equipo/page.tsx.
// Esta ruta se conserva solo para no romper enlaces/bookmarks viejos.
export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/space/${slug}/equipo`);
}
