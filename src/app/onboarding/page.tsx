import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { OnboardingForm } from './OnboardingForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OnboardingPage() {
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login?redirect=/onboarding');

  const res = await fetch(`${API}/api/me/affiliates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login?redirect=/onboarding');

  if (res.ok) {
    const affiliates: Array<{ id: string; slug: string }> = await res.json().catch(() => []);
    if (affiliates.length > 0) redirect(`/space/${affiliates[0].slug}`);
  }

  return <OnboardingForm />;
}
