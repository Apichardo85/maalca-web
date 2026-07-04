'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ConfigTab } from './ConfigTab';
import { CanalesTab } from './CanalesTab';
import { QrTab } from './QrTab';
import { PreviewPanel } from './PreviewPanel';
import { GATED_FIELDS, type CanalDto, type ProfileFormState } from './types';

interface Props {
  slug: string;
  name: string;
  whatsapp: string;
  primaryColor: string;
  profileLoaded: boolean;
  description: string;
  coverImageUrl: string | null;
  contactEmail: string;
  address: string;
  website: string;
  logoUrl: string | null;
  canales: CanalDto[];
  publicUrl: string;
  qrDataUrl: string;
}

type Tab = 'config' | 'canales' | 'qr';

export function DesignEditor({
  slug,
  name,
  whatsapp,
  primaryColor,
  profileLoaded,
  description,
  coverImageUrl,
  contactEmail,
  address,
  website,
  logoUrl,
  canales: initialCanales,
  publicUrl,
  qrDataUrl,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === 'canales' || initialTab === 'qr' ? initialTab : 'config',
  );

  const initialForm: ProfileFormState = {
    name, description, whatsapp, contactEmail, address, website, primaryColor, logoUrl, coverImageUrl,
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

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const body: Record<string, unknown> = {
      name: liveForm.name,
      whatsapp: liveForm.whatsapp,
      primaryColor: liveForm.primaryColor,
    };
    // The public-profile fetch can fail (see page.tsx) — only send gated fields we know are
    // real (successfully loaded) or that the user explicitly edited this session. Never send
    // an unloaded field's default empty value, or a save could silently wipe real saved data.
    for (const f of GATED_FIELDS) {
      if (profileLoaded || touched.has(f)) {
        body[f] = liveForm[f];
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
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? getText('Algo salió mal', 'Something went wrong'));
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
    { key: 'qr', label: 'QR', icon: '📱' },
  ];

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
            {saveError && <span className="text-sm text-red-600">{saveError}</span>}
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
              className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? getText('Guardando...', 'Saving...') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'bg-[#C8102E]/10 text-[#C8102E]'
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
              onChange={updateField}
              onCommit={commitField}
              onCommitAll={commitAll}
            />
          )}
          {activeTab === 'canales' && (
            <CanalesTab slug={slug} canales={canales} onChange={setCanales} />
          )}
          {activeTab === 'qr' && (
            <QrTab slug={slug} publicUrl={publicUrl} qrDataUrl={qrDataUrl} />
          )}
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900/50 p-6 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto">
          <p className="mb-3 text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Vista previa', 'Preview')}
          </p>
          <PreviewPanel
            name={previewSnapshot.name}
            description={previewSnapshot.description}
            address={previewSnapshot.address}
            website={previewSnapshot.website}
            whatsapp={previewSnapshot.whatsapp}
            contactEmail={previewSnapshot.contactEmail}
            primaryColor={liveForm.primaryColor}
            logoUrl={liveForm.logoUrl}
            coverImageUrl={liveForm.coverImageUrl}
            canales={canales}
          />
        </div>
      </div>
    </div>
  );
}
