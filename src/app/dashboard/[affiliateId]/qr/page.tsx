"use client";

import { useEffect, useState } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import QRCode from "qrcode";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "mesas" | "redes" | "imprimir";

interface QRItem {
  id: string;
  label: string;
  sub: string;
  url: string;
  icon: string;
}

// ─── QR Card Component ───────────────────────────────────────────────────────

function QRCard({ item, brandColor, size = 150 }: { item: QRItem; brandColor: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(item.url, {
      width: size * 2,
      margin: 2,
      color: { dark: brandColor, light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setDataUrl);
  }, [item.url, size, brandColor]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${item.id}.png`;
    a.click();
  };

  const ready = !!dataUrl;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* QR image */}
      <div
        className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {ready ? (
          <img src={dataUrl} alt={item.label} className="w-full h-full" />
        ) : (
          <span className="text-2xl">{item.icon}</span>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.sub}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={download}
          disabled={!ready}
          className="flex-1 py-1.5 rounded-full border-2 text-xs font-bold transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
        >
          PNG
        </button>
        <button
          onClick={() => {
            if (!ready) return;
            const w = window.open("", "_blank");
            if (!w) return;
            w.document.write(`<!DOCTYPE html><html><head><title>QR - ${item.label}</title>
              <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
              .card{width:290px;padding:28px 22px;border:2.5px solid ${brandColor};border-radius:16px;text-align:center}
              .label{font-size:24px;font-weight:700;color:${brandColor};margin-bottom:6px}
              .sub{font-size:11px;color:#74777f;margin-bottom:18px}
              img{width:200px;height:200px;margin:0 auto 14px;display:block}
              .url{font-size:8px;color:#9ca3af;word-break:break-all}</style></head><body>
              <div class="card"><div class="label">${item.label}</div><div class="sub">${item.sub}</div>
              <img src="${dataUrl}" alt="${item.label}"/><div class="url">${item.url}</div></div>
              <script>window.onload=()=>window.print()<\/script></body></html>`);
            w.document.close();
          }}
          disabled={!ready}
          className="flex-1 py-1.5 rounded-full text-white text-xs font-bold transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Print
        </button>
      </div>
    </div>
  );
}

// ─── Print All Button ────────────────────────────────────────────────────────

function PrintAllBtn({
  items,
  label,
  brandColor,
  brandName,
}: {
  items: QRItem[];
  label: string;
  brandColor: string;
  brandName: string;
}) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const cards = await Promise.all(
        items.map(async (item) => ({
          item,
          url: await QRCode.toDataURL(item.url, {
            width: 400,
            margin: 2,
            color: { dark: brandColor, light: "#fff" },
            errorCorrectionLevel: "M",
          }),
        }))
      );

      const w = window.open("", "_blank");
      if (!w) return;

      const html = cards
        .map(
          ({ item, url }) => `
        <div class="card">
          <div class="brand">${brandName}</div>
          <div class="label">${item.label}</div>
          <div class="sub">${item.sub}</div>
          <img src="${url}" alt="${item.label}"/>
        </div>`
        )
        .join("");

      w.document.write(`<!DOCTYPE html><html><head>
        <title>${label} - ${brandName}</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;padding:20px}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .card{border:2px solid ${brandColor};border-radius:14px;padding:18px 14px;text-align:center;page-break-inside:avoid}
        .brand{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${brandColor};margin-bottom:4px}
        .label{font-size:18px;font-weight:700;color:#111;margin-bottom:2px}
        .sub{font-size:10px;color:#74777f;margin-bottom:12px}
        img{width:150px;height:150px;margin:0 auto 10px;display:block}
        @media print{.grid{gap:14px}}</style></head><body>
        <div class="grid">${html}</div>
        <script>window.onload=()=>window.print()<\/script></body></html>`);
      w.document.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={run}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-opacity disabled:opacity-70"
      style={{ backgroundColor: "var(--brand-primary)" }}
    >
      🖨️ {loading ? "Generando..." : label}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function QRPage() {
  const { config, brandName } = useAffiliate();
  const [tab, setTab] = useState<Tab>("mesas");

  const affiliateId = config?.id ?? "affiliate";
  const brandColor = `var(--brand-primary)`;
  // For QR generation we need the actual hex, grab from CSS variable at runtime
  const [hexColor, setHexColor] = useState("#000000");

  useEffect(() => {
    const el = document.querySelector("[style*='--brand-primary']");
    if (el) {
      const val = getComputedStyle(el).getPropertyValue("--brand-primary").trim();
      if (val) setHexColor(val);
    }
  }, []);

  const BASE = `https://maalca.com/${affiliateId}`;
  const TABLES_COUNT = 12;

  const TABLE_ITEMS: QRItem[] = Array.from({ length: TABLES_COUNT }, (_, i) => ({
    id: `mesa-${i + 1}`,
    label: `Mesa ${i + 1}`,
    sub: "Escanea para ver el menu",
    url: `${BASE}/menu?mesa=${i + 1}`,
    icon: "🍽️",
  }));

  const SOCIAL_ITEMS: QRItem[] = [
    { id: "menu", label: "Menu Digital", sub: `${BASE}/menu`, url: `${BASE}/menu`, icon: "📋" },
    { id: "instagram", label: "Instagram", sub: `@${affiliateId}`, url: `https://instagram.com/${affiliateId}`, icon: "📸" },
    { id: "facebook", label: "Facebook", sub: brandName, url: `https://facebook.com/${affiliateId}`, icon: "👥" },
    { id: "reservar", label: "Reservaciones", sub: "Reserva tu mesa online", url: `${BASE}/#reservar`, icon: "📅" },
  ];

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "mesas", label: "Mesas", icon: "🍽️" },
    { key: "redes", label: "Redes & Flyers", icon: "📱" },
    { key: "imprimir", label: "Kit Impresion", icon: "🖨️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--brand-primary)" }}
          >
            Marketing Digital
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Codigos QR
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            QR con tu marca — Listos para imprimir — Sin app necesaria
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* MESAS tab */}
      {tab === "mesas" && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
              Cada QR lleva al menu digital pre-configurado para esa mesa. El cliente escanea con la camara del movil — sin app.
            </p>
            <PrintAllBtn
              items={TABLE_ITEMS}
              label={`Imprimir todas (${TABLES_COUNT} mesas)`}
              brandColor={hexColor}
              brandName={brandName}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TABLE_ITEMS.map((item) => (
              <QRCard key={item.id} item={item} brandColor={hexColor} size={130} />
            ))}
          </div>
        </div>
      )}

      {/* REDES tab */}
      {tab === "redes" && (
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
              Usa estos QR en flyers, menus impresos, tarjetas de visita y publicaciones de redes sociales.
            </p>
            <PrintAllBtn items={SOCIAL_ITEMS} label="Imprimir todos" brandColor={hexColor} brandName={brandName} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {SOCIAL_ITEMS.map((item) => (
              <QRCard key={item.id} item={item} brandColor={hexColor} size={160} />
            ))}
          </div>
        </div>
      )}

      {/* KIT tab */}
      {tab === "imprimir" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dark card — summary */}
          <div className="rounded-2xl p-8 text-white flex flex-col gap-6" style={{ backgroundColor: "var(--brand-dark, var(--brand-primary))" }}>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase opacity-40 mb-2">
                Kit de Impresion
              </p>
              <h3 className="text-2xl font-bold">
                Todo listo para imprimir
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                `${TABLES_COUNT} QR de mesas — 3 por pagina`,
                `${SOCIAL_ITEMS.length} QR de redes sociales y flyers`,
                `Diseno con marca ${brandName} en cada tarjeta`,
                "Resolucion 2x — nitido en cualquier impresora",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-xs flex-shrink-0">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <PrintAllBtn items={TABLE_ITEMS} label={`Mesas (${TABLES_COUNT})`} brandColor={hexColor} brandName={brandName} />
              <PrintAllBtn items={SOCIAL_ITEMS} label="Redes & Flyers" brandColor={hexColor} brandName={brandName} />
            </div>
          </div>

          {/* Instructions */}
          <DashboardCard title="Como implementarlos" icon="📖">
            <ol className="space-y-5">
              {[
                { n: "01", t: "Descarga o imprime", d: 'Clic en "Print" en cualquier QR, o usa los botones de Kit para imprimir en lote.' },
                { n: "02", t: "Coloca en la mesa", d: "Usa un soporte de acrilico, porta-menu o lamina el QR y pegalo en la mesa o pared." },
                { n: "03", t: "Cliente escanea", d: "Abre la camara del movil, apunta al QR y el menu se abre al instante. Sin app necesaria." },
                { n: "04", t: "Orden y pago", d: "Desde el menu digital puede agregar platos al carrito y confirmar la orden facilmente." },
              ].map((s) => (
                <li key={s.n} className="flex gap-3 items-start">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 text-white"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">{s.t}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
