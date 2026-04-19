/**
 * Configuración multi-tenant para afiliados del ecosistema MaalCa
 *
 * Cada afiliado tiene su configuración de:
 * - BusinessType (vertical de negocio — determina terminología por defecto)
 * - Branding (colores, logo, nombre)
 * - Módulos habilitados (metrics, campaigns, customers, etc.)
 * - Terminology (override de labels por afiliado)
 * - Features (multilenguaje, dark mode, notificaciones)
 */

// ─── Business types ──────────────────────────────────────────────────────────

export type BusinessType = 'barbershop' | 'restaurant' | 'beauty' | 'retail' | 'health' | 'media';

export type ModuleKey = keyof AffiliateConfig['modules'];

export type ModuleTerminology = Partial<Record<ModuleKey, string>>;

// ─── Commercial plans (ver /servicios) ──────────────────────────────────────

export type Plan = 'starter' | 'growth' | 'pro' | 'enterprise';

export interface PlanMeta {
  label: string;
  priceMonthly: number | null; // null = custom / enterprise
  setupFee: number | null;
  tier: number;                // 1..4 — util para comparar
  color: string;               // tailwind-ish hint para badges
}

export const PLAN_META: Record<Plan, PlanMeta> = {
  starter:    { label: 'Starter',    priceMonthly: 125,  setupFee: 250,  tier: 1, color: 'gray'   },
  growth:     { label: 'Growth',     priceMonthly: 350,  setupFee: 600,  tier: 2, color: 'blue'   },
  pro:        { label: 'Pro',        priceMonthly: 750,  setupFee: 2500, tier: 3, color: 'purple' },
  enterprise: { label: 'Enterprise', priceMonthly: null, setupFee: null, tier: 4, color: 'amber'  },
};

/**
 * Módulos incluidos en cada plan (cumulativo: cada tier hereda el anterior).
 * - Starter: presencia + menu/catalogo limitado + QR + analytics básicos + CRM lite
 * - Growth:  + reservas/pedidos, inventario, automatizaciones, Stripe, multi-user
 * - Pro:     + multi-sede, BI, IA, ERP
 * - Enterprise: todo + custom
 */
export const PLAN_MODULES: Record<Plan, ModuleKey[]> = {
  starter:    ['metrics', 'menu', 'qrCodes', 'customers'],
  growth:     [
    'metrics', 'menu', 'qrCodes', 'customers',
    'orders', 'appointments', 'inventory', 'invoicing',
    'campaigns', 'team', 'giftcards', 'ecommerce',
  ],
  pro:        [
    'metrics', 'menu', 'qrCodes', 'customers',
    'orders', 'appointments', 'inventory', 'invoicing',
    'campaigns', 'team', 'giftcards', 'ecommerce',
    'reports', 'salon', 'queue',
  ],
  enterprise: [
    'metrics', 'campaigns', 'customers', 'ecommerce', 'appointments',
    'inventory', 'invoicing', 'team', 'queue', 'salon',
    'giftcards', 'reports', 'menu', 'orders', 'qrCodes',
  ],
};

/**
 * Límites cuantitativos por plan — se aplican dentro de cada módulo.
 * `null` = sin límite.
 */
export interface PlanLimits {
  maxMenuItems: number | null;
  maxUsers: number | null;
  maxLocations: number | null;
  aiAgents: boolean;
  advancedAutomations: boolean;
  erpIntegrations: boolean;
  prioritySupportHours: number | null; // SLA en horas (null = sin SLA)
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter:    { maxMenuItems: 30,   maxUsers: 1,    maxLocations: 1,    aiAgents: false, advancedAutomations: false, erpIntegrations: false, prioritySupportHours: 48 },
  growth:     { maxMenuItems: null, maxUsers: 5,    maxLocations: 1,    aiAgents: false, advancedAutomations: true,  erpIntegrations: false, prioritySupportHours: 24 },
  pro:        { maxMenuItems: null, maxUsers: null, maxLocations: null, aiAgents: true,  advancedAutomations: true,  erpIntegrations: true,  prioritySupportHours: 4  },
  enterprise: { maxMenuItems: null, maxUsers: null, maxLocations: null, aiAgents: true,  advancedAutomations: true,  erpIntegrations: true,  prioritySupportHours: 2  },
};

