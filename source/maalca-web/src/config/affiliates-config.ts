/**
 * Configuración multi-tenant para afiliados del ecosistema MaalCa
 *
 * Cada afiliado tiene su configuración de:
 * - Branding (colores, logo, nombre)
 * - Módulos habilitados (metrics, campaigns, customers, etc.)
 * - Features (multilenguaje, dark mode, notificaciones)
 */

export interface AffiliateConfig {
  id: string;
  branding: {
    primaryColor: string;      // Tailwind color class (e.g., "red-600", "blue-600")
    secondaryColor: string;    // Color secundario
    logo: string;              // Path al logo
    name: string;              // Nombre para mostrar
    description: string;       // Descripción del negocio
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
}

/**
 * Configuración de afiliados
 * Cada key es el affiliateId que se usa en las rutas /dashboard/[affiliateId]
 */
export const affiliatesConfig: Record<string, AffiliateConfig> = {
  "pegote-barbershop": {
    id: "pegote-barbershop",
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
      reports: true             // Reportes y análisis
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
      giftcards: false          // No habilitado aún
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
      giftcards: true           // Gift cards para catering
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
      giftcards: false          // No aplica
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

  "hablando-mierda": {
    id: "hablando-mierda",
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
      giftcards: false          // No habilitado aún
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
  return affiliatesConfig[affiliateId] || null;
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
