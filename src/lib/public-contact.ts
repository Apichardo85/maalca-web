export interface PublicCanal {
  id: string;
  tipo: string;
  valorCrudo: string;
  enlaceGenerado: string;
  nombreVisible: string | null;
  activo: boolean;
  orden: number;
}

export interface ResolvedContactItem {
  icon: string;
  label: string;
  value: string;
  href: string;
  tipo: string;
  canalId: string | null;
}

interface ContactSourceBusiness {
  whatsapp?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  canales?: PublicCanal[];
}

function activeSorted(canales: PublicCanal[] = []): PublicCanal[] {
  return canales.filter((c) => c.activo).sort((a, b) => a.orden - b.orden);
}

const INVISIBLE_FORMATTING_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

/**
 * Strips invisible bidi/zero-width formatting characters and collapses any run of
 * whitespace (including NBSP/narrow-NBSP often carried over from pasted phone numbers)
 * into a single normal space, then trims the edges. Purely cosmetic cleanup for what
 * gets displayed/persisted as the raw value — digit-extraction logic elsewhere already
 * strips all of this correctly and is untouched.
 */
export function sanitizeContactValue(value: string): string {
  return value
    .replace(INVISIBLE_FORMATTING_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Digits-only WhatsApp number for hero/cart CTA links. Prefers an active WhatsApp
 * canal (the new Diseñar mi Espacio editor); falls back to the legacy flat
 * `whatsapp` field so affiliates who never touched the Canales editor keep
 * their existing contact button.
 */
export function resolveWhatsAppDigits(business: ContactSourceBusiness): string | null {
  const waCanal = activeSorted(business.canales).find((c) => c.tipo === 'WhatsApp');
  const raw = waCanal?.valorCrudo ?? business.whatsapp ?? null;
  const digits = raw?.replace(/\D/g, '') ?? '';
  return digits || null;
}

/**
 * Full contact grid (WhatsApp / phone / address / email). Each channel type falls
 * back independently to its legacy flat field when no matching active canal
 * exists — Address has no Canal equivalent, so it always comes from the flat field.
 */
export function resolveContactItems(business: ContactSourceBusiness): ResolvedContactItem[] {
  const canales = activeSorted(business.canales);
  const items: ResolvedContactItem[] = [];

  const waCanal = canales.find((c) => c.tipo === 'WhatsApp');
  if (waCanal) {
    items.push({ icon: '📱', label: 'WhatsApp', value: waCanal.nombreVisible ?? waCanal.valorCrudo, href: waCanal.enlaceGenerado, tipo: 'WhatsApp', canalId: waCanal.id });
  } else if (business.whatsapp) {
    items.push({ icon: '📱', label: 'WhatsApp', value: business.whatsapp, href: `https://wa.me/${business.whatsapp.replace(/\D/g, '')}`, tipo: 'WhatsApp', canalId: null });
  }

  const phoneCanal = canales.find((c) => c.tipo === 'Telefono');
  if (phoneCanal) {
    items.push({ icon: '📞', label: 'Teléfono', value: phoneCanal.nombreVisible ?? phoneCanal.valorCrudo, href: phoneCanal.enlaceGenerado, tipo: 'Telefono', canalId: phoneCanal.id });
  }

  if (business.address) {
    items.push({
      icon: '📍',
      label: 'Dirección',
      value: business.address,
      href: `https://maps.google.com?q=${encodeURIComponent(business.address)}`,
      tipo: 'Direccion',
      canalId: null,
    });
  }

  const emailCanal = canales.find((c) => c.tipo === 'Email');
  if (emailCanal) {
    items.push({ icon: '✉️', label: 'Email', value: emailCanal.nombreVisible ?? emailCanal.valorCrudo, href: emailCanal.enlaceGenerado, tipo: 'Email', canalId: emailCanal.id });
  } else if (business.contactEmail) {
    items.push({ icon: '✉️', label: 'Email', value: business.contactEmail, href: `mailto:${business.contactEmail}`, tipo: 'Email', canalId: null });
  }

  return items;
}

export interface ResolvedSocialLink {
  tipo: string;
  href: string;
  canalId: string | null;
}

const SOCIAL_TIPOS = ['Facebook', 'Instagram', 'TikTok'];

/**
 * Active Facebook/Instagram/TikTok canales, in `orden`. These are link-based (no legacy
 * flat-field fallback exists for social profiles, unlike WhatsApp/phone/email).
 * Icon rendering (real brand SVGs, not emoji) lives in the consuming component —
 * see PublicFooter.tsx's SOCIAL_ICON_BY_TIPO.
 */
export function resolveSocialLinks(business: ContactSourceBusiness): ResolvedSocialLink[] {
  return activeSorted(business.canales)
    .filter((c) => SOCIAL_TIPOS.includes(c.tipo))
    .map((c) => ({ tipo: c.tipo, href: c.enlaceGenerado || c.valorCrudo, canalId: c.id }));
}
