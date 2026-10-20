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
export const EXTRA_SCREEN_MONTHLY = 15;
export const EXTRA_SCREEN_YEARLY = 150;

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
