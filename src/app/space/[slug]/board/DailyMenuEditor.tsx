'use client';

// Editor del Menú del día (Affiliate.DailyMenu): la rotación semanal del restaurante, día por día.
// Cada día tiene secciones en orden:
//  - Lista (Arroz, Habichuelas, Guarniciones): solo nombres, sin precio.
//  - Combo (Pollo, Cerdo, Res…): platos del día + el plato del catálogo del que salen precio y tamaños.
//  - Destacado (Sopa del día, Desayuno): tarjeta grande con el precio del plato enlazado; puede tener horario.
// Los precios NUNCA se escriben acá: salen del catálogo, así un cambio de precio llega solo a la TV.
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { WEEK_DAYS, type DailyMenu, type DailyMenuSection, type DailySectionKind, type WeekDayKey } from '@/lib/board-layouts';

export interface DailyMenuProduct {
  id: string;
  name: string;
  price: number | null;
  category: string | null;
  /** Opciones del grupo de tamaños (ej. Pequeño/Mediano/Grande), si el plato tiene. */
  sizes: string[];
}

interface Props {
  slug: string;
  initialMenu: DailyMenu | null;
  products: DailyMenuProduct[];
  getText: (es: string, en: string) => string;
}

const DAY_LABEL: Record<WeekDayKey, { es: string; en: string }> = {
  monday: { es: 'Lun', en: 'Mon' }, tuesday: { es: 'Mar', en: 'Tue' }, wednesday: { es: 'Mié', en: 'Wed' },
  thursday: { es: 'Jue', en: 'Thu' }, friday: { es: 'Vie', en: 'Fri' }, saturday: { es: 'Sáb', en: 'Sat' }, sunday: { es: 'Dom', en: 'Sun' },
};

const KIND_LABEL: Record<DailySectionKind, { es: string; en: string; hint: { es: string; en: string } }> = {
  List: { es: 'Lista', en: 'List', hint: { es: 'Ej. Arroz, Habichuelas, Guarniciones', en: 'E.g. Rice, Beans, Sides' } },
  Combo: { es: 'Combo con precio', en: 'Combo with price', hint: { es: 'Ej. Pollo — precio y tamaños del plato enlazado', en: 'E.g. Chicken — price & sizes from the linked dish' } },
  Featured: { es: 'Destacado', en: 'Featured', hint: { es: 'Ej. Sopa del día, Desayuno', en: 'E.g. Soup of the day, Breakfast' } },
};

const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

function emptySection(kind: DailySectionKind): DailyMenuSection {
  return { name: '', nameEn: '', kind, items: [], itemsEn: [], productId: null, from: null, to: null };
}

