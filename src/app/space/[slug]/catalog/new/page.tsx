import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import NewItemForm from './NewItemForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewCatalogItemPage({ params }: PageProps) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  // Needed to gate the Restaurant-only fields (periods/weekDays/flags/featured/popular).
  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const spaceData = spaceRes.ok ? await spaceRes.json() : null;
  const businessType: string | null = spaceData?.business?.businessType ?? null;

  return <NewItemForm slug={slug} businessType={businessType} />;
}
