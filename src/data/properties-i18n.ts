import { LocalizedProperty } from '@/lib/types/property-i18n';

export const mockPropertiesI18n: LocalizedProperty[] = [
  {
    id: "terreno-virgen-lote-1",
    name: {
      en: "Virgin Land - Lot 1",
      es: "Terreno Virgen - Lote 1"
    },
    location: {
      en: "Loma Atravesada, Samaná",
      es: "Loma Atravesada, Samaná"
    },
    priceFrom: 450000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    lotSize: {
      en: "2.5 acres",
      es: "2.5 acres"
    },
    type: {
      en: "Virgin Land",
      es: "Terreno Virgen"
    },
    amenities: [
      { en: "Ocean Views", es: "Vistas al Mar" },
      { en: "Beach Access", es: "Acceso a Playa" },
      { en: "Natural Topography", es: "Topografía Natural" },
      { en: "Development Ready", es: "Listo para Desarrollo" },
      { en: "Prime Location", es: "Ubicación Privilegiada" },
      { en: "Investment Opportunity", es: "Oportunidad de Inversión" }
    ],
    description: {
      en: "Prime virgin land with stunning ocean views and direct beach access. Perfect for building your dream Caribbean villa. This exceptional lot offers natural topography and endless possibilities for development in one of the most sought-after locations.",
      es: "Terreno virgen privilegiado con impresionantes vistas al océano y acceso directo a la playa. Perfecto para construir la villa caribeña de tus sueños. Este lote excepcional ofrece topografía natural y posibilidades infinitas de desarrollo en una de las ubicaciones más codiciadas."
    },
    images: [
      "/images/properties/terrenos-virgenes/lote-1/hero.png",
      "/images/properties/terrenos-virgenes/lote-1/vista-mar.png",
      "/images/properties/terrenos-virgenes/lote-1/topografia.png",
      "/images/properties/terrenos-virgenes/lote-1/acceso.png"
    ],
    featured: true,
    status: {
      en: "Available",
      es: "Disponible"
    },
    virtualTour: "",
    videoUrl: "",
    coordinates: { lat: 19.2058, lng: -69.4033 }
  },
  // Otras propiedades desactivadas temporalmente para mostrar solo el lote 1 real
  /*
  {
    id: "beachfront-penthouse",
    name: {
      en: "Caribbean Penthouse Dreams",
      es: "Penthouse Caribeño de Ensueño"
    },
    location: {
      en: "Exclusive Beachfront",
      es: "Frente de Playa Exclusivo"
    },
    priceFrom: 1200000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    lotSize: {
      en: "Penthouse",
      es: "Penthouse"
    },
    type: {
      en: "Luxury Penthouse",
      es: "Penthouse de Lujo"
    },
    amenities: [
      { en: "360° Ocean Views", es: "Vistas 360° al Mar" },
      { en: "Private Elevator", es: "Ascensor Privado" },
      { en: "Rooftop Pool", es: "Piscina en Azotea" },
      { en: "Smart Home", es: "Casa Inteligente" },
      { en: "Concierge Service", es: "Servicio de Conserjería" },
      { en: "Marina Access", es: "Acceso a Marina" }
    ],
    description: {
      en: "Ultra-modern penthouse with 360-degree ocean views. The pinnacle of luxury living in the Caribbean. Features state-of-the-art smart home technology, premium finishes throughout, and exclusive access to world-class amenities.",
      es: "Penthouse ultra-moderno con vistas de 360 grados al océano. La cúspide del lujo caribeño. Cuenta con tecnología de casa inteligente de última generación, acabados premium y acceso exclusivo a amenidades de clase mundial."
    },
    images: [
      "/images/properties/penthouse-1.jpg",
      "/images/properties/penthouse-2.jpg",
      "/images/properties/penthouse-3.jpg"
    ],
    featured: true,
    status: {
      en: "Available",
      es: "Disponible"
    },
    virtualTour: "https://my.matterport.com/show/?m=example2",
    videoUrl: "https://vimeo.com/example2",
    coordinates: { lat: 18.5204, lng: -69.9620 }
  },
  {
    id: "tropical-estate",
    name: {
      en: "Tropical Estate Sanctuary",
      es: "Santuario de Finca Tropical"
    },
    location: {
      en: "Private Cove",
      es: "Ensenada Privada"
    },
    priceFrom: 2500000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 6500,
    lotSize: {
      en: "5 acres",
      es: "5 acres"
    },
    type: {
      en: "Private Estate",
      es: "Finca Privada"
    },
    amenities: [
      { en: "Private Cove", es: "Ensenada Privada" },
      { en: "Helipad", es: "Helipuerto" },
      { en: "Tennis Court", es: "Cancha de Tenis" },
      { en: "Wine Cellar", es: "Cava de Vinos" },
      { en: "Staff Quarters", es: "Habitaciones de Personal" },
      { en: "Boat Dock", es: "Muelle para Embarcaciones" }
    ],
    description: {
      en: "Exclusive private estate with its own cove, helipad, and unparalleled privacy. A true Caribbean sanctuary. This magnificent property offers complete seclusion while maintaining easy access to local attractions and services.",
      es: "Finca privada exclusiva con su propia ensenada, helipuerto y privacidad incomparable. Un verdadero santuario caribeño. Esta magnífica propiedad ofrece aislamiento completo mientras mantiene fácil acceso a atracciones y servicios locales."
    },
    images: [
      "/images/properties/estate-1.jpg", 
      "/images/properties/estate-2.jpg",
      "/images/properties/estate-3.jpg",
      "/images/properties/estate-4.jpg",
      "/images/properties/estate-5.jpg"
    ],
    featured: true,
    status: {
      en: "Available",
      es: "Disponible"
    },
    virtualTour: "https://my.matterport.com/show/?m=example3",
    coordinates: { lat: 18.4500, lng: -69.8800 }
  },
  {
    id: "modern-beach-house",
    name: {
      en: "Modern Beach House",
      es: "Casa de Playa Moderna"
    },
    location: {
      en: "Golden Sand Beach",
      es: "Playa de Arena Dorada"
    },
    priceFrom: 650000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2200,
    lotSize: {
      en: "1 acre",
      es: "1 acre"
    },
    type: {
      en: "Beach House",
      es: "Casa de Playa"
    },
    amenities: [
      { en: "Direct Beach Access", es: "Acceso Directo a la Playa" },
      { en: "Open Floor Plan", es: "Planta Abierta" },
      { en: "Solar Panels", es: "Paneles Solares" },
      { en: "Outdoor Kitchen", es: "Cocina Exterior" },
      { en: "Yoga Deck", es: "Terraza de Yoga" },
      { en: "Fire Pit", es: "Fogata" }
    ],
    description: {
      en: "Contemporary beach house with sustainable features and direct beach access. Modern living meets tropical paradise. Designed with eco-friendly materials and energy-efficient systems for the environmentally conscious buyer.",
      es: "Casa de playa contemporánea con características sostenibles y acceso directo a la playa. La vida moderna se encuentra con el paraíso tropical. Diseñada con materiales eco-amigables y sistemas eficientes para el comprador consciente del medio ambiente."
    },
    images: [
      "/images/properties/modern-beach-1.jpg",
      "/images/properties/modern-beach-2.jpg",
      "/images/properties/modern-beach-3.jpg"
    ],
    featured: false,
    status: {
      en: "Available",
      es: "Disponible"
    },
    coordinates: { lat: 18.5100, lng: -69.9000 }
  },
  {
    id: "luxury-condo-marina",
    name: {
      en: "Marina Luxury Residences",
      es: "Residencias de Lujo Marina"
    },
    location: {
      en: "Premium Marina",
      es: "Marina Premium"
    },
    priceFrom: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    lotSize: {
      en: "Condo",
      es: "Condominio"
    },
    type: {
      en: "Marina Condo",
      es: "Condominio Marina"
    },
    amenities: [
      { en: "Marina Views", es: "Vistas a la Marina" },
      { en: "Boat Slip Included", es: "Muelle Incluido" },
      { en: "Resort Amenities", es: "Amenidades de Resort" },
      { en: "24/7 Security", es: "Seguridad 24/7" },
      { en: "Fitness Center", es: "Centro de Fitness" },
      { en: "Restaurant Access", es: "Acceso a Restaurante" }
    ],
    description: {
      en: "Sophisticated condo with marina views and boat slip. Perfect for the nautical lifestyle enthusiast. Located in a prestigious marina community with full-service amenities and professional property management.",
      es: "Condominio sofisticado con vistas a la marina y muelle incluido. Perfecto para entusiastas del estilo de vida náutico. Ubicado en una prestigiosa comunidad marina con amenidades completas y administración profesional."
    },
    images: [
      "/images/properties/marina-condo-1.jpg",
      "/images/properties/marina-condo-2.jpg"
    ],
    featured: false,
    status: {
      en: "Available",
      es: "Disponible"
    },
    coordinates: { lat: 18.4700, lng: -69.9100 }
  },
  {
    id: "eco-luxury-retreat",
    name: {
      en: "Eco-Luxury Retreat",
      es: "Retiro Eco-Lujoso"
    },
    location: {
      en: "Rainforest Coastline",
      es: "Costa de Selva Tropical"
    },
    priceFrom: 950000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    lotSize: {
      en: "3 acres",
      es: "3 acres"
    },
    type: {
      en: "Eco Villa",
      es: "Villa Ecológica"
    },
    amenities: [
      { en: "Rainforest Views", es: "Vistas a la Selva" },
      { en: "Sustainable Design", es: "Diseño Sostenible" },
      { en: "Natural Pool", es: "Piscina Natural" },
      { en: "Organic Garden", es: "Jardín Orgánico" },
      { en: "Wildlife Sanctuary", es: "Santuario de Vida Silvestre" },
      { en: "Meditation Space", es: "Espacio de Meditación" }
    ],
    description: {
      en: "Eco-luxury villa where rainforest meets ocean. Sustainable luxury in perfect harmony with nature. Built with locally sourced materials and powered by renewable energy, this property represents the future of responsible luxury living.",
      es: "Villa eco-lujosa donde la selva se encuentra con el océano. Lujo sostenible en perfecta armonía con la naturaleza. Construida con materiales locales y alimentada por energía renovable, esta propiedad representa el futuro de la vida de lujo responsable."
    },
    images: [
      "/images/properties/eco-retreat-1.jpg",
      "/images/properties/eco-retreat-2.jpg",
      "/images/properties/eco-retreat-3.jpg"
    ],
    featured: false,
    status: {
      en: "Available",
      es: "Disponible"
    },
    virtualTour: "https://my.matterport.com/show/?m=example4",
    coordinates: { lat: 18.4200, lng: -69.8500 }
  }
  */
];

// Property types translated
export const propertyTypesI18n = {
  en: ["All Properties", "Virgin Land", "Luxury Penthouse", "Private Estate", "Beach House", "Marina Condo", "Eco Villa"],
  es: ["Todas las Propiedades", "Terreno Virgen", "Penthouse de Lujo", "Finca Privada", "Casa de Playa", "Condominio Marina", "Villa Ecológica"]
};

// Price ranges (same in both languages)
export const priceRangesI18n = {
  en: ["All Prices", "$400K - $700K", "$700K - $1M", "$1M - $2M", "$2M+"],
  es: ["Todos los Precios", "$400K - $700K", "$700K - $1M", "$1M - $2M", "$2M+"]
};