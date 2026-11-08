'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { sanitizeContactValue } from '@/lib/public-contact';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { parseApiError } from '@/lib/api-errors';
import { getCapabilities } from '@/lib/capabilities';
import { TrialExpiredNotice } from '@/components/space/TrialExpiredNotice';
import type { BusinessType, Plan, PublicTemplateProps } from '@/lib/templates/registry';
import { ConfigTab } from './ConfigTab';
import { CanalesTab } from './CanalesTab';
import { ContenidoTab, withAllDays } from './ContenidoTab';
import { PreviewFrame } from './PreviewFrame';
import {
  GATED_FIELDS,
  type CanalDto,
  type ProfileFormState,
  type ProcessStepDto,
  type FaqEntryDto,
  type HorarioDayDto,
  type MealPeriodHoursDto,
  type CategoryTranslationsDto,
  type SectionVisibilityDto,
  type CausaDto,
  type CommunityImpactDto,
} from './types';

interface Props {
  slug: string;
  id: string;
  businessType: BusinessType;
  plan: Plan;
  timezone: string;
  name: string;
  whatsapp: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  storeLayout: string;
  profileLoaded: boolean;
  description: string;
  descriptionEn: string;
  coverImageUrl: string | null;
  contactEmail: string;
  address: string;
  logoUrl: string | null;
  canales: CanalDto[];
  processSteps: ProcessStepDto[];
  faq: FaqEntryDto[];
  horario: HorarioDayDto[];
  mealPeriodHours: MealPeriodHoursDto;
  categoryTranslations: CategoryTranslationsDto;
  categoryNames: string[];
  sectionVisibility: SectionVisibilityDto;
  galleryImages: string[];
  causas: CausaDto[];
  communityImpact: CommunityImpactDto;
  publicUrl: string;
  /** Muestra del catálogo real para la vista previa (la arma design/page.tsx). */
  previewItems?: PublicTemplateProps['items'];
  /** Capacidades reales del negocio publicado — mandan sobre las del plan en la previa. */
  previewCapabilities?: Record<string, unknown> | null;
}

type Tab = 'config' | 'canales' | 'contenido';

