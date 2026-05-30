import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import SettingsForm from './SettingsForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const apiRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (apiRes.status === 404) redirect('/onboarding');
  if (apiRes.status === 403) redirect('/');
  if (!apiRes.ok) throw new Error(`Failed to load space: ${apiRes.status}`);

  const data = await apiRes.json();
  const biz = data.business;

  return (
    <SettingsForm
      slug={slug}
      name={biz.name ?? ''}
      whatsapp={biz.whatsapp ?? ''}
      primaryColor={biz.primaryColor ?? '#C8102E'}
    />
  );
}
