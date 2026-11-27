import { ImageResponse } from 'next/og';
import { getCreatorAuthor, getPublicWork, kindLabel } from '@/lib/creator';

// Imagen al compartir una obra (y sus capítulos): portada del libro, título y autor, en la piel del espacio
// de autor. Sin este archivo la obra heredaría la tarjeta del autor de [slug]/opengraph-image.tsx.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 300;

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

// satori solo dibuja PNG/JPEG/GIF: se valida el tipo real y se incrusta; si falla, la tarjeta sale sin portada.
async function loadImage(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), next: { revalidate: 300 } });
    if (!res.ok) return null;
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return null;
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string; work: string }> }) {
  const { slug, work } = await params;
  const [author, data] = await Promise.all([getCreatorAuthor(slug), getPublicWork(slug, work)]);
  const accent = author?.primaryColor && /^#[0-9a-f]{6}$/i.test(author.primaryColor) ? author.primaryColor : '#8E0F10';

  if (!author || !data) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#141318' }} />,
      { ...size },
    );
  }

  const w = data.work;
  const cover = await loadImage(w.coverUrl);
  const title = w.title.length > 60 ? `${w.title.slice(0, 59)}…` : w.title;
  const kicker = [kindLabel(w.kind, 'es'), w.imprint, w.year].filter(Boolean).join(' · ');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#141318', padding: 56, alignItems: 'center' }}>
        {cover && (
          <img src={cover} alt="" width={340} height={518} style={{ width: 340, height: 518, objectFit: 'cover', marginRight: 56, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', width: 64, height: 3, background: accent, marginBottom: 28 }} />
          {kicker && <div style={{ display: 'flex', fontSize: 28, color: '#C9A97A', marginBottom: 18 }}>{kicker}</div>}
          <div style={{ display: 'flex', fontSize: title.length > 28 ? 64 : 84, color: '#F2EDE4', lineHeight: 1.05, fontStyle: 'italic' }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#B9B2A6', marginTop: 28 }}>{author.name}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
