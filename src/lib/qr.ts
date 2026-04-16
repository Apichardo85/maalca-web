/**
 * Helpers para generación de códigos QR (client-safe).
 * Centraliza opciones por defecto para que toda la app renderice QRs consistentes.
 */

import QRCode from "qrcode";

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
