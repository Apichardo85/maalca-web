// Digital menu board — public, 16:9, meant to stay open fullscreen on a Smart TV browser.
// Same public catalog endpoint as the regular business page (no auth), but a completely
// separate layout: no nav/footer/marketing chrome, big type for viewing at a distance,
// content rotates on its own. See plans/spec-maalca-web-espacio-v2.md, Fase 7.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MenuBoard } from '@/components/public/MenuBoard';
import { normalizeDailyMenu, normalizeLayout, normalizeOrientation, normalizePanels } from '@/lib/board-layouts';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { alignCatalogToTemplates, normalizeBaseLanguage } from '@/lib/catalog-language';
import type { ApiWall } from '@/lib/wall-sync';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Same reserved list as [slug]/page.tsx would apply to — a board only makes sense for a
// real affiliate slug, so any of those top-level paths 404 here too rather than trying
// (and failing) to resolve them as a business. Exportado para que /{slug}/board/{screenId}
// aplique el mismo chequeo (Fase 9 Etapa B).
export const RESERVED = new Set([
  'servicios', 'login', 'signup', 'register', 'onboarding', 'space',
  'dashboard', 'admin', 'api', 'auth', 'app', 'www',
  'about', 'contact', 'contacto', 'pricing', 'terms', 'privacy', 'legal',
  'help', 'blog', 'docs', '_next', 'static', 'public', 'assets', 'images',
  'catering', 'editorial', 'properties', 'ciriwhispers', 'pegote',
  'settings', 'catalog', 'categories', 'upgrade',
  'masa-tina', 'dr-pichardo', 'hablando-mierda', 'casos-estudio', 'ecosistema',
  'affiliates', 'tarjeta', 'sync-test',
]);

/** Exportado para que /{slug}/board/{screenId}/page.tsx (Fase 9 Etapa B) reuse exactamente la
 *  misma resolución — pasar screenId solo agrega ?screenId= a la query, el backend hace el
 *  resto (aplica los overrides de esa pantalla, o 404 si no existe / es de otro afiliado). */
export async function getCatalog(slug: string, screenId?: string): Promise<BoardCatalogResponse | null> {
  try {
    const qs = screenId ? `?screenId=${encodeURIComponent(screenId)}` : '';
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog${qs}`, {
      next: { revalidate: 30, tags: [`affiliate:${slug}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return { title: 'MaalCa' };
  const data = await getCatalog(slug);
  return { title: data ? `${data.affiliate.name} — Menu` : 'MaalCa' };
}

/** Exportado para que /{slug}/board/{screenId}/page.tsx (Fase 9 Etapa B) renderice
 *  exactamente lo mismo — la única diferencia entre pantallas es qué `data` les llegó
 *  (según los overrides que resolvió el backend), no el markup. */
export function renderBoard(slug: string, data: BoardCatalogResponse, screenId?: string) {
  // Gated by plan + screen allowance (ModuleAccess / PublicCatalogService in maalca-api — that's the
  // real enforcement point; this just renders a diagnosable message instead of a bare 404
  // so whoever set up the TV knows *why* nothing's showing, not just that it's broken).
  if (!data.capabilities?.menuBoard) {
    const isEn = data.language === 'en';
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 px-10 text-center text-white">
        <p className="text-2xl font-bold">{data.affiliate.name}</p>
        <p className="text-lg font-semibold">{isEn ? 'This screen is paused' : 'Esta pantalla está en pausa'}</p>
        <p className="max-w-md text-white/60">
          {isEn
            ? 'Reactivate it from your dashboard at maalca.com.'
            : 'Reactívala desde tu panel en maalca.com.'}
        </p>
      </div>
    );
  }

  const mappedItems = alignCatalogToTemplates(
    data.items.map((item) => ({
      ...item,
      image_url: item.image_url ?? (item as typeof item & { imageUrl?: string | null }).imageUrl ?? null,
      video_url: (item as typeof item & { videoUrl?: string | null }).videoUrl ?? null,
    })),
    normalizeBaseLanguage(data.affiliate.language),
  );

  return (
    <MenuBoard
      slug={slug}
      screenId={screenId}
      business={{
        name: data.affiliate.name,
        logoUrl: data.affiliate.logoUrl ?? null,
        primaryColor: data.affiliate.primaryColor ?? '#045AFE',
        secondaryColor: data.affiliate.secondaryColor ?? null,
        accentColor: data.affiliate.accentColor ?? null,
        currency: data.affiliate.currency === 'DOP' ? 'DOP' : 'USD',
        categoryTranslations: data.affiliate.categoryTranslations ?? null,
        address: data.affiliate.address ?? null,
        phone: data.affiliate.whatsApp ?? null,
        horario: data.affiliate.horario ?? null,
        timezone: data.affiliate.timezone ?? null,
      }}
      initialItems={mappedItems}
      initialCategories={data.categories ?? []}
      initialScreenAds={data.screenAds ?? []}
      initialAdFrequency={data.adFrequency ?? null}
      initialWall={data.wall ?? null}
      language={data.language === 'en' ? 'en' : 'es'}
      theme={data.boardTheme === 'Light' ? 'Light' : 'Dark'}
      layout={normalizeLayout(data.layout)}
      orientation={normalizeOrientation(data.orientation)}
      panels={normalizePanels(data.panels)}
      dailyMenu={normalizeDailyMenu(data.affiliate.dailyMenu)}
      transitionEffect={
        data.transitionEffect === 'Slide' || data.transitionEffect === 'Zoom' || data.transitionEffect === 'None'
          ? data.transitionEffect
          : 'Fade'
      }
    />
  );
}

export default async function MenuBoardPage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const data = await getCatalog(slug);
  if (!data) notFound();

  return renderBoard(slug, data);
}

interface BoardScreenAd {
  id: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  durationSeconds: number;
  fit?: 'Contain' | 'Cover';
}

interface BoardCatalogResponse {
  affiliate: {
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    currency?: string | null;
    language?: string | null;
    categoryTranslations?: Record<string, { es?: string | null; en?: string | null }> | null;
    address?: string | null;
    whatsApp?: string | null;
    horario?: Array<{ dia: string; abre: string; cierra: string; cerrado: boolean }> | null;
    timezone?: string | null;
    dailyMenu?: unknown;
  };
  categories?: PublicTemplateProps['categories'];
  items: PublicTemplateProps['items'];
  capabilities?: PublicTemplateProps['capabilities'];
  screenAds?: BoardScreenAd[];
  adFrequency?: number | null;
  language?: string | null;
  boardTheme?: string | null;
  transitionEffect?: string | null;
  layout?: string | null;
  /** Layout "Panels": orientación de la TV y flyers por espacio (ya resueltos por el API). */
  orientation?: string | null;
  panels?: unknown;
  /** Muro sincronizado (config del dashboard) con la posición de ESTA pantalla. */
  wall?: ApiWall | null;
}
