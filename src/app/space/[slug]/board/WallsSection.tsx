'use client';

// Muros de pantallas sincronizadas — todo se configura desde aquí, de punta a punta:
// crear el muro (se crean solas sus TVs), modo (espejo / muro), acomodo, marco, reacomodar,
// calibrar y el link/QR de cada TV para ponerlo una sola vez en Fully Kiosk. Las TVs toman los
// cambios solas en su próximo poll (≤ 1 min): nadie tiene que tocar el TV ni recordar rutas.

import { useState } from 'react';
import QRCode from 'qrcode';

export interface WallSlot {
  screenId: string;
  screenName: string;
  col: number;
  row: number;
}

export interface WallRow {
  id: string;
  name: string;
  mode: 'Mirror' | 'Span' | string;
  cols: number;
  rows: number;
  bezelPx: number;
  calibrate: boolean;
  slots: WallSlot[];
}

interface Props {
  slug: string;
  initialWalls: WallRow[];
  /** Contenido de cada pantalla (de "Pantallas adicionales") para mostrar qué sale en cada TV. */
  screens: Array<{ id: string; categoryFilter: string | null; contentMode: string }>;
  getText: (es: string, en: string) => string;
  /** Crear/redimensionar un muro crea o suelta pantallas: el listado de arriba se recarga. */
  onScreensChanged: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}

const MIRROR_COUNTS = [2, 3, 4, 5, 6, 8];
const mirrorShape = (n: number) => ({ cols: Math.min(n, 4), rows: Math.ceil(n / 4) });

const btn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50';
const input =
  'rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white';

