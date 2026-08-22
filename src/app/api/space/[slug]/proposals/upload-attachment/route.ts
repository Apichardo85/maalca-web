import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Mismo patrón que catalog/upload-image (Supabase Storage, bucket 'affiliate-media'), extendido
// para aceptar documentos (tarea #336) — una propuesta puede traer un contrato/cotización en
// PDF, o una imagen de referencia, no solo fotos de producto.
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const EXT_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB — más holgado que las fotos de catálogo por ser PDFs

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten PDF, JPEG, PNG o WebP.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'El archivo no puede superar 10MB.' }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type] ?? 'bin';
  const path = `${affiliate.id}/proposals/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = supabaseAdmin();

  const { error: uploadError } = await supabase.storage
    .from('affiliate-media')
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('affiliate-media')
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, name: file.name });
}