/** ¿Un módulo está incluido en el plan? */
export function isModuleInPlan(plan: Plan, module: ModuleKey): boolean {
  return PLAN_MODULES[plan].includes(module);
}

/** Mínimo plan requerido para un módulo (para badges "Requiere Growth/Pro"). */
export function getMinPlanForModule(module: ModuleKey): Plan {
  const order: Plan[] = ['starter', 'growth', 'pro', 'enterprise'];
  for (const p of order) {
    if (PLAN_MODULES[p].includes(module)) return p;
  }
  return 'enterprise';
}

// ─── Contact & hours (tarjeta de negocios + menu por periodo) ───────────────

import type { MealPeriod } from "@/lib/types/catalog.types";

/**
 * Información de contacto pública del afiliado — usada en:
 * - Tarjeta de negocios (física y digital)
 * - vCard descargable
 * - Links accionables (tel:, mailto:, wa.me, maps)
 */
export interface AffiliateContact {
  phone?: string;           // E.164 (ej. "+16078574226")
  phoneDisplay?: string;    // Formato humano (ej. "(607) 857-4226")
  whatsapp?: string;        // E.164 para wa.me
  email?: string;
  address?: string;         // Una línea
  mapsUrl?: string;         // maps.app.goo.gl o Google Maps URL
  website?: string;         // Fallback cuando no hay menu público
  social?: {
    instagram?: string;     // handle SIN @
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
}

/** Rango horario "HH:mm" 24h. `end < start` significa que cruza medianoche. */
export interface MealPeriodHours {
  start: string;
  end: string;
}

/**
 * Horarios por periodo del día del afiliado (solo aplica a businessType === 'restaurant').
 * `all_day` se infiere cuando un item no tiene periodo o lo tiene marcado explícitamente.
 */
export type AffiliateMealPeriodHours = Partial<
  Record<Exclude<MealPeriod, "all_day">, MealPeriodHours>
>;

// ─── Module navigation config (canonical labels, icons, paths) ───────────────

export const MODULE_NAV_CONFIG: Record<
  string,
  { label: string; icon: string; path: string; desc: string }
> = {
  metrics:      { label: 'Analytics',     icon: '📈', path: 'metrics',      desc: 'Dashboard de análisis y KPIs' },
  campaigns:    { label: 'Campañas',      icon: '📢', path: 'campaigns',    desc: 'Marketing y comunicaciones' },
  customers:    { label: 'Clientes',      icon: '👥', path: 'customers',    desc: 'CRM y gestión de clientes' },
  ecommerce:    { label: 'Tienda',        icon: '🛍️', path: 'store',        desc: 'Productos y ventas en línea' },
  appointments: { label: 'Citas',         icon: '📅', path: 'appointments', desc: 'Sistema de reservaciones' },
  inventory:    { label: 'Inventario',    icon: '📦', path: 'inventory',    desc: 'Control de stock y materiales' },
  invoicing:    { label: 'Facturación',   icon: '💰', path: 'invoicing',    desc: 'Facturas y pagos' },
  team:         { label: 'Equipo',        icon: '👨‍💼', path: 'team',         desc: 'Gestión de personal' },
  queue:        { label: 'Fila Virtual',  icon: '⏳', path: 'queue',        desc: 'Sistema de turno digital' },
  salon:        { label: 'Salón Virtual', icon: '💈', path: 'salon',        desc: 'Vista en tiempo real del salón' },
  giftcards:    { label: 'Gift Cards',    icon: '💳', path: 'giftcards',    desc: 'Tarjetas de regalo' },
  reports:      { label: 'Reportes',      icon: '📊', path: 'reports',      desc: 'Análisis avanzado e informes' },
  menu:         { label: 'Menú',          icon: '🍽️', path: 'menu',         desc: 'Gestión del menú' },
  orders:       { label: 'Órdenes',       icon: '📋', path: 'orders',       desc: 'Monitor de órdenes en vivo' },
  qrCodes:      { label: 'QR Codes',      icon: '📱', path: 'qr',           desc: 'Generador de códigos QR' },
};

// ─── Default terminology per business type ──────────────────────────────────

export const DEFAULT_TERMINOLOGY: Record<BusinessType, ModuleTerminology> = {
  barbershop: { appointments: 'Citas', queue: 'Fila Virtual', salon: 'Salón Virtual' },
  restaurant: { customers: 'Comensales', menu: 'Carta', orders: 'Comandas', inventory: 'Ingredientes' },
  beauty:     { customers: 'Clientas', queue: 'Turno Digital', salon: 'Estaciones', appointments: 'Reservas' },
  retail:     { ecommerce: 'Catálogo', inventory: 'Stock' },
  health:     { customers: 'Pacientes', appointments: 'Consultas', queue: 'Sala de Espera' },
  media:      { customers: 'Audiencia', ecommerce: 'Merch', campaigns: 'Contenido', team: 'Crew' },
};

// ─── Sidebar navigation groups ──────────────────────────────────────────────

export type NavGroupId = 'operations' | 'commerce' | 'clients' | 'growth';

export interface NavGroup {
  id: NavGroupId;
  label: string;
  modules: ModuleKey[];
}

export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    id: 'operations',
    label: 'OPERACIONES',
    modules: ['metrics', 'queue', 'orders'],
  },
  {
    id: 'commerce',
    label: 'COMERCIO',
    modules: ['menu', 'ecommerce', 'inventory', 'invoicing', 'giftcards'],
  },
  {
    id: 'clients',
    label: 'CLIENTES & AGENDA',
    modules: ['customers', 'appointments'],
  },
  {
    id: 'growth',
    label: 'CRECIMIENTO',
    modules: ['campaigns', 'qrCodes', 'team'],
  },
];

