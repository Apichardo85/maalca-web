import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Params = { params: Promise<{ slug: string; id: string }> };

// PATCH /api/space/[slug]/catalog/[id] — update item; flips is_demo=false
export async function PATCH(req: NextRequest, { params }: Params) {
  const { slug, id } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = supabaseAdmin();

  // Verify ownership via business
  const { data: biz } = await admin
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!biz) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const update: Record<string, unknown> = { is_demo: false };
  if (body.name !== undefined) update.name = body.name;
  if (body.description !== undefined) update.description = body.description;
  if (body.category !== undefined) update.category = body.category || null;
  if (body.price !== undefined) update.price = body.price !== '' ? Number(body.price) : null;
  if (body.active !== undefined) update.active = body.active;

  const { error } = await admin
    .from('catalog_items')
    .update(update)
    .eq('id', id)
    .eq('business_id', biz.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/space/[slug]/catalog/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug, id } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: biz } = await admin
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!biz) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { error } = await admin
    .from('catalog_items')
    .delete()
    .eq('id', id)
    .eq('business_id', biz.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
