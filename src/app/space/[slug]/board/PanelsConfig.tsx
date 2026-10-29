'use client';

// Configuración del diseño "Flyers verticales" (layout Panels): cómo está montada la TV y qué
// flyer va en cada espacio. Se usa para la pantalla base (negocio) y para cada pantalla extra
// (con "Heredar del negocio"). El board resuelve: pantalla ?? negocio ?? [Menú del día, Comerciales].
import { MAX_PANELS, type BoardOrientation, type BoardPanel } from '@/lib/board-layouts';

interface Props {
  orientation: BoardOrientation | null;
  panels: BoardPanel[] | null;
  categories: string[];
  /** Pantallas extra: null = hereda del negocio. */
  allowInherit?: boolean;
  disabled?: boolean;
  getText: (es: string, en: string) => string;
  onChange: (next: { orientation: BoardOrientation | null; panels: BoardPanel[] | null }) => void;
}

const EMPTY = '';

function encode(p: BoardPanel | undefined): string {
  if (!p) return EMPTY;
  return p.kind === 'Category' ? `Category:${p.category ?? ''}` : p.kind;
}

function decode(v: string): BoardPanel | null {
  if (v === 'Daily' || v === 'Ads') return { kind: v };
  if (v.startsWith('Category:')) return { kind: 'Category', category: v.slice('Category:'.length) };
  return null;
}

function Thumb({ orientation, panels }: { orientation: BoardOrientation; panels: BoardPanel[] }) {
  const shown = orientation === 'Portrait' ? panels.slice(0, 1) : panels;
  const tone = (p: BoardPanel) => (p.kind === 'Ads' ? 'bg-gray-800 dark:bg-neutral-600' : p.kind === 'Daily' ? 'bg-brand-primary/70' : 'bg-amber-500/70');
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

export function PanelsConfig({ orientation, panels, categories, allowInherit, disabled, getText, onChange }: Props) {
  const inheritOrientation = Boolean(allowInherit && orientation === null);
  const inheritPanels = Boolean(allowInherit && panels === null);
  const effOrientation: BoardOrientation = orientation ?? 'Landscape';
  const effPanels: BoardPanel[] = panels ?? [{ kind: 'Daily' }, { kind: 'Ads' }];
  const slots = effOrientation === 'Portrait' ? 1 : MAX_PANELS;

  const label = (p: BoardPanel) =>
    p.kind === 'Daily' ? getText('Menú del día', 'Daily menu') : p.kind === 'Ads' ? getText('Comerciales', 'Commercials') : p.category ?? '';

  function setSlot(index: number, value: string) {
    const next = [...effPanels];
    const decoded = decode(value);
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
                return (
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
                  </select>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">
              {getText(
                'Los flyers no rotan: el menú queda fijo todo el día (animado) y solo los comerciales cambian. En TV vertical, si hay comerciales, rotan abajo del menú del día.',
                "Flyers don't rotate: the menu stays up all day (animated) and only the commercials change. On a vertical TV, commercials rotate below the daily menu.",
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
