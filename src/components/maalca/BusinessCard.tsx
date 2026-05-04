"use client";

/**
 * Tarjeta de presentación MaalCa — bilingüe, tres vistas.
 *
 * View "print"   → Frente (dark) + Reverso (white) para imprimir.
 * View "mobile"  → Card digital en mockup de phone.
 * View "digital" → AffiliateBusinessCard variant="digital" (tarjeta pública compartible).
 *
 * El toggle ES/EN solo cambia texto, nunca reordena ni redimensiona elementos.
 */

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import type { AffiliateConfig } from "@/config/affiliates-config";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadVCard } from "@/lib/vcard";
import { AffiliateBusinessCard } from "@/components/affiliate/AffiliateBusinessCard";

// ─── Traducciones ─────────────────────────────────────────────────────────────

const T = {
  en: {
    labelFront:    "Front side",
    labelBack:     "Back side",
    tagline:       "Creative ecosystem · multi-business hub",
    mobileTagline: "Master hub · Creative ecosystem & multi-business platform",
    scanLabel:     "Scan me",
    mobileScan:    "Scan to see more",
    location:      "Santo Domingo · Worldwide",
    saveContact:   "Save contact",
    webLabel:      "Website",
    socialLabel:   "Social",
  },
  es: {
    labelFront:    "Frente",
    labelBack:     "Reverso",
    tagline:       "Ecosistema creativo · hub multi-negocio",
    mobileTagline: "Hub maestro · Ecosistema creativo y multi-negocio",
    scanLabel:     "Escanéame",
    mobileScan:    "Escanea para ver más",
    location:      "Santo Domingo · Internacional",
    saveContact:   "Guardar contacto",
    webLabel:      "Sitio web",
    socialLabel:   "Redes sociales",
  },
} as const;

type Lang    = keyof typeof T;
type View    = "print" | "mobile" | "digital";
type Strings = typeof T[Lang];
type Contact = AffiliateConfig["contact"];

// ─── Paleta ───────────────────────────────────────────────────────────────────

const RED      = "#C8102E";
const RED_DIM  = "rgba(200,16,46,0.08)";
const RED_MID  = "rgba(200,16,46,0.15)";
const BG_DARK  = "#0a0a0f";
const SERIF    = "var(--font-playfair, Georgia, serif)";
const SANS     = "var(--font-inter, system-ui, sans-serif)";

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const stored = localStorage.getItem("maalca-card-lang") as Lang | null;
    if (stored === "en" || stored === "es") { setLang(stored); return; }
    setLang(navigator.language.startsWith("es") ? "es" : "en");
  }, []);
  const set = (l: Lang) => { setLang(l); localStorage.setItem("maalca-card-lang", l); };
  return [lang, set];
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

/** Segmented control genérico — igual al patrón del dashboard. */
function Seg<V extends string>({
  opts, value, onChange,
}: { opts: { v: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-0.5">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            v === value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Logo MaalCa sobre fondo blanco con anillo sutil. El SVG ya incluye su propio círculo rojo. */
function LogoBadge({ size }: { size: number }) {
  const pad = Math.round(size * 0.06);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: pad,
      boxShadow: `0 0 0 ${Math.round(size * 0.055)}px ${RED_MID}`,
    }}>
      <Image
        src="/logo-icon.svg"
        alt="MaalCa"
        width={size - pad * 2}
        height={size - pad * 2}
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
        unoptimized
      />
    </div>
  );
}

/** Placeholder animado mientras carga el QR. */
function QrPlaceholder({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: 6, background: "#f3f4f6" }}
      className="animate-pulse"
    />
  );
}

// ─── Print: Frente ────────────────────────────────────────────────────────────

