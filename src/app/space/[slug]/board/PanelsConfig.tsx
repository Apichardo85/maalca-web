'use client';

// Configuración del diseño "Flyers verticales" (layout Panels): cómo está montada la TV y qué
// flyer va en cada espacio. Se usa para la pantalla base (negocio) y para cada pantalla extra
// (con "Heredar del negocio"). El board resuelve: pantalla ?? negocio ?? [Menú del día, Comerciales].
import { MAX_PANELS, type BoardOrientation, type BoardPanel, type BoardPanelStyle } from '@/lib/board-layouts';

interface Props {
  orientation: BoardOrientation | null;
  panels: BoardPanel[] | null;
  categories: string[];
  /** Imágenes subidas en Comerciales: se pueden fijar como flyer (ej. el menú impreso del negocio). */
  images: Array<{ url: string; label: string }>;
  /** Pantallas extra: null = hereda del negocio. */
  allowInherit?: boolean;
  disabled?: boolean;
  getText: (es: string, en: string) => string;
  onChange: (next: { orientation: BoardOrientation | null; panels: BoardPanel[] | null }) => void;
}

const EMPTY = '';

function encode(p: BoardPanel | undefined): string {
  if (!p) return EMPTY;
  if (p.kind === 'Category') return `Category:${p.category ?? ''}`;
  if (p.kind === 'Image') return `Image:${p.mediaUrl ?? ''}`;
  return p.kind;
}

function decode(v: string, style?: BoardPanelStyle | null): BoardPanel | null {
  if (v === 'Daily') return { kind: v, style: style ?? null };
  if (v === 'Ads') return { kind: v };
  if (v.startsWith('Category:')) return { kind: 'Category', category: v.slice('Category:'.length), style: style ?? null };
  if (v.startsWith('Image:')) return { kind: 'Image', mediaUrl: v.slice('Image:'.length) };
  return null;
}

function Thumb({ orientation, panels }: { orientation: BoardOrientation; panels: BoardPanel[] }) {
  const shown = orientation === 'Portrait' ? panels.slice(0, 1) : panels;
  const tone = (p: BoardPanel) => (p.kind === 'Ads' ? 'bg-gray-800 dark:bg-neutral-600' : p.kind === 'Image' ? 'bg-fuchsia-500/70' : p.kind === 'Daily' ? (p.style === 'Tropical' ? 'bg-fuchsia-800/80' : 'bg-brand-primary/70') : 'bg-amber-500/70');
  return (
    <div
      className={`flex items-stretch justify-center gap-1 rounded-md border border-gray-300 bg-gray-50 p-1 dark:border-neutral-700 dark:bg-neutral-950 ${orientation === 'Portrait' ? 'h-28 w-16' : 'h-[72px] w-32'}`}
      aria-hidden
    >
      {shown.map((p, i) => (
        <div key={i} className={`rounded-[3px] ${tone(p)} ${orientation === 'Portrait' ? 'flex-1' : 'aspect-[9/16]'}`} />
      ))}
    </div>
  );
}

