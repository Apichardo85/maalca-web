// PATCH  /api/dashboard/[affiliateId]/dishes/[dishId]  → partial update.
// DELETE /api/dashboard/[affiliateId]/dishes/[dishId]  → remove dish.
// Ownership: `affiliate_guid` cookie must map to the same slug as route param (admins exempted).
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin, assertAffiliateAccess } from '@/lib/supabase/admin'

type Params = { params: Promise<{ affiliateId: string; dishId: string }> }

const EDITABLE_FIELDS = [
  'name', 'description', 'price', 'category', 'image_url',
  'periods', 'available', 'featured', 'popular', 'flags', 'display_order',
] as const

async function checkAuth(affiliateId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const cookieStore = await cookies()
  const guid = cookieStore.get('affiliate_guid')?.value
  const role = cookieStore.get('user_role')?.value
  if (!guid) {
    return { ok: false, reason: 'No hay sesión activa (cookie affiliate_guid ausente o expirada). Inicia sesión nuevamente.' }
  }
  if (!assertAffiliateAccess(guid, affiliateId, role)) {
    return { ok: false, reason: `Tu sesión no tiene permisos para editar "${affiliateId}" (role=${role ?? 'none'}).` }
  }
  return { ok: true }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { affiliateId, dishId } = await params
  const auth = await checkAuth(affiliateId)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  const body = await req.json()
  const patch: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in body) patch[field] = body[field]
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no editable fields provided' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('dishes')
    .update(patch)
    .eq('id', dishId)
    .eq('affiliate_id', affiliateId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (affiliateId === 'the-little-dominican') {
    revalidatePath('/the-little-dominican')
    revalidatePath('/the-little-dominican/menu')
  }
  return NextResponse.json({ dish: data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { affiliateId, dishId } = await params
  const auth = await checkAuth(affiliateId)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', dishId)
    .eq('affiliate_id', affiliateId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (affiliateId === 'the-little-dominican') {
    revalidatePath('/the-little-dominican')
    revalidatePath('/the-little-dominican/menu')
  }
  return NextResponse.json({ ok: true })
}
