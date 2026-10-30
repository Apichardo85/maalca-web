'use client';

// Flyers verticales del Menu Board (layout "Panels"). A diferencia del resto de plantillas, el
// contenido NO rota: cada flyer queda fijo todo el día y solo se anima (brillo, cinta, luz que
// recorre los combos, precios). Lo único que cambia de contenido son los comerciales.
//  - TV vertical (Portrait): un flyer a pantalla completa (1080x1920). Si es el Menú del día y hay
//    comerciales, se reserva una zona abajo donde rotan.
//  - TV horizontal (Landscape): 1-3 flyers verticales lado a lado sobre 1920x1080.
// El menú del día sale de Affiliate.DailyMenu; los precios y tamaños, de los platos enlazados
// (nunca escritos a mano). Colores: paleta del negocio (makePalette), igual que las demás plantillas.

import { useEffect, useMemo, useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { categoryLabel } from '@/lib/category-label';
import { formatPrice as formatCurrencyPrice } from '@/lib/currency';
import { getOpenStatus, nowInTimezone, type HorarioEntry } from '@/lib/business-hours';
import {
  WEEK_DAYS, sectionVisibleAt,
  type BoardOrientation, type BoardPanel, type DailyMenu, type DailyMenuSection, type WeekDayKey,
} from '@/lib/board-layouts';
import { ensureContrast, mix, type BoardPalette } from './MenuBoardLayouts';
import { buildAutoDailyMenu, hasOwnDailyMenu } from '@/lib/daily-menu-auto';

type BoardItem = PublicTemplateProps['items'][number] & {
  modifierGroups?: Array<{
    name: string;
    nameEn?: string | null;
    required?: boolean;
    options: Array<{ name: string; nameEn?: string | null; priceDelta: number; isDefault?: boolean }>;
  }> | null;
};

export interface PanelAd {
  id: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  durationSeconds: number;
  fit?: 'Contain' | 'Cover';
  /** Solo para la vitrina de platos (cuando el negocio no subió comerciales). */
  caption?: { title: string; price: string } | null;
}

interface Props {
  orientation: BoardOrientation;
  panels: BoardPanel[];
  business: {
    name: string;
    logoUrl: string | null;
    currency?: 'USD' | 'DOP';
    categoryTranslations?: Record<string, { es?: string | null; en?: string | null }> | null;
    address?: string | null;
    phone?: string | null;
    horario?: HorarioEntry[] | null;
    timezone?: string | null;
  };
  items: BoardItem[];
  ads: PanelAd[];
  dailyMenu: DailyMenu | null;
  language: 'es' | 'en';
  palette: BoardPalette;
  /** Tamaño real (lógico) de la pantalla, ya medido por MenuBoard. */
  viewport: { w: number; h: number };
}

const PANEL_W = 1080;
const PANEL_H = 1920;
const MAX_VIDEO_AD_MS = 60_000;

const DAY_ES: Record<WeekDayKey, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};
const DAY_EN: Record<WeekDayKey, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const ES_KEY_TO_WEEKDAY: Record<string, WeekDayKey> = {
  lunes: 'monday', martes: 'tuesday', miercoles: 'wednesday', jueves: 'thursday', viernes: 'friday', sabado: 'saturday', domingo: 'sunday',
};

/** Día y minuto actuales en la zona del negocio (o la de la TV si el negocio no tiene zona). */
function useBusinessNow(timezone: string | null | undefined) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const now = new Date(tick);
    // Solo para revisar el diseño: ?day=friday&time=11:30 en la URL del board.
    let override: { day?: string; minutes?: number } = {};
    try {
      const q = new URLSearchParams(window.location.search);
      const d = q.get('day');
      const t = /^(\d{1,2}):(\d{2})$/.exec(q.get('time') ?? '');
      override = { day: d && (WEEK_DAYS as readonly string[]).includes(d) ? d : undefined, minutes: t ? Number(t[1]) * 60 + Number(t[2]) : undefined };
    } catch { /* sin override */ }
    const local = timezone ? nowInTimezone(timezone, now) : null;
    const day: WeekDayKey = (override.day as WeekDayKey)
      ?? (local ? ES_KEY_TO_WEEKDAY[local.day] : WEEK_DAYS[(now.getDay() + 6) % 7]);
    const minutes = override.minutes ?? local?.minutes ?? now.getHours() * 60 + now.getMinutes();
    let dateLabel = '';
    try {
      dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(timezone ? { timeZone: timezone } : {}) }).format(now);
    } catch {
      dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return { now, day, minutes, dateLabel };
  }, [tick, timezone]);
}

/** "$10" en vez de "$10.00" cuando el precio es redondo: en un flyer se lee mejor. */
function shortPrice(n: number | null | undefined, currency?: 'USD' | 'DOP') {
  if (n == null) return '';
  const s = formatCurrencyPrice(n, currency);
  return Number.isInteger(n) ? s.replace(/[.,]00(?=\D*$)/, '') : s;
}

/** "20:00" → "8 PM" en inglés; en español se deja en 24 h ("20:00"). */
function clock(hhmm: string, language: 'es' | 'en') {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m || language !== 'en') return hhmm;
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m[2] === '00' ? `${h12} ${suffix}` : `${h12}:${m[2]} ${suffix}`;
}

function pick(language: 'es' | 'en', es: string | null | undefined, en: string | null | undefined) {
  return (language === 'en' && en?.trim() ? en : es) ?? '';
}

/* ───────────────────────── Comerciales ───────────────────────── */

/** Rota los comerciales dentro de un recuadro. Imagen: su duración; video: hasta que termina (tope 60 s).
 *  "Contain" (default) nunca recorta: el fondo es la misma imagen desenfocada para no dejar franjas. */
