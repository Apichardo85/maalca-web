'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { ApiError } from '@/lib/api-client';
import { sanitizeContactValue } from '@/lib/public-contact';

// Only these 4 have a real public template (src/components/public/templates/).
// Creator/Publisher/Professional stay visible but disabled until Fase 5 confirms
// the existing 4 work end-to-end and those templates get built.
const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante', emoji: '🍽️', comingSoon: false },
  { value: 'barber', label: 'Barbería', emoji: '💈', comingSoon: false },
  { value: 'service', label: 'Servicios', emoji: '🛠️', comingSoon: false },
  { value: 'retail', label: 'Tienda', emoji: '🛍️', comingSoon: false },
  { value: 'creator', label: 'Creador', emoji: '🎨', comingSoon: true },
  { value: 'publisher', label: 'Editorial', emoji: '📚', comingSoon: true },
  { value: 'professional', label: 'Profesional', emoji: '💼', comingSoon: true },
] as const;

const PALETTE = [
  { name: 'Rojo MaalCa', hex: '#C8102E' },
  { name: 'Azul Océano', hex: '#0066CC' },
  { name: 'Verde Esmeralda', hex: '#10B981' },
  { name: 'Morado', hex: '#7C3AED' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Amarillo', hex: '#F59E0B' },
  { name: 'Turquesa', hex: '#06B6D4' },
  { name: 'Negro', hex: '#171717' },
  { name: 'Gris Pizarra', hex: '#475569' },
  { name: 'Café', hex: '#92400E' },
  { name: 'Índigo', hex: '#4338CA' },
];

const STEPS = ['name', 'type', 'color', 'logo', 'whatsapp'] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [type, setType] = useState<typeof BUSINESS_TYPES[number]['value'] | ''>('');
  const [primaryColor, setPrimaryColor] = useState(PALETTE[0].hex);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar 2MB.');
      return;
    }
    setError(null);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const digits = whatsapp.replace(/\D/g, '');
  const whatsappValid = whatsapp.trim() === '' || (digits.length >= 11 && digits.length <= 15);

  const stepValid =
    (STEPS[step] === 'name' && name.trim().length >= 2) ||
    (STEPS[step] === 'type' && type !== '') ||
    STEPS[step] === 'color' ||
    STEPS[step] === 'logo' ||
    (STEPS[step] === 'whatsapp' && whatsappValid);

  const submit = () => {
    if (!name.trim() || !type || !whatsappValid) return;
    setError(null);
    const cleanWhatsapp = sanitizeContactValue(whatsapp);

    startTransition(async () => {
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            businessType: type,
            primaryColor,
            ...(cleanWhatsapp ? { whatsapp: cleanWhatsapp } : {}),
          }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => res.statusText);
          throw new ApiError(res.status, body);
        }
        const data: { affiliateId: string; slug: string } = await res.json();

        track('onboarding_completed', {
          business_id: data.affiliateId,
          business_type: type,
        });

        // Logo is non-critical to the core flow — the upload route needs an existing
        // affiliate slug, so it can only happen after the space is created. A failure
        // here doesn't block the redirect; the user can still add a logo from Configuración.
        if (logoFile) {
          try {
            const fd = new FormData();
            fd.append('file', logoFile);
            fd.append('itemId', 'logo');
            const uploadRes = await fetch(`/api/space/${data.slug}/catalog/upload-image`, {
              method: 'POST',
              body: fd,
            });
            const uploadData = await uploadRes.json();
            if (uploadRes.ok && uploadData.url) {
              await fetch(`/api/space/${data.slug}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: name.trim(),
                  whatsapp: cleanWhatsapp,
                  primaryColor,
                  logoUrl: uploadData.url,
                }),
              });
            }
          } catch {
            // swallow — logo can be added later from Configuración
          }
        }

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

  const goNext = () => {
    if (!stepValid) return;
    if (step === STEPS.length - 1) {
      submit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Crea tu espacio</h1>
          <p className="mt-2 text-sm text-neutral-500">Unos segundos y estás en línea.</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#C8102E]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {STEPS[step] === 'name' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Nombre del negocio
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. La Casa del Mofongo"
                maxLength={50}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
              />
            </div>
          )}

          {STEPS[step] === 'type' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                ¿Qué tipo de negocio?
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    disabled={t.comingSoon}
                    onClick={() => setType(t.value)}
                    title={t.comingSoon ? 'Próximamente' : undefined}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${
                      t.comingSoon
                        ? 'cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300'
                        : type === t.value
                          ? 'border-[#C8102E] bg-[#C8102E]/5 text-[#C8102E]'
                          : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className="font-medium">{t.label}</span>
                    {t.comingSoon && (
                      <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-neutral-300">
                        Pronto
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {STEPS[step] === 'color' && (
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Color principal
                </label>
                <span
                  className="inline-block h-5 w-5 flex-shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {PALETTE.map(({ name: colorName, hex }) => (
                  <button
                    key={hex}
                    type="button"
                    title={colorName}
                    onClick={() => setPrimaryColor(hex)}
                    className="relative h-8 w-8 rounded-full border-2 transition focus:outline-none"
                    style={{
                      backgroundColor: hex,
                      borderColor: primaryColor === hex ? '#ffffff' : 'transparent',
                      boxShadow: primaryColor === hex ? `0 0 0 2px ${hex}` : undefined,
                    }}
                  >
                    {primaryColor === hex && (
                      <svg className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {STEPS[step] === 'logo' && (
            <div className="flex flex-col items-center gap-2">
              <label className="self-start text-sm font-medium text-neutral-700">
                Logo (opcional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative mt-2 h-16 w-16 overflow-hidden rounded-full border-2 border-dashed border-neutral-300 bg-neutral-100 transition hover:border-neutral-400 focus:outline-none"
                title="Subir logo"
              >
                {logoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreviewUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl">📷</span>
                )}
              </button>
              <p className="text-xs text-neutral-400">Puedes agregarlo después si prefieres.</p>
            </div>
          )}

          {STEPS[step] === 'whatsapp' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoFocus
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="18095551234"
                maxLength={20}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Tus clientes te escribirán directamente a este número.
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Incluye el código de país (1 para República Dominicana/Estados Unidos).
              </p>
              {!whatsappValid && (
                <p className="mt-1 text-xs text-red-600">
                  El número de WhatsApp debe incluir el código de país (ej. 1 para RD/USA): 18095551234
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={pending}
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={!stepValid || pending}
              className="flex-1 rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending
                ? 'Creando...'
                : step === STEPS.length - 1
                  ? 'Crear mi espacio'
                  : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
