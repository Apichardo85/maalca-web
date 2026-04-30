"use client";

import { useState } from "react";
import type { MenuItem } from "@/app/the-little-dominicana/_data";
import type { MealPeriod, WeekDay } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS: Array<{ key: WeekDay; es: string; en: string }> = [
  { key: "monday",    es: "Lunes",     en: "Monday"    },
  { key: "tuesday",   es: "Martes",    en: "Tuesday"   },
  { key: "wednesday", es: "Miércoles", en: "Wednesday" },
  { key: "thursday",  es: "Jueves",    en: "Thursday"  },
  { key: "friday",    es: "Viernes",   en: "Friday"    },
  { key: "saturday",  es: "Sábado",    en: "Saturday"  },
];

const JS_TO_WEEKDAY: Partial<Record<number, WeekDay>> = {
  1: "monday", 2: "tuesday", 3: "wednesday",
  4: "thursday", 5: "friday", 6: "saturday",
};

const CAT_ORDER = [
  "Desayuno", "Bebidas", "Carnes", "Sopas",
  "Mariscos", "Fritura", "Picadera", "Acompañantes",
];

const CAT_EN: Record<string, string> = {
  Desayuno: "Breakfast", Bebidas: "Beverages", Carnes: "Meat Plates",
  Sopas: "Soups", Mariscos: "Seafood", Fritura: "Fried",
  Picadera: "Appetizers & Snacks", Acompañantes: "Sides",
};

