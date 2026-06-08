import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { OnboardingForm } from './OnboardingForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OnboardingPage() {
  const token = await getMaalcaApiToken();

  // No token: middleware already redirects unauthenticated users to /login.
  // Redirecting here too creates a loop — fall through to the form.
  if (!token) {
    return <OnboardingForm />;
  }

  try {
    const res = await fetch(`${API}/api/me/affiliates`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.ok) {
      const affiliates: Array<{ id: string; slug: string }> = await res.json().catch(() => []);
      if (affiliates.length > 0) redirect(`/space/${affiliates[0].slug}`);
    }
  } catch {
    // API unreachable — show form anyway
  }

  return <OnboardingForm />;
}
