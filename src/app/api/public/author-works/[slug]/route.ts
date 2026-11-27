import { NextResponse } from 'next/server';
import { getPublicWorks } from '@/lib/creator';

// Obras publicadas de un autor para páginas de MaalCa que las muestran del lado del cliente (/editorial,
// /ecosistema). Mismo dato que la página del autor; [] si el autor no existe o no está publicado.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const works = (await getPublicWorks(slug)) ?? [];
  return NextResponse.json(works, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
