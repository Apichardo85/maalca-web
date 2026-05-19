"use client";

import { useState, useEffect, useRef } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import type { AffiliateConfig } from "@/config/affiliates-config";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadVCard } from "@/lib/vcard";
import { AffiliateBusinessCard } from "@/components/affiliate/AffiliateBusinessCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang        = "en" | "es";
type View        = "print" | "digital";
type PrintFormat = "horizontal" | "vertical";
type Contact     = AffiliateConfig["contact"];

// ─── Paleta ───────────────────────────────────────────────────────────────────

const RED  = "#C8102E";
const SANS = "var(--font-inter, system-ui, sans-serif)";

// ─── Datos fijos de founders ──────────────────────────────────────────────────

const FOUNDERS = {
  ciriaco: {
    name:    "Ciriaco Pichardo",
    title:   "Founder · Systems Architect",
    handles: "@CiriSonic · @CiriWhispers",
    phone:   "607-857-4226",
    email:   "maalca@gmail.com",
    url:     "maalca.com",
  },
  alexis: {
    name:    "Alexis Ruiz",
    title:   "Founder · Growth & Partnerships",
    handles: "@MaalCa",
    phone:   "917-388-6156",
    email:   "maalca@gmail.com",
    url:     "maalca.com",
  },
} as const;

// ─── Lang hook ────────────────────────────────────────────────────────────────

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("maalca-card-lang") as Lang | null;
    if (s === "en" || s === "es") { setLang(s); return; }
    setLang(navigator.language.startsWith("es") ? "es" : "en");
  }, []);
  const set = (l: Lang) => { setLang(l); localStorage.setItem("maalca-card-lang", l); };
  return [lang, set];
}

// ─── Seg control ─────────────────────────────────────────────────────────────

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

// ─── Shared helpers ───────────────────────────────────────────────────────────

function QrPlaceholder({ size }: { size: number }) {
  return <div style={{ width: size, height: size, borderRadius: 4, background: "#e5e7eb" }} className="animate-pulse" />;
}

function MaalCaPersonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="11" r="4" fill="#fff" />
      <line x1="20" y1="15" x2="20" y2="27" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="19" x2="30" y2="19" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="27" x2="13" y2="35" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="27" x2="27" y2="35" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Contact icon SVGs ────────────────────────────────────────────────────────

type CIconId = "at" | "phone" | "mail" | "web";

function CIcon({ id }: { id: CIconId }) {
  const s = { width: 11, height: 11, fill: "none", stroke: "rgba(255,255,255,0.45)", strokeWidth: 1.5, display: "block", flexShrink: 0 } as const;
  if (id === "at")    return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
  if (id === "phone") return <svg {...s} viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16.92z"/></svg>;
  if (id === "mail")  return <svg {...s} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

function InfoRow({ icon, text, center }: { icon: CIconId; text: string; center?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, justifyContent: center ? "center" : undefined }}>
      <CIcon id={icon} />
      <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", lineHeight: 1 }}>{text}</span>
    </div>
  );
}

// ─── FORMATO VERTICAL (200×320) ───────────────────────────────────────────────

interface PersonalData { name: string; title: string; handles: string; phone: string; email: string; url: string; qrDataUrl: string; }

function VerticalPersonalCard({ data }: { data: PersonalData }) {
  return (
    <div style={{
      width: 200, height: 320, borderRadius: 16,
      padding: "22px 20px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: "#111", border: "0.5px solid #2a2a2a",
      fontFamily: SANS, flexShrink: 0,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MaalCaPersonIcon size={22} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#fff", letterSpacing: "0.05em" }}>MaalCa</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 0" }}>
        <div style={{ fontSize: 17, fontWeight: 500, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 4, whiteSpace: "pre-line" }}>{data.name}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{data.title}</div>
        <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 12 }} />
        <InfoRow icon="at"    text={data.handles} />
        <InfoRow icon="phone" text={data.phone} />
        <InfoRow icon="mail"  text={data.email} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ background: "#fff", borderRadius: 6, padding: 5, lineHeight: 0 }}>
          {data.qrDataUrl ? <img src={data.qrDataUrl} width={70} height={70} alt="QR" style={{ display: "block" }} /> : <QrPlaceholder size={70} />}
        </div>
        <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{data.url}</span>
      </div>
    </div>
  );
}

