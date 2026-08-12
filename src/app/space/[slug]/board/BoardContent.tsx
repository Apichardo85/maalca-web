'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface ScreenAdRow {
  id: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  durationSeconds: number;
  sortOrder: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  /** "Contain" (default, nunca recorta) | "Cover" (llena el recuadro, puede recortar). */
  fit: 'Contain' | 'Cover';
}

// Fase 9 Etapa B — una pantalla adicional. Los overrides son null = "hereda del negocio"
// (los valores de arriba: adFrequency/boardLanguage/boardTheme/transitionEffect), consistente
// con cómo el backend resuelve /{slug}/board/{screenId} en PublicCatalogService.
// Fase 9 Etapa C — contentMode ('Menu' | 'AdsOnly' | 'FeaturedOnly') y adIds (null = todos los
// comerciales del negocio; lista = solo esos, puede ser vacía = ninguno) permiten armar una
// pantalla de un solo propósito (ej. solo comerciales) sin tocar la pantalla base.
export interface ScreenRow {
  id: string;
  name: string;
  sortOrder: number;
  language: string | null;
  boardTheme: string | null;
  adFrequency: number | null;
  categoryFilter: string | null;
  transitionEffect: string | null;
  contentMode: string;
  adIds: string[] | null;
}

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  initialAds: ScreenAdRow[];
  initialAdFrequency: number | null;
  initialLanguage: 'es' | 'en';
  initialBoardTheme: 'Dark' | 'Light';
  initialTransitionEffect: 'Fade' | 'Slide' | 'Zoom' | 'None';
  initialScreens: ScreenRow[];
  /** Categorías reales del catálogo (derivadas de los items) — para elegir por checkbox en vez
   *  de escribirlas a mano. */
  categories: string[];
}

/**
 * Fase 9 Etapa A — panel para subir/gestionar comerciales del Menu Board (/{slug}/board) y
 * configurar cada cuántos slides de menú se intercala uno. Mismo patrón visual que
 * OrdersContent.tsx (tarjetas + acciones inline), mismo bucket de Supabase que el upload de
 * imágenes de catálogo (ver screen-ads/upload-media/route.ts).
 */
