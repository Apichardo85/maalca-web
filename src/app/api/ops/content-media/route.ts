import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { optimizeImage } from '@/lib/optimize-image';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Subida manual de la imagen o el video de una pieza de contenido (estudio de contenido, /ops/contenido).
// Mismo bucket y mismo patrón que /api/ops/site-media. Devuelve la URL pública; guardarla en la pieza
// lo hace la bandeja con PUT /api/ops/content/{id}.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
// Vercel rechaza cuerpos de más de ~4.5 MB en funciones. Un video más pesado se sube a otro lado y se pega su enlace.
const MAX_SIZE = 4 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Solo personal de plataforma: este listado exige ser admin en el API.
  const gate = await fetch(`${API}/api/ops/agents`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!gate.ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const affiliateId = String(formData.get('affiliateId') ?? '');
  if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (!UUID.test(affiliateId)) return NextResponse.json({ error: 'invalid_affiliate' }, { status: 400 });

  const isVideo = VIDEO_TYPES.includes(file.type);
  if (!isVideo && !IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no admitido. Usa JPEG, PNG o WebP, o un video MP4 o WebM.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `${isVideo ? 'El video' : 'La imagen'} no puede superar 4MB. Comprímelo, o súbelo a otro lado y pega el enlace.` },
      { status: 400 },
    );
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const out = isVideo
    ? { buffer: raw, contentType: file.type, ext: file.type.split('/')[1] }
    : await optimizeImage(raw, file.type, 1920);
  const path = `content/${affiliateId}/${Date.now()}.${out.ext}`;

  const supabase = supabaseAdmin();
  const { error } = await supabase.storage
    .from('affiliate-media')
    .upload(path, out.buffer, { contentType: out.contentType, upsert: true, cacheControl: '31536000' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('affiliate-media').getPublicUrl(path);
  return NextResponse.json({ url: publicUrl, kind: isVideo ? 'video' : 'image' });
}
