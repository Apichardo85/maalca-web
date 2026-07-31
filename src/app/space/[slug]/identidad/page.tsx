import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { IdentidadContent } from './IdentidadContent';
import type { BusinessType, Plan, PublicTemplateProps } from '@/lib/templates/registry';

// Matches design/page.tsx's default — a business hasn't configured a timezone yet.
const DEFAULT_TIMEZONE = 'America/Santo_Domingo';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function IdentidadPage({
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

  // Same public-profile fallback fetch as design/page.tsx — /api/space/{slug} doesn't carry
  // description/logoUrl/etc. today. Identidad shows what's actually published, not a draft,
  // so unlike DesignEditor there's no liveForm/previewSnapshot to reconcile with — this fetch
  // result goes straight into the business object below.
  let publicProfile: {
    description: string | null;
    descriptionEn: string | null;
    logoUrl: string | null;
    contactEmail: string | null;
    address: string | null;
  } | null = null;

  try {
    const publicRes = await fetch(`${API}/api/public/affiliates/${slug}`, { cache: 'no-store' });
    if (publicRes.ok) {
      const p = await publicRes.json();
      publicProfile = {
        description: p.description ?? null,
        descriptionEn: p.descriptionEn ?? null,
        logoUrl: p.logoUrl ?? null,
        contactEmail: p.contactEmail ?? null,
        address: p.address ?? null,
      };
    }
  } catch {
    // publicProfile stays null — the card just renders without a description/logo/contacts.
  }

  const business: PublicTemplateProps['business'] = {
    id: biz.id,
    slug,
    name: biz.name ?? '',
    plan: ((biz.plan as string) ?? 'free').toLowerCase() as Plan,
    description: publicProfile?.description ?? null,
    descriptionEn: publicProfile?.descriptionEn ?? null,
    logo_url: publicProfile?.logoUrl ?? null,
    primary_color: biz.primaryColor ?? '#C8102E',
    whatsapp: biz.whatsapp ?? null,
    address: publicProfile?.address ?? null,
    contactEmail: publicProfile?.contactEmail ?? null,
    canales: biz.canales ?? [],
    business_type: (biz.businessType as string).toLowerCase() as BusinessType,
    timezone: biz.timezone ?? DEFAULT_TIMEZONE,
  };

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/${slug}`;
  // The QR image encodes the /r/{slug} tracking redirect (records qr_scan, then 302s to
  // publicUrl) — publicUrl itself keeps being the clean link shown/copied in the UI.
  const qrTargetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com'}/r/${slug}`;
  const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, { width: 240, margin: 1 });

  return (
    <IdentidadContent
      slug={slug}
      business={business}
      publicUrl={publicUrl}
      qrTargetUrl={qrTargetUrl}
      qrDataUrl={qrDataUrl}
    />
  );
}
