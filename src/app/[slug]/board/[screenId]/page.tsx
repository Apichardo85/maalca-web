// Fase 9 Etapa B — pantalla adicional del negocio (segunda TV, pantalla solo-comerciales,
// una en inglés, etc.). Reutiliza toda la resolución y el markup de /{slug}/board — la única
// diferencia es que el fetch pasa screenId, y el backend resuelve los overrides de esa
// pantalla puntual (o null/404 si no existe o es de otro afiliado).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCatalog, renderBoard, RESERVED } from '../page';

interface PageProps {
  params: Promise<{ slug: string; screenId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, screenId } = await params;
  if (RESERVED.has(slug)) return { title: 'MaalCa' };
  const data = await getCatalog(slug, screenId);
  return { title: data ? `${data.affiliate.name} — Menu` : 'MaalCa' };
}

export default async function ScreenBoardPage({ params }: PageProps) {
  const { slug, screenId } = await params;
  if (RESERVED.has(slug)) notFound();

  const data = await getCatalog(slug, screenId);
  if (!data) notFound();

  return renderBoard(slug, data);
}
