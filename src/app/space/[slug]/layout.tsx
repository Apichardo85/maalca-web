import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { SpaceSidebar } from '@/components/space/SpaceSidebar';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function SpaceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const { business } = await res.json();

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <SpaceSidebar
        slug={slug}
        businessName={business.name}
        plan={business.plan}
        businessId={business.id}
      />
      <div className="flex-1 min-w-0 md:pl-60">
        {children}
      </div>
    </div>
  );
}
