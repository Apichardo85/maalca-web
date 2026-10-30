import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { optimizeImage } from '@/lib/optimize-image';
import { SITE_MEDIA_BY_KEY } from '@/lib/site-content';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Subida de medios del sitio (Fase 2 del Panel de Sitio): video/poster del hero y de la home.
// Mismo bucket que los medios de pantallas (screen-ads/upload-media); cambia la ruta
// (platform/site/...), el tope de tamaño y que solo acepta los slots de lib/site-content.
// Devuelve la URL pública; guardarla como override (PlatformContent) lo hace el editor vía
// PUT /api/ops/site-content/{key}, que sí exige Owner.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
// Tope de 4 MB: Vercel rechaza cuerpos de más de ~4.5 MB en funciones, y la home debe ser liviana
// (el comercial del hero pesa ~1 MB). Las imágenes se re-comprimen a WebP 1920 px al guardar.
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Solo personal de plataforma: el listado de /ops exige rol de plataforma en el API.
  const gate = await fetch(`${API}/api/ops/site-content`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!gate.ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const slotKey = String(formData.get('slot') ?? '');
  const lang = String(formData.get('lang') ?? '');
  const slot = SITE_MEDIA_BY_KEY[slotKey];
  if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (!slot || (lang !== 'es' && lang !== 'en')) {
    return NextResponse.json({ error: 'invalid_slot' }, { status: 400 });
  }

  const isVideo = slot.kind === 'video';
  const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: isVideo ? 'Este campo es de video (MP4 o WebM).' : 'Este campo es de imagen (JPEG, PNG o WebP).' },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `${isVideo ? 'El video' : 'La imagen'} no puede superar 4MB. Comprímelo y vuelve a subirlo.` },
      { status: 400 },
    );
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const out = isVideo
    ? { buffer: raw, contentType: file.type, ext: file.type.split('/')[1] }
    : await optimizeImage(raw, file.type, 1920);
  const path = `platform/site/${slotKey}-${lang}-${Date.now()}.${out.ext}`;

  const supabase = supabaseAdmin();
  const { error } = await supabase.storage
    .from('affiliate-media')
    .upload(path, out.buffer, { contentType: out.contentType, upsert: true, cacheControl: '31536000' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('affiliate-media').getPublicUrl(path);
  return NextResponse.json({ url: publicUrl });
}
