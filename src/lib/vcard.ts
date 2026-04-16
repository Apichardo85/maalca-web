/**
 * vCard 3.0 generator + descarga (client-side).
 * Compatible con iOS Contacts, Google Contacts, Outlook, Android.
 */

import type { AffiliateConfig } from "@/config/affiliates-config";

/** Escapa valores para vCard 3.0 (comas, puntos y coma, newlines). */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Construye un string vCard 3.0 a partir del config del afiliado.
 * Solo incluye campos presentes en `config.contact`.
 */
export function buildVCard(config: AffiliateConfig): string {
  const { branding, contact } = config;
  const c = contact ?? {};
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${escapeVCardValue(branding.name)}`);
  lines.push(`ORG:${escapeVCardValue(branding.name)}`);

  if (c.phone) lines.push(`TEL;TYPE=CELL,VOICE:${c.phone}`);
  if (c.whatsapp && c.whatsapp !== c.phone) {
    lines.push(`TEL;TYPE=MSG:${c.whatsapp}`);
  }
  if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(c.email)}`);
  if (c.website) lines.push(`URL:${escapeVCardValue(c.website)}`);
  if (c.address) {
    // ADR;TYPE=WORK:po-box;ext;street;locality;region;postal;country
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(c.address)};;;;`);
  }

  // Redes → URLs adicionales
  const socialUrls: string[] = [];
  if (c.social?.instagram) socialUrls.push(`https://instagram.com/${c.social.instagram}`);
  if (c.social?.facebook)  socialUrls.push(`https://facebook.com/${c.social.facebook}`);
  if (c.social?.tiktok)    socialUrls.push(`https://tiktok.com/@${c.social.tiktok}`);
  if (c.social?.twitter)   socialUrls.push(`https://twitter.com/${c.social.twitter}`);
  socialUrls.forEach((u) => lines.push(`URL:${escapeVCardValue(u)}`));

  if (branding.description) {
    lines.push(`NOTE:${escapeVCardValue(branding.description)}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** Descarga el vCard como archivo `.vcf`. Solo client-side. */
export function downloadVCard(config: AffiliateConfig): void {
  if (typeof window === "undefined") return;
  const vcard = buildVCard(config);
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.id}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