function VerticalBrandCard({ tagline, qrDataUrl }: { tagline: string; qrDataUrl: string }) {
  return (
    <div style={{
      width: 200, height: 320, borderRadius: 16,
      padding: "22px 20px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: RED, border: "0.5px solid #a00c24",
      fontFamily: SANS, flexShrink: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MaalCaPersonIcon size={22} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: "#fff", letterSpacing: "-0.02em" }}>MaalCa</div>
        <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.65)", letterSpacing: "0.12em", textTransform: "uppercase", maxWidth: 130, lineHeight: 1.4 }}>{tagline}</div>
        <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.35)", margin: "12px auto" }} />
        <InfoRow icon="mail" text="maalca@gmail.com" center />
        <InfoRow icon="web"  text="maalca.com" center />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ background: "#fff", borderRadius: 6, padding: 5, lineHeight: 0 }}>
          {qrDataUrl ? <img src={qrDataUrl} width={70} height={70} alt="QR MaalCa" style={{ display: "block" }} /> : <QrPlaceholder size={70} />}
        </div>
        <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>maalca.com</span>
      </div>
    </div>
  );
}

// ─── FORMATO HORIZONTAL (3.5"×2", aspect-ratio 1.75:1) ───────────────────────

function HorizontalPersonalCard({ data }: { data: PersonalData }) {
  return (
    <div style={{
      width: "100%",
      aspectRatio: "1.75 / 1",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: "#111", border: "0.5px solid #333",
      fontFamily: SANS,
    }}>
      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MaalCaPersonIcon size={16} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#fff", letterSpacing: "0.01em" }}>MaalCa</span>
      </div>

      {/* Mid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "4px 0" }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: "#fff", marginBottom: 3, letterSpacing: "-0.01em" }}>{data.name}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{data.title}</div>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 10 }} />
        <InfoRow icon="at"    text={data.handles} />
        <InfoRow icon="phone" text={data.phone} />
        <InfoRow icon="mail"  text={data.email} />
      </div>

      {/* Bottom: url + QR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>{data.url}</span>
        <div style={{ width: 52, height: 52, background: "#fff", borderRadius: 6, padding: 3, flexShrink: 0 }}>
          {data.qrDataUrl ? <img src={data.qrDataUrl} width={46} height={46} alt="QR" style={{ display: "block" }} /> : <QrPlaceholder size={46} />}
        </div>
      </div>
    </div>
  );
}

function HorizontalBrandCard({ tagline, qrDataUrl }: { tagline: string; qrDataUrl: string }) {
  return (
    <div style={{
      width: "100%",
      aspectRatio: "1.75 / 1",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: RED, border: "0.5px solid #a00c24",
      fontFamily: SANS,
    }}>
      {/* Logo centrado */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MaalCaPersonIcon size={16} />
        </div>
      </div>

      {/* Mid centrado */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: "#fff", letterSpacing: "-0.02em" }}>MaalCa</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{tagline}</div>
        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.35)", margin: "4px 0 6px" }} />
        <InfoRow icon="mail" text="maalca@gmail.com" center />
        <InfoRow icon="web"  text="maalca.com" center />
      </div>

      {/* QR centrado */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 52, height: 52, background: "#fff", borderRadius: 6, padding: 3 }}>
          {qrDataUrl ? <img src={qrDataUrl} width={46} height={46} alt="QR" style={{ display: "block" }} /> : <QrPlaceholder size={46} />}
        </div>
      </div>
    </div>
  );
}

// ─── Download PNG ─────────────────────────────────────────────────────────────

