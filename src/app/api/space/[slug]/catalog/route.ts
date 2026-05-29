import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Params = { params: Promise<{ slug: string }> };

async function resolveBusinessId(slug: string, userId: string): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('owner_id', userId)
    .maybeSingle();
  return data?.id ?? null;
}

// POST /api/space/[slug]/catalog — create a new catalog item
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const businessId = await resolveBusinessId(slug, user.id);
  if (!businessId) return NextResponse.json({ error: 'business not found' }, { status: 404 });

  const body = await req.json();
  const { name, description, category, price } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from('catalog_items')
    .insert({
      business_id: businessId,
      name: name.trim(),
      description: description ?? null,
      category: category?.trim() || null,
      price: price ? Number(price) : null,
      is_demo: false,
      active: true,
      sort_order: 999,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire first_product_added milestone via maalca-api (fire-and-forget)
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? 'http://localhost:8080';
  const session = (await supabase.auth.getSession()).data.session;
  if (session) {
    fetch(`${API}/api/affiliates/${businessId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type: 'first_product_added' }),
    }).catch(() => {});

    // Update onboarding_progress in Supabase
    void supabaseAdmin()
      .from('onboarding_progress')
      .upsert({ business_id: businessId, first_product_added: true }, { onConflict: 'business_id' });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
