import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { BoardContent, type ScreenAdRow } from './BoardContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: 'free' | 'entrepreneur' };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space: SpaceResponse = await spaceRes.json();

  let ads: ScreenAdRow[] = [];
  try {
    const adsRes = await fetch(`${API}/api/affiliates/${space.business.id}/screen-ads`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (adsRes.ok) ads = await adsRes.json();
  } catch {
    // ads stays [] — BoardContent renders the empty state rather than crashing the page.
  }

  // AdFrequency/Language/BoardTheme no viven en el aggregator de /api/space/{slug} — se leen
  // del catálogo público (el mismo endpoint que ya consume el board en vivo), sin agregar un
  // endpoint autenticado nuevo solo para esto.
  let adFrequency: number | null = null;
  let language: 'es' | 'en' = 'es';
  let boardTheme: 'Dark' | 'Light' = 'Dark';
  try {
    const catalogRes = await fetch(`${API}/api/public/affiliates/${slug}/catalog`, { cache: 'no-store' });
    if (catalogRes.ok) {
      const catalog = await catalogRes.json();
      adFrequency = catalog.adFrequency ?? null;
      language = catalog.language === 'en' ? 'en' : 'es';
      boardTheme = catalog.boardTheme === 'Light' ? 'Light' : 'Dark';
    }
  } catch {
    // se quedan en sus defaults
  }

  return (
    <BoardContent
      slug={slug}
      plan={space.business.plan}
      initialAds={ads}
      initialAdFrequency={adFrequency}
      initialLanguage={language}
      initialBoardTheme={boardTheme}
    />
  );
}
