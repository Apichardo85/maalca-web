import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL
  ?? 'http://localhost:8080';

export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  // Región del visitante (Vercel la manda en este header): RD → la API arranca el negocio en pesos, el resto en dólares.
  const country = req.headers.get('x-vercel-ip-country');
  if (country && /^[A-Za-z]{2}$/.test(country) && !body.country) body.country = country.toUpperCase();

  const apiRes = await fetch(`${API}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json();

  if (apiRes.ok) {
    // Fire-and-forget emails — don't block the user's redirect
    const { sendOnboardingWelcome, notifyNewSpace } = await import('@/lib/services/resend-service');

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email ?? '';

    sendOnboardingWelcome(userEmail, data.name, data.slug).catch(() => {});
    notifyNewSpace(userEmail, data.name, data.slug, data.businessType).catch(() => {});
  }

  return NextResponse.json(data, { status: apiRes.status });
}
