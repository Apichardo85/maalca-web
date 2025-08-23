export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  category: "box-comida" | "bubette" | "empanadas" | "eventos" | "consultoria";
  price: {
    min: number;
    max: number;
    currency: string;
    unit: string;
  };
  duration: string;
  capacity: {
    min: number;
    max: number;
  };
  includes: string[];
  addOns: ServiceAddOn[];
  gallery: string[];
  popular: boolean;
  premium: boolean;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
}

export const servicePackages: ServicePackage[] = [
  {
    id: "box-ejecutivo-premium",
    name: "Box Ejecutivo Premium",
    description: "Experiencia gastronómica completa para eventos corporativos. Incluye entrada, plato principal, postre y bebida premium.",
    category: "box-comida",
    price: {
      min: 25000,
      max: 45000,
      currency: "CLP",
      unit: "por persona"
    },
    duration: "2-4 horas",
    capacity: {
      min: 10,
      max: 500
    },
    includes: [
      "Entrada gourmet de temporada",
      "Plato principal premium",
      "Postre artesanal",
      "Bebida incluida (agua, jugo, café)",
      "Vajilla biodegradable premium",
      "Servilletas de lino",
      "Delivery en horario acordado"
    ],
    addOns: [
      {
        id: "vino-premium",
        name: "Maridaje con Vinos Premium",
        description: "Selección de vinos chilenos premium para acompañar",
        price: 12000,
        unit: "por persona"
      },
      {
        id: "servicio-meseros",
        name: "Servicio de Meseros",
        description: "Personal especializado para servir y atender",
        price: 45000,
        unit: "por mesero/4hrs"
      }
    ],
    gallery: [
      "/images/services/box-ejecutivo-1.jpg",
      "/images/services/box-ejecutivo-2.jpg",
      "/images/services/box-ejecutivo-3.jpg"
    ],
    popular: true,
    premium: true
  },
  {
    id: "bubette-brunch-completo",
    name: "Bubette Brunch Completo",
    description: "Experiencia de brunch premium con productos artesanales, café de specialty y ambientación elegante.",
    category: "bubette",
    price: {
      min: 18000,
      max: 28000,
      currency: "CLP",
      unit: "por persona"
    },
    duration: "3-5 horas",
    capacity: {
      min: 8,
      max: 80
    },
    includes: [
      "Estación de café specialty",
      "Panadería artesanal fresca",
      "Mermeladas y conservas caseras",
      "Quesos y fiambres premium",
      "Jugos naturales de temporada",
      "Frutas frescas y granolas",
      "Montaje y decoración",
      "Personal de servicio"
    ],
    addOns: [
      {
        id: "mimosas-bar",
        name: "Barra de Mimosas",
        description: "Estación de mimosas con champagne y jugos frescos",
        price: 8500,
        unit: "por persona"
      },
      {
        id: "live-music",
        name: "Música en Vivo",
        description: "Músico acústico para ambientar el brunch",
        price: 150000,
        unit: "por evento"
      }
    ],
    gallery: [
      "/images/services/bubette-brunch-1.jpg",
      "/images/services/bubette-brunch-2.jpg"
    ],
    popular: true,
    premium: false
  },
  {
    id: "empanadas-gourmet-mixtas",
    name: "Empanadas Gourmet Variadas",
    description: "Selección de empanadas artesanales con masa casera y rellenos únicos, perfectas para eventos y celebraciones.",
    category: "empanadas",
    price: {
      min: 3500,
      max: 5500,
      currency: "CLP",
      unit: "por unidad"
    },
    duration: "Bajo pedido",
    capacity: {
      min: 12,
      max: 1000
    },
    includes: [
      "Masa artesanal casera",
      "8 variedades disponibles",
      "Horneado al momento",
      "Salsas acompañantes",
      "Packaging premium",
      "Delivery incluido (Santiago)"
    ],
    addOns: [
      {
        id: "salsa-premium",
        name: "Salsas Premium Extra",
        description: "Chimichurri, ají verde, salsa criolla",
        price: 2500,
        unit: "por salsa"
      },
      {
        id: "empanada-dulce",
        name: "Empanadas Dulces",
        description: "Variedades dulces: manjar, manzana, dulce de leche",
        price: 4200,
        unit: "por unidad"
      }
    ],
    gallery: [
      "/images/services/empanadas-gourmet-1.jpg",
      "/images/services/empanadas-gourmet-2.jpg",
      "/images/services/empanadas-gourmet-3.jpg"
    ],
    popular: true,
    premium: false
  },
  {
    id: "evento-corporativo-completo",
    name: "Evento Corporativo Integral",
    description: "Servicio completo para eventos corporativos incluyendo catering, logística, decoración y coordinación profesional.",
    category: "eventos",
    price: {
      min: 45000,
      max: 120000,
      currency: "CLP",
      unit: "por persona"
    },
    duration: "4-8 horas",
    capacity: {
      min: 50,
      max: 1000
    },
    includes: [
      "Menú personalizado 3-5 tiempos",
      "Servicio de meseros profesional",
      "Coordinación general del evento",
      "Decoración temática",
      "Mobiliario completo",
      "Sonido básico incluido",
      "Fotografía del evento",
      "Limpieza post-evento"
    ],
    addOns: [
      {
        id: "show-cooking",
        name: "Show Cooking Interactivo",
        description: "Chef ejecutivo preparando en vivo",
        price: 250000,
        unit: "por chef"
      },
      {
        id: "barra-premium",
        name: "Barra Premium de Licores",
        description: "Bartender profesional con cócteles premium",
        price: 15000,
        unit: "por persona"
      },
      {
        id: "streaming-live",
        name: "Transmisión en Vivo",
        description: "Streaming profesional del evento",
        price: 450000,
        unit: "por evento"
      }
    ],
    gallery: [
      "/images/services/evento-corporativo-1.jpg",
      "/images/services/evento-corporativo-2.jpg",
      "/images/services/evento-corporativo-3.jpg",
      "/images/services/evento-corporativo-4.jpg"
    ],
    popular: false,
    premium: true
  },
  {
    id: "consultoria-gastronomica",
    name: "Consultoría Gastronómica Especializada",
    description: "Asesoría profesional para desarrollo de conceptos gastronómicos, optimización de menús y capacitación de equipos culinarios.",
    category: "consultoria",
    price: {
      min: 180000,
      max: 350000,
      currency: "CLP",
      unit: "por hora"
    },
    duration: "Según proyecto",
    capacity: {
      min: 1,
      max: 50
    },
    includes: [
      "Análisis gastronómico completo",
      "Desarrollo de conceptos únicos",
      "Optimización de costos",
      "Capacitación de personal",
      "Manual de procedimientos",
      "Seguimiento mensual",
      "Certificación MaalCa"
    ],
    addOns: [
      {
        id: "menu-development",
        name: "Desarrollo de Menú Completo",
        description: "Creación de carta completa con costeo",
        price: 850000,
        unit: "por proyecto"
      },
      {
        id: "staff-training",
        name: "Capacitación Intensiva Staff",
        description: "Programa de capacitación de 3 días",
        price: 450000,
        unit: "por programa"
      }
    ],
    gallery: [
      "/images/services/consultoria-1.jpg",
      "/images/services/consultoria-2.jpg"
    ],
    popular: false,
    premium: true
  }
];

export const getServicesByCategory = (category: string): ServicePackage[] => {
  return servicePackages.filter(service => service.category === category);
};

export const getPopularServices = (): ServicePackage[] => {
  return servicePackages.filter(service => service.popular);
};

export const getPremiumServices = (): ServicePackage[] => {
  return servicePackages.filter(service => service.premium);
};

export const getServiceById = (id: string): ServicePackage | undefined => {
  return servicePackages.find(service => service.id === id);
};