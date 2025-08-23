import { Project, ProjectCategory, ProjectStatus } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "maalca-summit-2024",
    name: "MaalCa Summit 2024 - Evento Gastronómico Premium",
    description: "Evento cumbre anual de MaalCa reuniendo a los mejores chefs, proveedores y partners del ecosistema gastronómico. Una experiencia culinaria inmersiva para 500 invitados VIP.",
    category: "eventos-corporativos",
    status: "completed",
    features: [
      "7 estaciones gastronómicas temáticas",
      "Maridajes exclusivos con sommelier",
      "Show cooking en vivo con chefs estrella",
      "Networking lounge premium",
      "Presentación de productos 2024",
      "Cena de gala con menú degustación"
    ],
    technologies: [
      "Cocina molecular",
      "Fermentación artesanal",
      "Ahumado en frío",
      "Sous-vide premium",
      "Técnicas de nitrógeno líquido"
    ],
    images: [
      {
        id: "summit-hero",
        url: "/images/projects/maalca-summit-hero.jpg",
        alt: "Vista panorámica del MaalCa Summit 2024",
        type: "hero",
        order: 1
      },
      {
        id: "summit-cooking",
        url: "/images/projects/maalca-summit-cooking.jpg",
        alt: "Show cooking con chef estrella",
        type: "process",
        order: 2
      },
      {
        id: "summit-gala",
        url: "/images/projects/maalca-summit-gala.jpg",
        alt: "Cena de gala con invitados VIP",
        type: "result",
        order: 3
      }
    ],
    startDate: new Date("2024-03-15"),
    completionDate: new Date("2024-03-17"),
    client: "MaalCa Corporation",
    location: "Hotel W Santiago, Rooftop",
    budget: {
      min: 180000000,
      max: 250000000,
      currency: "CLP"
    },
    team: [
      {
        id: "chef-director",
        name: "Chef Patricia Mendoza",
        role: "Directora Culinaria",
        avatar: "/images/team/patricia-mendoza.jpg"
      },
      {
        id: "sommelier",
        name: "Rodrigo Valenzuela",
        role: "Sommelier Ejecutivo",
        avatar: "/images/team/rodrigo-valenzuela.jpg"
      },
      {
        id: "coordinator",
        name: "Andrea Torres",
        role: "Coordinadora de Eventos",
        avatar: "/images/team/andrea-torres.jpg"
      }
    ],
    metrics: {
      guestsServed: 500,
      eventsCompleted: 1,
      satisfactionScore: 9.8,
      revenueGenerated: 220000000,
      mediaImpression: 2500000
    },
    tags: ["premium", "corporativo", "networking", "degustación", "vip"]
  },
  {
    id: "bubette-expansion",
    name: "Expansión Bubette - Franquicia Nacional",
    description: "Desarrollo y lanzamiento de la línea Bubette como franquicia independiente, especializándose en experiencias de brunch premium y desayunos gourmet.",
    category: "franquicias",
    status: "in-progress",
    features: [
      "Manual de operaciones franquicia",
      "Recetario estandarizado Bubette",
      "Kit de diseño e identidad visual",
      "Programa de capacitación franquiciados",
      "Sistema POS integrado",
      "Marketing digital centralizado"
    ],
    technologies: [
      "Panificación artesanal",
      "Café specialty de origen",
      "Mermeladas casa",
      "Productos orgánicos",
      "Conservación natural"
    ],
    images: [
      {
        id: "bubette-store",
        url: "/images/projects/bubette-flagship.jpg",
        alt: "Primera tienda Bubette flagship",
        type: "hero",
        order: 1
      },
      {
        id: "bubette-products",
        url: "/images/projects/bubette-products.jpg",
        alt: "Línea completa de productos Bubette",
        type: "gallery",
        order: 2
      }
    ],
    startDate: new Date("2024-01-10"),
    client: "Inversionistas Bubette SpA",
    location: "Nacional - Chile",
    budget: {
      min: 450000000,
      max: 650000000,
      currency: "CLP"
    },
    team: [
      {
        id: "business-dev",
        name: "Carlos Restrepo",
        role: "Director Desarrollo Negocios",
        avatar: "/images/team/carlos-restrepo.jpg"
      },
      {
        id: "chef-bubette",
        name: "Sofia Ramírez",
        role: "Chef de Desarrollo Bubette",
        avatar: "/images/team/sofia-ramirez.jpg"
      }
    ],
    metrics: {
      eventsCompleted: 8,
      satisfactionScore: 9.5,
      revenueGenerated: 280000000
    },
    tags: ["franquicia", "expansion", "brunch", "startup", "escalabilidad"]
  },
  {
    id: "tech-campus-catering",
    name: "Catering Corporativo Campus Tech",
    description: "Servicio de catering integral para el nuevo campus tecnológico de 3000 empleados, incluyendo restaurante ejecutivo, cafeterías y servicio de eventos.",
    category: "catering-masivo",
    status: "completed",
    features: [
      "Restaurante ejecutivo 200 personas",
      "3 cafeterías satélite",
      "Menús rotativos semanales",
      "Opciones veganas y sin gluten",
      "Servicio de eventos corporativos",
      "Coffee stations premium"
    ],
    technologies: [
      "Cocina industrial automatizada",
      "Sistema cold chain",
      "Nutritional tracking",
      "Waste management system",
      "Quality control IoT"
    ],
    images: [
      {
        id: "campus-restaurant",
        url: "/images/projects/campus-restaurant.jpg",
        alt: "Restaurante ejecutivo campus tech",
        type: "hero",
        order: 1
      },
      {
        id: "campus-cafeteria",
        url: "/images/projects/campus-cafeteria.jpg",
        alt: "Cafetería satellite moderna",
        type: "gallery",
        order: 2
      }
    ],
    startDate: new Date("2023-08-01"),
    completionDate: new Date("2024-02-28"),
    client: "TechCorp Chile",
    location: "Las Condes, Santiago",
    budget: {
      min: 850000000,
      max: 1200000000,
      currency: "CLP"
    },
    team: [
      {
        id: "ops-manager",
        name: "Miguel Fernández",
        role: "Gerente de Operaciones",
        avatar: "/images/team/miguel-fernandez.jpg"
      },
      {
        id: "nutrition-chef",
        name: "Valentina López",
        role: "Chef Nutricionista",
        avatar: "/images/team/valentina-lopez.jpg"
      }
    ],
    metrics: {
      guestsServed: 245000,
      eventsCompleted: 52,
      satisfactionScore: 9.2,
      revenueGenerated: 980000000
    },
    tags: ["corporativo", "masivo", "tecnologia", "sustentable", "wellness"]
  },
  {
    id: "luxury-wedding-vineyard",
    name: "Boda de Lujo en Viñedo Premium",
    description: "Celebración matrimonial exclusiva para 150 invitados en viñedo boutique del Valle de Casablanca, con experiencia gastronómica de 3 días.",
    category: "bodas-luxury",
    status: "completed",
    features: [
      "Cena de bienvenida al aire libre",
      "Ceremonia con cocktail garden",
      "Cena de gala 5 tiempos",
      "Brunch de despedida",
      "Maridajes con vinos de la casa",
      "Late night food truck gourmet"
    ],
    technologies: [
      "Asado argentino premium",
      "Maridajes vino-comida",
      "Flores comestibles",
      "Quesos artesanales",
      "Destilados premium"
    ],
    images: [
      {
        id: "vineyard-ceremony",
        url: "/images/projects/vineyard-ceremony.jpg",
        alt: "Ceremonia entre viñedos al atardecer",
        type: "hero",
        order: 1
      },
      {
        id: "vineyard-dinner",
        url: "/images/projects/vineyard-dinner.jpg",
        alt: "Cena de gala bajo las estrellas",
        type: "result",
        order: 2
      }
    ],
    startDate: new Date("2024-01-20"),
    completionDate: new Date("2024-01-22"),
    client: "Familia Rodríguez-Silva",
    location: "Viñedo Casa Silva, Casablanca",
    budget: {
      min: 95000000,
      max: 125000000,
      currency: "CLP"
    },
    team: [
      {
        id: "wedding-planner",
        name: "Isabella Morales",
        role: "Wedding Planner Ejecutiva",
        avatar: "/images/team/isabella-morales.jpg"
      },
      {
        id: "pastry-chef",
        name: "Jean-Pierre Dubois",
        role: "Chef Pastelero",
        avatar: "/images/team/jean-pierre-dubois.jpg"
      }
    ],
    metrics: {
      guestsServed: 150,
      eventsCompleted: 1,
      satisfactionScore: 10.0,
      revenueGenerated: 110000000,
      mediaImpression: 850000
    },
    tags: ["boda", "lujo", "viñedo", "exclusivo", "3-dias", "maridajes"]
  },
  {
    id: "empanada-factory",
    name: "Planta Productiva Empanadas MaalCa",
    description: "Desarrollo de planta productiva industrial para empanadas gourmet con capacidad de 50,000 unidades/día y distribución nacional.",
    category: "desarrollo-productos",
    status: "planning",
    features: [
      "Línea automatizada de producción",
      "Cámara de frío industrial",
      "10 variedades gourmet",
      "Packaging sustentable",
      "Trazabilidad blockchain",
      "Distribución cold chain nacional"
    ],
    technologies: [
      "Automatización industrial",
      "Freeze technology",
      "Vacuum packaging",
      "Quality sensors",
      "Blockchain tracking"
    ],
    images: [
      {
        id: "factory-plan",
        url: "/images/projects/empanada-factory-plan.jpg",
        alt: "Planos arquitectónicos de la planta",
        type: "process",
        order: 1
      }
    ],
    startDate: new Date("2024-06-01"),
    client: "MaalCa Industrial",
    location: "Melipilla, Región Metropolitana",
    budget: {
      min: 2800000000,
      max: 3500000000,
      currency: "CLP"
    },
    team: [
      {
        id: "industrial-eng",
        name: "Roberto Sánchez",
        role: "Ingeniero Industrial",
        avatar: "/images/team/roberto-sanchez.jpg"
      },
      {
        id: "qa-manager",
        name: "Carmen Vega",
        role: "Gerente Calidad",
        avatar: "/images/team/carmen-vega.jpg"
      }
    ],
    tags: ["industrial", "empanadas", "automatizacion", "distribucion", "escalabilidad"]
  },
  {
    id: "real-estate-showroom",
    name: "Showroom Inmobiliario MaalCa Properties",
    description: "Desarrollo de showroom gastronómico para promoción de propiedades premium, combinando degustaciones culinarias con tours inmobiliarios.",
    category: "real-estate",
    status: "in-progress",
    features: [
      "Cocina de demostración interactiva",
      "Sala de degustaciones VIP",
      "Tours gastronómicos guiados",
      "Experiencias inmobiliarias únicas",
      "Concierge culinario especializado",
      "Eventos de lanzamiento exclusivos"
    ],
    technologies: [
      "Cocina modular móvil",
      "AV system integration",
      "Virtual reality tours",
      "Smart home integration",
      "Climate control systems"
    ],
    images: [
      {
        id: "showroom-kitchen",
        url: "/images/projects/showroom-kitchen.jpg",
        alt: "Cocina de demostración interactiva",
        type: "hero",
        order: 1
      }
    ],
    startDate: new Date("2024-04-01"),
    client: "MaalCa Properties",
    location: "Vitacura, Santiago",
    budget: {
      min: 320000000,
      max: 450000000,
      currency: "CLP"
    },
    team: [
      {
        id: "concept-chef",
        name: "Alejandro Mora",
        role: "Chef Conceptual",
        avatar: "/images/team/alejandro-mora.jpg"
      },
      {
        id: "real-estate-mgr",
        name: "Fernanda Castro",
        role: "Gerente Inmobiliaria",
        avatar: "/images/team/fernanda-castro.jpg"
      }
    ],
    metrics: {
      eventsCompleted: 12,
      satisfactionScore: 9.4
    },
    tags: ["inmobiliario", "showroom", "premium", "experiencial", "tours"]
  }
];

export const getProjectsByCategory = (category: ProjectCategory): Project[] => {
  return projects.filter(project => project.category === category);
};

export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return projects.filter(project => project.status === status);
};

export const getFeaturedProjects = (): Project[] => {
  return projects.filter(project => 
    project.status === "completed" && 
    project.metrics?.satisfactionScore && 
    project.metrics.satisfactionScore >= 9.5
  );
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};