export function DesignEditor({
  slug,
  id,
  businessType,
  plan,
  timezone,
  name,
  whatsapp,
  primaryColor,
  secondaryColor,
  accentColor,
  storeLayout,
  profileLoaded,
  description,
  descriptionEn,
  coverImageUrl,
  contactEmail,
  address,
  logoUrl,
  canales: initialCanales,
  processSteps: initialProcessSteps,
  faq: initialFaq,
  horario: initialHorario,
  mealPeriodHours: initialMealPeriodHours,
  categoryTranslations: initialCategoryTranslations,
  categoryNames,
  sectionVisibility: initialSectionVisibility,
  galleryImages: initialGalleryImages,
  causas: initialCausas,
  communityImpact: initialCommunityImpact,
  publicUrl,
  previewItems = [],
  previewCapabilities = null,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === 'canales' || initialTab === 'contenido' ? initialTab : 'config',
  );

  const initialForm: ProfileFormState = {
    name, description, descriptionEn, whatsapp, contactEmail, address, primaryColor, secondaryColor, accentColor, logoUrl, coverImageUrl,
    storeLayout,
  };

  // liveForm updates on every keystroke/click/upload. previewSnapshot only updates for the
  // "on-demand" text fields (via blur or the "Ver cambio" button) — primaryColor/logoUrl/
  // coverImageUrl are read straight from liveForm since clicking a swatch or finishing an
  // upload are discrete actions, not a per-keystroke stream, so there's no reactivity engine
  // to build for those.
  const [liveForm, setLiveForm] = useState<ProfileFormState>(initialForm);
  const [previewSnapshot, setPreviewSnapshot] = useState<ProfileFormState>(initialForm);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [canales, setCanales] = useState<CanalDto[]>(initialCanales);

  // Lifted out of ContenidoTab so PreviewFrame (the real public template, scaled) can render
  // them live as the user edits — ContenidoTab still owns the editing UI and its own save().
  const [processSteps, setProcessSteps] = useState<ProcessStepDto[]>(initialProcessSteps);
  const [faq, setFaq] = useState<FaqEntryDto[]>(initialFaq);
  const [horario, setHorario] = useState<HorarioDayDto[]>(withAllDays(initialHorario));
  const [mealPeriodHours, setMealPeriodHours] = useState<MealPeriodHoursDto>(initialMealPeriodHours);
  const [categoryTranslations, setCategoryTranslations] = useState<CategoryTranslationsDto>(initialCategoryTranslations);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibilityDto>(initialSectionVisibility);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages);
  const [causas, setCausas] = useState<CausaDto[]>(initialCausas);
  const [communityImpact, setCommunityImpact] = useState<CommunityImpactDto>(initialCommunityImpact);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof ProfileFormState, value: string | null) => {
    setLiveForm((f) => ({ ...f, [key]: value }));
    setTouched((t) => new Set(t).add(key));
  };

  const commitField = (key: keyof ProfileFormState) => {
    setPreviewSnapshot((p) => ({ ...p, [key]: liveForm[key] }));
  };

  const commitAll = () => {
    setPreviewSnapshot(liveForm);
  };

  // contactEmail stays a fallback field (unlike WhatsApp, which moved to Canales entirely) so
  // the owner isn't forced through Canales just to have a contact email at all. But that means
  // the same address can end up typed twice — here and in Canales — so on every successful
  // profile save, auto-create the Email canal from it. Only when none exists yet (by tipo,
  // regardless of activo — an owner who deliberately deactivated theirs shouldn't get a new
  // one silently recreated), so this only ever fires once per affiliate; every save after that
  // sees the canal already in `canales` state and skips it.
  const ensureEmailCanal = async () => {
    const email = liveForm.contactEmail.trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    if (canales.some((c) => c.tipo === 'Email')) return;

    try {
      const res = await fetch(`/api/space/${slug}/canales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'Email',
          metodo: 'Manual',
          valorCrudo: sanitizeContactValue(email),
          orden: canales.length,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) setCanales((c) => [...c, data]);
    } catch {
      // Best-effort — the profile save itself already succeeded; a failure here just means
      // the owner keeps seeing the "Este campo está siendo reemplazado..." note next time.
    }
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    setTrialExpired(false);
    setSaved(false);

    const body: Record<string, unknown> = {
      name: liveForm.name,
      whatsapp: sanitizeContactValue(liveForm.whatsapp),
      primaryColor: liveForm.primaryColor,
      // '' borra el color (vuelve al cálculo automático); el API lo trata como "limpiar".
      secondaryColor: liveForm.secondaryColor,
      accentColor: liveForm.accentColor,
      ...(businessType === 'retail' ? { storeLayout: liveForm.storeLayout } : {}),
    };
    // The public-profile fetch can fail (see page.tsx) — only send gated fields we know are
    // real (successfully loaded) or that the user explicitly edited this session. Never send
    // an unloaded field's default empty value, or a save could silently wipe real saved data.
    for (const f of GATED_FIELDS) {
      if (profileLoaded || touched.has(f)) {
        // La descripción llega como HTML del RichTextEditor: la saneamos antes de enviarla para
        // que lo guardado quede limpio (no solo al mostrar). Defensa de punta a punta.
        body[f] =
          f === 'description' || f === 'descriptionEn'
            ? sanitizeRichText(liveForm[f] as string)
            : liveForm[f];
      }
    }

    try {
      const res = await fetch(`/api/space/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        commitAll();
        await ensureEmailCanal();
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        const parsed = parseApiError(data, getText('Algo salió mal', 'Something went wrong'));
        setTrialExpired(parsed.isTrialExpired);
        setSaveError(parsed.message);
      }
    } catch {
      setSaveError(getText('Algo salió mal', 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'config', label: getText('Configuración', 'Settings'), icon: '⚙️' },
    { key: 'canales', label: getText('Canales', 'Channels'), icon: '💬' },
    { key: 'contenido', label: getText('Contenido', 'Content'), icon: '📝' },
  ];

  // Capacidades del plan, corregidas con las reales del negocio (las mismas que recibe la
  // tienda publicada): sin esto la previa anunciaba "Pago seguro con tarjeta" aunque el alta en
  // Stripe estuviera a medias y la tienda real no ofreciera tarjeta.
  const capabilities = { ...getCapabilities(plan), ...(previewCapabilities ?? {}) } as PublicTemplateProps['capabilities'];

  // Exact shape of PublicTemplateProps['business'] (registry.ts) — same fields the real
  // public page and /preview/[slug] build, so PreviewFrame can render the actual template
  // component instead of a hand-maintained approximation of it. items/categories are fixed
  // empty: the catalog preview is out of scope here.
  const previewBusiness: PublicTemplateProps['business'] = {
    id,
    slug,
    name: previewSnapshot.name,
    plan,
    description: previewSnapshot.description || null,
    descriptionEn: previewSnapshot.descriptionEn || null,
    logo_url: liveForm.logoUrl,
    cover_image_url: liveForm.coverImageUrl,
    primary_color: liveForm.primaryColor,
    secondary_color: liveForm.secondaryColor || null,
    accent_color: liveForm.accentColor || null,
    whatsapp: previewSnapshot.whatsapp || null,
    address: previewSnapshot.address || null,
    contactEmail: previewSnapshot.contactEmail || null,
    canales,
    business_type: businessType,
    store_layout: liveForm.storeLayout === 'marketplace' ? 'marketplace' : 'boutique',
    processSteps: processSteps.length > 0 ? processSteps : null,
    faq: faq.length > 0 ? faq : null,
    timezone,
    horario: horario.length > 0 ? horario : null,
    mealPeriodHours: Object.keys(mealPeriodHours).length > 0 ? mealPeriodHours : null,
    categoryTranslations: Object.keys(categoryTranslations).length > 0 ? categoryTranslations : null,
    sectionVisibility,
    galleryImages,
    causas: causas.length > 0 ? causas : null,
    communityImpact,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Top bar */}
      <div className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Diseñar mi Espacio', 'Design my Space')}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                {getText('En línea', 'Live')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveError && !trialExpired && <span className="text-sm text-red-600">{saveError}</span>}
            {saved && (
              <span className="text-sm text-emerald-600">{getText('✓ Guardado', '✓ Saved')}</span>
            )}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              {getText('Ver mi página ↗', 'View my page ↗')}
            </a>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? getText('Guardando...', 'Saving...') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>

        {trialExpired && (
          <div className="mt-4">
            <TrialExpiredNotice slug={slug} />
          </div>
        )}


        <ModuleIntro
          id="disenar"
          className="mt-4"
          summary={getText('Aquí cambias cómo se ve tu página pública: colores, textos y canales de contacto.', 'Change how your public page looks here: colors, texts and contact channels.')}
          steps={[
            getText('Cambia lo que quieras y mira la vista previa.', 'Change what you like and watch the preview.'),
            getText('Guarda para publicar los cambios en tu página.', 'Save to publish the changes to your page.'),
          ]}
        />

        {/* Tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto">
          {activeTab === 'config' && (
            <ConfigTab
              slug={slug}
              form={liveForm}
              businessType={businessType}
              onChange={updateField}
              onCommit={commitField}
              onCommitAll={commitAll}
              onGoToContenido={() => setActiveTab('contenido')}
              canales={canales}
            />
          )}
          {activeTab === 'canales' && (
            <CanalesTab slug={slug} canales={canales} onChange={setCanales} />
          )}
          {activeTab === 'contenido' && (
            <ContenidoTab
              slug={slug}
              processSteps={processSteps}
              onProcessStepsChange={setProcessSteps}
              faq={faq}
              onFaqChange={setFaq}
              horario={horario}
              onHorarioChange={setHorario}
              mealPeriodHours={mealPeriodHours}
              onMealPeriodHoursChange={setMealPeriodHours}
              categoryTranslations={categoryTranslations}
              onCategoryTranslationsChange={setCategoryTranslations}
              categoryNames={categoryNames}
              sectionVisibility={sectionVisibility}
              onSectionVisibilityChange={setSectionVisibility}
              galleryImages={galleryImages}
              onGalleryImagesChange={setGalleryImages}
              businessType={businessType}
              causas={causas}
              onCausasChange={setCausas}
              communityImpact={communityImpact}
              onCommunityImpactChange={setCommunityImpact}
            />
          )}
        </div>

        <div id="preview-panel" className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900/50 p-6 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto">
          <p className="mb-3 text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Vista previa', 'Preview')}
          </p>
          <PreviewFrame business={previewBusiness} capabilities={capabilities} items={previewItems} />
        </div>
      </div>
    </div>
  );
}
