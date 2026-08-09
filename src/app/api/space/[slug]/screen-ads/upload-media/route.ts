import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Mismo bucket que el upload de imágenes de catálogo (catalog/upload-image/route.ts) — solo se
// amplía el set de tipos permitidos y el límite de tamaño, porque un comercial puede ser video.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 30 * 1024 * 1024;

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

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Solo se permiten imágenes (JPEG, PNG, WebP) o video (MP4, WebM).' },
      { status: 400 },
    );
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: isVideo ? 'El video no puede superar 30MB.' : 'La imagen no puede superar 5MB.' },
      { status: 400 },
    );
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${affiliate.id}/ads/${Date.now()}.${ext}`;

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

  return NextResponse.json({ url: publicUrl, mediaType: isVideo ? 'Video' : 'Image' });
}