export function PanelsConfig({ orientation, panels, categories, images, allowInherit, disabled, getText, onChange }: Props) {
  const inheritOrientation = Boolean(allowInherit && orientation === null);
  const inheritPanels = Boolean(allowInherit && panels === null);
  const effOrientation: BoardOrientation = orientation ?? 'Landscape';
  const effPanels: BoardPanel[] = panels ?? [{ kind: 'Daily' }, { kind: 'Ads' }];
  const slots = effOrientation === 'Portrait' ? 1 : MAX_PANELS;

  const label = (p: BoardPanel) =>
    p.kind === 'Daily' ? getText('Menú del día', 'Daily menu') : p.kind === 'Ads' ? getText('Comerciales', 'Commercials') : p.kind === 'Image' ? getText('Imagen', 'Image') : p.category ?? '';

  function setStyle(index: number, style: BoardPanelStyle) {
    const next = effPanels.map((p, k) => (k === index ? { ...p, style } : p));
    onChange({ orientation, panels: next });
  }

  function setSlot(index: number, value: string) {
    const next = [...effPanels];
    const decoded = decode(value, effPanels[index]?.style);
    if (decoded) next[index] = decoded;
    else next.splice(index, 1);
    const clean = next.filter(Boolean).slice(0, MAX_PANELS);
    onChange({ orientation, panels: clean.length > 0 ? clean : [{ kind: 'Daily' }] });
  }

  const btn = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
      active ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400'
    }`;

  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-neutral-700">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-neutral-400">{getText('¿Cómo está montada la TV?', 'How is the TV mounted?')}</p>
            <div className="flex flex-wrap gap-2">
              {allowInherit && (
                <button type="button" disabled={disabled} className={btn(inheritOrientation)} onClick={() => onChange({ orientation: null, panels })}>
                  {getText('Heredar del negocio', 'Inherit from business')}
                </button>
              )}
              <button type="button" disabled={disabled} className={btn(!inheritOrientation && effOrientation === 'Landscape')} onClick={() => onChange({ orientation: 'Landscape', panels })}>
                ▭ {getText('Horizontal · flyers lado a lado', 'Horizontal · flyers side by side')}
              </button>
              <button type="button" disabled={disabled} className={btn(!inheritOrientation && effOrientation === 'Portrait')} onClick={() => onChange({ orientation: 'Portrait', panels })}>
                ▯ {getText('Vertical · un flyer', 'Vertical · one flyer')}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                {effOrientation === 'Portrait' ? getText('Flyer', 'Flyer') : getText('Flyers (de izquierda a derecha)', 'Flyers (left to right)')}
              </p>
              {allowInherit && (
                <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={inheritPanels}
                    disabled={disabled}
                    onChange={(e) => onChange({ orientation, panels: e.target.checked ? null : effPanels })}
                  />
                  {getText('Usar los del negocio', 'Use business flyers')}
                </label>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {Array.from({ length: slots }).map((_, i) => {
                const value = encode(effPanels[i]);
                const canBeEmpty = i > 0;
                const current = effPanels[i];
                const styled = current && (current.kind === 'Daily' || current.kind === 'Category');
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                  <select
                    key={i}
                    value={value}
                    disabled={disabled || inheritPanels || (i > effPanels.length)}
                    onChange={(e) => setSlot(i, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-900 disabled:opacity-50 dark:border-neutral-700 dark:text-white"
                  >
                    {canBeEmpty && <option value={EMPTY}>{getText('— vacío —', '— empty —')}</option>}
                    <option value="Daily">{getText('Menú del día', 'Daily menu')}</option>
                    <option value="Ads">{getText('Comerciales', 'Commercials')}</option>
                    {categories.map((c) => (
                      <option key={c} value={`Category:${c}`}>{getText('Categoría', 'Category')}: {c}</option>
                    ))}
                    {images.map((img) => (
                      <option key={img.url} value={`Image:${img.url}`}>{getText('Imagen fija', 'Fixed image')}: {img.label}</option>
                    ))}
                  </select>
                  {styled && (
                    <div className="flex gap-1">
                      {(['Modern', 'Tropical'] as BoardPanelStyle[]).map((st) => {
                        const active = (current.style ?? 'Modern') === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={disabled || inheritPanels}
                            onClick={() => setStyle(i, st)}
                            className={`flex-1 rounded-full border px-2 py-1 text-[11px] font-medium disabled:opacity-50 ${active ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-300 dark:border-neutral-700'}`}
                          >
                            {st === 'Modern' ? getText('Moderno', 'Modern') : getText('Tropical 🌺', 'Tropical 🌺')}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {current?.kind === 'Image' && current.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.mediaUrl} alt="" className="h-24 w-auto self-start rounded-md border border-gray-200 object-contain dark:border-neutral-700" />
                  )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">
              {getText(
                'Los flyers no rotan: el menú queda fijo todo el día (animado) y solo los comerciales cambian. En TV vertical, si hay comerciales, rotan abajo del menú del día. "Imagen fija": cualquier imagen subida en Comerciales (ej. tu menú impreso) queda fija en ese espacio.',
                "Flyers don't rotate: the menu stays up all day (animated) and only the commercials change. On a vertical TV, commercials rotate below the daily menu. \"Fixed image\": any image uploaded in Commercials (e.g. your printed menu) stays fixed in that spot.",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Thumb orientation={effOrientation} panels={effPanels} />
          <span className="max-w-[140px] text-center text-[10px] text-gray-400 dark:text-neutral-500">
            {(effOrientation === 'Portrait' ? effPanels.slice(0, 1) : effPanels).map(label).join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
}
