import { redirect } from 'next/navigation';
import { SpaceDashboard } from '@/components/space/SpaceDashboard';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.MAALCA_API_URL
  ?? process.env.NEXT_PUBLIC_API_BASE_URL
  ?? 'http://localhost:8080';

interface SpaceResponse {
  business: {
    id: string;
    slug: string;
    name: string;
    businessType: string;
    plan: 'free' | 'entrepreneur';
    whatsapp: string | null;
    primaryColor: string | null;
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
  if (!token) redirect('/login');

  const apiRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (apiRes.status === 404) redirect('/onboarding');
  if (apiRes.status === 403) redirect('/');
  if (!apiRes.ok) throw new Error(`Failed to load space: ${apiRes.status}`);

  const data: SpaceResponse = await apiRes.json();

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/${slug}`;

  // Adapt camelCase API response to SpaceDashboard's snake_case prop interface.
  // SpaceDashboard shape is unchanged; mapping lives here.
  // A future cleanup can rename SpaceDashboard props to camelCase and remove this adapter.
  return (
    <SpaceDashboard
      business={{
        id:             data.business.id,
        slug:           data.business.slug,
        name:           data.business.name,
        business_type:  data.business.businessType,
        plan:           data.business.plan,
        whatsapp:       data.business.whatsapp,
        primary_color:  data.business.primaryColor,
      }}
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
