import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { optimizeImage } from '@/lib/optimize-image';
import { INTAKE_BUCKET, INTAKE_FILE_TYPES, INTAKE_MAX_FILE_SIZE } from '@/lib/intake';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Subida de archivos del formulario público (logo, lista de clientes, lista de precios…).
// Bucket PRIVADO: devuelve la ruta, no una URL. Solo /ops los ve, con URL firmada de vida corta
// (/api/ops/intakes/[id]/file). Solo se acepta si el levantamiento existe y sigue abierto.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const gate = await fetch(`${API}/api/public/intakes/${token}`, { cache: 'no-store' });
  if (!gate.ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const intake = await gate.json().catch(() => null);
  if (intake?.status !== 'open') {
    return NextResponse.json({ error: 'Este formulario ya no recibe archivos.' }, { status: 409 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
  }
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (!INTAKE_FILE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no admitido. Usa JPG, PNG, PDF, Excel o Word.' }, { status: 400 });
  }
  if (file.size > INTAKE_MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'El archivo supera 4 MB. Comprímelo o envía una foto más liviana.' }, { status: 400 });
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith('image/');
  // Logos: 1600 px en WebP sobra para el espacio; documentos pasan intactos.
  const out = isImage ? await optimizeImage(raw, file.type) : { buffer: raw, contentType: file.type, ext: '' };
  const original = (file.name || 'archivo').replace(/[^\w.\- ]+/g, '').trim().slice(0, 80) || 'archivo';
  const base = original.replace(/\.[^.]+$/, '').replace(/\s+/g, '-').toLowerCase() || 'archivo';
  const ext = out.ext || (original.includes('.') ? original.split('.').pop()!.toLowerCase() : 'bin');
  const path = `intake/${token}/${Date.now()}-${base}.${ext}`;

  const supabase = supabaseAdmin();
  let { error } = await supabase.storage
    .from(INTAKE_BUCKET)
    .upload(path, out.buffer, { contentType: out.contentType, upsert: false });

  // Primera subida de la plataforma: el bucket privado se crea solo (sin pasos manuales en Supabase).
  if (error && /bucket not found|not found/i.test(error.message)) {
    await supabase.storage.createBucket(INTAKE_BUCKET, { public: false });
    ({ error } = await supabase.storage
      .from(INTAKE_BUCKET)
      .upload(path, out.buffer, { contentType: out.contentType, upsert: false }));
  }
  if (error) return NextResponse.json({ error: 'No se pudo subir el archivo. Intenta de nuevo.' }, { status: 500 });

  return NextResponse.json({ path, name: original });
}