function DownloadCardBtn({ cardRef, filename }: { cardRef: React.RefObject<HTMLDivElement | null>; filename: string }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filename}.png`;
      a.click();
    } catch (e) {
      console.error("Error generando PNG:", e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={run}
      disabled={loading}
      className="px-4 py-1.5 rounded-full text-white text-xs font-bold transition-opacity disabled:opacity-60"
      style={{ background: RED }}
    >
      {loading ? "Generando..." : "⬇️ PNG"}
    </button>
  );
}

// ─── Print ventana (ambos formatos) ──────────────────────────────────────────

function PrintAllCardsBtn({ qrDataUrl, format }: { qrDataUrl: string; format: PrintFormat }) {
  const open = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const personSvg = `<svg width="16" height="16" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="11" r="4" fill="#fff"/><line x1="20" y1="15" x2="20" y2="27" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="19" x2="30" y2="19" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="27" x2="13" y2="35" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="27" x2="27" y2="35" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`;

    const isH = format === "horizontal";

    const cardStyle = isH
      ? `width:100%;aspect-ratio:1.75/1;border-radius:16px;padding:20px 22px;`
      : `width:200px;height:320px;border-radius:16px;padding:22px 20px;`;

    const founders = [
      { name: "Ciriaco Pichardo", title: "Founder · Systems Architect",      handles: "@CiriSonic · @CiriWhispers", phone: "607-857-4226", email: "maalca@gmail.com" },
      { name: "Alexis Ruiz",      title: "Founder · Growth & Partnerships",  handles: "@MaalCa",                   phone: "917-388-6156", email: "maalca@gmail.com" },
    ];

    const logoCircleDark  = `<div style="width:${isH?28:36}px;height:${isH?28:36}px;border-radius:50%;background:#C8102E;display:flex;align-items:center;justify-content:center;flex-shrink:0">${personSvg}</div>`;
    const logoCircleGlass = `<div style="width:${isH?28:36}px;height:${isH?28:36}px;border-radius:50%;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center">${personSvg}</div>`;
    const qrBox           = (size: number) => `<div style="width:${size}px;height:${size}px;background:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0"><img src="${qrDataUrl}" width="${size-4}" height="${size-4}" style="display:block"/></div>`;

    const darkCard = (d: typeof founders[0]) => isH ? `
      <div style="${cardStyle}display:flex;flex-direction:column;justify-content:space-between;background:#111;border:.5px solid #333;font-family:system-ui,sans-serif;overflow:hidden">
        <div style="display:flex;align-items:center;gap:8px">${logoCircleDark}<span style="font-size:13px;font-weight:500;color:#fff;letter-spacing:.01em">MaalCa</span></div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:4px 0">
          <div style="font-size:16px;font-weight:500;color:#fff;margin-bottom:3px;letter-spacing:-.01em">${d.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.55);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px">${d.title}</div>
          <div style="width:28px;height:1px;background:rgba(255,255,255,.2);margin-bottom:10px"></div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:3px">@ ${d.handles}</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:3px">☎ ${d.phone}</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65)">✉ ${d.email}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <span style="font-size:8.5px;color:rgba(255,255,255,.35);letter-spacing:.06em">maalca.com</span>
          ${qrBox(36)}
        </div>
      </div>` : `
      <div style="${cardStyle}display:flex;flex-direction:column;justify-content:space-between;background:#111;border:.5px solid #2a2a2a;font-family:system-ui,sans-serif">
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px">${logoCircleDark}<span style="font-size:11px;font-weight:500;color:#fff;letter-spacing:.05em">MaalCa</span></div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:16px 0">
          <div style="font-size:17px;font-weight:500;color:#fff;line-height:1.2;margin-bottom:4px">${d.name}</div>
          <div style="font-size:9px;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px">${d.title}</div>
          <div style="width:24px;height:1px;background:rgba(255,255,255,.2);margin-bottom:12px"></div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:5px">@ ${d.handles}</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:5px">☎ ${d.phone}</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65)">✉ ${d.email}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          ${qrBox(70)}
          <span style="font-size:8.5px;color:rgba(255,255,255,.3);letter-spacing:.06em">maalca.com</span>
        </div>
      </div>`;

    const redCard = isH ? `
      <div style="${cardStyle}display:flex;flex-direction:column;justify-content:space-between;background:#C8102E;border:.5px solid #a00c24;font-family:system-ui,sans-serif;overflow:hidden">
        <div style="display:flex;justify-content:center">${logoCircleGlass}</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px">
          <div style="font-size:20px;font-weight:500;color:#fff;letter-spacing:-.02em">MaalCa</div>
          <div style="font-size:9px;color:rgba(255,255,255,.7);letter-spacing:.12em;text-transform:uppercase">Modern OS for Local Business</div>
          <div style="width:28px;height:1px;background:rgba(255,255,255,.35);margin:4px 0 6px"></div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:3px">✉ maalca@gmail.com</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65)">🌐 maalca.com</div>
        </div>
        <div style="display:flex;justify-content:center">${qrBox(36)}</div>
      </div>` : `
      <div style="${cardStyle}display:flex;flex-direction:column;justify-content:space-between;background:#C8102E;border:.5px solid #a00c24;font-family:system-ui,sans-serif">
        <div style="display:flex;justify-content:center">${logoCircleGlass}</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px">
          <div style="font-size:22px;font-weight:500;color:#fff;letter-spacing:-.02em">MaalCa</div>
          <div style="font-size:8.5px;color:rgba(255,255,255,.65);letter-spacing:.12em;text-transform:uppercase;max-width:130px;line-height:1.4">Modern OS for Local Business</div>
          <div style="width:24px;height:1px;background:rgba(255,255,255,.35);margin:12px auto"></div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65);margin-bottom:5px">✉ maalca@gmail.com</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,.65)">🌐 maalca.com</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          ${qrBox(70)}
          <span style="font-size:8.5px;color:rgba(255,255,255,.5);letter-spacing:.06em">maalca.com</span>
        </div>
      </div>`;

    const gridStyle = isH
      ? `display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;max-width:1100px;margin:0 auto`
      : `display:flex;gap:24px;justify-content:center;flex-wrap:wrap`;

    w.document.write(`<!DOCTYPE html><html><head><title>Tarjetas MaalCa</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;padding:24px;background:#f5f5f5}
