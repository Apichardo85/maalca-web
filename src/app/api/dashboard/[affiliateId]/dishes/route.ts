// GET  /api/dashboard/[affiliateId]/dishes  → list all dishes for the affiliate (public read).
// POST /api/dashboard/[affiliateId]/dishes  → create a new dish. Cookie `affiliate_guid` must match.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin, assertAffiliateAccess } from '@/lib/supabase/admin'

type Params = { params: Promise<{ affiliateId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { affiliateId } = await params
  let supabase
  try {
    supabase = supabaseAdmin()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[dishes GET] supabaseAdmin init failed:', msg)
    return NextResponse.json(
      { error: `Config del servidor incompleta: ${msg}. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.` },
      { status: 500 },
    )
  }
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[dishes GET] query failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ dishes: data ?? [] })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { affiliateId } = await params
  const cookieStore = await cookies()
  const guid = cookieStore.get('affiliate_guid')?.value
  const role = cookieStore.get('user_role')?.value

  if (!assertAffiliateAccess(guid, affiliateId, role)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, name, description, price, category, image_url, periods, available, featured, popular, flags, display_order } = body

  if (!id || !name || price == null || !category) {
    return NextResponse.json({ error: 'missing required fields (id, name, price, category)' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('dishes')
    .insert({
      id,
      affiliate_id: affiliateId,
      name,
      description: description ?? null,
      price,
      category,
      image_url: image_url ?? null,
      periods: periods ?? [],
      available: available ?? true,
      featured: featured ?? false,
      popular: popular ?? false,
      flags: flags ?? {},
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (affiliateId === 'the-little-dominican') {
    revalidatePath('/the-little-dominican')
    revalidatePath('/the-little-dominican/menu')
  }
  return NextResponse.json({ dish: data }, { status: 201 })
}