const CAT_NOTE: Record<string, string> = {
  Carnes:   "★ incluye arroz + habichuela / includes rice & beans",
  Mariscos: "★ incluye arroz / includes rice · solo cena / dinner only",
  Desayuno: "9–11 AM",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(amount: number, currency: string) {
  const s = amount.toFixed(2);
  return `${currency}${s.endsWith(".00") ? s.slice(0, -3) : s}`;
}

function firstSentence(text: string) {
  const i = text.indexOf(".");
  return i > 0 ? text.slice(0, i + 1) : text.slice(0, 90);
}

function getDayDishes(
  dishes: MenuItem[],
  availability: Record<string, boolean>,
  itemWeekDays: Record<string, WeekDay[]>,
  day: WeekDay,
) {
  return dishes.filter((d) => {
    if (!availability[d.id]) return false;
    if (d.category === "Incluidos") return false;
    const wd = itemWeekDays[d.id] ?? [];
    return wd.length === 0 || wd.includes(day);
  });
}

function byCategory(items: MenuItem[]): Map<string, MenuItem[]> {
  const m = new Map<string, MenuItem[]>(CAT_ORDER.map((c) => [c, []]));
  for (const d of items) {
    if (!m.has(d.category)) m.set(d.category, []);
    m.get(d.category)!.push(d);
  }
  for (const [k, v] of m) if (!v.length) m.delete(k);
  return m;
}

// Dishes available ONLY on this specific day (day-exclusive specials)
function getDaySpecials(
  items: MenuItem[],
  itemWeekDays: Record<string, WeekDay[]>,
  day: WeekDay,
) {
  return items.filter((d) => {
    const wd = itemWeekDays[d.id] ?? [];
    return wd.length === 1 && wd[0] === day;
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrintableMenuProps {
  dishes: MenuItem[];
  prices: Record<string, number>;
  availability: Record<string, boolean>;
  itemPeriods: Record<string, MealPeriod[]>;
  itemWeekDays: Record<string, WeekDay[]>;
  currency: string;
}

// ─── Page wrapper ────────────────────────────────────────────────────────────

function Page({ id, active, children }: { id: string; active: boolean; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className={`pm-page${active ? " pm-active" : ""}`}
      style={{
        width: "215.9mm", minHeight: "279.4mm",
        background: "#fff", margin: "0 auto 16px",
        padding: "11mm 12mm 14mm", position: "relative",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "14px", color: "#1a1a1a",
        boxShadow: "0 2px 12px rgba(0,0,0,.15)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────

function PageHeader({ dayEs, dayEn }: { dayEs: string; dayEn: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      borderBottom: "3px solid #CE1126", paddingBottom: 7, marginBottom: 9,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span style={{ fontSize: "1.6rem" }}>🇩🇴</span>
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>
            The Little Dominicana
          </div>
          <div style={{ fontSize: ".63rem", color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginTop: 1 }}>
            Cocina Dominicana Auténtica · Elmira, NY
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "1.2rem", color: "#CE1126", lineHeight: 1.1 }}>{dayEs}</div>
        <div style={{ fontSize: ".7rem", color: "#555", textTransform: "uppercase", letterSpacing: "1.5px" }}>{dayEn}</div>
      </div>
    </div>
  );
}

// ─── Page footer ─────────────────────────────────────────────────────────────

function PageFooter() {
  return (
    <div style={{
      position: "absolute", bottom: "8mm", left: "12mm", right: "12mm",
      borderTop: "1px solid #ddd", paddingTop: 4,
      display: "flex", justifyContent: "space-between",
      fontSize: ".6rem", color: "#aaa",
    }}>
      <span>🇩🇴 The Little Dominicana · 315 E Water St, Elmira, NY · (607) 215-0990</span>
      <span><strong>Lun–Sáb</strong> 9 AM – 8 PM · Dom cerrado / Sun closed</span>
    </div>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  dish, price, currency, dinnerOnly,
}: {
  dish: MenuItem; price: number; currency: string; dinnerOnly: boolean;
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto", gap: "0 6px",
      padding: "3.5px 0", borderBottom: "1px dotted #e8e4df",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: ".82rem", color: "#1a1a1a", lineHeight: 1.2 }}>
          {dish.name}
        </div>
        {(dish.descriptionEn || dish.description) && (
          <div style={{ fontSize: ".68rem", color: "#666", fontStyle: "italic", lineHeight: 1.25, marginTop: 1 }}>
            {firstSentence(dish.descriptionEn || dish.description || "")}
          </div>
        )}
        {dinnerOnly && (
          <div style={{ fontSize: ".6rem", color: "#818cf8", marginTop: 1 }}>
            Solo cena / Dinner only
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", paddingTop: 2, flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: ".85rem", color: "#1a1a1a", whiteSpace: "nowrap" }}>
          {fmtPrice(price, currency)}
        </div>
      </div>
    </div>
  );
}

// ─── Category section ────────────────────────────────────────────────────────

function CategorySection({
  cat, items, prices, itemPeriods, currency,
}: {
  cat: string; items: MenuItem[];
  prices: Record<string, number>;
  itemPeriods: Record<string, MealPeriod[]>;
  currency: string;
}) {
  return (
    <div style={{ marginBottom: 10, breakInside: "avoid" }}>
      <div style={{
        fontSize: ".58rem", fontWeight: 700, letterSpacing: "2px",
        textTransform: "uppercase", color: "#CE1126",
        borderBottom: "1px solid #e8e0d8", paddingBottom: 2, marginBottom: 5,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span>{cat} / {CAT_EN[cat] ?? cat}</span>
        {CAT_NOTE[cat] && (
          <span style={{ fontSize: ".55rem", color: "#777", fontWeight: 400, letterSpacing: ".3px", textTransform: "none" }}>
            {CAT_NOTE[cat]}
          </span>
        )}
      </div>
      {items.map((dish) => {
        const periods = itemPeriods[dish.id] ?? [];
        const dinnerOnly = periods.length > 0 && periods.every((p) => p === "dinner");
        return (
          <ItemRow
            key={dish.id}
            dish={dish}
            price={prices[dish.id] ?? dish.price}
            currency={currency}
            dinnerOnly={dinnerOnly}
          />
        );
      })}
    </div>
  );
}

// ─── Menu day page ────────────────────────────────────────────────────────────

function MenuDayPage({
  day, grouped, specials, prices, itemPeriods, currency,
}: {
  day: { key: WeekDay; es: string; en: string };
  grouped: Map<string, MenuItem[]>;
  specials: MenuItem[];
  prices: Record<string, number>;
  itemPeriods: Record<string, MealPeriod[]>;
  currency: string;
}) {
  const entries = Array.from(grouped.entries());
  const mid = Math.ceil(entries.length / 2);
  const left = entries.slice(0, mid);
  const right = entries.slice(mid);

  return (
    <>
      <PageHeader dayEs={day.es} dayEn={day.en} />

      {specials.length > 0 && (
        <div style={{
          border: "1px solid #e8d99a", borderRadius: 4, background: "#fffdf0",
          padding: "5px 9px", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: "1.1rem" }}>⭐</span>
          <div style={{ fontSize: ".72rem", color: "#9a7a1f", fontWeight: 600, lineHeight: 1.4 }}>
            Especiales del día / Today&apos;s Specials:{" "}
            {specials.map((d) => (
              <span key={d.id} style={{ marginRight: 10 }}>
                {d.name} — {fmtPrice(prices[d.id] ?? d.price, currency)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        border: "1px solid #efefef", borderRadius: 3, padding: "3px 8px",
        marginBottom: 6, background: "#fafafa", textAlign: "center",
        fontSize: ".6rem", color: "#999", fontStyle: "italic",
      }}>
        ★ Carnes incluyen arroz y habichuela a elegir · Meat plates include rice &amp; beans of your choice
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px", alignItems: "start" }}>
        <div>{left.map(([cat, items]) => (
          <CategorySection key={cat} cat={cat} items={items} prices={prices} itemPeriods={itemPeriods} currency={currency} />
        ))}</div>
        <div>{right.map(([cat, items]) => (
          <CategorySection key={cat} cat={cat} items={items} prices={prices} itemPeriods={itemPeriods} currency={currency} />
        ))}</div>
      </div>

      <PageFooter />
    </>
  );
}

// ─── Portada (cover page) ────────────────────────────────────────────────────

function PortadaPage({
  weeklySpecials,
}: {
  weeklySpecials: Array<{ key: WeekDay; es: string; en: string; specials: MenuItem[]; total: number; prices: Record<string, number>; currency: string }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
      {/* Brand top */}
      <div style={{
        textAlign: "center", paddingBottom: "10mm",
        borderBottom: "3px solid #CE1126", width: "100%",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: 6 }}>🇩🇴</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "2.2rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1 }}>
          The Little Dominicana
        </div>
        <div style={{ fontSize: ".75rem", letterSpacing: "3px", textTransform: "uppercase", color: "#555", marginTop: 4 }}>
          Cocina Dominicana Auténtica &nbsp;·&nbsp; Authentic Dominican Cuisine
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", marginTop: 10, fontSize: ".72rem", color: "#555" }}>
          <span>📍 315 E Water St, Elmira, NY 14901</span>
          <span>📞 (607) 215-0990</span>
          <span>⏰ Lun–Sáb / Mon–Sat · 9 AM – 8 PM</span>
        </div>
      </div>

      {/* Weekly specials table */}
      <div style={{ width: "100%", margin: "10mm 0" }}>
        <div style={{
          fontSize: ".6rem", fontWeight: 700, letterSpacing: "2.5px",
          textTransform: "uppercase", color: "#CE1126",
          textAlign: "center", marginBottom: "6mm",
        }}>
          Especiales de la Semana / Weekly Specials
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {weeklySpecials.map(({ key, es, en, specials, total, prices, currency }) => (
              <tr key={key} style={{ borderBottom: "1px solid #efefef" }}>
                <td style={{ padding: "5px 8px", verticalAlign: "top", width: "22%", fontWeight: 700, color: "#CE1126", fontSize: ".75rem", whiteSpace: "nowrap" }}>
                  {es}<br />
                  <span style={{ fontSize: ".62rem", color: "#555", fontWeight: 400 }}>{en}</span>
                </td>
                <td style={{ padding: "5px 8px", fontSize: ".78rem", color: "#1a1a1a", lineHeight: 1.5 }}>
                  {specials.length > 0 ? (
                    specials.map((s) => (
                      <span key={s.id} style={{ fontWeight: 600, color: "#9a7a1f", marginRight: 12 }}>
                        ⭐ {s.name} — {fmtPrice(prices[s.id] ?? s.price, currency)}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#aaa", fontStyle: "italic", fontSize: ".7rem" }}>
                      Menú regular · Regular menu
                    </span>
                  )}
                  <br />
                  <span style={{ fontSize: ".62rem", color: "#bbb" }}>{total} platos disponibles / dishes available</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div style={{ marginTop: "auto", borderTop: "1px solid #ddd", paddingTop: "8mm", width: "100%", fontSize: ".68rem", color: "#555", lineHeight: 1.6 }}>
        <strong style={{ color: "#1a1a1a", display: "block", fontSize: ".72rem", marginBottom: 3 }}>
          Sobre los platos de Carnes / About Meat Plates
        </strong>
        Todos los platos de carnes incluyen arroz y habichuela a elegir al ordenar.<br />
        All meat plates include rice and beans of your choice.
        <br /><br />
        <strong style={{ color: "#1a1a1a" }}>Opciones / Options:</strong> Arroz Blanco · Moro de Guandules · Moro de Habichuela Roja · Arroz de Vegetales &nbsp;·&nbsp;
        Habichuela Roja · Lenteja (martes/Tue) · Guandule Guisado (miércoles/Wed)
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PrintableMenu({
  dishes, prices, availability, itemPeriods, itemWeekDays, currency,
}: PrintableMenuProps) {
  const todayKey = JS_TO_WEEKDAY[new Date().getDay()] ?? "monday";
  const [activeDay, setActiveDay] = useState<WeekDay | "portada">(todayKey);

  const weeklySpecials = DAYS.map(({ key, es, en }) => {
    const dayDishes = getDayDishes(dishes, availability, itemWeekDays, key);
    const specials = getDaySpecials(dayDishes, itemWeekDays, key);
    return { key, es, en, specials, total: dayDishes.length, prices, currency };
  });

  return (
    <div id="pm-root">
      {/* ── Print CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #pm-root, #pm-root * { visibility: visible; }
          #pm-root { position: absolute; top: 0; left: 0; width: 100%; }
          .pm-nav { display: none !important; }
          .pm-page { display: block !important; page-break-after: always; break-after: page; }
          @page { size: Letter portrait; margin: 0; }
        }
        @media screen {
          .pm-page { display: none; }
          .pm-page.pm-active { display: block; }
        }
      `}} />

      {/* ── Day nav (screen only) ── */}
      <div className="pm-nav flex flex-wrap gap-1.5 pb-3 mb-1 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveDay("portada")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeDay === "portada"
              ? "text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          }`}
          style={activeDay === "portada" ? { backgroundColor: "var(--brand-primary)" } : undefined}
        >
          📄 Portada
        </button>
        {DAYS.map((d) => {
          const isToday = d.key === todayKey;
          return (
            <button
              key={d.key}
              onClick={() => setActiveDay(d.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeDay === d.key
                  ? "text-white"
                  : isToday
                  ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
              style={activeDay === d.key ? { backgroundColor: "var(--brand-primary)" } : undefined}
            >
              {d.es}
              {isToday && activeDay !== d.key && (
                <span className="ml-1 text-[8px]">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Portada ── */}
      <Page id="pm-portada" active={activeDay === "portada"}>
        <PortadaPage weeklySpecials={weeklySpecials} />
      </Page>

      {/* ── Day pages ── */}
      {DAYS.map((day) => {
        const dayDishes = getDayDishes(dishes, availability, itemWeekDays, day.key);
        const specials  = getDaySpecials(dayDishes, itemWeekDays, day.key);
        const grouped   = byCategory(dayDishes);

        return (
          <Page key={day.key} id={`pm-${day.key}`} active={activeDay === day.key}>
            <MenuDayPage
              day={day}
              grouped={grouped}
              specials={specials}
              prices={prices}
              itemPeriods={itemPeriods}
              currency={currency}
            />
          </Page>
        );
      })}
    </div>
  );
}
