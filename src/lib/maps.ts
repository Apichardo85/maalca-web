// src/lib/maps.ts
// Shared helper so a business address renders as a clickable Google Maps link
// across every public template (and the shared PublicFooter) instead of plain text.

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
