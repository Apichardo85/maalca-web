// src/lib/marketing-paths.ts
// The only pages that get MaalCa's own corporate chrome (Header nav, Footer
// columns). Everything else — every dynamic business slug, dashboard,
// /space, /editorial, /ciriwhispers (those two ship their own header/footer
// via their own layout.tsx), every affiliate/client microsite — renders
// neither by default. Shared by Header.tsx and Footer.tsx so the two can't
// drift apart.
// /ecosistema is a permanent redirect to /casos (next.config.ts) — it never
// actually renders as its own pathname, so it isn't listed separately here.
export const MARKETING_PATHS = [
  "/",
  "/casos",
  "/casos-estudio",
  "/docs",
  "/servicios",
  "/contacto",
  "/privacidad",
  "/terminos",
];