@media print{body{padding:8px;background:white}}</style></head><body>
<div style="${gridStyle}">
  ${founders.map(darkCard).join("")}
  ${redCard}
</div>
<script>window.onload=()=>window.print()<\/script>
</body></html>`);
    w.document.close();
  };
  return (
    <button
      onClick={open}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
      style={{ background: RED }}
    >
      🖨️ Imprimir las 3
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BusinessCard() {
  const { config } = useAffiliate();
  const [lang, setLang]           = useLang();
  const [view, setView]           = useState<View>("print");
  const [format, setFormat]       = useState<PrintFormat>("horizontal");
  const [qrDataUrl, setQr]        = useState("");

  const ciriRef   = useRef<HTMLDivElement>(null);
  const alexisRef = useRef<HTMLDivElement>(null);
  const maalcaRef = useRef<HTMLDivElement>(null);

  const contact = config?.contact;
  const cardUrl = contact?.website ?? "https://maalca.com";

  const tagline = lang === "es" ? "OS moderno para negocios locales" : "Modern OS for Local Business";

  useEffect(() => {
    generateQrDataUrl("https://maalca.com", { darkColor: RED, width: 512 }).then(setQr);
  }, []);

  if (!config) return null;

  const ciriData   = { ...FOUNDERS.ciriaco, qrDataUrl };
  const alexisData = { ...FOUNDERS.alexis,  qrDataUrl };

  return (
    <div className="space-y-6">
      {/* ── Controles ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Seg<Lang>
          opts={[{ v: "en", label: "EN" }, { v: "es", label: "ES" }]}
          value={lang}
          onChange={setLang}
        />
        <Seg<View>
          opts={[
            { v: "print",   label: "Print"   },
            { v: "digital", label: "Digital" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {/* ── Vista Print ── */}
      {view === "print" && (
        <div className="space-y-5">
          {/* Formato toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Formato:</span>
            <Seg<PrintFormat>
              opts={[
                { v: "horizontal", label: "Horizontal 3.5″×2″" },
                { v: "vertical",   label: "Vertical"            },
              ]}
              value={format}
              onChange={setFormat}
            />
          </div>

          {/* Tarjetas */}
          {format === "horizontal" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <CardWrapper label="Ciriaco"      cardRef={ciriRef}   filename="tarjeta-ciriaco">
                <HorizontalPersonalCard data={ciriData} />
              </CardWrapper>
              <CardWrapper label="Alexis"       cardRef={alexisRef} filename="tarjeta-alexis">
                <HorizontalPersonalCard data={alexisData} />
              </CardWrapper>
              <CardWrapper label="MaalCa general" cardRef={maalcaRef} filename="tarjeta-maalca">
                <HorizontalBrandCard tagline={tagline} qrDataUrl={qrDataUrl} />
              </CardWrapper>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              <CardWrapper label="Ciriaco"      cardRef={ciriRef}   filename="tarjeta-ciriaco">
                <VerticalPersonalCard data={ciriData} />
              </CardWrapper>
              <CardWrapper label="Alexis"       cardRef={alexisRef} filename="tarjeta-alexis">
                <VerticalPersonalCard data={alexisData} />
              </CardWrapper>
              <CardWrapper label="MaalCa general" cardRef={maalcaRef} filename="tarjeta-maalca">
                <VerticalBrandCard tagline={tagline} qrDataUrl={qrDataUrl} />
              </CardWrapper>
            </div>
          )}

          <div className="flex justify-center">
            <PrintAllCardsBtn qrDataUrl={qrDataUrl} format={format} />
          </div>
        </div>
      )}

      {/* ── Vista Digital (tarjeta pública compartible) ── */}
      {view === "digital" && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
            Vista previa · maalca.com/tarjeta/maalca
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

// ─── Card wrapper (label + ref + download btn) ────────────────────────────────

function CardWrapper({ label, cardRef, filename, children }: {
  label: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">{label}</p>
      <div ref={cardRef}>{children}</div>
      <div className="flex justify-center">
        <DownloadCardBtn cardRef={cardRef} filename={filename} />
      </div>
    </div>
  );
}
