export interface PublicCanal {
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
    items.push({ icon: '📱', label: 'WhatsApp', value: waCanal.nombreVisible ?? waCanal.valorCrudo, href: waCanal.enlaceGenerado });
  } else if (business.whatsapp) {
    items.push({ icon: '📱', label: 'WhatsApp', value: business.whatsapp, href: `https://wa.me/${business.whatsapp.replace(/\D/g, '')}` });
  }

  const phoneCanal = canales.find((c) => c.tipo === 'Telefono');
  if (phoneCanal) {
    items.push({ icon: '📞', label: 'Teléfono', value: phoneCanal.nombreVisible ?? phoneCanal.valorCrudo, href: phoneCanal.enlaceGenerado });
  }

  if (business.address) {
    items.push({
      icon: '📍',
      label: 'Dirección',
      value: business.address,
      href: `https://maps.google.com?q=${encodeURIComponent(business.address)}`,
    });
  }

  const emailCanal = canales.find((c) => c.tipo === 'Email');
  if (emailCanal) {
    items.push({ icon: '✉️', label: 'Email', value: emailCanal.nombreVisible ?? emailCanal.valorCrudo, href: emailCanal.enlaceGenerado });
  } else if (business.contactEmail) {
    items.push({ icon: '✉️', label: 'Email', value: business.contactEmail, href: `mailto:${business.contactEmail}` });
  }

  return items;
}
