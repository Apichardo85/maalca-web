/**
 * Precios del SaaS (MaalCa Plataforma).
 * Cambiar SOLO aquí — todos los componentes importan estas constantes.
 */

// Planes mensuales (USD)
export const PRICE_FREE = 0;
export const PRICE_ENTREPRENEUR = 38;
export const PRICE_PROFESSIONAL = 95;
export const PRICE_PREMIUM = 195;

// Anuales (2 meses gratis) y cargos de la suscripción — respaldo si Stripe no responde; los
// precios reales salen de /billing/summary (lookup_keys maalca_* en Stripe).
export const PRICE_ENTREPRENEUR_YEARLY = 380;
export const PRICE_PROFESSIONAL_YEARLY = 950;
export const SETUP_FEE = 150;
// Pantallas de TV: se cobran SIEMPRE aparte, ningún plan las incluye (2026-11-24). Precio por
// pantalla, escalonado: 1.ª $39 · 2.ª $15 · desde la 3.ª $10 al mes (anual: $390 · $150 · $100).
export const SCREEN_FIRST_MONTHLY = 39;
export const SCREEN_SECOND_MONTHLY = 15;
export const SCREEN_MORE_MONTHLY = 10;
export const SCREEN_FIRST_YEARLY = 390;
export const SCREEN_SECOND_YEARLY = 150;
export const SCREEN_MORE_YEARLY = 100;

// Add-ons mensuales (USD)
export const ADDON_SOCIAL_POSTS = 75;
export const ADDON_AI_AGENT = 150;
export const ADDON_SUPPORT_247 = 200;
export const ADDON_CUSTOM_INTEGRATION = 400;

// Descuento anual (porcentaje en decimal)
export const ANNUAL_DISCOUNT = 0.17;

/**
 * Precios de Editorial MaalCa — re-exportados aquí para un único punto de verdad.
 */
export const EDITORIAL_ASSISTED_PRICE_USD = 185;
export const EDITORIAL_ASSISTED_PRICE_DISPLAY = `$${EDITORIAL_ASSISTED_PRICE_USD} USD`;