export function DailyMenuEditor({ slug, initialMenu, products, getText }: Props) {
  const toast = useToast();
  const lang = getText('es', 'en') as 'es' | 'en';
  const [menu, setMenu] = useState<DailyMenu>(initialMenu ?? { note: '', noteEn: '', days: {} });
  const [day, setDay] = useState<WeekDayKey>('monday');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const sections = menu.days[day] ?? [];

  const productsByCategory = useMemo(() => {
    const map = new Map<string, DailyMenuProduct[]>();
    for (const p of products) {
      const key = p.category ?? getText('Sin categoría', 'No category');
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return [...map.entries()];
  }, [products, getText]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  function update(next: DailyMenu) {
    setMenu(next);
    setDirty(true);
  }
  function setSections(list: DailyMenuSection[]) {
    update({ ...menu, days: { ...menu.days, [day]: list } });
  }
  function patchSection(i: number, patch: Partial<DailyMenuSection>) {
    setSections(sections.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  }
  function copyFrom(source: WeekDayKey) {
    const src = menu.days[source] ?? [];
    setSections(src.map((s) => ({ ...s, items: [...(s.items ?? [])], itemsEn: s.itemsEn ? [...s.itemsEn] : [] })));
  }

  async function save() {
    // Limpieza mínima en el cliente (el API valida todo): secciones sin nombre fuera.
    const days: DailyMenu['days'] = {};
    for (const d of WEEK_DAYS) {
      const list = (menu.days[d] ?? []).filter((s) => s.name.trim());
      if (list.length > 0) {
        days[d] = list.map((s) => ({
          ...s,
          name: s.name.trim(),
          nameEn: s.nameEn?.trim() || null,
          productId: s.kind === 'List' ? null : s.productId || null,
          from: s.from || null,
          to: s.to || null,
        }));
      }
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyMenu: { note: menu.note?.trim() || null, noteEn: menu.noteEn?.trim() || null, days } }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || err?.message || getText('No se pudo guardar.', "Couldn't save."));
      }
      setDirty(false);
      toast.success(getText('Menú del día guardado. Las TVs lo toman en menos de un minuto.', 'Daily menu saved. TVs pick it up within a minute.'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white';
  const label = 'flex flex-col gap-1 text-xs font-medium text-gray-500 dark:text-neutral-400';

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{getText('Menú del día', 'Daily menu')}</h2>
          <p className="mt-1 max-w-2xl text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Lo que cambia cada día (arroz, habichuelas, guarniciones, proteínas, sopa, desayuno). Se muestra en el flyer "Menú del día" del diseño Flyers verticales. Los precios salen de tu catálogo.',
              'What changes every day (rice, beans, sides, proteins, soup, breakfast). It shows on the "Daily menu" flyer of the Vertical flyers layout. Prices come from your catalog.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? getText('Guardando…', 'Saving…') : dirty ? getText('Guardar menú', 'Save menu') : getText('Guardado', 'Saved')}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>
          {getText('Nota de los combos (español)', 'Combo note (Spanish)')}
          <input className={input} value={menu.note ?? ''} maxLength={120}
            placeholder={getText('Ej. incluye arroz, habichuelas y una guarnición', 'e.g. incluye arroz, habichuelas y una guarnición')}
            onChange={(e) => update({ ...menu, note: e.target.value })} />
        </label>
        <label className={label}>
          {getText('Nota de los combos (inglés)', 'Combo note (English)')}
          <input className={input} value={menu.noteEn ?? ''} maxLength={120}
            placeholder="e.g. comes with rice, beans & a side"
            onChange={(e) => update({ ...menu, noteEn: e.target.value })} />
        </label>
      </div>

      {/* Días */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {WEEK_DAYS.map((d) => {
          const count = menu.days[d]?.length ?? 0;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                d === day ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400'
              }`}
            >
              {DAY_LABEL[d][lang]}{count > 0 && <span className="ml-1 opacity-70">· {count}</span>}
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
          {getText('Copiar de', 'Copy from')}
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value as WeekDayKey;
              if (!v) return;
              if (sections.length > 0 && !window.confirm(getText('Esto reemplaza las secciones de este día. ¿Seguir?', "This replaces this day's sections. Continue?"))) return;
              copyFrom(v);
            }}
            className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs"
          >
            <option value="">—</option>
            {WEEK_DAYS.filter((d) => d !== day && (menu.days[d]?.length ?? 0) > 0).map((d) => (
              <option key={d} value={d}>{DAY_LABEL[d][lang]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Secciones del día */}
      <div className="mt-4 space-y-3">
        {sections.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-neutral-500">
            {getText('Este día no tiene menú del día (la TV muestra un aviso). Agrega secciones abajo o copia otro día.', 'No daily menu this day (the TV shows a notice). Add sections below or copy another day.')}
          </p>
        )}
        {sections.map((s, i) => {
          const product = s.productId ? productById.get(s.productId) : undefined;
          const timed = Boolean(s.from || s.to);
          return (
            <div key={i} className="rounded-xl border border-gray-200/70 p-3 dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {KIND_LABEL[s.kind][lang]}
                </span>
                <span className="text-xs text-gray-400">{KIND_LABEL[s.kind].hint[lang]}</span>
                <div className="ml-auto flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs disabled:opacity-30 dark:border-neutral-700">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs disabled:opacity-30 dark:border-neutral-700">↓</button>
                  <button type="button" onClick={() => setSections(sections.filter((_, k) => k !== i))} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-500 hover:border-red-400 hover:text-red-500 dark:border-neutral-700">
                    {getText('Quitar', 'Remove')}
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={label}>
                  {getText('Nombre (español)', 'Name (Spanish)')}
                  <input className={input} value={s.name} maxLength={60} onChange={(e) => patchSection(i, { name: e.target.value })}
                    placeholder={s.kind === 'List' ? 'Arroz' : s.kind === 'Combo' ? 'Pollo' : 'Sopa del día'} />
                </label>
                <label className={label}>
                  {getText('Nombre (inglés)', 'Name (English)')}
                  <input className={input} value={s.nameEn ?? ''} maxLength={60} onChange={(e) => patchSection(i, { nameEn: e.target.value })}
                    placeholder={s.kind === 'List' ? 'Rice' : s.kind === 'Combo' ? 'Chicken' : 'Soup of the day'} />
                </label>
                <label className={label}>
                  {s.kind === 'Featured' ? getText('Plato de hoy (español)', "Today's dish (Spanish)") : getText('Platos (uno por línea, español)', 'Dishes (one per line, Spanish)')}
                  <textarea className={input} rows={s.kind === 'Featured' ? 1 : 4} defaultValue={(s.items ?? []).join('\n')}
                    key={`${day}-${i}-es-${(s.items ?? []).length}`}
                    onBlur={(e) => patchSection(i, { items: lines(e.target.value) })} />
                </label>
                <label className={label}>
                  {s.kind === 'Featured' ? getText('Plato de hoy (inglés)', "Today's dish (English)") : getText('Platos (uno por línea, inglés)', 'Dishes (one per line, English)')}
                  <textarea className={input} rows={s.kind === 'Featured' ? 1 : 4} defaultValue={(s.itemsEn ?? []).join('\n')}
                    key={`${day}-${i}-en-${(s.itemsEn ?? []).length}`}
                    onBlur={(e) => patchSection(i, { itemsEn: lines(e.target.value) })} />
                </label>
                {s.kind !== 'List' && (
                  <label className={`${label} sm:col-span-2`}>
                    {getText('Precio desde el plato del catálogo', 'Price from catalog dish')}
                    <select className={input} value={s.productId ?? ''} onChange={(e) => patchSection(i, { productId: e.target.value || null })}>
                      <option value="">{s.kind === 'Combo' ? getText('— elige un plato —', '— pick a dish —') : getText('— sin precio —', '— no price —')}</option>
                      {productsByCategory.map(([cat, list]) => (
                        <optgroup key={cat} label={cat}>
                          {list.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}{p.price != null ? ` · $${p.price}` : ''}{p.sizes.length > 0 ? ` · ${p.sizes.join('/')}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {product && product.sizes.length > 0 && (
                      <span className="text-[11px] text-gray-400">{getText('La TV muestra un precio por tamaño:', 'The TV shows one price per size:')} {product.sizes.join(' · ')}</span>
                    )}
                  </label>
                )}
                {s.kind !== 'List' && (
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={timed}
                      onChange={(e) => patchSection(i, e.target.checked ? { from: '10:00', to: '12:00' } : { from: null, to: null })} />
                    {getText('Solo en un horario', 'Only during certain hours')}
                  </label>
                  {timed && (
                    <>
                      <input type="time" value={s.from ?? ''} onChange={(e) => patchSection(i, { from: e.target.value || null })} className="rounded-lg border border-gray-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
                      <span>–</span>
                      <input type="time" value={s.to ?? ''} onChange={(e) => patchSection(i, { to: e.target.value || null })} className="rounded-lg border border-gray-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
                    </>
                  )}
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['List', 'Combo', 'Featured'] as DailySectionKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSections([...sections, emptySection(k)])}
            disabled={sections.length >= 12}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-40 dark:border-neutral-700"
          >
            + {KIND_LABEL[k][lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