// ─── Config interface ───────────────────────────────────────────────────────

/**
 * Paleta extendida opcional del afiliado. Cuando está definida, el sistema
 * de branding usa estos tokens en vez de derivar colores del `primaryColor` string.
 * Pensada para afiliados con identidad visual completa (ej. TLD).
 */
export interface AffiliatePalette {
  /** Navy profundo — fondos hero, bloques oscuros */
  navyDeep?: string;
  /** Navy principal — headers, bloques oscuros */
  navy?: string;
  /** Rojo de bandera / acento cálido */
  red?: string;
  /** Azul bandera / secundario */
  blue?: string;
  /** Dorado — precios, acentos, stars */
  gold?: string;
  /** Crema / arena — fondos suaves de contenido */
  cream?: string;
  /** Verde accent (NO confundir con WhatsApp; aquí es para plátano/limón) */
  accent?: string;
  /** Tagline cálido para copy (ej. "Sabor de casa. Lejos de casa.") */
  tagline?: string;
}

export interface AffiliateConfig {
  id: string;
  businessType: BusinessType;
  /** Plan comercial contratado — determina qué módulos y límites aplica. Default: 'growth'. */
  plan?: Plan;
  /** Si está en false, el afiliado queda oculto: getAffiliateConfig devuelve null y las rutas dan 404. Default: true. */
  active?: boolean;
  terminology: ModuleTerminology;
  branding: {
    primaryColor: string;      // Tailwind color class (e.g., "red-600", "blue-600")
    secondaryColor: string;    // Color secundario
    logo: string;              // Path al logo
    name: string;              // Nombre para mostrar
    description: string;       // Descripción del negocio
    /** Paleta extendida opcional — si está presente, sobreescribe primaryColor para componentes que la soportan. */
    palette?: AffiliatePalette;
  };
  modules: {
    metrics: boolean;          // Dashboard de métricas y analytics
    campaigns: boolean;        // Gestión de campañas de marketing
    customers: boolean;        // CRM - Gestión de clientes
    ecommerce: boolean;        // Tienda online / productos
    appointments: boolean;     // Sistema de citas (salud, barbería, etc.)
    inventory: boolean;        // Control de inventario
    invoicing: boolean;        // Facturación
    team: boolean;             // Gestión de equipo
    queue: boolean;            // Fila virtual (barbería, clínicas)
    salon: boolean;            // Vista de salón/sillas en tiempo real
    giftcards: boolean;        // Sistema de gift cards
    reports: boolean;          // Reportes y análisis
    menu: boolean;             // Menu management (restaurantes)
    orders: boolean;           // Monitor de órdenes en vivo
    qrCodes: boolean;          // Generador de códigos QR
  };
  features: {
    multiLanguage: boolean;    // Soporte multi-idioma
    darkMode: boolean;         // Toggle de dark mode
    notifications: boolean;    // Sistema de notificaciones
    analytics: boolean;        // Analytics avanzado
  };
  settings: {
    currency: string;          // Moneda (USD, DOP, etc.)
    timezone: string;          // Zona horaria
    dateFormat: string;        // Formato de fecha
  };
  /** Contacto público (tarjeta de negocios, vCard). Opcional por afiliado. */
  contact?: AffiliateContact;
  /** Horarios por periodo — solo afiliados con businessType 'restaurant'. */
  mealPeriodHours?: AffiliateMealPeriodHours;
}

