// src/components/public/SocialIcons.tsx
// Brand SVG icons for Facebook/Instagram/TikTok, keyed by the same `tipo`
// string resolveSocialLinks() returns. Extracted out of PublicFooter.tsx so
// PreviewPanel.tsx (the Diseñar mi Espacio live preview) can render the same
// social section instead of silently omitting it — that gap (PreviewPanel
// never calling resolveSocialLinks() at all) was found in QA on a real
// business with an active Facebook canal.
import type { ComponentType } from 'react';

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.5 1.5-1.5H16V4.14C15.72 4.1 14.94 4 14 4c-2.06 0-3.5 1.26-3.5 3.5V10.5H8v3h2.5V21h3Z" />
    </svg>
  );
}

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.9v2.8a6.6 6.6 0 0 1-3.5-1.2v6.6a5.6 5.6 0 1 1-5.6-5.6c.2 0 .4 0 .6.03v2.9a2.7 2.7 0 1 0 1.9 2.6V3h3.1Z" />
    </svg>
  );
}

export const SOCIAL_ICON_BY_TIPO: Record<string, ComponentType<{ size: number }>> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
};