function AdRotator({ ads, className = '' }: { ads: PanelAd[]; className?: string }) {
  const [i, setI] = useState(0);
  const ad = ads.length > 0 ? ads[i % ads.length] : null;
  useEffect(() => {
    if (!ad || ads.length <= 1) return;
    const ms = ad.mediaType === 'Video' ? MAX_VIDEO_AD_MS : Math.max(3, ad.durationSeconds || 8) * 1000;
    const id = setTimeout(() => setI((v) => (v + 1) % ads.length), ms);
    return () => clearTimeout(id);
  }, [ad, ads.length]);
  if (!ad) return null;
  const fit = ad.fit === 'Cover' ? 'cover' : 'contain';
  return (
    <div className={`bp-ad ${className}`} key={`${ad.id}-${i}`}>
      {ad.mediaType === 'Video' ? (
        <video
          src={ad.mediaUrl}
          className="bp-ad-media"
          style={{ objectFit: fit }}
          autoPlay
          muted
          playsInline
          loop={ads.length <= 1}
          onEnded={() => setI((v) => (v + 1) % ads.length)}
        />
      ) : (
        <>
          {fit === 'contain' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.mediaUrl} alt="" className="bp-ad-media bp-ad-blur" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.mediaUrl} alt="" className="bp-ad-media bp-kb" style={{ objectFit: fit }} />
        </>
      )}
      {ad.caption && (
        <div className="bp-ad-cap">
          <span>{ad.caption.title}</span>
          {ad.caption.price && <b>{ad.caption.price}</b>}
        </div>
      )}
      {ads.length > 1 && <div className="bp-ad-bar" style={{ animationDuration: `${ad.mediaType === 'Video' ? MAX_VIDEO_AD_MS : Math.max(3, ad.durationSeconds || 8) * 1000}ms` }} />}
    </div>
  );
}

/* ───────────────────────── Piezas comunes ───────────────────────── */

