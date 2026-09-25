import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { DesignEditor } from './DesignEditor';
import type { ProcessStepDto, FaqEntryDto, HorarioDayDto, SectionVisibilityDto, CausaDto, CommunityImpactDto } from './types';
import { EMPTY_COMMUNITY_IMPACT } from './types';
import type { BusinessType, Plan } from '@/lib/templates/registry';

// The public template's default timezone fallback when a business hasn't configured one yet —
// matches the default used across affiliates-config.ts for Dominican-based businesses.
const DEFAULT_TIMEZONE = 'America/Santo_Domingo';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface CanalDto {
  id: string;
  tipo: string;
  metodo: string;
  valorCrudo: string;
  enlaceGenerado: string;
  nombreVisible: string | null;
  verificado: boolean;
  orden: number;
  activo: boolean;
}

export default async function DesignPage({
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

  const spaceData = await spaceRes.json();
  const biz = spaceData.business;

  // The only GET that returns description/coverImageUrl/contactEmail/address/website/logoUrl
  // is the PUBLIC, unauthenticated, published-only endpoint — there's no authenticated owner
  // profile GET today. This is a real backend gap: every onboarded affiliate is Published=true
  // by design (no draft workflow exists), so in practice this always succeeds — but we guard
  // against it failing anyway so a fetch failure can never silently wipe real saved data.
  let publicProfile: {
    description: string | null;
    descriptionEn: string | null;
    coverImageUrl: string | null;
    contactEmail: string | null;
    address: string | null;
    website: string | null;
    logoUrl: string | null;
  } | null = null;
  let processSteps: ProcessStepDto[] = [];
  let faq: FaqEntryDto[] = [];
  let horario: HorarioDayDto[] = [];
  let sectionVisibility: SectionVisibilityDto = {};
  let galleryImages: string[] = [];
  let causas: CausaDto[] = [];
  let communityImpact: CommunityImpactDto = EMPTY_COMMUNITY_IMPACT;

  try {
    const publicRes = await fetch(`${API}/api/public/affiliates/${slug}`, { cache: 'no-store' });
    if (publicRes.ok) {
      const p = await publicRes.json();
      publicProfile = {
        description: p.description ?? null,
        descriptionEn: p.descriptionEn ?? null,
        coverImageUrl: p.coverImageUrl ?? null,
        contactEmail: p.contactEmail ?? null,
        address: p.address ?? null,
        website: p.website ?? null,
        logoUrl: p.logoUrl ?? null,
      };
      processSteps = p.processSteps ?? [];
      faq = p.faq ?? [];
      horario = p.horario ?? [];
      sectionVisibility = p.sectionVisibility ?? {};
      galleryImages = p.galleryImages ?? [];
      communityImpact = p.communityImpact ?? EMPTY_COMMUNITY_IMPACT;
    }
  } catch {
    // publicProfile stays null — DesignEditor omits these fields from any PATCH
    // unless the user explicitly edits them, so a failed fetch here can't cause data loss.
    // processSteps/faq/horario stay empty — worst case Contenido tab starts blank
    // instead of throwing; saving from there always sends a full explicit array.
  }

  // Causas -- ya no viene del payload público de arriba (backlog 2026-09-25, ver Causa.cs);
  // tiene su propio CRUD autenticado, mismo patrón que Activities. Solo Community tiene UI
  // para esto, así que no vale la pena el fetch para otros tipos de negocio.
  if ((biz.businessType as string)?.toLowerCase() === 'community') {
    try {
      const causasRes = await fetch(`${API}/api/affiliates/${biz.id}/causas`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': biz.id },
        cache: 'no-store',
      });
      if (causasRes.ok) causas = await causasRes.json();
    } catch {
      // causas arranca vacío -- el tab de Contenido simplemente no muestra nada que editar
      // hasta que el usuario reintente (recargando), en vez de tumbar la página del editor.
    }
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/${slug}`;

  return (
    <DesignEditor
      slug={slug}
      id={biz.id}
      businessType={(biz.businessType as string).toLowerCase() as BusinessType}
      plan={((biz.plan as string) ?? 'free').toLowerCase() as Plan}
      timezone={biz.timezone ?? DEFAULT_TIMEZONE}
      name={biz.name ?? ''}
      whatsapp={biz.whatsapp ?? ''}
      primaryColor={biz.primaryColor ?? '#045AFE'}
      profileLoaded={publicProfile !== null}
      description={publicProfile?.description ?? ''}
      descriptionEn={publicProfile?.descriptionEn ?? ''}
      coverImageUrl={publicProfile?.coverImageUrl ?? null}
      contactEmail={publicProfile?.contactEmail ?? ''}
      address={publicProfile?.address ?? ''}
      website={publicProfile?.website ?? ''}
      logoUrl={publicProfile?.logoUrl ?? null}
      canales={(biz.canales ?? []) as CanalDto[]}
      processSteps={processSteps}
      faq={faq}
      horario={horario}
      sectionVisibility={sectionVisibility}
      galleryImages={galleryImages}
      causas={causas}
      communityImpact={communityImpact}
      publicUrl={publicUrl}
    />
  );
}
