// POST /api/dashboard/[affiliateId]/dishes/upload-image
// FormData: { file: File, dishId: string }
// Uploads to storage bucket "tld-photos" at `{affiliateId}/{dishId}-{timestamp}.{ext}`, returns public URL.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin, assertAffiliateAccess } from '@/lib/supabase/admin'

type Params = { params: Promise<{ affiliateId: string }> }

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest, { params }: Params) {
  const { affiliateId } = await params
  const cookieStore = await cookies()
  const guid = cookieStore.get('affiliate_guid')?.value
  const role = cookieStore.get('user_role')?.value
  if (!assertAffiliateAccess(guid, affiliateId, role)) {
    return NextResponse.json(
      {
        error: guid
          ? `Tu sesión no tiene permisos para editar "${affiliateId}" (guid=${guid.slice(0, 13)}…, role=${role ?? 'none'}). Vuelve a iniciar sesión.`
          : 'No hay sesión activa (cookie affiliate_guid ausente o expirada). Inicia sesión nuevamente.',
      },
      { status: 401 },
    )
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  const dishId = (form.get('dishId') as string | null)?.trim()

  if (!file || !dishId) {
    return NextResponse.json({ error: 'missing file or dishId' }, { status: 400 })
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: `unsupported mime type ${file.type}` }, { status: 415 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file too large (max 5MB)' }, { status: 413 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${affiliateId}/${dishId}-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  let supabase
  try {
    supabase = supabaseAdmin()
  } catch (err) {
    return NextResponse.json(
      {
        error: `Configuración del servidor incompleta: ${err instanceof Error ? err.message : String(err)}. Revisa variables de entorno en Vercel.`,
      },
      { status: 500 },
    )
  }
  const { error: uploadErr } = await supabase.storage
    .from('tld-photos')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadErr) {
    console.error('[upload-image] Supabase storage error:', uploadErr)
    return NextResponse.json(
      { error: `Supabase storage: ${uploadErr.message}` },
      { status: 500 },
    )
  }

  const { data: publicUrlData } = supabase.storage.from('tld-photos').getPublicUrl(path)
  return NextResponse.json({ url: publicUrlData.publicUrl, path })
}
