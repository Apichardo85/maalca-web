import { ImageResponse } from 'next/og';

// Imagen que se ve al compartir el link de un negocio (WhatsApp, iMessage, Facebook…): la
// identidad del NEGOCIO (portada, logo, nombre, dirección), no la de MaalCa. Next la sirve como
// og:image / twitter:image de /[slug] (el archivo tiene prioridad sobre la config de metadata).
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 60;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

interface CatalogAffiliate {
  name: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor?: string | null;
  address?: string | null;
}

// satori solo dibuja PNG/JPEG/GIF. Se descarga y se valida el tipo real (no la extensión) y se
// incrusta como data URI; si algo falla, esa imagen simplemente se omite en vez de romper la tarjeta.
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

const safeColor = (c?: string | null) => (c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#1f2a5c');

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let affiliate: CatalogAffiliate | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, {
      next: { revalidate: 60, tags: [`affiliate:${slug}`] },
    });
    if (res.ok) affiliate = (await res.json()).affiliate ?? null;
  } catch {
    affiliate = null;
  }

  if (!affiliate) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#12121e', color: '#ffffff', fontSize: 72, fontWeight: 700 }}>
          MaalCa
        </div>
      ),
      { ...size },
    );
  }

  const [cover, logo] = await Promise.all([loadImage(affiliate.coverImageUrl), loadImage(affiliate.logoUrl)]);
  const color = safeColor(affiliate.primaryColor);
  const name = affiliate.name.length > 48 ? `${affiliate.name.slice(0, 47)}…` : affiliate.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: `linear-gradient(135deg, ${color} 0%, #0b1020 100%)`,
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }} />
        )}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.78) 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 64, right: 64, bottom: 56, display: 'flex', alignItems: 'center' }}>
          {logo && (
            <div style={{ display: 'flex', width: 168, height: 168, borderRadius: 84, background: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 40, overflow: 'hidden', border: '4px solid #ffffff' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" width={152} height={152} style={{ width: 152, height: 152, objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: name.length > 28 ? 60 : 76, fontWeight: 800, color: '#ffffff', letterSpacing: -1, lineHeight: 1.05 }}>{name}</div>
            {affiliate.address && (
              <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.85)', marginTop: 14 }}>{affiliate.address}</div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
