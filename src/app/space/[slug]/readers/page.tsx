import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ReadersContent, type ReaderClubSettings, type ReaderList, type ReaderLetter } from './ReadersContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Club de lectores del autor (módulo 'readers'): lectores, cartas y membresía. Solo creator/publisher.
export default async function ReadersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);
  const space: { business: { id: string; businessType: string } } = await spaceRes.json();
  const type = space.business.businessType.toLowerCase();
  if (type !== 'creator' && type !== 'publisher') redirect(`/space/${slug}`);

  const id = space.business.id;
  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': id };
  const get = async <T,>(path: string): Promise<T | null> => {
    try {
      const res = await fetch(`${API}/api/affiliates/${id}/readers${path}`, { headers, cache: 'no-store' });
      return res.ok ? ((await res.json()) as T) : null;
    } catch {
      return null;
    }
  };
  const [settings, list, letters] = await Promise.all([
    get<ReaderClubSettings>('/settings'),
    get<ReaderList>('?take=50'),
    get<ReaderLetter[]>('/letters'),
  ]);

  return <ReadersContent slug={slug} initialSettings={settings} initialList={list} initialLetters={letters ?? []} />;
}