function PrintFront({ t }: { t: Strings }) {
  return (
    <article style={{
      background: BG_DARK,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      aspectRatio: "1.75 / 1",
      maxWidth: 520,
      border: "0.5px solid rgba(255,255,255,0.06)",
      fontFamily: SANS,
    }}>
      {/* Franjas rojas */}
      <div style={{ position: "absolute", top: 0,    left: 0, right: 0, height: 3, background: RED }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: RED }} />

      {/* Meta esquinas */}
      <span style={{ position: "absolute", top: 20, left: 24,  fontSize: 9,  color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>est. 2024</span>
      <span style={{ position: "absolute", top: 20, right: 24, fontSize: 9,  color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>DR · INTL</span>

      {/* Centro */}
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 28px", gap: 10 }}>
        <LogoBadge size={76} />

        <h1 style={{ fontFamily: SERIF, fontSize: 32, color: "white", letterSpacing: "0.02em", lineHeight: 1, margin: "4px 0 0" }}>
          MaalCa
        </h1>

        <div style={{ width: 32, height: 1, background: RED }} />

        {/* min-height: reserva espacio para la versión ES (≈20% más larga) */}
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "center", margin: 0, minHeight: "2.8em", lineHeight: 1.4 }}>
          {t.tagline}
        </p>
      </div>
    </article>
  );
}

// ─── Print: Reverso ───────────────────────────────────────────────────────────

function PrintBack({ t, qrDataUrl, contact }: { t: Strings; qrDataUrl: string; contact: Contact }) {
  const QR_SIZE = 114;
  return (
    <article style={{
      background: "white",
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      aspectRatio: "1.75 / 1",
      maxWidth: 520,
      border: "0.5px solid rgba(0,0,0,0.08)",
      fontFamily: SANS,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED }} />

      <div style={{ height: "100%", display: "flex", padding: 28, gap: 24, alignItems: "center" }}>
        {/* QR block */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ border: `2px solid ${RED}`, borderRadius: 6, padding: 8, background: "white", lineHeight: 0 }}>
            {qrDataUrl
              ? <img src={qrDataUrl} width={QR_SIZE} height={QR_SIZE} alt="QR MaalCa" style={{ display: "block", borderRadius: 4 }} />
              : <QrPlaceholder size={QR_SIZE} />
            }
          </div>
          <p style={{ fontSize: 8, color: RED, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 500, margin: 0, minHeight: "1.4em", lineHeight: 1.4 }}>
            {t.scanLabel}
          </p>
        </div>

        {/* Contacto */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: SERIF, fontSize: 26, color: "#1a1a1a", lineHeight: 1 }}>MaalCa</span>
          <div style={{ width: 28, height: 1, background: RED, margin: "6px 0 14px" }} />

          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {contact?.email && <BackRow icon="mail"  text={contact.email} />}
            {contact?.website && <BackRow icon="web" text={contact.website.replace(/^https?:\/\//, "")} />}
            <BackRow icon="pin" text={t.location} />
          </ul>
        </div>
      </div>
    </article>
  );
}

type IconId = "mail" | "web" | "pin";

function BackRow({ icon, text }: { icon: IconId; text: string }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10, listStyle: "none" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: RED_DIM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ContactSvg id={icon} size={12} />
      </div>
      <span style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.4 }}>{text}</span>
    </li>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MobileCard({ t, qrDataUrl, contact, onSave }: {
  t: Strings;
  qrDataUrl: string;
  contact: Contact;
  onSave: () => void;
}) {
  const QR_SIZE = 114;
  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-800/60 rounded-2xl p-6">
      {/* Phone shell */}
      <div style={{ width: 320, background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 0 0 8px #1a1a1a", fontFamily: SANS }}>

        {/* Header rojo */}
        <header style={{ background: `linear-gradient(180deg, ${RED} 0%, #8b0a20 100%)`, padding: "32px 24px 28px", textAlign: "center", position: "relative" }}>
          {/* Notch */}
          <div style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
          </div>
          <div style={{ display: "inline-block", margin: "12px 0 14px" }}>
            <LogoBadge size={72} />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 28, color: "white", margin: "0 0 4px", lineHeight: 1 }}>MaalCa</h1>
          <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.5)", margin: "8px auto" }} />
          {/* min-height absorbe ES (más largo que EN) */}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em", padding: "0 16px", lineHeight: 1.5, margin: 0, minHeight: "3.2em" }}>
            {t.mobileTagline}
          </p>
        </header>

        {/* QR section */}
        <section style={{ padding: "24px 20px 20px", textAlign: "center", background: "#fafafa" }}>
          <div style={{ width: 130, height: 130, margin: "0 auto 8px", background: "white", padding: 8, borderRadius: 8, border: `1px solid rgba(200,16,46,0.2)`, lineHeight: 0, display: "inline-block" }}>
            {qrDataUrl
              ? <img src={qrDataUrl} width={QR_SIZE} height={QR_SIZE} alt="QR MaalCa" style={{ display: "block", borderRadius: 4 }} />
              : <QrPlaceholder size={QR_SIZE} />
            }
          </div>
          <p style={{ fontSize: 9, color: RED, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, margin: 0, minHeight: "1.4em", lineHeight: 1.4 }}>
            {t.mobileScan}
          </p>
        </section>

        {/* Links */}
        <section style={{ padding: "8px 16px 20px", background: "white" }}>
          {contact?.email && (
            <MobileLink href={`mailto:${contact.email}`} icon="mail" label="Email" sub={contact.email} />
          )}
          {contact?.website && (
            <MobileLink href={contact.website} icon="web" label={t.webLabel} sub={contact.website.replace(/^https?:\/\//, "")} external />
          )}
          {contact?.social?.instagram && (
            <MobileLink href={`https://instagram.com/${contact.social.instagram}`} icon="insta" label={t.socialLabel} sub={`@${contact.social.instagram}`} external />
          )}

          <button
            onClick={onSave}
            style={{ width: "100%", padding: 14, background: RED, color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 500, marginTop: 8, cursor: "pointer", letterSpacing: "0.02em", lineHeight: 1.5 }}
          >
            {t.saveContact}
          </button>
        </section>

      </div>
    </div>
  );
}

type MobileIconId = "mail" | "web" | "pin" | "insta";

function MobileLink({ href, icon, label, sub, external }: {
  href: string; icon: MobileIconId; label: string; sub: string; external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, marginBottom: 8, background: "#fff5f5", border: `1px solid rgba(200,16,46,0.1)`, textDecoration: "none", color: "inherit" }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: RED_MID, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ContactSvg id={icon} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", margin: 0, lineHeight: 1.4 }}>{label}</p>
        <p style={{ fontSize: 11, color: "#666", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
      </div>
      <span style={{ color: RED, fontSize: 16, flexShrink: 0 }}>→</span>
    </a>
  );
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
// Inline SVG para evitar dependencias externas y mantener el color dinámico.

function ContactSvg({ id, size }: { id: IconId | MobileIconId; size: number }) {
  const s = { width: size, height: size, fill: "none", stroke: RED, strokeWidth: 2 } as const;
  if (id === "mail")  return <svg {...s} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  if (id === "web")   return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
  if (id === "pin")   return <svg {...s} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  if (id === "insta") return <svg {...s} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1.2" fill={RED} stroke="none"/></svg>;
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BusinessCard() {
  const { config } = useAffiliate();
  const [lang, setLang]     = useLang();
  const [view, setView]     = useState<View>("print");
  const [qrDataUrl, setQr]  = useState("");

  const t       = T[lang];
  const contact = config?.contact;
  const cardUrl = contact?.website ?? "https://maalca.com";

  useEffect(() => {
    generateQrDataUrl(cardUrl, { darkColor: RED, width: 512 }).then(setQr);
  }, [cardUrl]);

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* ── Controles ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Lang toggle — solo visible en vistas print/mobile */}
        {view !== "digital" && (
          <Seg<Lang>
            opts={[{ v: "en", label: "EN" }, { v: "es", label: "ES" }]}
            value={lang}
            onChange={setLang}
          />
        )}
        {view === "digital" && <div />}
        <Seg<View>
          opts={[
            { v: "print",   label: "Print"   },
            { v: "mobile",  label: "Mobile"  },
            { v: "digital", label: "Digital" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {/* ── Vista Print ── */}
      {view === "print" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{t.labelFront}</p>
            <PrintFront t={t} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{t.labelBack}</p>
            <PrintBack t={t} qrDataUrl={qrDataUrl} contact={contact} />
          </div>
        </div>
      )}

      {/* ── Vista Mobile ── */}
      {view === "mobile" && (
        <MobileCard
          t={t}
          qrDataUrl={qrDataUrl}
          contact={contact}
          onSave={() => downloadVCard(config)}
        />
      )}

      {/* ── Vista Digital (tarjeta pública compartible) ── */}
      {view === "digital" && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
            Vista previa digital · maalca.com/tarjeta/maalca
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <AffiliateBusinessCard
                config={config}
                qrDataUrl={qrDataUrl}
                qrUrl={cardUrl}
                variant="digital"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <a
              href="/tarjeta/maalca"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: RED, color: "white" }}
            >
              Abrir tarjeta pública →
            </a>
            <button
              onClick={() => downloadVCard(config)}
              className="px-4 py-2 rounded-full border-2 text-xs font-bold"
              style={{ borderColor: RED, color: RED }}
            >
              📥 Descargar vCard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
