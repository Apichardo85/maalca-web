import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentSpaceUser } from '@/lib/api-auth';
import { canAddBusiness, type Plan } from '@/lib/plan-limits';
import type { BusinessType } from '@/lib/templates/registry';
import { SpaceSidebar } from '@/components/space/SpaceSidebar';
import { SpaceMobileNav } from '@/components/space/SpaceMobileNav';
import { SupportModeBanner } from '@/components/space/SupportModeBanner';
import { PastDueBanner } from '@/components/space/billing/PastDueBanner';
import { NotificationsProvider } from '@/components/space/NotificationsProvider';
import { isPaidPlan } from '@/lib/plan-limits';
import { canOpenPage, homePage, pageOfPath } from '@/lib/access-profiles';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface Affiliate {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

/**
 * Color del negocio como variables CSS del panel: --brand-primary (botones y acentos que ya lo usan),
 * --brand-primary-hover y --brand-tint (fondo suave para tarjetas y encabezados). Si el hex es muy claro
 * (texto blanco ilegible encima) se oscurece; si no hay color válido, se queda el azul de MaalCa.
 */
function spaceBrandVars(hex?: string | null): React.CSSProperties | undefined {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return undefined;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const base = lum > 0.4 ? `color-mix(in srgb, ${hex} 60%, black)` : hex;
  return {
    '--brand-primary': base,
    '--brand-primary-hover': `color-mix(in srgb, ${base} 85%, black)`,
    '--brand-tint': `color-mix(in srgb, ${base} 7%, transparent)`,
  } as React.CSSProperties;
}

export default async function SpaceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentSpaceUser();
  if (!currentUser) redirect('/login');
  const { token } = currentUser;

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const { business, role, profile, isImpersonation, impersonationExpiresAt } = await res.json();

  // Perfil de acceso (chofer, cajero…): si abre una página que no es de su perfil —por la dirección, un marcador o un
  // enlace viejo— lo mandamos a la suya. La API además le niega los datos aunque llegue (ver ProfileAccessMiddleware).
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname && !canOpenPage(role, profile, pageOfPath(pathname))) {
    redirect(`/space/${slug}${homePage(profile) ? `/${homePage(profile)}` : ''}`);
  }
  const businessType = (business.businessType as string).toLowerCase() as BusinessType;

  // Needed so SpaceMobileNav's drawer can show the real business switcher on
  // mobile (SpaceSwitcherBar, mounted one layout up, is desktop-only now —
  // it used to float fixed over this same drawer with no coordination).
  const affiliatesRes = await fetch(`${API}/api/me/affiliates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const affiliates: Affiliate[] = affiliatesRes.ok ? await affiliatesRes.json().catch(() => []) : [];
  const highestPlan = affiliates.some((a) => isPaidPlan(a.plan)) ? 'entrepreneur' : 'free';
  const canCreateMore = canAddBusiness(highestPlan, affiliates.length);

  return (
    <NotificationsProvider slug={slug}>
    <div className="flex min-h-screen bg-background" style={spaceBrandVars(business.primaryColor)}>
      <SpaceSidebar
        slug={slug}
        businessName={business.name}
        businessType={businessType}
        plan={business.plan}
        primaryColor={business.primaryColor}
        userFullName={currentUser.fullName}
        userAvatarUrl={currentUser.avatarUrl}
        userEmail={currentUser.email}
        userRole={role}
        userProfile={profile ?? null}
        activeModules={business.modulosActivos}
      />
      {/* lg:pl-[var(--space-sidebar-w,15rem)] en vez de un md:pl-60 fijo — SpaceSidebar (client)
          ajusta esa CSS var en :root cuando el usuario colapsa/expande el sidebar (persistido en
          localStorage), y este wrapper (server component, no puede leer ese estado directo) solo
          la sigue. El fallback 15rem es para el primer paint antes de que el useEffect corra. */}
      <div className="flex-1 min-w-0 transition-[padding] duration-200 lg:pl-[var(--space-sidebar-w,15rem)]">
        {isImpersonation && (
          <SupportModeBanner businessName={business.name} expiresAt={impersonationExpiresAt} />
        )}
        {business.planStatus === 'PastDue' && (
          <PastDueBanner slug={slug} canManage={role !== 'Staff'} />
        )}
        <SpaceMobileNav
          slug={slug}
          businessName={business.name}
          businessType={businessType}
          plan={business.plan}
          primaryColor={business.primaryColor}
          userFullName={currentUser.fullName}
          userAvatarUrl={currentUser.avatarUrl}
          userEmail={currentUser.email}
          userRole={role}
          userProfile={profile ?? null}
          businesses={affiliates}
          canCreateMore={canCreateMore}
          spanishFlag={business.spanishFlag ?? null}
          activeModules={business.modulosActivos}
        />
        {children}
      </div>
    </div>
    </NotificationsProvider>
  );
}