/**
 * Configuración de afiliados
 * Cada key es el affiliateId que se usa en las rutas /dashboard/[affiliateId]
 */
export const affiliatesConfig: Record<string, AffiliateConfig> = {
  "pegote-barbershop": {
    id: "pegote-barbershop",
    businessType: "barbershop",
    plan: "starter",
    terminology: {},
    branding: {
      primaryColor: "blue-600",
      secondaryColor: "blue-400",
      logo: "/images/affiliates/pegote-logo.png",
      name: "Pegote Barbershop",
      description: "Barbería dominicana en Elmira, NY"
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,
      ecommerce: true,          // Productos de barbería
      appointments: true,       // Sistema de citas
      inventory: true,          // Stock de productos
      invoicing: true,
      team: true,
      queue: true,              // Fila virtual
      salon: true,              // Vista de salón
      giftcards: true,          // Gift cards
      reports: true,            // Reportes y análisis
      menu: false,
      orders: false,
      qrCodes: false
    },
    features: {
      multiLanguage: true,      // ES/EN
      darkMode: true,
      notifications: true,
      analytics: true
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  },

  "britocolor": {
    id: "britocolor",
    businessType: "retail",
    plan: "growth",
    active: false,
    terminology: { ecommerce: "Servicios", inventory: "Materiales" },
    branding: {
      primaryColor: "orange-600",
      secondaryColor: "orange-400",
      logo: "/images/affiliates/britocolor-logo.png",
      name: "BritoColor",
      description: "Comunicación visual, impresión y pintura artesanal"
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,
      ecommerce: true,          // Venta de servicios y productos
      appointments: false,      // No necesita citas
      inventory: true,          // Control de materiales
      invoicing: true,
      team: true,
      queue: false,             // No aplica
      salon: false,             // No aplica
      giftcards: false,         // No habilitado aún
      reports: false,
      menu: false,
      orders: false,
      qrCodes: false
    },
    features: {
      multiLanguage: false,     // Solo español
      darkMode: true,
      notifications: true,
      analytics: true
    },
    settings: {
      currency: "DOP",
      timezone: "America/Santo_Domingo",
      dateFormat: "DD/MM/YYYY"
    }
  },

  "masa-tina": {
    id: "masa-tina",
    businessType: "restaurant",
    plan: "pro",
    terminology: { appointments: "Reservas de Catering" },
    branding: {
      primaryColor: "green-600",
      secondaryColor: "green-400",
      logo: "/images/projects/masa-tina.svg",
      name: "Masa Tina",
      description: "Catering y cocina dominicana"
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,
      ecommerce: true,          // Menús y catering
      appointments: true,       // Reservas de catering
      inventory: true,          // Ingredientes
      invoicing: true,
      team: true,
      queue: false,             // No aplica
      salon: false,             // No aplica
      giftcards: true,          // Gift cards para catering
      reports: false,
      menu: true,               // Menú de catering
      orders: true,             // Órdenes de catering
      qrCodes: false
    },
    features: {
      multiLanguage: true,
      darkMode: true,
      notifications: true,
      analytics: true
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  },

  "dr-pichardo": {
    id: "dr-pichardo",
    businessType: "health",
    plan: "growth",
    terminology: { invoicing: "Donaciones" },
    branding: {
      primaryColor: "blue-600",
      secondaryColor: "green-500",
      logo: "/images/affiliates/dr-pichardo-logo.png",
      name: "Dr. Pichardo",
      description: "Medicina interna y atención solidaria"
    },
    modules: {
      metrics: true,
      campaigns: false,         // No hace marketing
      customers: true,          // Base de pacientes
      ecommerce: false,         // No vende productos
      appointments: true,       // Sistema de citas médicas
      inventory: false,         // No maneja inventario
      invoicing: true,          // Facturación por donaciones
      team: false,              // Práctica individual
      queue: true,              // Fila virtual para consultas
      salon: false,             // No aplica
      giftcards: false,         // No aplica
      reports: false,
      menu: false,
      orders: false,
      qrCodes: false
    },
    features: {
      multiLanguage: true,
      darkMode: true,
      notifications: true,
      analytics: false          // Privacy médico
    },
    settings: {
      currency: "DOP",
      timezone: "America/Santo_Domingo",
      dateFormat: "DD/MM/YYYY"
    }
  },

  "the-little-dominican": {
    id: "the-little-dominican",
    businessType: "restaurant",
    plan: "growth", // menu + orders + inventory + QR + invoicing — todo incluido en Growth
    terminology: {},
    contact: {
      phone: "+16078574226",
      phoneDisplay: "(607) 857-4226",
      whatsapp: "+16078574226",
      website: "https://maalca.com/the-little-dominican",
      social: {
        instagram: "thelittledominican",
      },
    },
    mealPeriodHours: {
      breakfast:  { start: "07:00", end: "11:00" },
      lunch:      { start: "11:00", end: "16:00" },
      dinner:     { start: "17:00", end: "22:00" },
      late_night: { start: "22:00", end: "02:00" },
    },
    branding: {
      primaryColor: "red-600",
      secondaryColor: "orange-400",
      logo: "/images/affiliates/tld/Logo.png",
      name: "The Little Dominican",
      description: "Cocina dominicana auténtica en Elmira, NY",
      palette: {
        navyDeep: "#00193C",
        navy:     "#002D62",
        red:      "#CE1126",
        blue:     "#0038A8",
        gold:     "#F4B400",
        cream:    "#F5E6D0",
        accent:   "#3A7D44",
        tagline:  "Sabor de casa. Lejos de casa.",
      },
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,
      ecommerce: false,
      appointments: false,
      inventory: true,          // Control de ingredientes
      invoicing: true,          // Facturación
      team: false,
      queue: false,
      salon: false,
      giftcards: true,          // Gift cards
      reports: false,
      menu: true,               // Menu management
      orders: true,             // Monitor de órdenes
      qrCodes: true             // QR codes para mesas
    },
    features: {
      multiLanguage: true,
      darkMode: true,
      notifications: true,
      analytics: false
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  },

  "hablando-mierda": {
    active: false,
    id: "hablando-mierda",
    businessType: "media",
    plan: "growth",
    terminology: { inventory: "Merch Inventory" },
    branding: {
      primaryColor: "purple-600",
      secondaryColor: "pink-500",
      logo: "/images/projects/hablando-mierda.svg",
      name: "Hablando Mierda (HBM)",
      description: "Podcast y contenido digital"
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,          // Audiencia
      ecommerce: true,          // Merch
      appointments: false,
      inventory: true,          // Merch inventory
      invoicing: false,
      team: true,               // Equipo de producción
      queue: false,             // No aplica
      salon: false,             // No aplica
      giftcards: false,         // No habilitado aún
      reports: false,
      menu: false,
      orders: false,
      qrCodes: false
    },
    features: {
      multiLanguage: false,
      darkMode: true,
      notifications: true,
      analytics: true           // Analytics de contenido
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  }
};

/**
 * Obtiene la configuración de un afiliado por su ID
 */
export function getAffiliateConfig(affiliateId: string): AffiliateConfig | null {
  const cfg = affiliatesConfig[affiliateId];
  if (!cfg) return null;
  if (cfg.active === false) return null;
  return cfg;
}

/**
 * Verifica si un afiliado tiene un módulo habilitado
 */
export function affiliateHasModule(
  affiliateId: string,
  module: keyof AffiliateConfig['modules']
): boolean {
  const config = getAffiliateConfig(affiliateId);
  return config?.modules[module] ?? false;
}

/**
 * Obtiene todos los afiliados con dashboard habilitado
 */
export function getAffiliatesWithDashboard(): AffiliateConfig[] {
  return Object.values(affiliatesConfig);
}

/**
 * Obtiene el color primario de un afiliado
 */
export function getAffiliatePrimaryColor(affiliateId: string): string {
  return getAffiliateConfig(affiliateId)?.branding.primaryColor ?? "red-600";
}

/**
 * Obtiene el label de un módulo para un afiliado específico
 * Orden de precedencia:
 *   1. terminology override del afiliado
 *   2. DEFAULT_TERMINOLOGY del businessType
 *   3. MODULE_NAV_CONFIG canonical label
 *   4. module key como fallback
 */
export function getModuleLabel(config: AffiliateConfig, module: ModuleKey): string {
  return (
    config.terminology[module] ??
    DEFAULT_TERMINOLOGY[config.businessType]?.[module] ??
    MODULE_NAV_CONFIG[module]?.label ??
    module
  );
}

/**
 * Verifica si un afiliado tiene el área de Analytics (metrics OR reports)
 * metrics y reports están fusionados en una sola vista tabulada
 */
export function affiliateHasAnalytics(config: AffiliateConfig): boolean {
  return config.modules.metrics || config.modules.reports;
}

/**
 * Verifica si un afiliado tiene el área de Workspace (queue OR salon)
 * queue y salon están fusionados en una sola vista tabulada
 */
export function affiliateHasWorkspace(config: AffiliateConfig): boolean {
  return config.modules.queue || config.modules.salon;
}

// ─── Plan helpers ───────────────────────────────────────────────────────────

/** Plan del afiliado con fallback a 'growth' si no está definido. */
export function getAffiliatePlan(config: AffiliateConfig | null | undefined): Plan {
  return config?.plan ?? 'growth';
}

/** Límites cuantitativos del afiliado según su plan. */
export function getAffiliateLimits(config: AffiliateConfig | null | undefined): PlanLimits {
  return PLAN_LIMITS[getAffiliatePlan(config)];
}

/**
 * ¿Puede el afiliado acceder a este módulo?
 * Requiere BOTH: módulo habilitado en la config AND módulo incluido en el plan.
 */
export function affiliateCanUseModule(
  config: AffiliateConfig | null | undefined,
  module: ModuleKey
): boolean {
  if (!config) return false;
  if (!config.modules[module]) return false;
  return isModuleInPlan(getAffiliatePlan(config), module);
}