export function BoardContent({
  slug, plan, initialAds, initialAdFrequency, initialLanguage, initialBoardTheme,
  initialTransitionEffect, initialScreens, categories,
}: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [ads, setAds] = useState(initialAds);
  const [adFrequency, setAdFrequency] = useState(initialAdFrequency ?? 0);
  const [boardLanguage, setBoardLanguage] = useState(initialLanguage);
  const [boardTheme, setBoardTheme] = useState(initialBoardTheme);
  const [transitionEffect, setTransitionEffect] = useState(initialTransitionEffect);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingFrequency, setSavingFrequency] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fase 9 Etapa B — pantallas adicionales
  const [screens, setScreens] = useState(initialScreens);
  const [addingScreen, setAddingScreen] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [creatingScreen, setCreatingScreen] = useState(false);
  const [screenBusyId, setScreenBusyId] = useState<string | null>(null);
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);

  async function createScreen() {
    if (!newScreenName.trim()) return;
    setCreatingScreen(true);
    try {
      const res = await fetch(`/api/space/${slug}/screens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newScreenName.trim() }),
      });
      const created = await res.json().catch(() => null);
      if (res.ok && created?.id) {
        setScreens((prev) => [...prev, created]);
        setNewScreenName('');
        setAddingScreen(false);
      }
    } finally {
      setCreatingScreen(false);
    }
  }

  async function updateScreen(screen: ScreenRow, patch: Partial<ScreenRow>) {
    setScreenBusyId(screen.id);
    try {
      const next = { ...screen, ...patch };
      const res = await fetch(`/api/space/${slug}/screens/${screen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: next.name,
          sortOrder: next.sortOrder,
          language: next.language,
          boardTheme: next.boardTheme,
          adFrequency: next.adFrequency,
          categoryFilter: next.categoryFilter,
          transitionEffect: next.transitionEffect,
          contentMode: next.contentMode,
          adIds: next.adIds,
        }),
      });
      const updated = await res.json().catch(() => null);
      if (res.ok && updated?.id) {
        setScreens((prev) => prev.map((s) => (s.id === screen.id ? updated : s)));
      }
    } finally {
      setScreenBusyId(null);
    }
  }

  // adIds null = hereda todos los comerciales del negocio (todos "marcados" visualmente).
  // Al desmarcar/marcar, si el resultado termina siendo el set completo se vuelve a guardar
  // como null (misma semántica, más limpio que guardar una lista igual a "todos").
  function toggleScreenAd(screen: ScreenRow, adId: string) {
    const current = screen.adIds ?? ads.map((a) => a.id);
    const next = current.includes(adId) ? current.filter((id) => id !== adId) : [...current, adId];
    updateScreen(screen, { adIds: next.length === ads.length ? null : next });
  }

  // categoryFilter sigue siendo el string comma-separated que ya entiende el backend — el
  // checkbox solo arma/desarma esa lista a partir de las categorías reales del catálogo.
  function toggleScreenCategory(screen: ScreenRow, category: string) {
    const current = screen.categoryFilter
      ? screen.categoryFilter.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    const next = current.includes(category) ? current.filter((c) => c !== category) : [...current, category];
    updateScreen(screen, { categoryFilter: next.length === 0 ? null : next.join(',') });
  }

  async function deleteScreen(screenId: string) {
    setScreenBusyId(screenId);
    try {
      const res = await fetch(`/api/space/${slug}/screens/${screenId}`, { method: 'DELETE' });
      if (res.ok) setScreens((prev) => prev.filter((s) => s.id !== screenId));
    } finally {
      setScreenBusyId(null);
    }
  }

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`/api/space/${slug}/screen-ads/upload-media`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadData?.url) {
        setError(uploadData?.error ?? getText('No se pudo subir el archivo.', 'Could not upload the file.'));
        return;
      }

      const createRes = await fetch(`/api/space/${slug}/screen-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: uploadData.url,
          mediaType: uploadData.mediaType,
          durationSeconds: 8,
          sortOrder: ads.length,
        }),
      });
      const created = await createRes.json().catch(() => null);
      if (!createRes.ok || !created?.id) {
        setError(getText('No se pudo guardar el comercial.', 'Could not save the ad.'));
        return;
      }
      setAds((prev) => [...prev, created]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function toggleActive(ad: ScreenAdRow) {
    setBusyId(ad.id);
    try {
      const res = await fetch(`/api/space/${slug}/screen-ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !ad.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAd(adId: string) {
    setBusyId(adId);
    try {
      const res = await fetch(`/api/space/${slug}/screen-ads/${adId}`, { method: 'DELETE' });
      if (res.ok) setAds((prev) => prev.filter((a) => a.id !== adId));
    } finally {
      setBusyId(null);
    }
  }

  async function saveFrequency() {
    setSavingFrequency(true);
    try {
      await fetch(`/api/space/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adFrequency }),
      });
    } finally {
      setSavingFrequency(false);
    }
  }

  // Idioma, tema y efecto del board — preferencia del NEGOCIO (nadie interactúa con una TV
  // para cambiarlos), separado de `language` de arriba que es la del visitante viendo este panel.
  async function savePrefs(next: {
    language?: 'es' | 'en';
    boardTheme?: 'Dark' | 'Light';
    transitionEffect?: 'Fade' | 'Slide' | 'Zoom' | 'None';
  }) {
    setSavingPrefs(true);
    try {
      await fetch(`/api/space/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } finally {
      setSavingPrefs(false);
    }
  }

  async function updateAdFit(ad: ScreenAdRow, fit: 'Contain' | 'Cover') {
    setBusyId(ad.id);
    try {
      const res = await fetch(`/api/space/${slug}/screen-ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fit }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12 max-w-3xl">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Pantalla (Menu Board)', 'Screen (Menu Board)')}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Comerciales o promos que se intercalan con tu menú en la pantalla pública. Ábrela en tu Smart TV: ',
            'Commercials or promos that rotate with your menu on the public screen. Open it on your Smart TV: ',
          )}
          <a href={`/${slug}/board`} target="_blank" rel="noopener" className="text-[#C8102E] underline">
            maalca.com/{slug}/board
          </a>
        </p>

        {plan === 'free' && (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'El Menu Board es parte del plan Emprendedor. Con el plan gratis, esta pantalla queda configurada pero no se activa públicamente.',
              'The Menu Board is part of the Entrepreneur plan. On the free plan, this screen stays configured but not publicly active.',
            )}
          </p>
        )}

        {/* Frecuencia de rotación */}
        <div className="mt-6 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-sm font-semibold">{getText('Frecuencia de comerciales', 'Ad frequency')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Cada cuántos slides de menú aparece un comercial. 0 = nunca (solo menú).',
              'How many menu slides between each ad. 0 = never (menu only).',
            )}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
              value={adFrequency}
              onChange={(e) => setAdFrequency(Number(e.target.value))}
              className="w-20 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm"
            />
            <button
              onClick={saveFrequency}
              disabled={savingFrequency}
              className="rounded-full bg-[#C8102E] px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {savingFrequency ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>

        {/* Idioma, tema y efecto del board */}
        <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-sm font-semibold">{getText('Idioma, tema y efecto de la pantalla', 'Screen language, theme and effect')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Como nadie interactúa con la TV, esto se configura acá — no cambia con el idioma de este panel.',
              "Since nobody interacts with the TV, this is set here — it doesn't change with this panel's language.",
            )}
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Idioma', 'Language')}
              <select
                value={boardLanguage}
                onChange={(e) => {
                  const value = e.target.value as 'es' | 'en';
                  setBoardLanguage(value);
                  savePrefs({ language: value });
                }}
                disabled={savingPrefs}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Tema', 'Theme')}
              <select
                value={boardTheme}
                onChange={(e) => {
                  const value = e.target.value as 'Dark' | 'Light';
                  setBoardTheme(value);
                  savePrefs({ boardTheme: value });
                }}
                disabled={savingPrefs}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
              >
                <option value="Dark">{getText('Oscuro', 'Dark')}</option>
                <option value="Light">{getText('Claro', 'Light')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Efecto de transición', 'Transition effect')}
              <select
                value={transitionEffect}
                onChange={(e) => {
                  const value = e.target.value as 'Fade' | 'Slide' | 'Zoom' | 'None';
                  setTransitionEffect(value);
                  savePrefs({ transitionEffect: value });
                }}
                disabled={savingPrefs}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
              >
                <option value="Fade">{getText('Desvanecer', 'Fade')}</option>
                <option value="Slide">{getText('Deslizar', 'Slide')}</option>
                <option value="Zoom">{getText('Acercar', 'Zoom')}</option>
                <option value="None">{getText('Ninguno', 'None')}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Pantallas adicionales — Fase 9 Etapa B */}
        <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">{getText('Pantallas adicionales', 'Additional screens')}</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                {getText(
                  'Más TVs con su propia configuración (ej. solo comerciales, o en inglés). Lo que no cambies acá hereda lo del negocio, arriba.',
                  'More TVs with their own settings (e.g. ads-only, or in English). Anything you leave unset here inherits the business default above.',
                )}
              </p>
            </div>
            <button
              onClick={() => setAddingScreen((v) => !v)}
              className="shrink-0 rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E]"
            >
              {addingScreen ? getText('Cancelar', 'Cancel') : getText('+ Agregar', '+ Add')}
            </button>
          </div>

          {addingScreen && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                placeholder={getText('Nombre (ej. Pantalla cocina)', 'Name (e.g. Kitchen screen)')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm"
              />
              <button
                onClick={createScreen}
                disabled={creatingScreen || !newScreenName.trim()}
                className="rounded-full bg-[#C8102E] px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {creatingScreen ? getText('Creando…', 'Creating…') : getText('Crear', 'Create')}
              </button>
            </div>
          )}

          {screens.length === 0 ? (
            <p className="mt-4 text-xs text-gray-400 dark:text-neutral-500">
              {getText('Todavía no tienes pantallas adicionales.', "You don't have additional screens yet.")}
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {screens.map((screen) => (
                <div key={screen.id} className="rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{screen.name}</p>
                      <a
                        href={`/${slug}/board/${screen.id}`}
                        target="_blank"
                        rel="noopener"
                        className="text-xs text-[#C8102E] underline truncate block"
                      >
                        maalca.com/{slug}/board/{screen.id}
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => setEditingScreenId((id) => (id === screen.id ? null : screen.id))}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E]"
                      >
                        {editingScreenId === screen.id ? getText('Cerrar', 'Close') : getText('Editar', 'Edit')}
                      </button>
                      <button
                        onClick={() => deleteScreen(screen.id)}
                        disabled={screenBusyId === screen.id}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                      >
                        {getText('Eliminar', 'Delete')}
                      </button>
                    </div>
                  </div>

                  {editingScreenId === screen.id && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 dark:border-neutral-800 pt-3">
                      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText('Idioma', 'Language')}
                        <select
                          value={screen.language ?? ''}
                          disabled={screenBusyId === screen.id}
                          onChange={(e) => updateScreen(screen, { language: e.target.value || null })}
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        >
                          <option value="">{getText('Heredar del negocio', 'Inherit from business')}</option>
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText('Tema', 'Theme')}
                        <select
                          value={screen.boardTheme ?? ''}
                          disabled={screenBusyId === screen.id}
                          onChange={(e) => updateScreen(screen, { boardTheme: e.target.value || null })}
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        >
                          <option value="">{getText('Heredar del negocio', 'Inherit from business')}</option>
                          <option value="Dark">{getText('Oscuro', 'Dark')}</option>
                          <option value="Light">{getText('Claro', 'Light')}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText('Frecuencia de comerciales', 'Ad frequency')}
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={screen.adFrequency ?? ''}
                          disabled={screenBusyId === screen.id}
                          placeholder={getText('Heredar', 'Inherit')}
                          onChange={(e) =>
                            updateScreen(screen, { adFrequency: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText('Efecto de transición', 'Transition effect')}
                        <select
                          value={screen.transitionEffect ?? ''}
                          disabled={screenBusyId === screen.id}
                          onChange={(e) => updateScreen(screen, { transitionEffect: e.target.value || null })}
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        >
                          <option value="">{getText('Heredar del negocio', 'Inherit from business')}</option>
                          <option value="Fade">{getText('Desvanecer', 'Fade')}</option>
                          <option value="Slide">{getText('Deslizar', 'Slide')}</option>
                          <option value="Zoom">{getText('Acercar', 'Zoom')}</option>
                          <option value="None">{getText('Ninguno', 'None')}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText('Modo de contenido', 'Content mode')}
                        <select
                          value={screen.contentMode}
                          disabled={screenBusyId === screen.id}
                          onChange={(e) => updateScreen(screen, { contentMode: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        >
                          <option value="Menu">{getText('Menú normal', 'Normal menu')}</option>
                          <option value="AdsOnly">{getText('Solo comerciales', 'Ads only')}</option>
                          <option value="FeaturedOnly">{getText('Solo destacados', 'Featured only')}</option>
                        </select>
                      </label>

                      {screen.contentMode !== 'AdsOnly' && categories.length > 0 && (
                        <div className="col-span-2 sm:col-span-4 flex flex-col gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400">
                          {getText('Categorías (vacío = todas)', 'Categories (empty = all)')}
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                              const selected = (screen.categoryFilter ?? '')
                                .split(',').map((c) => c.trim()).filter(Boolean)
                                .includes(category);
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  disabled={screenBusyId === screen.id}
                                  onClick={() => toggleScreenCategory(screen, category)}
                                  className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                                    selected
                                      ? 'border-[#C8102E] bg-[#C8102E]/10 text-[#C8102E]'
                                      : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:border-[#C8102E]'
                                  }`}
                                >
                                  {category}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {ads.length > 0 && (
                        <div className="col-span-2 sm:col-span-4 flex flex-col gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400">
                          {getText('Comerciales en esta pantalla (vacío = ninguno)', 'Ads on this screen (empty = none)')}
                          <div className="flex flex-wrap gap-2">
                            {ads.map((ad) => {
                              const selected = (screen.adIds ?? ads.map((a) => a.id)).includes(ad.id);
                              const label = `${ad.mediaType === 'Video' ? getText('Video', 'Video') : getText('Imagen', 'Image')} · ${ad.durationSeconds}s`;
                              return (
                                <button
                                  key={ad.id}
                                  type="button"
                                  disabled={screenBusyId === screen.id}
                                  onClick={() => toggleScreenAd(screen, ad.id)}
                                  className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                                    selected
                                      ? 'border-[#C8102E] bg-[#C8102E]/10 text-[#C8102E]'
                                      : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:border-[#C8102E]'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subir comercial */}
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-5 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            id="ad-upload"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <label
            htmlFor="ad-upload"
            className="cursor-pointer text-sm font-medium text-[#C8102E] hover:underline"
          >
            {uploading
              ? getText('Subiendo…', 'Uploading…')
              : getText('+ Subir comercial (imagen o video)', '+ Upload ad (image or video)')}
          </label>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {/* Lista de comerciales */}
        {ads.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {getText('Todavía no hay comerciales.', 'No ads yet.')}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800">
                  {ad.mediaType === 'Video' ? (
                    <video src={ad.mediaUrl} className="h-full w-full object-contain" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.mediaUrl} alt="" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {ad.mediaType === 'Video' ? getText('Video', 'Video') : getText('Imagen', 'Image')} · {ad.durationSeconds}s
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      ad.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {ad.active ? getText('Activo', 'Active') : getText('Inactivo', 'Inactive')}
                  </span>
                </div>
                <label className="flex shrink-0 flex-col gap-1 text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                  {getText('Ajuste', 'Fit')}
                  <select
                    value={ad.fit}
                    disabled={busyId === ad.id}
                    onChange={(e) => updateAdFit(ad, e.target.value as 'Contain' | 'Cover')}
                    className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs text-gray-900 dark:text-white"
                  >
                    <option value="Contain">{getText('Ajustar (sin recortar)', 'Fit (no crop)')}</option>
                    <option value="Cover">{getText('Llenar (recorta)', 'Fill (crops)')}</option>
                  </select>
                </label>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    disabled={busyId === ad.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-50"
                  >
                    {ad.active ? getText('Pausar', 'Pause') : getText('Activar', 'Activate')}
                  </button>
                  <button
                    onClick={() => deleteAd(ad.id)}
                    disabled={busyId === ad.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                  >
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