export function WallsSection({ slug, initialWalls, screens, getText, onScreensChanged, toast }: Props) {
  const [walls, setWalls] = useState(initialWalls);
  const [busy, setBusy] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMode, setNewMode] = useState<'Span' | 'Mirror'>('Span');
  const [newCols, setNewCols] = useState(2);
  const [newRows, setNewRows] = useState(1);
  const [swapFrom, setSwapFrom] = useState<{ wallId: string; screenId: string } | null>(null);
  const [qr, setQr] = useState<{ title: string; url: string; dataUrl: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const contentLabel = (screenId: string) => {
    const sc = screens.find((x) => x.id === screenId);
    if (!sc) return '';
    if (sc.contentMode === 'AdsOnly') return getText('Solo comerciales', 'Ads only');
    if (sc.contentMode === 'FeaturedOnly') return getText('Solo destacados', 'Featured only');
    return sc.categoryFilter?.trim() || getText('Todo el menú', 'Full menu');
  };
  const norm = (f: string | null | undefined) =>
    (f ?? '').split(',').map((c) => c.trim().toLowerCase()).filter(Boolean).sort().join('|');
  const perTv = (w: WallRow) => {
    const list = w.slots.map((sl) => screens.find((x) => x.id === sl.screenId)).filter(Boolean) as Props['screens'];
    return list.some((x) => norm(x.categoryFilter) !== norm(list[0]?.categoryFilter) || x.contentMode !== list[0]?.contentMode);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://maalca.com';
  const tvUrl = (screenId: string) => `${origin}/${slug}/board/${screenId}`;

  async function call(method: string, path: string, body?: unknown) {
    const res = await fetch(`/api/space/${slug}/screen-walls${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
    return data;
  }

  const replace = (w: WallRow) => setWalls((prev) => prev.map((x) => (x.id === w.id ? w : x)));

  async function createWall() {
    if (!newName.trim()) return;
    setBusy('new');
    try {
      const shape = newMode === 'Mirror' ? mirrorShape(newCols) : { cols: newCols, rows: newRows };
      const created: WallRow = await call('POST', '', { name: newName.trim(), mode: newMode, ...shape });
      setWalls((prev) => [...prev, created]);
      setCreating(false);
      setNewName('');
      onScreensChanged();
      toast.success(getText(`Muro creado con ${created.slots.length} TVs.`, `Wall created with ${created.slots.length} TVs.`));
    } catch (e) {
      toast.error(getText('No se pudo crear el muro.', "Couldn't create the wall.") + ` ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function patchWall(w: WallRow, patch: Partial<Pick<WallRow, 'name' | 'mode' | 'cols' | 'rows' | 'bezelPx' | 'calibrate'>>) {
    setBusy(w.id);
    try {
      const updated: WallRow = await call('PATCH', `/${w.id}`, patch);
      replace(updated);
      if (patch.cols !== undefined || patch.rows !== undefined) onScreensChanged();
      return updated;
    } catch {
      toast.error(getText('No se pudo guardar el cambio.', "Couldn't save the change."));
    } finally {
      setBusy(null);
    }
  }

  async function deleteWall(w: WallRow) {
    if (!confirm(getText(
      `¿Eliminar el muro "${w.name}"? Sus TVs quedan como pantallas sueltas (sus links siguen funcionando).`,
      `Delete wall "${w.name}"? Its TVs stay as standalone screens (their links keep working).`,
    ))) return;
    setBusy(w.id);
    try {
      await call('DELETE', `/${w.id}`);
      setWalls((prev) => prev.filter((x) => x.id !== w.id));
      onScreensChanged();
    } catch {
      toast.error(getText('No se pudo eliminar el muro.', "Couldn't delete the wall."));
    } finally {
      setBusy(null);
    }
  }

  async function tapSlot(w: WallRow, slot: WallSlot) {
    if (!swapFrom || swapFrom.wallId !== w.id) {
      setSwapFrom({ wallId: w.id, screenId: slot.screenId });
      return;
    }
    if (swapFrom.screenId === slot.screenId) { setSwapFrom(null); return; }
    const a = w.slots.find((s) => s.screenId === swapFrom.screenId);
    setSwapFrom(null);
    if (!a) return;
    setBusy(w.id);
    try {
      const updated: WallRow = await call('PUT', `/${w.id}/slots`, {
        slots: [
          { screenId: a.screenId, col: slot.col, row: slot.row },
          { screenId: slot.screenId, col: a.col, row: a.row },
        ],
      });
      replace(updated);
      onScreensChanged();
    } catch {
      toast.error(getText('No se pudo reacomodar.', "Couldn't rearrange."));
    } finally {
      setBusy(null);
    }
  }

  async function showQr(title: string, url: string) {
    const dataUrl = await QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: 'M' });
    setQr({ title, url, dataUrl });
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(getText('Link copiado.', 'Link copied.'));
    } catch {
      toast.error(url);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{getText('Muros sincronizados', 'Synced walls')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Varias TVs que funcionan juntas: todas iguales al mismo tiempo (espejo) o como una sola pantalla gigante (muro).',
              'Several TVs working together: all identical at the same time (mirror) or as one giant screen (wall).',
            )}
          </p>
        </div>
        <button onClick={() => setCreating((v) => !v)} className={`shrink-0 ${btn}`}>
          {creating ? getText('Cancelar', 'Cancel') : getText('+ Nuevo muro', '+ New wall')}
        </button>
      </div>

      {creating && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3">
          <input
            type="text"
            value={newName}
            maxLength={60}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={getText('Nombre (ej. Muro del comedor)', 'Name (e.g. Dining room wall)')}
            className={input}
          />
          <ModePicker value={newMode} onChange={setNewMode} getText={getText} />
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
            {newMode === 'Mirror' ? (
              <label className="flex items-center gap-2">
                {getText('Cantidad de TVs', 'Number of TVs')}
                <select value={newCols} onChange={(e) => setNewCols(Number(e.target.value))} className={input}>
                  {MIRROR_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            ) : (
              <>
                <label className="flex items-center gap-2">
                  {getText('TVs a lo ancho', 'TVs across')}
                  <select value={newCols} onChange={(e) => setNewCols(Number(e.target.value))} className={input}>
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  {getText('Filas', 'Rows')}
                  <select value={newRows} onChange={(e) => setNewRows(Number(e.target.value))} className={input}>
                    {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>
          <div>
            <button
              onClick={createWall}
              disabled={busy === 'new' || !newName.trim() || (newMode === 'Span' && newCols * newRows < 2)}
              className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy === 'new' ? getText('Creando…', 'Creating…') : getText('Crear muro y sus TVs', 'Create wall and its TVs')}
            </button>
          </div>
        </div>
      )}

      {walls.length === 0 && !creating && (
        <p className="mt-4 text-xs text-gray-400 dark:text-neutral-500">
          {getText('Todavía no tienes muros.', "You don't have walls yet.")}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {walls.map((w) => {
          const isSpan = w.mode === 'Span';
          const total = w.cols * w.rows;
          const lead = [...w.slots].sort((a, b) => a.row - b.row || a.col - b.col)[0];
          return (
            <div key={w.id} className="rounded-xl border border-gray-200/70 dark:border-neutral-800 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <input
                  key={`${w.id}-${w.name}`}
                  defaultValue={w.name}
                  maxLength={60}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== w.name) patchWall(w, { name: v });
                    else e.target.value = w.name;
                  }}
                  className="min-w-0 basis-full bg-transparent text-sm font-semibold outline-none focus:underline sm:basis-0 sm:flex-1"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => patchWall(w, { calibrate: !w.calibrate })}
                    disabled={busy === w.id}
                    className={w.calibrate
                      ? 'rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50'
                      : btn}
                  >
                    {w.calibrate ? getText('■ Terminar calibración', '■ Stop calibration') : getText('Calibrar', 'Calibrate')}
                  </button>
                  <button onClick={() => deleteWall(w)} disabled={busy === w.id} className={`${btn} text-gray-500 hover:border-red-400 hover:text-red-500`}>
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>

              {w.calibrate && (
                <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  {getText(
                    'Las TVs muestran la prueba de sincronización (en menos de 1 minuto). Toma una foto a todas a la vez: mismo color, mismo número y la barra cruzando sin saltos = sincronizadas.',
                    'TVs show the sync test (within 1 minute). Take one photo of all of them: same color, same number and the bar crossing smoothly = in sync.',
                  )}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
                <ModePicker
                  value={isSpan ? 'Span' : 'Mirror'}
                  disabled={busy === w.id}
                  onChange={(mode) => patchWall(w, { mode })}
                  getText={getText}
                />
                {isSpan ? (
                  <>
                    <label className="flex items-center gap-2">
                      {getText('A lo ancho', 'Across')}
                      <select value={w.cols} disabled={busy === w.id} onChange={(e) => patchWall(w, { cols: Number(e.target.value) })} className={input}>
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label className="flex items-center gap-2">
                      {getText('Filas', 'Rows')}
                      <select value={w.rows} disabled={busy === w.id} onChange={(e) => patchWall(w, { rows: Number(e.target.value) })} className={input}>
                        {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label className="flex items-center gap-2" title={getText('Ancho del marco entre TVs: la imagen "salta" el marco en vez de partirse encima.', 'Bezel width between TVs.')}>
                      {getText('Marco (px)', 'Bezel (px)')}
                      <input
                        key={`${w.id}-bezel-${w.bezelPx}`}
                        type="number"
                        min={0}
                        max={400}
                        defaultValue={w.bezelPx}
                        disabled={busy === w.id}
                        onBlur={(e) => {
                          const v = Math.max(0, Math.min(400, Number(e.target.value) || 0));
                          if (v !== w.bezelPx) patchWall(w, { bezelPx: v });
                        }}
                        className={`w-20 ${input}`}
                      />
                    </label>
                  </>
                ) : (
                  <label className="flex items-center gap-2">
                    {getText('Cantidad de TVs', 'Number of TVs')}
                    <select
                      value={total}
                      disabled={busy === w.id}
                      onChange={(e) => patchWall(w, mirrorShape(Number(e.target.value)))}
                      className={input}
                    >
                      {[...new Set([...MIRROR_COUNTS, total])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                )}
              </div>

              {/* Grilla física del muro: cada recuadro es una TV, con su link fijo para Fully Kiosk.
                  Tocar dos TVs las intercambia de lugar. */}
              <div
                className="mt-4 grid gap-2"
                style={{ gridTemplateColumns: `repeat(${isSpan ? w.cols : Math.min(total, 4)}, minmax(0, 1fr))` }}
              >
                {[...w.slots].sort((a, b) => a.row - b.row || a.col - b.col).map((s, i) => {
                  const selected = swapFrom?.wallId === w.id && swapFrom.screenId === s.screenId;
                  return (
                    <div
                      key={s.screenId}
                      className={`flex min-w-0 flex-col gap-2 rounded-lg border p-2.5 ${selected ? 'border-brand-primary ring-2 ring-brand-primary/40' : 'border-gray-200 dark:border-neutral-700'} bg-gray-50 dark:bg-neutral-950`}
                    >
                      <button
                        type="button"
                        onClick={() => tapSlot(w, s)}
                        disabled={busy === w.id}
                        title={getText('Toca dos TVs para intercambiarlas', 'Tap two TVs to swap them')}
                        className="flex aspect-video w-full flex-col items-center justify-center rounded-md bg-neutral-900 text-white"
                      >
                        <span className="text-lg font-bold">TV {i + 1}</span>
                        {s.screenId === lead?.screenId && (
                          <span className="text-[10px] uppercase tracking-wide text-white/60">
                            {isSpan ? getText('comerciales', 'ads') : getText('contenido', 'content')}
                          </span>
                        )}
                      </button>
                      <p className="truncate text-xs font-medium" title={s.screenName}>{s.screenName}</p>
                      <p className="truncate text-[11px] text-gray-500 dark:text-neutral-400" title={contentLabel(s.screenId)}>
                        {isSpan ? contentLabel(s.screenId) : getText('Igual a TV 1', 'Same as TV 1')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => copy(tvUrl(s.screenId))} className={`${btn} px-2 py-1`}>{getText('Copiar link', 'Copy link')}</button>
                        <button onClick={() => showQr(`${w.name} · TV ${i + 1}`, tvUrl(s.screenId))} className={`${btn} px-2 py-1`}>QR</button>
                        <a href={`/${slug}/board/${s.screenId}`} target="_blank" rel="noopener" className={`${btn} px-2 py-1`}>{getText('Abrir', 'Open')}</a>
                      </div>
                    </div>
                  );
                })}
              </div>
              {swapFrom?.wallId === w.id && (
                <p className="mt-2 text-xs text-brand-primary">{getText('Ahora toca la TV con la que quieres intercambiarla.', 'Now tap the TV to swap it with.')}</p>
              )}

              <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
                {!isSpan
                  ? getText(
                      `Espejo: todas las TVs muestran el contenido de "${lead?.screenName ?? 'TV 1'}" (edítalo en Pantallas adicionales).`,
                      `Mirror: every TV shows the content of "${lead?.screenName ?? 'TV 1'}" (edit it under Additional screens).`,
                    )
                  : perTv(w)
                    ? getText(
                        'Cada TV muestra sus propias categorías (edítalas con "Editar" en Pantallas adicionales) y cambian de slide al mismo tiempo.',
                        'Each TV shows its own categories (edit them with "Edit" under Additional screens) and they change slides at the same time.',
                      )
                    : getText(
                        'Todas tienen el mismo menú, así que las slides se reparten solas entre las TVs. Para que cada TV muestre algo distinto, ponle categorías propias en Pantallas adicionales.',
                        'All TVs have the same menu, so slides are spread across them automatically. To give each TV its own content, set its categories under Additional screens.',
                      )}
                {' ' + getText(
                  `Los comerciales son comunes a todo el muro y se configuran en "${lead?.screenName ?? 'TV 1'}".`,
                  `Ads are shared by the whole wall and are set on "${lead?.screenName ?? 'TV 1'}".`,
                )}
                {isSpan && ' ' + getText(
                  `Un comercial con la proporción del muro (${w.cols * 16}:${w.rows * 9}) se estira sobre todas las TVs; cualquier otro se repite completo en cada una.`,
                  `An ad with the wall's aspect ratio (${w.cols * 16}:${w.rows * 9}) stretches across all TVs; any other is shown whole on each one.`,
                )}
              </p>
            </div>
          );
        })}
      </div>

      {walls.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setHelpOpen((v) => !v)} className="text-xs font-medium text-brand-primary">
            {helpOpen ? '▾' : '▸'} {getText('Cómo instalar las TVs', 'How to set up the TVs')}
          </button>
          {helpOpen && (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-600 dark:text-neutral-400">
              <li>{getText('En cada TV instala Fully Kiosk Browser.', 'Install Fully Kiosk Browser on each TV.')}</li>
              <li>{getText('Pon como "Start URL" el link de ESA TV (botón Copiar link). Truco: activa "Remote Administration" en Fully y pégalo desde tu celular, sin escribirlo con el control.', 'Set its "Start URL" to THAT TV\'s link (Copy link). Tip: enable "Remote Administration" in Fully and paste it from your phone instead of typing with the remote.')}</li>
              <li>{getText('Ese link no cambia nunca: todo lo demás (modo, acomodo, contenido) se cambia desde aquí y las TVs lo toman solas en menos de 1 minuto.', "That link never changes: everything else (mode, layout, content) is changed here and the TVs pick it up within 1 minute.")}</li>
              <li>{getText('Usa "Calibrar" para comprobar que están sincronizadas, y vuelve a tocarlo para terminar.', 'Use "Calibrate" to check they are in sync, then tap it again to finish.')}</li>
            </ol>
          )}
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setQr(null)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center text-gray-900 dark:bg-neutral-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold">{qr.title}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.dataUrl} alt="QR" className="mx-auto mt-3 w-60 rounded-lg bg-white p-1" />
            <p className="mt-2 break-all text-[11px] text-gray-500 dark:text-neutral-400">{qr.url}</p>
            <button onClick={() => setQr(null)} className={`mt-3 ${btn}`}>{getText('Cerrar', 'Close')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModePicker({
  value, onChange, disabled, getText,
}: {
  value: 'Span' | 'Mirror';
  onChange: (v: 'Span' | 'Mirror') => void;
  disabled?: boolean;
  getText: (es: string, en: string) => string;
}) {
  const opt = (v: 'Span' | 'Mirror', label: string, hint: string) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => v !== value && onChange(v)}
      title={hint}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === v ? 'bg-brand-primary text-white' : 'text-gray-500 dark:text-neutral-400'}`}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex rounded-full border border-gray-300 p-0.5 dark:border-neutral-700">
      {opt('Span', getText('Muro (una imagen gigante)', 'Wall (one giant image)'), getText('Las slides se reparten y los comerciales cruzan todas las TVs.', 'Slides spread across TVs and ads span all of them.'))}
      {opt('Mirror', getText('Espejo (todas iguales)', 'Mirror (all identical)'), getText('Todas las TVs muestran lo mismo al mismo instante.', 'All TVs show the same at the same instant.'))}
    </div>
  );
}
