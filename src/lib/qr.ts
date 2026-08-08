/**
 * Helpers para generación de códigos QR (client-safe).
 * Centraliza opciones por defecto para que toda la app renderice QRs consistentes.
 */

import QRCode from "qrcode";

export async function generateQRPng(url: string, size = 512): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRDataURL(url: string, size = 256): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

export interface QrOptions {
  width?: number;
  margin?: number;
  darkColor?: string;    // hex, ej. "#DC2626"
  lightColor?: string;   // hex ARGB o hex, ej. "#FFFFFF" o "#FFFFFF00" para transparente
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Genera un data URL (`data:image/png;base64,...`) listo para usar en <img src=...>.
 * Defaults pensados para Business Card: H error correction, 512px, margin mínimo.
 */
export async function generateQrDataUrl(
  url: string,
  options: QrOptions = {},
): Promise<string> {
  const {
    width = 512,
    margin = 1,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = "H",
  } = options;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel,
    margin,
    width,
    color: { dark: darkColor, light: lightColor },
  });
}

/**
 * Genera un QR como SVG, envuelto en un data URL (`data:image/svg+xml,...`)
 * listo para `<a download>` o `<img src=...>`. Hermana de generateQrDataUrl
 * (PNG) — mismas opciones, mismos defaults.
 */
export async function generateQrSvgDataUrl(
  url: string,
  options: QrOptions = {},
): Promise<string> {
  const {
    margin = 1,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = "H",
  } = options;

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel,
    margin,
    color: { dark: darkColor, light: lightColor },
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export interface BrandedQrOptions extends QrOptions {
  /** Business logo — drawn centered on a white backing plate over the QR. errorCorrectionLevel
   *  defaults to "H" (30% tolerance) specifically so this occlusion stays scannable. */
  logoUrl?: string | null;
  /** Business name — drawn as a caption band below the QR so the exported PNG is a
   *  self-contained, printable piece (works pinned on a wall without any surrounding card). */
  caption?: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Branded, print-ready QR: base QR (from generateQrDataUrl) + business logo composited
 * center + business name as a caption band. Client-only (uses <canvas>) — on the server,
 * or when neither logoUrl nor caption is given, falls back to the plain QR data URL.
 */
export async function generateBrandedQrDataUrl(
  url: string,
  options: BrandedQrOptions = {},
): Promise<string> {
  const { width = 512, logoUrl, caption, ...qrOptions } = options;
  const plainQrDataUrl = await generateQrDataUrl(url, { width, ...qrOptions });

  if (typeof document === "undefined" || (!logoUrl && !caption)) {
    return plainQrDataUrl;
  }

  const lightColor = qrOptions.lightColor ?? "#FFFFFF";
  const darkColor = qrOptions.darkColor ?? "#000000";
  const captionHeight = caption ? Math.round(width * 0.16) : 0;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width + captionHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return plainQrDataUrl;

  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const qrImg = await loadImage(plainQrDataUrl);
  ctx.drawImage(qrImg, 0, 0, width, width);

  if (logoUrl) {
    try {
      const logoImg = await loadImage(logoUrl);
      const logoSize = Math.round(width * 0.2);
      const pad = Math.round(logoSize * 0.18);
      const plateSize = logoSize + pad * 2;
      const x = (width - plateSize) / 2;
      const y = (width - plateSize) / 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(x, y, plateSize, plateSize, 10);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect((width - logoSize) / 2, (width - logoSize) / 2, logoSize, logoSize, 6);
      ctx.clip();
      ctx.drawImage(logoImg, (width - logoSize) / 2, (width - logoSize) / 2, logoSize, logoSize);
      ctx.restore();
    } catch {
      // Logo failed to load (CORS, 404, etc.) — the QR itself is still valid without it.
    }
  }

  if (caption) {
    ctx.fillStyle = darkColor;
    ctx.font = `600 ${Math.round(width * 0.058)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(caption, width / 2, width + captionHeight / 2, width * 0.9);
  }

  return canvas.toDataURL("image/png");
}
