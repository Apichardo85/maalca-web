import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? 'http://localhost:8080';

type BusinessType = 'restaurant' | 'barber' | 'service' | 'retail';

const PRIMARY_COLORS: Record<BusinessType, string> = {
  restaurant: '#C8102E',
  barber:     '#1a1a2e',
  service:    '#374151',
  retail:     '#047857',
};

const DEMO_ITEMS: Record<BusinessType, Array<{ name: string; description: string; category: string; price: number }>> = {
  restaurant: [
    { name: 'Mofongo de Cerdo',  description: 'Plátano verde majado con chicharrón crocante', category: 'Platos fuertes', price: 14.99 },
    { name: 'Pollo Guisado',     description: 'Pollo en salsa criolla con sazón casera',       category: 'Platos fuertes', price: 12.99 },
    { name: 'Tres Golpes',       description: 'Mangú, huevo, queso frito y salami',             category: 'Desayunos',     price: 10.99 },
  ],
  barber: [
    { name: 'Corte Clásico',    description: 'Fade o degradado a elección',               category: 'Cortes',  price: 25 },
    { name: 'Corte + Barba',    description: 'Servicio completo, toalla caliente incluida', category: 'Combos', price: 40 },
    { name: 'Solo Barba',       description: 'Perfilado y toalla caliente',                category: 'Barba',   price: 18 },
  ],
  service: [
    { name: 'Consulta Inicial', description: 'Evaluación y diagnóstico', category: 'Consultas',    price: 50  },
    { name: 'Servicio Estándar', description: 'Atención completa',        category: 'Servicios',    price: 120 },
    { name: 'Mantenimiento',    description: 'Revisión periódica',        category: 'Mantenimiento', price: 75  },
  ],
  retail: [
    { name: 'Producto Destacado', description: 'Tu producto principal',               category: 'Destacados', price: 29.99 },
    { name: 'Producto B',         description: 'Descripción corta del producto',      category: 'Categoría 1', price: 19.99 },
    { name: 'Producto C',         description: 'Descripción corta del producto',      category: 'Categoría 1', price: 24.99 },
  ],
};

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // 1 — Forward to maalca-api
  const apiRes = await fetch(`${API}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const apiData = await apiRes.json();

  if (!apiRes.ok) {
    return NextResponse.json(apiData, { status: apiRes.status });
  }

  // 2 — Sync to Supabase so the space dashboard can read it
  const { affiliateId, slug } = apiData as { affiliateId: string; slug: string };
  const businessType = (body.businessType as BusinessType) ?? 'service';
  const name = body.name as string;

  const admin = supabaseAdmin();

  // businesses row (idempotent — skip if already exists)
  const { error: bizErr } = await admin.from('businesses').upsert({
    id:             affiliateId,
    slug:           slug,
    name:           name,
    business_type:  businessType,
    plan:           'free',
    plan_status:    'active',
    whatsapp:       body.whatsapp ?? null,
    primary_color:  PRIMARY_COLORS[businessType] ?? '#C8102E',
    owner_id:       session.user.id,
  }, { onConflict: 'id' });

  if (bizErr) {
    console.error('[onboarding] Supabase businesses upsert failed:', bizErr.message);
    // Non-fatal — dashboard falls back to notFound but the user can retry
  }

  // catalog_items — 3 demo items
  const templates = DEMO_ITEMS[businessType] ?? [];
  if (templates.length > 0) {
    const demoRows = templates.map((t, i) => ({
      business_id: affiliateId,
      name:        t.name,
      description: t.description,
      category:    t.category,
      price:       t.price,
      is_demo:     true,
      active:      true,
      sort_order:  i,
    }));

    const { error: itemsErr } = await admin.from('catalog_items').insert(demoRows);
    if (itemsErr && !itemsErr.message.includes('duplicate')) {
      console.error('[onboarding] Supabase catalog_items insert failed:', itemsErr.message);
    }
  }

  // onboarding_progress — start all false
  const { error: progErr } = await admin.from('onboarding_progress').upsert({
    business_id:       affiliateId,
    first_product_added: false,
    whatsapp_configured: body.whatsapp ? true : false,
    link_shared:         false,
  }, { onConflict: 'business_id' });

  if (progErr) {
    console.error('[onboarding] Supabase onboarding_progress upsert failed:', progErr.message);
  }

  return NextResponse.json(apiData);
}
