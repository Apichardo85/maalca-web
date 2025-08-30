import { Property } from '@/lib/types/property';

export const mockProperties: Property[] = [
  {
    id: "oceanfront-villa-paradise",
    name: "Villa Paraíso Oceanfront",
    location: "Caribbean Coastline",
    priceFrom: 850000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3500,
    lotSize: "2.5 acres",
    type: "Oceanfront Villa",
    amenities: ["Private Beach", "Infinity Pool", "Ocean Views", "Tropical Gardens", "Guest House", "Sunset Deck"],
    description: "Luxury villa with unobstructed ocean views, private beach access, and world-class amenities. Wake up to endless Caribbean blue waters. This stunning property features elegant architecture that seamlessly blends indoor and outdoor living, creating the perfect tropical sanctuary.",
    images: [
      "/images/properties/villa-paradise-1.jpg",
      "/images/properties/villa-paradise-2.jpg", 
      "/images/properties/villa-paradise-3.jpg",
      "/images/properties/villa-paradise-4.jpg"
    ],
    featured: true,
    status: "Available",
    virtualTour: "https://my.matterport.com/show/?m=example1",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    coordinates: { lat: 18.4861, lng: -69.9312 }
  },
  {
    id: "beachfront-penthouse",
    name: "Caribbean Penthouse Dreams", 
    location: "Exclusive Beachfront",
    priceFrom: 1200000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    lotSize: "Penthouse",
    type: "Luxury Penthouse",
    amenities: ["360° Ocean Views", "Private Elevator", "Rooftop Pool", "Smart Home", "Concierge Service", "Marina Access"],
    description: "Ultra-modern penthouse with 360-degree ocean views. The pinnacle of luxury living in the Caribbean. Features state-of-the-art smart home technology, premium finishes throughout, and exclusive access to world-class amenities.",
    images: [
      "/images/properties/penthouse-1.jpg",
      "/images/properties/penthouse-2.jpg",
      "/images/properties/penthouse-3.jpg"
    ],
    featured: true,
    status: "Available",
    virtualTour: "https://my.matterport.com/show/?m=example2",
    videoUrl: "https://vimeo.com/example2",
    coordinates: { lat: 18.5204, lng: -69.9620 }
  },
  {
    id: "tropical-estate",
    name: "Tropical Estate Sanctuary",
    location: "Private Cove",
    priceFrom: 2500000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 6500,
    lotSize: "5 acres",
    type: "Private Estate",
    amenities: ["Private Cove", "Helipad", "Tennis Court", "Wine Cellar", "Staff Quarters", "Boat Dock"],
    description: "Exclusive private estate with its own cove, helipad, and unparalleled privacy. A true Caribbean sanctuary. This magnificent property offers complete seclusion while maintaining easy access to local attractions and services.",
    images: [
      "/images/properties/estate-1.jpg", 
      "/images/properties/estate-2.jpg",
      "/images/properties/estate-3.jpg",
      "/images/properties/estate-4.jpg",
      "/images/properties/estate-5.jpg"
    ],
    featured: true,
    status: "Available",
    virtualTour: "https://my.matterport.com/show/?m=example3",
    coordinates: { lat: 18.4500, lng: -69.8800 }
  },
  {
    id: "modern-beach-house",
    name: "Modern Beach House",
    location: "Golden Sand Beach",
    priceFrom: 650000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2200,
    lotSize: "1 acre",
    type: "Beach House",
    amenities: ["Direct Beach Access", "Open Floor Plan", "Solar Panels", "Outdoor Kitchen", "Yoga Deck", "Fire Pit"],
    description: "Contemporary beach house with sustainable features and direct beach access. Modern living meets tropical paradise. Designed with eco-friendly materials and energy-efficient systems for the environmentally conscious buyer.",
    images: [
      "/images/properties/modern-beach-1.jpg",
      "/images/properties/modern-beach-2.jpg",
      "/images/properties/modern-beach-3.jpg"
    ],
    featured: false,
    status: "Available",
    coordinates: { lat: 18.5100, lng: -69.9000 }
  },
  {
    id: "luxury-condo-marina",
    name: "Marina Luxury Residences",
    location: "Premium Marina",
    priceFrom: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    lotSize: "Condo",
    type: "Marina Condo",
    amenities: ["Marina Views", "Boat Slip Included", "Resort Amenities", "24/7 Security", "Fitness Center", "Restaurant Access"],
    description: "Sophisticated condo with marina views and boat slip. Perfect for the nautical lifestyle enthusiast. Located in a prestigious marina community with full-service amenities and professional property management.",
    images: [
      "/images/properties/marina-condo-1.jpg",
      "/images/properties/marina-condo-2.jpg"
    ],
    featured: false,
    status: "Available",
    coordinates: { lat: 18.4700, lng: -69.9100 }
  },
  {
    id: "eco-luxury-retreat",
    name: "Eco-Luxury Retreat",
    location: "Rainforest Coastline", 
    priceFrom: 950000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    lotSize: "3 acres",
    type: "Eco Villa",
    amenities: ["Rainforest Views", "Sustainable Design", "Natural Pool", "Organic Garden", "Wildlife Sanctuary", "Meditation Space"],
    description: "Eco-luxury villa where rainforest meets ocean. Sustainable luxury in perfect harmony with nature. Built with locally sourced materials and powered by renewable energy, this property represents the future of responsible luxury living.",
    images: [
      "/images/properties/eco-retreat-1.jpg",
      "/images/properties/eco-retreat-2.jpg",
      "/images/properties/eco-retreat-3.jpg"
    ],
    featured: false,
    status: "Available",
    virtualTour: "https://my.matterport.com/show/?m=example4",
    coordinates: { lat: 18.4200, lng: -69.8500 }
  }
];

// Datos adicionales para filtros
export const mockPropertyTypes = [
  "All Properties",
  "Oceanfront Villa", 
  "Luxury Penthouse",
  "Private Estate",
  "Beach House",
  "Marina Condo",
  "Eco Villa"
];

export const mockPriceRanges = [
  "All Prices",
  "$400K - $700K",
  "$700K - $1M", 
  "$1M - $2M",
  "$2M+"
];

export const mockAmenities = [
  "Private Beach",
  "Ocean Views",
  "Infinity Pool",
  "Marina Access",
  "Smart Home",
  "Concierge Service",
  "Tennis Court",
  "Wine Cellar",
  "Helipad",
  "Solar Panels",
  "Yoga Deck",
  "Fire Pit",
  "Guest House",
  "Boat Dock",
  "24/7 Security"
];