import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ModulesContent } from './ModulesContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function ModulesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const data: {
    business: { id?: string; modulosActivos?: string[]; businessType?: string; plan?: 'free' | 'entrepreneur' };
  } = await res.json();

  return (
    <ModulesContent
      slug={slug}
      businessId={data.business.id ?? ''}
      activeTokens={data.business.modulosActivos ?? []}
      businessType={(data.business.businessType ?? '').toLowerCase()}
      plan={data.business.plan === 'entrepreneur' ? 'entrepreneur' : 'free'}
    />
  );
}