function Header({ business, title, eyebrow, sub, open, language }: {
  business: Props['business'];
  title: string;
  eyebrow: string;
  sub: string;
  open: 'open' | 'closed' | null;
  language: 'es' | 'en';
}) {
  return (
    <>
      <div className="bp-hdr">
        {business.logoUrl && (
          <div className="bp-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={business.logoUrl} alt={business.name} />
          </div>
        )}
        <div className="bp-htxt">
          <div className="bp-eyebrow">{eyebrow}</div>
          {/* Tamaño según el largo: "MIÉRCOLES"/"WEDNESDAY" no cabe al tamaño de "LUNES". */}
          <div className="bp-title" style={{ fontSize: title.length <= 6 ? 122 : title.length <= 8 ? 110 : title.length <= 9 ? 98 : 86 }}>{title}</div>
          <div className="bp-hsub">
            {sub && <span>{sub}</span>}
            {open && (
              <span className={`bp-pill ${open === 'open' ? '' : 'bp-pill-closed'}`}>
                <i />
                {open === 'open' ? (language === 'en' ? 'OPEN NOW' : 'ABIERTO') : (language === 'en' ? 'CLOSED' : 'CERRADO')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="bp-ribbon" />
    </>
  );
}

function Footer({ business }: { business: Props['business'] }) {
  const parts = [business.address, business.phone].filter(Boolean);
  return (
    <div className="bp-ftr">
      <span>{parts.join(' · ') || business.name}</span>
      <span className="bp-ftr-name">{parts.length > 0 ? business.name : ''}</span>
    </div>
  );
}

/* ───────────────────────── Flyer: Menú del día ───────────────────────── */

function sectionKey(s: DailyMenuSection) {
  return s.name.trim().toLowerCase();
}

function DailyPanel({ ctx, withAds }: { ctx: PanelCtx; withAds: boolean }) {
  const { language, business, dailyMenu, itemsById, ads, now } = ctx;
  const t = (es: string, en: string) => (language === 'en' ? en : es);
  const dayName = language === 'en' ? DAY_EN[now.day] : DAY_ES[now.day];
  const allToday = dailyMenu?.days[now.day] ?? [];
  const today = allToday.filter((s) => sectionVisibleAt(s, now.minutes));

  // Días que tienen menú: para saber si una sección es "solo hoy" (no está todos los días) y para
  // la próxima sopa cuando hoy no hay.
  const menuDays = WEEK_DAYS.filter((d) => (dailyMenu?.days[d]?.length ?? 0) > 0);
  const dayHas = (d: WeekDayKey, key: string, kind: DailyMenuSection['kind']) =>
    (dailyMenu?.days[d] ?? []).some((s) => s.kind === kind && sectionKey(s) === key);

  const lists = today.filter((s) => s.kind === 'List');
  const combos = today.filter((s) => s.kind === 'Combo');
  const featured = today.filter((s) => s.kind === 'Featured');

  // Destacadas que existen otros días pero hoy no (ej. "Sopa del día" un jueves): tarjeta "hoy no hay,
  // la próxima es…". Solo las de todo el día (sin horario), para no anunciar el desayuno a las 3 pm.
  const missing: Array<{ section: DailyMenuSection; nextDay: WeekDayKey }> = [];
  const seen = new Set(featured.map(sectionKey));
  const todayIdx = WEEK_DAYS.indexOf(now.day);
  for (let k = 1; k <= 7 && missing.length < 2; k++) {
    const d = WEEK_DAYS[(todayIdx + k) % 7];
    for (const s of dailyMenu?.days[d] ?? []) {
      const key = sectionKey(s);
      if (s.kind !== 'Featured' || s.from || seen.has(key) || allToday.some((x) => sectionKey(x) === key)) continue;
      seen.add(key);
      missing.push({ section: s, nextDay: d });
    }
  }

  const priceChips = (s: DailyMenuSection) => {
    const product = s.productId ? itemsById.get(s.productId) : undefined;
    if (!product) return null;
    const group = (product.modifierGroups ?? []).find((g) => g.options.length > 1 && g.required !== false)
      ?? (product.modifierGroups ?? []).find((g) => g.options.length > 1);
    const base = Number(product.price ?? 0);
    if (!group) {
      return <div className="bp-chips"><div className="bp-chip bp-chip-solo"><strong>{shortPrice(base, business.currency)}</strong></div></div>;
    }
    const opts = group.options.slice(0, 4);
    return (
      <div className={`bp-chips ${opts.length > 3 ? 'bp-chips-4' : ''}`}>
        {opts.map((o) => (
          <div className="bp-chip" key={o.name}>
            <small>{pick(language, o.name, o.nameEn).toUpperCase()}</small>
            <strong>{shortPrice(base + Number(o.priceDelta ?? 0), business.currency)}</strong>
          </div>
        ))}
      </div>
    );
  };

  const itemsOf = (s: DailyMenuSection) =>
    (language === 'en' && s.itemsEn && s.itemsEn.length > 0 ? s.itemsEn : s.items) ?? [];

  const status = getOpenStatus(business.horario, business.timezone, now.now);
  const open = status ? (status.state === 'open' ? 'open' : 'closed') : null;
  const todaysHours = (business.horario ?? []).find((h) => ES_KEY_TO_WEEKDAY[h.dia] === now.day);
  const hoursLabel = todaysHours && !todaysHours.cerrado ? `${clock(todaysHours.abre, language)} – ${clock(todaysHours.cierra, language)}` : '';

  const cycle = Math.max(1, combos.length) * 2.2 + 2;
  const roomy = !withAds;
  const empty = today.length === 0;

  return (
    <div
      className={`bp-panel ${roomy ? 'bp-roomy' : ''} ${combos.length + featured.length + missing.length >= 6 ? 'bp-dense' : ''}`}
      style={{ ['--cycle' as string]: `${cycle}s` }}
    >
      <Header
        business={business}
        language={language}
        eyebrow={t('MENÚ DE HOY', "TODAY'S MENU")}
        title={dayName}
        sub={[now.dateLabel, hoursLabel].filter(Boolean).join(' · ')}
        open={open}
      />
      <div className="bp-body">
        {empty ? (
          <div className="bp-card bp-empty">
            <b>{dayName}</b>
            <p>{menuDays.length > 0
              ? t('Hoy no hay menú del día. Pregunta por nuestro menú completo.', 'No daily menu today. Ask for our full menu.')
              : t('El menú del día se configura en el panel → Pantallas.', 'Set up the daily menu in your dashboard → Screens.')}</p>
          </div>
        ) : (
          <>
            {lists.length > 0 && (
              <div className="bp-card bp-base" style={{ gridTemplateColumns: `repeat(${Math.min(3, lists.length)}, 1fr)` }}>
                {lists.map((s, i) => (
                  <div className="bp-col" key={`${s.name}-${i}`}>
                    <h3>{pick(language, s.name, s.nameEn)}</h3>
                    <ul>{itemsOf(s).map((it) => <li key={it}>{it}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}

            {combos.length > 0 && (
              <div className="bp-combos">
                {(dailyMenu?.note || dailyMenu?.noteEn) && (
                  <div className="bp-ctitle">
                    <b>{t('COMBOS', 'COMBOS')}</b>
                    <span>{pick(language, dailyMenu?.note, dailyMenu?.noteEn)}</span>
                  </div>
                )}
                {combos.map((s, i) => {
                  const key = sectionKey(s);
                  const onlyToday = menuDays.length > 1 && menuDays.some((d) => !dayHas(d, key, 'Combo'));
                  return (
                    <div className={`bp-card bp-prow ${onlyToday ? 'bp-special' : ''}`} key={`${s.name}-${i}`} style={{ ['--d' as string]: `${i * 2.2}s` }}>
                      <div className="bp-prow-txt">
                        <h4>
                          {pick(language, s.name, s.nameEn)}
                          {onlyToday && <span className="bp-tag">{t('SOLO HOY', 'TODAY ONLY')}</span>}
                        </h4>
                        <p>{itemsOf(s).map((it, k) => (
                          <span key={it}>{k > 0 && <> <span className="bp-sep">·</span> </>}<span className="bp-it">{it}</span></span>
                        ))}</p>
                      </div>
                      {priceChips(s)}
                    </div>
                  );
                })}
              </div>
            )}

            {(featured.length > 0 || missing.length > 0) && (
              <div className={`bp-extras ${featured.length + missing.length === 1 ? 'bp-one' : ''}`}>
                {featured.map((s, i) => {
                  const product = s.productId ? itemsById.get(s.productId) : undefined;
                  const main = itemsOf(s)[0] ?? (product ? pick(language, product.name, product.nameEn) : '');
                  const desc = product ? pick(language, product.description, product.descriptionEn) : '';
                  const timed = Boolean(s.from && s.to);
                  return (
                    <div className={`bp-card bp-feat ${i % 2 === 0 && !timed ? 'bp-feat-a' : 'bp-feat-b'}`} key={`${s.name}-${i}`}>
                      {!timed && (
                        <svg className="bp-steam" viewBox="0 0 120 120" aria-hidden>
                          <path d="M30 100c-12-18 12-26 0-46" /><path d="M60 100c-12-18 12-26 0-46" /><path d="M90 100c-12-18 12-26 0-46" />
                        </svg>
                      )}
                      <div className="bp-kick">{pick(language, s.name, s.nameEn).toUpperCase()}{timed ? ` · ${clock(s.from!, language)}–${clock(s.to!, language)}` : ''}</div>
                      <div className="bp-fname">{main}</div>
                      {product && (
                        <div className="bp-fprice"><b>{shortPrice(product.price, business.currency)}</b>{desc && <span>{desc}</span>}</div>
                      )}
                    </div>
                  );
                })}
                {missing.map(({ section, nextDay }) => {
                  const nextItem = ((language === 'en' && section.itemsEn?.length ? section.itemsEn : section.items) ?? [])[0]
                    ?? (section.productId ? pick(language, itemsById.get(section.productId)?.name, itemsById.get(section.productId)?.nameEn) : '');
                  return (
                    <div className="bp-card bp-feat bp-none" key={`missing-${section.name}`}>
                      <div className="bp-kick">{pick(language, section.name, section.nameEn).toUpperCase()}</div>
                      <div className="bp-fname">{t('Hoy no hay', 'Not today')}</div>
                      <div className="bp-next">
                        {t('Próximo', 'Next')}: <b>{nextItem}</b> · {language === 'en' ? DAY_EN[nextDay] : DAY_ES[nextDay]}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {withAds && ads.length > 0 && <AdRotator ads={ads} className="bp-adzone" />}
      </div>
      <Footer business={business} />
    </div>
  );
}

/* ───────────────────────── Flyer: Categoría ───────────────────────── */

/** Separa "Empanada — Res" en ["Empanada", "Res"] para agrupar variantes del mismo plato. */
function splitVariant(name: string): [string, string] | null {
  const m = /^(.+?)\s+[—–-]\s+(.+)$/.exec(name);
  return m ? [m[1].trim(), m[2].trim()] : null;
}

function CategoryPanel({ ctx, category }: { ctx: PanelCtx; category: string }) {
  const { language, business, items, now } = ctx;
  const t = (es: string, en: string) => (language === 'en' ? en : es);
  const title = categoryLabel(category, language, business.categoryTranslations);
  const inCat = items.filter((i) =>
    (i.status ?? 'Active') === 'Active' && !i.is_demo && (i.category ?? '').toLowerCase() === category.toLowerCase());

  // Especiales de un solo día (desayuno del lunes, del martes…) → lista de la semana con hoy resaltado.
  const daily = inCat
    .filter((i) => (i.weekDays?.length ?? 0) === 1)
    .sort((a, b) => WEEK_DAYS.indexOf(a.weekDays![0] as WeekDayKey) - WEEK_DAYS.indexOf(b.weekDays![0] as WeekDayKey));
  const todays = daily.find((i) => i.weekDays![0] === now.day);
  // El resto: lo disponible hoy (sin días = todos los días).
  const rest = inCat.filter((i) => (i.weekDays?.length ?? 0) !== 1 && (!i.weekDays?.length || i.weekDays.includes(now.day)));

  // Variantes del mismo plato con el mismo precio → una tarjeta ("Empanadas $3.50: Res · Pollo…").
  const groups = new Map<string, { title: string; price: number | null | undefined; variants: string[]; items: BoardItem[] }>();
  const singles: BoardItem[] = [];
  for (const i of rest) {
    const v = splitVariant(pick(language, i.name, i.nameEn));
    if (v) {
      const key = `${v[0].toLowerCase()}|${i.price}`;
      const g = groups.get(key) ?? { title: v[0], price: i.price, variants: [], items: [] };
      g.variants.push(v[1]);
      g.items.push(i);
      groups.set(key, g);
    } else singles.push(i);
  }
  const groupList = [...groups.values()].filter((g) => g.variants.length > 1);
  for (const g of groups.values()) if (g.variants.length === 1) singles.push(...g.items);

  const dayIdx = WEEK_DAYS.indexOf(now.day);
  const firstPrice = daily[0]?.price;
  const samePrice = daily.length > 0 && daily.every((i) => i.price === firstPrice);

  return (
    <div className="bp-panel bp-cat">
      <div className="bp-chdr">
        <div className="bp-sun" />
        {daily.length > 0 && (
          <div className="bp-eyebrow bp-eyebrow-on-accent">
            {daily.map((i) => (language === 'en' ? DAY_EN : DAY_ES)[i.weekDays![0] as WeekDayKey].slice(0, 3).toUpperCase()).join(' · ')}
          </div>
        )}
        <h1 className={title.length > 10 ? 'bp-h1-sm' : ''}>{title}</h1>
        {samePrice && <div className="bp-cmeta"><span className="bp-cprice">{shortPrice(firstPrice, business.currency)}</span><span>{t('especial del día', 'daily special')}</span></div>}
      </div>
      <div className="bp-ribbon" />
      <div className="bp-body">
        {todays && (
          <div className="bp-card bp-today">
            <div className="bp-today-tx">
              <div className="bp-kick">{t('HOY', 'TODAY')}</div>
              <div className="bp-fname">{pick(language, todays.name, todays.nameEn)}</div>
              <div className="bp-tdesc">{pick(language, todays.description, todays.descriptionEn)}</div>
              {!samePrice && <div className="bp-tprice">{shortPrice(todays.price, business.currency)}</div>}
            </div>
            {(todays.image_url || todays.video_url) && (
              <div className="bp-today-ph">
                {todays.video_url ? (
                  <video src={todays.video_url} autoPlay muted loop playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={todays.image_url ?? undefined} alt="" className="bp-kb" />
                )}
              </div>
            )}
          </div>
        )}
        {daily.length > 0 && (
          <div className="bp-card bp-week">
            {daily.map((i) => {
              const d = i.weekDays![0] as WeekDayKey;
              const idx = WEEK_DAYS.indexOf(d);
              return (
                <div key={i.id} className={`bp-wrow ${d === now.day ? 'bp-now' : idx < dayIdx ? 'bp-past' : ''}`}>
                  <span className="bp-wd">{(language === 'en' ? DAY_EN : DAY_ES)[d].slice(0, 3).toUpperCase()}</span>
                  <span>{pick(language, i.name, i.nameEn)}</span>
                  {!samePrice && <span className="bp-wp">{shortPrice(i.price, business.currency)}</span>}
                </div>
              );
            })}
          </div>
        )}
        {(groupList.length > 0 || singles.length > 0) && (
          <div className="bp-rest">
            {daily.length > 0 && <div className="bp-ctitle"><b>{t('TODO EL DÍA', 'ALL DAY')}</b></div>}
            <div className="bp-minis">
              {groupList.map((g) => (
                <div key={g.title} className={`bp-card bp-mini ${g.variants.length > 4 ? 'bp-mini-wide' : ''}`}>
                  <h3>{g.title}<span>{shortPrice(g.price, business.currency)}</span></h3>
                  <ul className={g.variants.length > 4 ? 'bp-cols3' : ''}>{g.variants.map((v) => <li key={v}>{v}</li>)}</ul>
                </div>
              ))}
              {singles.length > 0 && (
                <div className="bp-card bp-mini bp-mini-wide">
                  <ul className="bp-pricelist">
                    {singles.map((i) => (
                      <li key={i.id}><span>{pick(language, i.name, i.nameEn)}</span><i /><b>{shortPrice(i.price, business.currency)}</b></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        {inCat.length === 0 && (
          <div className="bp-card bp-empty"><b>{title}</b><p>{t('Esta categoría no tiene platos activos.', 'No active items in this category.')}</p></div>
        )}
      </div>
      <Footer business={business} />
    </div>
  );
}

/* ───────────────────────── Flyer: Comerciales ───────────────────────── */

function AdsPanel({ ctx }: { ctx: PanelCtx }) {
  const { business, ads, language } = ctx;
  return (
    <div className="bp-panel bp-adpanel">
      {ads.length > 0 ? (
        <AdRotator ads={ads} className="bp-adfull" />
      ) : (
        <div className="bp-empty bp-noads"><b>{business.name}</b><p>{language === 'en' ? 'Add commercials in your dashboard → Screens.' : 'Sube comerciales en tu panel → Pantallas.'}</p></div>
      )}
      {business.logoUrl && (
        <div className="bp-adbadge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={business.logoUrl} alt={business.name} />
        </div>
      )}
      <div className="bp-adfoot"><div className="bp-ribbon" /><Footer business={business} /></div>
    </div>
  );
}

/* ───────────────────────── Montaje ───────────────────────── */

interface PanelCtx {
  language: 'es' | 'en';
  business: Props['business'];
  items: BoardItem[];
  itemsById: Map<string, BoardItem>;
  ads: PanelAd[];
  dailyMenu: DailyMenu | null;
  palette: BoardPalette;
  now: ReturnType<typeof useBusinessNow>;
}

function renderPanel(p: BoardPanel, ctx: PanelCtx, withAds: boolean) {
  if (p.kind === 'Ads') return <AdsPanel ctx={ctx} />;
  if (p.kind === 'Category' && p.category) return <CategoryPanel ctx={ctx} category={p.category} />;
  return <DailyPanel ctx={ctx} withAds={withAds} />;
}

export function PanelsBoard(props: Props) {
  const { orientation, business, items, ads, dailyMenu, language, palette, viewport } = props;
  const now = useBusinessNow(business.timezone);
  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  // Sin menú del día configurado: se arma uno con el catálogo que ya existe (combos con tamaños,
  // especiales del día). Sin comerciales: vitrina con las fotos de los platos. Nunca sale vacío.
  const effectiveMenu = useMemo(() => (hasOwnDailyMenu(dailyMenu)
    ? dailyMenu
    : buildAutoDailyMenu(items.map((i) => ({
        ...i,
        hasSizes: (i.modifierGroups ?? []).some((g) => g.options.length > 1),
      })), business.categoryTranslations)), [dailyMenu, items, business.categoryTranslations]);
  const effectiveAds = useMemo<PanelAd[]>(() => {
    if (ads.length > 0) return ads;
    return items
      .filter((i) => (i.status ?? 'Active') === 'Active' && !i.is_demo && i.image_url
        && (!i.weekDays?.length || i.weekDays.includes(now.day)))
      .slice(0, 10)
      .map((i) => ({
        id: `dish-${i.id}`, mediaUrl: i.image_url as string, mediaType: 'Image' as const, durationSeconds: 7, fit: 'Cover' as const,
        caption: { title: pick(language, i.name, i.nameEn), price: shortPrice(i.price, business.currency) },
      }));
  }, [ads, items, now.day, language, business.currency]);
  const ctx: PanelCtx = { language, business, items, itemsById, ads: effectiveAds, dailyMenu: effectiveMenu, palette, now };

  const panels = props.panels.length > 0 ? props.panels : [{ kind: 'Daily' as const }];
  const portrait = orientation === 'Portrait';
  // TV vertical: un solo flyer. TV horizontal: hasta 3 lado a lado.
  const shown = portrait ? panels.slice(0, 1) : panels.slice(0, 3);
  const hasAdsPanel = shown.some((p) => p.kind === 'Ads');

  // Escala: el flyer se dibuja siempre a 1080x1920 y se ajusta a la pantalla real.
  const stageW = portrait ? PANEL_W : 1920;
  const stageH = portrait ? PANEL_H : 1080;
  const scale = Math.min(viewport.w / stageW, viewport.h / stageH);
  const slotScale = portrait ? 1 : stageH / PANEL_H;
  const slotW = PANEL_W * slotScale;

  const hi = ensureContrast(palette.accent, palette.primary, 3);
  const titleColor = ensureContrast(palette.accent, palette.isDark ? palette.surface : '#ffffff', 4.5);
  const cssVars = {
    '--bp-bg': palette.bg,
    '--bp-card': palette.isDark ? palette.surface : '#ffffff',
    '--bp-text': palette.text,
    '--bp-muted': palette.muted,
    '--bp-line': palette.isDark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.10)',
    '--bp-primary': palette.primary,
    '--bp-primary2': mix(palette.primary, '#000000', 0.32),
    '--bp-on-primary': palette.onPrimary,
    '--bp-accent': palette.accent,
    '--bp-accent2': mix(palette.accent, '#000000', 0.22),
    '--bp-on-accent': palette.onAccent,
    '--bp-hi': hi,
    '--bp-title': titleColor,
    '--bp-special-bg': palette.isDark ? mix(palette.accent, palette.surface, 0.85) : mix(palette.accent, '#ffffff', 0.92),
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: portrait ? palette.bg : mix(palette.primary, '#000000', 0.85) }}>
      <style>{PANEL_CSS}</style>
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', width: stageW, height: stageH,
          transform: `translate(-50%, -50%) scale(${scale})`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-evenly',
          ...cssVars,
        }}
      >
        {shown.map((p, i) => (
          <div key={`${p.kind}-${p.category ?? ''}-${i}`} style={{ width: slotW, height: PANEL_H * slotScale, position: 'relative', overflow: 'hidden', borderRadius: portrait ? 0 : 6, flex: 'none' }}>
            <div style={{ width: PANEL_W, height: PANEL_H, transform: `scale(${slotScale})`, transformOrigin: 'top left' }}>
              {renderPanel(p, ctx, portrait && !hasAdsPanel)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Texto para el monitoreo de pantallas ("Flyers: Menú del día, Comerciales"). */
export function describePanels(panels: BoardPanel[], orientation: BoardOrientation): string {
  const names = panels.map((p) => (p.kind === 'Daily' ? 'Menú del día' : p.kind === 'Ads' ? 'Comerciales' : p.category ?? 'Categoría'));
  return `${orientation === 'Portrait' ? 'Vertical' : 'Flyers'}: ${(orientation === 'Portrait' ? names.slice(0, 1) : names).join(', ')}`;
}

const PANEL_CSS = `
.bp-panel{width:1080px;height:1920px;position:relative;overflow:hidden;background:var(--bp-bg);color:var(--bp-text);display:flex;flex-direction:column;font-feature-settings:"tnum"}
.bp-hdr{position:relative;background:linear-gradient(160deg,var(--bp-primary) 0%,var(--bp-primary2) 100%);color:var(--bp-on-primary);padding:40px 44px 34px;display:flex;gap:34px;align-items:center;flex:none}
.bp-logo{width:190px;height:190px;border-radius:30px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(0,0,0,.35);flex:none;animation:bpBob 6s ease-in-out infinite;overflow:hidden}
.bp-logo img{width:176px;height:176px;object-fit:contain}
@keyframes bpBob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1deg)}}
.bp-htxt{flex:1;min-width:0}
.bp-eyebrow{font-weight:800;letter-spacing:.34em;color:var(--bp-hi);font-size:28px}
.bp-title{font-weight:900;font-size:122px;line-height:.92;text-transform:uppercase;letter-spacing:-.01em;white-space:nowrap;
  background:linear-gradient(100deg,currentColor 0%,currentColor 42%,var(--bp-hi) 50%,currentColor 58%,currentColor 100%);background-size:250% 100%;
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:bpShine 7s linear infinite}
@keyframes bpShine{0%{background-position:120% 0}60%,100%{background-position:-120% 0}}
.bp-hsub{display:flex;align-items:center;gap:18px;margin-top:12px;font-size:28px;font-weight:600;opacity:.92}
.bp-pill{display:inline-flex;align-items:center;gap:10px;background:var(--bp-accent);color:var(--bp-on-accent);padding:6px 18px 6px 14px;border-radius:999px;font-weight:800;font-size:20px;letter-spacing:.14em}
.bp-pill i{width:12px;height:12px;border-radius:50%;background:#7CFF9B;animation:bpPing 2s infinite}
.bp-pill-closed{background:#4b5563;color:#fff}.bp-pill-closed i{background:#cbd5e1;animation:none}
@keyframes bpPing{0%{box-shadow:0 0 0 0 rgba(124,255,155,.7)}80%,100%{box-shadow:0 0 0 14px rgba(124,255,155,0)}}
.bp-ribbon{height:14px;flex:none;background:repeating-linear-gradient(90deg,var(--bp-accent) 0 120px,#fff 120px 160px,var(--bp-primary) 160px 280px,#fff 280px 320px);background-size:320px 100%;animation:bpRibbon 8s linear infinite}
@keyframes bpRibbon{to{background-position:320px 0}}
.bp-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:18px;padding:24px 44px 20px;position:relative;overflow:hidden}
.bp-card{background:var(--bp-card);border-radius:26px;box-shadow:0 1px 0 rgba(0,0,0,.05),0 12px 30px rgba(0,0,0,.10);position:relative}
.bp-base{display:grid;padding:22px 26px;border-top:8px solid var(--bp-hi);flex:none}
.bp-col{padding:0 18px;min-width:0}.bp-col+.bp-col{border-left:2px dashed var(--bp-line)}
.bp-col h3{font-weight:900;font-size:30px;letter-spacing:.08em;color:var(--bp-title);margin:0 0 6px;text-transform:uppercase}
.bp-col ul,.bp-mini ul,.bp-pricelist{list-style:none;margin:0;padding:0}
.bp-col li{font-size:25px;font-weight:600;line-height:1.36}
.bp-combos{display:flex;flex-direction:column;gap:14px;flex:none}
.bp-combos>.bp-card{flex:none}
.bp-ctitle{display:flex;align-items:baseline;gap:16px;padding:0 6px}
.bp-ctitle b{font-weight:900;font-size:40px;color:var(--bp-title);letter-spacing:.02em}
.bp-ctitle span{font-size:24px;font-weight:600;color:var(--bp-muted)}
.bp-prow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;padding:14px 20px 14px 28px;border-left:10px solid var(--bp-primary);overflow:hidden}
.bp-prow::after{content:'';position:absolute;inset:0;border-radius:26px;pointer-events:none;background:linear-gradient(105deg,transparent 30%,color-mix(in srgb,var(--bp-hi) 28%,transparent) 50%,transparent 70%);background-size:300% 100%;background-position:150% 0;animation:bpSpot var(--cycle,9s) ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes bpSpot{0%{background-position:150% 0}22%{background-position:-50% 0}100%{background-position:-50% 0}}
.bp-prow-txt{min-width:0}
.bp-prow h4{font-weight:900;font-size:34px;letter-spacing:.06em;color:var(--bp-title);text-transform:uppercase;margin:0}
.bp-prow p{font-size:25px;font-weight:600;line-height:1.3;margin:2px 0 0}
.bp-it{white-space:nowrap}.bp-sep{color:var(--bp-hi);font-weight:900}
.bp-chips{display:grid;grid-template-columns:repeat(3,108px);gap:10px}
.bp-chips-4{grid-template-columns:repeat(4,96px)}
.bp-chip{background:var(--bp-primary);color:var(--bp-on-primary);border-radius:18px;text-align:center;padding:8px 0 10px;animation:bpPop var(--cycle,9s) ease-in-out infinite;animation-delay:var(--d,0s)}
.bp-chip small{display:block;font-size:13px;font-weight:800;letter-spacing:.12em;color:var(--bp-hi);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px}
.bp-chip strong{display:block;font-weight:900;font-size:38px;line-height:1.05}
.bp-chip-solo{padding:14px 18px}.bp-chips:has(.bp-chip-solo){grid-template-columns:auto}
@keyframes bpPop{0%,4%{transform:scale(1)}10%{transform:scale(1.07)}16%,100%{transform:scale(1)}}
.bp-special{border-left-color:var(--bp-accent);background:var(--bp-special-bg)}
.bp-special .bp-chip{background:var(--bp-accent);color:var(--bp-on-accent)}
.bp-tag{display:inline-block;background:var(--bp-accent);color:var(--bp-on-accent);font-size:16px;font-weight:800;letter-spacing:.18em;padding:5px 12px;border-radius:9px;vertical-align:middle;margin-left:12px}
.bp-extras{display:grid;grid-template-columns:1fr 1fr;gap:20px;flex:none}
.bp-one{grid-template-columns:1fr}
.bp-kick{font-weight:800;letter-spacing:.22em;font-size:19px}
.bp-feat{padding:22px 30px;overflow:hidden}
.bp-feat-a{background:linear-gradient(150deg,var(--bp-accent),var(--bp-accent2));color:var(--bp-on-accent)}
.bp-feat-b{background:linear-gradient(150deg,var(--bp-primary),var(--bp-primary2));color:var(--bp-on-primary)}
.bp-feat-b .bp-kick{color:var(--bp-hi)}.bp-feat-a .bp-kick{opacity:.85}
.bp-fname{font-weight:900;font-size:44px;line-height:1.04;margin:8px 0 10px;max-width:85%}
.bp-fprice{display:flex;align-items:baseline;gap:14px}
.bp-fprice b{font-weight:900;font-size:62px;line-height:1}
.bp-fprice span{font-size:20px;font-weight:600;opacity:.9;line-height:1.25}
.bp-feat-b .bp-fprice b{color:var(--bp-hi)}
.bp-steam{position:absolute;right:26px;top:18px;width:120px;height:120px;opacity:.55}
.bp-steam path{fill:none;stroke:currentColor;stroke-width:6;stroke-linecap:round;animation:bpSteam 3.2s ease-in-out infinite}
.bp-steam path:nth-child(2){animation-delay:.6s}.bp-steam path:nth-child(3){animation-delay:1.2s}
@keyframes bpSteam{0%{opacity:0;transform:translateY(16px)}40%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}
.bp-none{border-top:8px solid var(--bp-accent)}.bp-none .bp-kick{color:var(--bp-title)}
.bp-none .bp-fname{color:var(--bp-muted);font-size:42px}
.bp-next{font-size:24px;font-weight:600}.bp-next b{color:var(--bp-title)}
.bp-ad{position:relative;overflow:hidden;background:#000}
.bp-adzone{flex:1 1 0;min-height:0;border-radius:26px}
.bp-ad-media{position:absolute;inset:0;width:100%;height:100%}
.bp-ad-blur{object-fit:cover;filter:blur(30px) brightness(.6);transform:scale(1.15)}
.bp-kb{animation:bpKb 12s ease-out forwards}
@keyframes bpKb{from{transform:scale(1.02)}to{transform:scale(1.10)}}
.bp-ad-cap{position:absolute;left:0;right:0;bottom:0;padding:90px 40px 40px;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,0));color:#fff;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}
.bp-ad-cap span{font-weight:900;font-size:52px;line-height:1.05}
.bp-ad-cap b{font-weight:900;font-size:56px;background:var(--bp-accent);color:var(--bp-on-accent);border-radius:20px;padding:4px 20px;white-space:nowrap}
.bp-adfull .bp-ad-cap{padding-bottom:140px}
.bp-ad-bar{position:absolute;left:0;top:0;height:6px;background:var(--bp-hi);width:0;animation:bpBar linear forwards}
@keyframes bpBar{to{width:100%}}
.bp-ftr{flex:none;background:var(--bp-primary2);color:var(--bp-on-primary);display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 44px;font-size:22px;font-weight:600}
.bp-ftr span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bp-ftr-name{color:var(--bp-hi)}
.bp-empty{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:20px;padding:60px}
.bp-empty b{font-weight:900;font-size:64px;color:var(--bp-title)}
.bp-empty p{font-size:30px;color:var(--bp-muted);font-weight:600;max-width:800px}
.bp-roomy .bp-combos{flex:1 0 auto}.bp-roomy .bp-combos>.bp-prow{flex:1 0 auto}
.bp-roomy .bp-prow p{font-size:30px;line-height:1.38}
.bp-roomy .bp-it{display:block}.bp-roomy .bp-sep{display:none}
.bp-roomy .bp-chips{grid-template-columns:repeat(3,128px)}.bp-roomy .bp-chips-4{grid-template-columns:repeat(4,104px)}
.bp-roomy .bp-chip strong{font-size:48px}.bp-roomy .bp-chip small{font-size:15px}
.bp-roomy .bp-prow h4{font-size:40px}
/* Día cargado (ej. sábado: 4 combos + sopa + desayuno): platos en línea aunque haya espacio de sobra. */
.bp-dense.bp-roomy .bp-it{display:inline}.bp-dense.bp-roomy .bp-sep{display:inline}.bp-dense.bp-roomy .bp-prow p{font-size:27px}.bp-roomy .bp-col li{font-size:27px}.bp-roomy .bp-fname{font-size:52px}
/* Comerciales a pantalla completa */
.bp-adpanel{background:#000}
.bp-adfull{position:absolute;inset:0}
.bp-noads{position:absolute;inset:0;color:#fff}.bp-noads b{color:#fff}
.bp-adbadge{position:absolute;left:40px;top:40px;width:150px;height:150px;border-radius:26px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:3;overflow:hidden}
.bp-adbadge img{width:138px;height:138px;object-fit:contain}
.bp-adfoot{position:absolute;left:0;right:0;bottom:0;z-index:3}
/* Categoría */
.bp-chdr{background:linear-gradient(160deg,var(--bp-accent),var(--bp-accent2));color:var(--bp-on-accent);padding:46px 50px 36px;flex:none;position:relative;overflow:hidden}
.bp-eyebrow-on-accent{color:inherit;opacity:.85}
.bp-chdr h1{font-weight:900;font-size:120px;line-height:.95;letter-spacing:-.01em;text-transform:uppercase;margin:0}
.bp-h1-sm{font-size:92px!important}
.bp-cmeta{display:flex;gap:16px;align-items:center;margin-top:16px;font-size:28px;font-weight:700}
.bp-cprice{background:#fff;color:#111;font-weight:900;font-size:40px;padding:2px 18px;border-radius:16px}
.bp-sun{position:absolute;right:-60px;top:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.45),rgba(255,255,255,0) 70%);animation:bpGlow 5s ease-in-out infinite}
@keyframes bpGlow{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.12);opacity:1}}
.bp-today{display:grid;grid-template-columns:1fr 340px;overflow:hidden;border-top:8px solid var(--bp-hi);flex:none}
.bp-today:not(:has(.bp-today-ph)){grid-template-columns:1fr}
.bp-today-tx{padding:28px 30px}.bp-today-tx .bp-kick{color:var(--bp-title)}
.bp-today .bp-fname{color:var(--bp-title);font-size:52px}
.bp-tdesc{font-size:24px;color:var(--bp-muted);font-weight:600;line-height:1.35}
.bp-tprice{font-weight:900;font-size:52px;color:var(--bp-title);margin-top:10px}
.bp-today-ph{position:relative;min-height:320px;overflow:hidden}
.bp-today-ph img,.bp-today-ph video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bp-week{padding:16px 22px;flex:none}
.bp-wrow{display:grid;grid-template-columns:110px 1fr auto;align-items:center;padding:12px 14px;border-radius:16px;font-size:26px;font-weight:600;position:relative;overflow:hidden}
.bp-wrow+.bp-wrow{border-top:1px dashed var(--bp-line)}
.bp-wd{font-weight:900;letter-spacing:.1em;color:var(--bp-title);font-size:22px}
.bp-wp{font-weight:800}
.bp-past{opacity:.38}
.bp-now{background:var(--bp-primary);color:var(--bp-on-primary)}.bp-now .bp-wd{color:var(--bp-hi)}
.bp-now::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 35%,rgba(255,255,255,.22) 50%,transparent 65%);background-size:300% 100%;animation:bpSheen 4s linear infinite}
@keyframes bpSheen{from{background-position:150% 0}to{background-position:-150% 0}}
.bp-rest{display:flex;flex-direction:column;gap:14px;min-height:0;flex:1}
.bp-minis{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-content:start}
.bp-mini{padding:24px 26px;border-top:8px solid var(--bp-primary)}
.bp-mini-wide{grid-column:1/-1}
.bp-mini h3{display:flex;justify-content:space-between;align-items:baseline;font-weight:900;font-size:34px;color:var(--bp-title);letter-spacing:.04em;margin:0 0 6px;text-transform:uppercase}
.bp-mini h3 span{color:var(--bp-text);font-size:40px}
.bp-mini li{font-size:27px;font-weight:600;line-height:1.4}
.bp-cols3{columns:3;column-gap:24px}
.bp-pricelist li{display:flex;align-items:baseline;gap:12px}
.bp-pricelist li i{flex:1;border-bottom:3px dotted var(--bp-line);transform:translateY(-6px)}
.bp-pricelist li b{font-weight:900}
`;
