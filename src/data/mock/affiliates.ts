import { Affiliate, AffiliateCategory, AffiliateStatus } from "@/lib/types";

export const affiliates: Affiliate[] = [
  {
    id: "mercado-central-premium",
    name: "Mercado Central Premium",
    description: "Proveedor exclusivo de ingredientes gourmet, mariscos frescos y productos premium para alta gastronomía. Especialistas en trazabilidad y calidad certificada.",
    category: "proveedor-ingredientes",
    status: "premium",
    logo: "/images/affiliates/mercado-central-logo.png",
    website: "https://mercadocentralpremium.cl",
    contact: {
      name: "Ricardo Valenzuela",
      email: "ricardo@mercadocentral.cl",
      phone: "+56 2 2633 8800",
      address: "Puente 465, Santiago Centro",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Mariscos ultra frescos",
      "Carnes premium importadas",
      "Vegetales orgánicos",
      "Especias internacionales",
      "Productos de temporada",
      "Delivery refrigerado"
    ],
    locations: ["Santiago Centro", "Maipú", "Las Condes"],
    partnership: {
      type: "supplier",
      since: new Date("2020-03-15"),
      contractType: "preferred",
      commissionRate: 8,
      minimumOrder: 500000,
      paymentTerms: "30 días",
      renewalDate: new Date("2025-03-15")
    },
    metrics: {
      projectsCompleted: 124,
      averageRating: 9.6,
      responseTime: 2,
      reliabilityScore: 98,
      costEfficiency: 92,
      lastProjectDate: new Date("2024-08-15")
    },
    certifications: ["HACCP", "ISO 22000", "Organic Chile", "MSC Certified"],
    socialMedia: {
      instagram: "@mercadocentralpremium",
      facebook: "MercadoCentralPremium",
      linkedin: "mercado-central-premium"
    }
  },
  {
    id: "flores-jardines-botanica",
    name: "Jardines Botánica Premium",
    description: "Especialistas en diseño floral y decoración botánica para eventos de lujo. Flores importadas, arreglos exclusivos y jardines verticales.",
    category: "floreria-plantas",
    status: "premium",
    logo: "/images/affiliates/botanica-logo.png",
    website: "https://jardinesbotanica.cl",
    contact: {
      name: "Esperanza Molina",
      email: "esperanza@jardinesbotanica.cl",
      phone: "+56 9 8765 4321",
      address: "Av. Kennedy 9001, Las Condes",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Diseño floral exclusivo",
      "Arreglos de mesa premium",
      "Jardines verticales",
      "Flores comestibles",
      "Decoración temática",
      "Mantenimiento post-evento"
    ],
    locations: ["Las Condes", "Vitacura", "Lo Barnechea", "Providencia"],
    partnership: {
      type: "vendor",
      since: new Date("2019-06-20"),
      contractType: "exclusive",
      commissionRate: 12,
      paymentTerms: "15 días",
      renewalDate: new Date("2025-06-20")
    },
    metrics: {
      projectsCompleted: 89,
      averageRating: 9.8,
      responseTime: 4,
      reliabilityScore: 96,
      costEfficiency: 88,
      lastProjectDate: new Date("2024-08-10")
    },
    certifications: ["Florist International", "Sustainable Flowers", "Organic Design"],
    socialMedia: {
      instagram: "@jardinesbotanica",
      facebook: "JardinesBotanicaChile",
      linkedin: "jardines-botanica-premium"
    }
  },
  {
    id: "vinos-casillero-dorado",
    name: "Casillero Dorado Premium",
    description: "Vinatería boutique especializada en vinos premium chilenos y maridajes exclusivos. Asesoría sommelier y catas privadas.",
    category: "vinos-bebidas",
    status: "preferred",
    logo: "/images/affiliates/casillero-dorado-logo.png",
    website: "https://casillero-dorado.cl",
    contact: {
      name: "Sebastián Undurraga",
      email: "sebastian@casillero-dorado.cl",
      phone: "+56 2 2845 7700",
      address: "Av. Vitacura 3568, Vitacura",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Vinos premium chilenos",
      "Importación de exclusivos",
      "Asesoría de maridajes",
      "Catas privadas",
      "Sommelier a domicilio",
      "Almacenamiento especializado"
    ],
    locations: ["Vitacura", "Valle de Maipo", "Valle de Casablanca"],
    partnership: {
      type: "supplier",
      since: new Date("2021-01-10"),
      contractType: "non-exclusive",
      commissionRate: 15,
      minimumOrder: 800000,
      paymentTerms: "45 días",
      renewalDate: new Date("2025-01-10")
    },
    metrics: {
      projectsCompleted: 67,
      averageRating: 9.4,
      responseTime: 6,
      reliabilityScore: 94,
      costEfficiency: 90,
      lastProjectDate: new Date("2024-08-05")
    },
    certifications: ["Wine & Spirit Education Trust", "Sommelier Chile", "ISO 9001"],
    socialMedia: {
      instagram: "@casillero_dorado",
      facebook: "CasilleroDoradoPremium",
      linkedin: "casillero-dorado-wine"
    }
  },
  {
    id: "mobiliario-eventos-elite",
    name: "Elite Event Furniture",
    description: "Mobiliario de lujo para eventos premium. Mesas, sillas, lounges y elementos decorativos de diseño exclusivo.",
    category: "mobiliario-eventos",
    status: "active",
    logo: "/images/affiliates/elite-furniture-logo.png",
    website: "https://eliteeventfurniture.cl",
    contact: {
      name: "Patricia Henríquez",
      email: "patricia@eliteeventfurniture.cl",
      phone: "+56 2 2234 5600",
      address: "Av. Marathon 1943, Ñuñoa",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Mobiliario de diseño",
      "Lounge areas VIP",
      "Barras móviles premium",
      "Iluminación ambiental",
      "Carpas y toldos",
      "Instalación completa"
    ],
    locations: ["Ñuñoa", "San Miguel", "Puente Alto"],
    partnership: {
      type: "vendor",
      since: new Date("2020-09-12"),
      contractType: "preferred",
      commissionRate: 10,
      paymentTerms: "30 días",
      renewalDate: new Date("2025-09-12")
    },
    metrics: {
      projectsCompleted: 156,
      averageRating: 9.1,
      responseTime: 8,
      reliabilityScore: 91,
      costEfficiency: 95,
      lastProjectDate: new Date("2024-08-12")
    },
    certifications: ["Event Industry Council", "Safety Standards Chile"],
    socialMedia: {
      instagram: "@elite_event_furniture",
      facebook: "EliteEventFurnitureChile"
    }
  },
  {
    id: "sonido-luces-premium",
    name: "Premium Audio Visual",
    description: "Tecnología audiovisual de última generación para eventos corporativos y sociales. Sonido profesional, iluminación LED y proyección 4K.",
    category: "tecnologia-eventos",
    status: "preferred",
    logo: "/images/affiliates/premium-av-logo.png",
    website: "https://premiumav.cl",
    contact: {
      name: "José Miguel Torres",
      email: "josemiguel@premiumav.cl",
      phone: "+56 2 2789 4500",
      address: "Las Hualtatas 5936, Vitacura",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Sonido profesional",
      "Iluminación LED",
      "Proyección 4K/8K",
      "Streaming en vivo",
      "DJ profesional",
      "Operación técnica"
    ],
    locations: ["Vitacura", "Las Condes", "Providencia"],
    partnership: {
      type: "vendor",
      since: new Date("2019-11-30"),
      contractType: "preferred",
      commissionRate: 8,
      paymentTerms: "30 días",
      renewalDate: new Date("2025-11-30")
    },
    metrics: {
      projectsCompleted: 203,
      averageRating: 9.3,
      responseTime: 3,
      reliabilityScore: 97,
      costEfficiency: 89,
      lastProjectDate: new Date("2024-08-18")
    },
    certifications: ["Audio Engineering Society", "LED Professional", "ISO 27001"],
    socialMedia: {
      instagram: "@premium_audiovisual",
      linkedin: "premium-audio-visual-chile"
    }
  },
  {
    id: "venue-hacienda-santa-rita",
    name: "Hacienda Santa Rita Events",
    description: "Venue exclusivo en las afueras de Santiago. Hacienda colonial restaurada con capacidad para eventos de hasta 300 personas.",
    category: "venues-espacios",
    status: "active",
    logo: "/images/affiliates/hacienda-santa-rita-logo.png",
    website: "https://hacienda-santarita.cl",
    contact: {
      name: "Magdalena Irarrázaval",
      email: "magdalena@hacienda-santarita.cl",
      phone: "+56 2 2345 6789",
      address: "Camino Santa Rita Km 8, Melipilla",
      city: "Melipilla",
      country: "Chile"
    },
    services: [
      "Salón colonial principal",
      "Jardines exteriores",
      "Capilla histórica",
      "Caballerizas renovadas",
      "Alojamiento boutique",
      "Coordinación integral"
    ],
    locations: ["Melipilla", "Región Metropolitana"],
    partnership: {
      type: "strategic",
      since: new Date("2018-05-15"),
      contractType: "exclusive",
      commissionRate: 20,
      paymentTerms: "15 días",
      renewalDate: new Date("2025-05-15")
    },
    metrics: {
      projectsCompleted: 78,
      averageRating: 9.7,
      responseTime: 12,
      reliabilityScore: 95,
      costEfficiency: 87,
      lastProjectDate: new Date("2024-07-28")
    },
    certifications: ["Heritage Venue", "Sustainable Tourism", "Wedding Venue Excellence"],
    socialMedia: {
      instagram: "@hacienda_santarita_events",
      facebook: "HaciendaSantaRitaEvents",
      website: "https://hacienda-santarita.cl"
    }
  },
  {
    id: "transporte-premium-logistics",
    name: "Premium Event Logistics",
    description: "Servicios de logística y transporte especializado para eventos. Vehículos refrigerados, montacargas y personal especializado.",
    category: "logistica-transporte",
    status: "active",
    logo: "/images/affiliates/premium-logistics-logo.png",
    contact: {
      name: "Felipe Moreno",
      email: "felipe@premiumlogistics.cl",
      phone: "+56 2 2567 8900",
      address: "Av. Américo Vespucio 1501, Quilicura",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Transporte refrigerado",
      "Camiones con pluma",
      "Personal especializado",
      "Almacenamiento temporal",
      "Seguro de mercancías",
      "Tracking en tiempo real"
    ],
    locations: ["Quilicura", "Maipú", "Santiago", "Regiones"],
    partnership: {
      type: "supplier",
      since: new Date("2020-07-01"),
      contractType: "preferred",
      commissionRate: 5,
      minimumOrder: 300000,
      paymentTerms: "45 días",
      renewalDate: new Date("2025-07-01")
    },
    metrics: {
      projectsCompleted: 234,
      averageRating: 9.0,
      responseTime: 4,
      reliabilityScore: 96,
      costEfficiency: 94,
      lastProjectDate: new Date("2024-08-20")
    },
    certifications: ["ISO 9001", "Cold Chain Certified", "Dangerous Goods"],
    socialMedia: {
      linkedin: "premium-event-logistics"
    }
  },
  {
    id: "fotografia-luz-creativa",
    name: "Luz Creativa Photography",
    description: "Estudio de fotografía y video especializado en eventos gastronómicos y corporativos. Captura profesional de experiencias culinarias.",
    category: "fotografia-video",
    status: "preferred",
    logo: "/images/affiliates/luz-creativa-logo.png",
    website: "https://luzcreativa.cl",
    contact: {
      name: "Daniela Herrera",
      email: "daniela@luzcreativa.cl",
      phone: "+56 9 8765 4321",
      address: "Av. Providencia 1184, Providencia",
      city: "Santiago",
      country: "Chile"
    },
    services: [
      "Fotografía de eventos",
      "Video corporativo",
      "Food photography",
      "Streaming profesional",
      "Edición avanzada",
      "Entrega express"
    ],
    locations: ["Providencia", "Las Condes", "Santiago"],
    partnership: {
      type: "vendor",
      since: new Date("2021-03-20"),
      contractType: "non-exclusive",
      commissionRate: 15,
      paymentTerms: "30 días",
      renewalDate: new Date("2025-03-20")
    },
    metrics: {
      projectsCompleted: 145,
      averageRating: 9.5,
      responseTime: 6,
      reliabilityScore: 93,
      costEfficiency: 91,
      lastProjectDate: new Date("2024-08-16")
    },
    certifications: ["Professional Photographers", "Drone Operator License", "Food Photography Specialist"],
    socialMedia: {
      instagram: "@luz_creativa_photo",
      facebook: "LuzCreativaPhotography",
      linkedin: "luz-creativa-photography"
    }
  }
];

export const getAffiliatesByCategory = (category: AffiliateCategory): Affiliate[] => {
  return affiliates.filter(affiliate => affiliate.category === category);
};

export const getAffiliatesByStatus = (status: AffiliateStatus): Affiliate[] => {
  return affiliates.filter(affiliate => affiliate.status === status);
};

export const getPremiumAffiliates = (): Affiliate[] => {
  return affiliates.filter(affiliate => 
    affiliate.status === "premium" || affiliate.status === "preferred"
  );
};

export const getAffiliateById = (id: string): Affiliate | undefined => {
  return affiliates.find(affiliate => affiliate.id === id);
};

export const getTopRatedAffiliates = (limit: number = 5): Affiliate[] => {
  return affiliates
    .filter(affiliate => affiliate.metrics?.averageRating)
    .sort((a, b) => (b.metrics?.averageRating || 0) - (a.metrics?.averageRating || 0))
    .slice(0, limit);
};