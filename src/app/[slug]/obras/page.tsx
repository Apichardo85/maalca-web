import { redirect } from 'next/navigation';

// /{slug}/obras no tiene página propia: las obras viven en la portada del autor (sección #obras).
// Así los enlaces viejos a /ciriwhispers/obras siguen llegando a algo.
export default async function WorksIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/${slug}#obras`);
}
