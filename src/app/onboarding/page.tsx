'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { track } from '@/lib/analytics';
import { apiFetch, ApiError } from '@/lib/api-client';

// Set to false to show the stub page instead of the live onboarding flow
const ONBOARDING_LIVE = true;

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante', emoji: '🍽️' },
  { value: 'barber', label: 'Barbería', emoji: '💈' },
  { value: 'service', label: 'Servicios', emoji: '🛠️' },
  { value: 'retail', label: 'Tienda', emoji: '🛍️' },
] as const;

function OnboardingStub() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated border border-border">
            <svg className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Estamos preparando tu espacio
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Tu cuenta está lista. Estamos configurando las últimas piezas de la plataforma.
            Pronto tendrás acceso completo a tu dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full rounded-full bg-brand-primary py-3 text-sm font-medium text-white transition hover:bg-brand-primary-hover text-center"
          >
            Ir al inicio
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-text-secondary transition hover:border-border-muted hover:text-text-primary"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<typeof BUSINESS_TYPES[number]['value'] | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ONBOARDING_LIVE) return <OnboardingStub />;

  const submit = () => {
    if (!name.trim() || !type) return;
    setError(null);

    startTransition(async () => {
      try {
        const data = await apiFetch<{ affiliateId: string; slug: string }>('/api/onboarding', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), businessType: type }),
        });

        track('onboarding_completed', {
          business_id: data.affiliateId,
          business_type: type,
        });

        router.push(`/space/${data.slug}?new=1`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setError('Ya tienes un negocio. Upgrade a Entrepreneur para crear más de uno.');
        } else {
          setError('Algo salió mal. Intenta de nuevo.');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Crea tu espacio
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Dos preguntas y estás en línea.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Nombre del negocio
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. La Casa del Mofongo"
              maxLength={50}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700">
              ¿Qué tipo de negocio?
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${
                    type === t.value
                      ? 'border-[#C8102E] bg-[#C8102E]/5 text-[#C8102E]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={!name.trim() || !type || pending}
            className="mt-8 w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Creando...' : 'Crear mi espacio'}
          </button>
        </div>
      </div>
    </div>
  );
}
