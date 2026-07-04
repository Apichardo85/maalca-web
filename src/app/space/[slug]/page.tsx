import { redirect } from 'next/navigation';
import { SpaceDashboard } from '@/components/space/SpaceDashboard';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL
  ?? 'http://localhost:8080';

interface SpaceKpi {
  valor: number | null;
  disponible: boolean;
}

interface SpaceResponse {
  business: {
    id: string;
    slug: string;
    name: string;
    businessType: string;
    plan: 'free' | 'entrepreneur';
    whatsapp: string | null;
    primaryColor: string | null;
    modulosActivos: string[];
  };
  items: Array<{
    id: string;
    name: string;
    category: string | null;
    isDemo: boolean;
    active: boolean;
  }>;
  productCount: number;
  progress: {
    firstProductAdded: boolean;
    whatsAppConfigured: boolean;
    linkShared: boolean;
  };
  /** Not yet deployed to production as of this writing — guarded with a fallback below. */
  kpis?: {
    visitas: SpaceKpi;
    itemsPublicados: SpaceKpi;
    escaneosQr: SpaceKpi;
    clicsCanales: SpaceKpi;
  };
}

export default async function SpacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ new?: string; upgraded?: string }>;
}) {
  const { slug } = await params;
  const { new: isNew, upgraded } = await searchParams;

  const token = await getMaalcaApiToken();
  console.log('[SpacePage] token:', token ? 'present' : 'null', '| slug:', slug);
  if (!token) redirect('/login');

  const apiRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  console.log('[SpacePage] apiRes.status:', apiRes.status, '| API:', API);

  if (apiRes.status === 404) redirect('/onboarding');
  if (apiRes.status === 403) redirect('/');
  if (!apiRes.ok) throw new Error(`Failed to load space: ${apiRes.status}`);

  const data: SpaceResponse = await apiRes.json();

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/${slug}`;

  // `kpis` isn't deployed to production yet — fall back to a sane default (itemsPublicados
  // from productCount, everything else unavailable) so the dashboard doesn't crash pre-deploy.
  const kpis = data.kpis ?? {
    visitas:         { valor: null, disponible: false },
    itemsPublicados: { valor: data.productCount, disponible: true },
    escaneosQr:      { valor: null, disponible: false },
    clicsCanales:    { valor: null, disponible: false },
  };

  // Adapt camelCase API response to SpaceDashboard's snake_case prop interface.
  // SpaceDashboard shape is unchanged; mapping lives here.
  // A future cleanup can rename SpaceDashboard props to camelCase and remove this adapter.
  return (
    <SpaceDashboard
      business={{
        id:               data.business.id,
        slug:             data.business.slug,
        name:             data.business.name,
        business_type:    data.business.businessType,
        plan:             data.business.plan,
        whatsapp:         data.business.whatsapp,
        primary_color:    data.business.primaryColor,
        modulos_activos:  data.business.modulosActivos ?? [],
      }}
      kpis={kpis}
      items={data.items.map((i) => ({
        id:       i.id,
        name:     i.name,
        category: i.category,
        is_demo:  i.isDemo,
        active:   i.active,
      }))}
      productCount={data.productCount}
      progress={{
        first_product_added: data.progress.firstProductAdded,
        whatsapp_configured: data.progress.whatsAppConfigured,
        link_shared:         data.progress.linkShared,
      }}
      isNew={isNew === '1'}
      justUpgraded={upgraded === '1'}
      publicUrl={publicUrl}
    />
  );
}
