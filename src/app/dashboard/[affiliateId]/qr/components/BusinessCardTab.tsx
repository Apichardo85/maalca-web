"use client";

/**
 * Tab "Tarjeta de Negocios" del módulo QR (dashboard).
 *
 * Preview en vivo del front + back de la tarjeta imprimible,
 * con acciones: descargar PNG (html-to-image), copiar link digital, descargar vCard.
 *
 * Gated a afiliados en el set del padre — aquí solo renderiza si ya se incluye.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { AffiliateBusinessCard } from "@/components/affiliate/AffiliateBusinessCard";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadVCard } from "@/lib/vcard";
import { getBrandColors } from "@/lib/affiliate-branding";

/**
 * Wrapper que escala proporcionalmente un contenido de tamaño fijo
 * (ej: 1050x600 tarjeta print) al ancho disponible del contenedor.
 * Usa ResizeObserver para recomputar scale en resize y rotate.
 */
function ScaledCardPreview({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const avail = el.clientWidth;
      if (avail > 0) setScale(Math.min(1, avail / width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapRef}
      className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 sm:p-6 overflow-hidden"
    >
      <div
        style={{
          width: "100%",
          height: height * scale,
          position: "relative",
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function BusinessCardTab() {
  const { config, brandName } = useAffiliate();
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState<"png-front" | "png-back" | "png-both" | null>(null);
  const [copied, setCopied] = useState(false);

  const colors = config ? getBrandColors(config.branding.primaryColor) : null;
  const digitalUrl = config ? `https://maalca.com/tarjeta/${config.id}` : "";
  // QR en la tarjeta impresa apunta a website si existe, sino a la versión digital
  const cardQrUrl = config?.contact?.website ?? digitalUrl;

  useEffect(() => {
    if (!colors) return;
    generateQrDataUrl(cardQrUrl, { darkColor: colors.dark, width: 512 }).then(setQrDataUrl);
  }, [cardQrUrl, colors]);

  if (!config || !colors) return null;

  const downloadPng = async (which: "front" | "back") => {
    setLoading(which === "front" ? "png-front" : "png-back");
    try {
      const { toPng } = await import("html-to-image");
      const node = (which === "front" ? frontRef : backRef).current;
      if (!node) return;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `tarjeta-${config.id}-${which}.png`;
      a.click();
    } catch (err) {
      console.error("Error generando PNG:", err);
      alert("Hubo un error al generar la imagen. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  };

  const copyDigitalLink = async () => {
    await navigator.clipboard.writeText(digitalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Intro + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--brand-primary)" }}
          >
            Tarjeta de Negocios
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Diseño imprimible + digital compartible
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Descarga la tarjeta lista para imprimir (3.5&quot;×2&quot; @ 300dpi), o comparte
            el link digital — incluye QR con tu marca {brandName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyDigitalLink}
            className="px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            {copied ? "✓ Copiado" : "🔗 Copiar link digital"}
          </button>
          <button
            onClick={() => downloadVCard(config)}
            className="px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
            }}
          >
            📥 Descargar vCard (.vcf)
          </button>
        </div>
      </div>

      {/* Preview grid — front + back (responsive scale to container) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Anverso
            </p>
            <button
              onClick={() => downloadPng("front")}
              disabled={loading !== null}
              className="px-3 sm:px-4 py-1.5 rounded-full text-white text-xs font-bold transition-opacity disabled:opacity-60"
              style={{ background: "var(--brand-primary)" }}
            >
              {loading === "png-front" ? "Generando..." : "⬇️ PNG imprimible"}
            </button>
          </div>
          <ScaledCardPreview width={1050} height={600}>
            <div ref={frontRef}>
              <AffiliateBusinessCard config={config} variant="front" />
            </div>
          </ScaledCardPreview>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Reverso (con QR)
            </p>
            <button
              onClick={() => downloadPng("back")}
              disabled={loading !== null}
              className="px-3 sm:px-4 py-1.5 rounded-full text-white text-xs font-bold transition-opacity disabled:opacity-60"
              style={{ background: "var(--brand-primary)" }}
            >
              {loading === "png-back" ? "Generando..." : "⬇️ PNG imprimible"}
            </button>
          </div>
          <ScaledCardPreview width={1050} height={600}>
            <div ref={backRef}>
              <AffiliateBusinessCard
                config={config}
                qrDataUrl={qrDataUrl}
                qrUrl={cardQrUrl}
                variant="back"
              />
            </div>
          </ScaledCardPreview>
        </div>
      </div>

      {/* Digital preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
          Vista previa digital (mobile)
        </p>
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <AffiliateBusinessCard
              config={config}
              qrDataUrl={qrDataUrl}
              qrUrl={cardQrUrl}
              variant="digital"
            />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          URL pública:{" "}
          <a
            href={`/tarjeta/${config.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs underline"
            style={{ color: "var(--brand-primary)" }}
          >
            /tarjeta/{config.id}
          </a>
        </p>
      </div>

      {/* Spec card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "var(--brand-dark, var(--brand-primary))" }}
      >
        <p className="text-xs font-bold tracking-widest uppercase opacity-50 mb-2">
          Especificaciones
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="opacity-60 text-xs">Tamaño</p>
            <p className="font-bold">3.5&quot; × 2&quot;</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">Resolución</p>
            <p className="font-bold">1050 × 600 px</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">DPI</p>
            <p className="font-bold">300</p>
          </div>
          <div>
            <p className="opacity-60 text-xs">Formato</p>
            <p className="font-bold">PNG + vCard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
