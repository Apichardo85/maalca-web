'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { ApiError } from '@/lib/api-client';
import { sanitizeContactValue } from '@/lib/public-contact';
import { useTranslation } from '@/hooks/useSimpleLanguage';

// Only these 4 have a real public template (src/components/public/templates/).
// Creator/Publisher/Professional stay visible but disabled until Fase 5 confirms
// the existing 4 work end-to-end and those templates get built.
const BUSINESS_TYPES = [
  { value: 'restaurant', labelKey: 'onboarding.type.restaurant.label', emoji: '🍽️', examplesKey: 'onboarding.type.restaurant.examples', comingSoon: false },
  { value: 'barber', labelKey: 'onboarding.type.barber.label', emoji: '💈', examplesKey: 'onboarding.type.barber.examples', comingSoon: false },
  { value: 'service', labelKey: 'onboarding.type.service.label', emoji: '🛠️', examplesKey: 'onboarding.type.service.examples', comingSoon: false },
  { value: 'retail', labelKey: 'onboarding.type.retail.label', emoji: '🛍️', examplesKey: 'onboarding.type.retail.examples', comingSoon: false },
  { value: 'creator', labelKey: 'onboarding.type.creator.label', emoji: '🎨', examplesKey: null, comingSoon: true },
  { value: 'publisher', labelKey: 'onboarding.type.publisher.label', emoji: '📚', examplesKey: null, comingSoon: true },
  { value: 'professional', labelKey: 'onboarding.type.professional.label', emoji: '💼', examplesKey: null, comingSoon: true },
] as const;

const PALETTE = [
  { nameKey: 'onboarding.palette.redMaalca', hex: '#C8102E' },
  { nameKey: 'onboarding.palette.oceanBlue', hex: '#0066CC' },
  { nameKey: 'onboarding.palette.emeraldGreen', hex: '#10B981' },
  { nameKey: 'onboarding.palette.purple', hex: '#7C3AED' },
  { nameKey: 'onboarding.palette.orange', hex: '#F97316' },
  { nameKey: 'onboarding.palette.pink', hex: '#EC4899' },
  { nameKey: 'onboarding.palette.yellow', hex: '#F59E0B' },
  { nameKey: 'onboarding.palette.turquoise', hex: '#06B6D4' },
  { nameKey: 'onboarding.palette.black', hex: '#171717' },
  { nameKey: 'onboarding.palette.slateGray', hex: '#475569' },
  { nameKey: 'onboarding.palette.brown', hex: '#92400E' },
  { nameKey: 'onboarding.palette.indigo', hex: '#4338CA' },
];

const STEPS = ['name', 'type', 'color', 'logo', 'whatsapp'] as const;

// Shared by every plain text input in this form — missing `text-neutral-900`
// here is exactly the bug that made the Nombre and WhatsApp inputs render
// invisible text, twice, independently. One definition instead of copies.
const inputClass =
  'mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none';

export function OnboardingForm() {
  const { t } = useTranslation();
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
      setError(t('onboarding.error.logoTooLarge'));
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
          setError(t('onboarding.error.duplicateBusiness'));
        } else {
          setError(t('onboarding.error.generic'));
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="MaalCa" width={32} height={32} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{t('onboarding.title')}</h1>
          <p className="mt-2 text-sm text-neutral-500">{t('onboarding.subtitle')}</p>
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
                {t('onboarding.step.name.label')}
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onboarding.step.name.placeholder')}
                maxLength={50}
                className={inputClass}
              />
            </div>
          )}

          {STEPS[step] === 'type' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                {t('onboarding.step.type.label')}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((bt) => (
                  <button
                    key={bt.value}
                    type="button"
                    disabled={bt.comingSoon}
                    onClick={() => setType(bt.value)}
                    title={bt.comingSoon ? t('onboarding.type.comingSoonTitle') : undefined}
                    className={`relative flex flex-col gap-0.5 rounded-lg border px-3 py-3 text-left text-sm transition ${
                      bt.comingSoon ? 'pr-11' : ''
                    } ${
                      bt.comingSoon
                        ? 'cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300'
                        : type === bt.value
                          ? 'border-[#C8102E] bg-[#C8102E]/5 text-[#C8102E]'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 text-lg">{bt.emoji}</span>
                      <span className="font-medium">{t(bt.labelKey)}</span>
                    </div>
                    {bt.examplesKey && (
                      <span className="text-xs text-neutral-400">{t(bt.examplesKey)}</span>
                    )}
                    {bt.comingSoon && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                        {t('onboarding.type.comingSoonBadge')}
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
                  {t('onboarding.step.color.label')}
                </label>
                <span
                  className="inline-block h-5 w-5 flex-shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {PALETTE.map(({ nameKey: colorNameKey, hex }) => (
                  <button
                    key={hex}
                    type="button"
                    title={t(colorNameKey)}
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
                {t('onboarding.step.logo.label')}
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
                title={t('onboarding.step.logo.title')}
              >
                {logoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreviewUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl">📷</span>
                )}
              </button>
              <p className="text-xs text-neutral-400">{t('onboarding.step.logo.hint')}</p>
            </div>
          )}

          {STEPS[step] === 'whatsapp' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                {t('onboarding.step.whatsapp.label')}
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoFocus
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="18095551234"
                maxLength={20}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-neutral-400">
                {t('onboarding.step.whatsapp.hint1')}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                {t('onboarding.step.whatsapp.hint2')}
              </p>
              {!whatsappValid && (
                <p className="mt-1 text-xs text-red-600">
                  {t('onboarding.step.whatsapp.invalid')}
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
                {t('onboarding.button.back')}
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={!stepValid || pending}
              className="flex-1 rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending
                ? t('onboarding.button.creating')
                : step === STEPS.length - 1
                  ? t('onboarding.button.create')
                  : t('onboarding.button.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
