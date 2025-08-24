"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const properties = [
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
    description: "Luxury villa with unobstructed ocean views, private beach access, and world-class amenities. Wake up to endless Caribbean blue waters.",
    images: ["/images/properties/villa-paradise-1.jpg", "/images/properties/villa-paradise-2.jpg"],
    featured: true,
    status: "Available",
    virtualTour: "#"
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
    description: "Ultra-modern penthouse with 360-degree ocean views. The pinnacle of luxury living in the Caribbean.",
    images: ["/images/properties/penthouse-1.jpg", "/images/properties/penthouse-2.jpg"],
    featured: true,
    status: "Available",
    virtualTour: "#"
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
    description: "Exclusive private estate with its own cove, helipad, and unparalleled privacy. A true Caribbean sanctuary.",
    images: ["/images/properties/estate-1.jpg", "/images/properties/estate-2.jpg"],
    featured: true,
    status: "Available",
    virtualTour: "#"
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
    description: "Contemporary beach house with sustainable features and direct beach access. Modern living meets tropical paradise.",
    images: ["/images/properties/modern-beach-1.jpg", "/images/properties/modern-beach-2.jpg"],
    featured: false,
    status: "Available",
    virtualTour: "#"
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
    description: "Sophisticated condo with marina views and boat slip. Perfect for the nautical lifestyle enthusiast.",
    images: ["/images/properties/marina-condo-1.jpg", "/images/properties/marina-condo-2.jpg"],
    featured: false,
    status: "Available",
    virtualTour: "#"
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
    description: "Eco-luxury villa where rainforest meets ocean. Sustainable luxury in perfect harmony with nature.",
    images: ["/images/properties/eco-retreat-1.jpg", "/images/properties/eco-retreat-2.jpg"],
    featured: false,
    status: "Available",
    virtualTour: "#"
  }
];

const propertyTypes = ["All Properties", "Oceanfront Villa", "Luxury Penthouse", "Private Estate", "Beach House", "Marina Condo", "Eco Villa"];
const priceRanges = ["All Prices", "$400K - $700K", "$700K - $1M", "$1M - $2M", "$2M+"];

const investmentBenefits = [
  {
    icon: "🏖️",
    title: "Prime Oceanfront Locations",
    description: "Exclusive properties with direct beach access and unobstructed ocean views"
  },
  {
    icon: "📈",
    title: "Strong ROI Potential",
    description: "Caribbean real estate has shown consistent growth and high rental yields"
  },
  {
    icon: "🌴",
    title: "Tropical Lifestyle",
    description: "Year-round paradise living with world-class amenities and natural beauty"
  },
  {
    icon: "✈️",
    title: "Global Accessibility",
    description: "Easy access from major international airports with direct flights worldwide"
  },
  {
    icon: "🏛️",
    title: "Stable Market",
    description: "Established legal framework and favorable investment conditions"
  },
  {
    icon: "🤝",
    title: "Full-Service Support",
    description: "End-to-end assistance from purchase to property management"
  }
];

export default function MaalCaPropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filters, setFilters] = useState({
    type: "All Properties",
    priceRange: "All Prices"
  });
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [showContactForm, setShowContactForm] = useState(false);

  const translations = {
    en: {
      heroTitle: "Your Gateway to Caribbean Paradise",
      heroSubtitle: "Exclusive oceanfront properties where dreams meet reality",
      exploreProperties: "Explore Properties",
      contactUs: "Contact Us",
      featuredProperties: "Featured Properties",
      allProperties: "All Properties",
      from: "From",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      viewDetails: "View Details",
      virtualTour: "Virtual Tour",
      whyInvest: "Why Invest in Caribbean Real Estate",
      aboutMaalCa: "The MaalCa Properties Difference",
      contactTitle: "Ready to Find Your Paradise?",
      scheduleCall: "Schedule a Call"
    },
    es: {
      heroTitle: "Tu Puerta al Paraíso Caribeño",
      heroSubtitle: "Propiedades exclusivas frente al océano donde los sueños se hacen realidad",
      exploreProperties: "Explorar Propiedades",
      contactUs: "Contáctanos",
      featuredProperties: "Propiedades Destacadas",
      allProperties: "Todas las Propiedades",
      from: "Desde",
      bedrooms: "Habitaciones",
      bathrooms: "Baños",
      viewDetails: "Ver Detalles",
      virtualTour: "Tour Virtual",
      whyInvest: "Por Qué Invertir en Bienes Raíces Caribeños",
      aboutMaalCa: "La Diferencia MaalCa Properties",
      contactTitle: "¿Listo para Encontrar tu Paraíso?",
      scheduleCall: "Agendar Llamada"
    }
  };

  const t = translations[language];

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else {
      return `$${(price / 1000)}K`;
    }
  };

  const filteredProperties = properties.filter(property => {
    const typeMatch = filters.type === "All Properties" || property.type === filters.type;
    let priceMatch = true;
    
    if (filters.priceRange !== "All Prices") {
      const price = property.priceFrom;
      switch (filters.priceRange) {
        case "$400K - $700K":
          priceMatch = price >= 400000 && price < 700000;
          break;
        case "$700K - $1M":
          priceMatch = price >= 700000 && price < 1000000;
          break;
        case "$1M - $2M":
          priceMatch = price >= 1000000 && price < 2000000;
          break;
        case "$2M+":
          priceMatch = price >= 2000000;
          break;
      }
    }
    
    return typeMatch && priceMatch;
  });

  const featuredProperties = properties.filter(property => property.featured);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-b from-blue-900/20 via-teal-900/30 to-blue-900/40 relative">
            {/* Simulated ocean background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-500 to-blue-800">
              {/* Animated waves */}
              <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
                <motion.div
                  animate={{ 
                    backgroundPosition: ["0% 0%", "100% 0%"],
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjAwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMEMyNSAxMCA3NSAzMCAxMDAgMjBDMTI1IDEwIDE3NSAzMCAyMDAgMjBWMzJIMFYyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=')",
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "200px 32px"
                  }}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight">
              {t.heroTitle.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl font-light mb-12 text-blue-100 max-w-3xl mx-auto"
            >
              {t.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
              >
                {t.exploreProperties}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowContactForm(true)}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg"
              >
                {t.contactUs}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Discover</span>
            <div className="w-0.5 h-12 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold text-gray-800">
              MaalCa <span className="font-light">Properties</span>
            </span>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#properties" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Properties
              </a>
              <a href="#investment" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Investment
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Contact
              </a>
              <button
                onClick={() => setLanguage(language === "en" ? "es" : "en")}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
              >
                {language === "en" ? "ES" : "EN"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Featured Properties */}
      <section id="properties" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.featuredProperties}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Carefully curated selection of our most exclusive oceanfront properties
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200">
                  {/* Property Image */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                      <span className="text-6xl opacity-70">🏖️</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {property.status}
                      </span>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="font-semibold">{t.viewDetails}</p>
                      </div>
                    </div>
                  </div>

                  {/* Property Content */}
                  <div className="p-8">
                    <div className="mb-4">
                      <h3 className="text-2xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-slate-600 flex items-center">
                        <span className="mr-2">📍</span>
                        {property.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="text-3xl font-light text-slate-900">
                        {t.from} {formatPrice(property.priceFrom)}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-semibold text-slate-900">{property.bedrooms}</div>
                        <div className="text-sm text-slate-600">{t.bedrooms}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-semibold text-slate-900">{property.bathrooms}</div>
                        <div className="text-sm text-slate-600">{t.bathrooms}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-lg font-semibold text-slate-900">{property.sqft.toLocaleString()}</div>
                        <div className="text-sm text-slate-600">Sq Ft</div>
                      </div>
                    </div>

                    {/* Amenities Preview */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setSelectedProperty(property.id)}
                      >
                        {t.viewDetails}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white"
                      >
                        {t.virtualTour}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Properties with Filters */}
      <section className="py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.allProperties}
            </h2>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8 max-w-4xl mx-auto">
              <div className="flex-1">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Property Image */}
                <div className="aspect-video relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-300 to-teal-400 flex items-center justify-center">
                    <span className="text-4xl opacity-70">🏖️</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 text-slate-900 px-2 py-1 rounded text-xs font-medium">
                      {formatPrice(property.priceFrom)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {property.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{property.location}</p>
                  
                  <div className="flex items-center text-sm text-slate-600 mb-4">
                    <span className="mr-4">{property.bedrooms} bed</span>
                    <span className="mr-4">{property.bathrooms} bath</span>
                    <span>{property.sqft.toLocaleString()} sqft</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                    onClick={() => setSelectedProperty(property.id)}
                  >
                    {t.viewDetails}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Benefits */}
      <section id="investment" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.whyInvest}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover the compelling reasons why Caribbean real estate represents one of the most attractive investment opportunities today
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {investmentBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="text-center p-8 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all duration-300"
              >
                <div className="text-5xl mb-6">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About MaalCa Properties */}
      <section id="about" className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-light mb-8">
                {t.aboutMaalCa}
              </h2>
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  MaalCa Properties represents the pinnacle of Caribbean real estate excellence. 
                  As part of the innovative MaalCa ecosystem, we bridge the gap between global investors 
                  and exclusive oceanfront opportunities.
                </p>
                <p>
                  Our curated portfolio features only the most exceptional properties, each offering 
                  unparalleled access to pristine beaches, crystal-clear waters, and the Caribbean lifestyle 
                  that discerning clients worldwide seek.
                </p>
                <p>
                  With deep local knowledge and a global perspective, we provide comprehensive support 
                  from initial consultation through property management, ensuring your investment 
                  delivers both financial returns and lifestyle fulfillment.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-light text-teal-400 mb-2">50+</div>
                  <div className="text-slate-400">Exclusive Properties</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-teal-400 mb-2">25+</div>
                  <div className="text-slate-400">Countries Represented</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-teal-400 mb-2">$50M+</div>
                  <div className="text-slate-400">Properties Sold</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-teal-400 mb-2">100%</div>
                  <div className="text-slate-400">Client Satisfaction</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-teal-500 rounded-3xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-70">
                  🏰
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-teal-500 text-white p-4 rounded-2xl shadow-lg"
              >
                <span className="text-2xl">🌊</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-blue-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <span className="text-2xl">☀️</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.contactTitle}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
              Our dedicated team of Caribbean real estate specialists is ready to help you 
              discover your perfect oceanfront sanctuary.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Schedule Call */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
              >
                <div className="text-5xl mb-6">📞</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t.scheduleCall}
                </h3>
                <p className="text-slate-600 mb-6">
                  Book a personalized consultation with our Caribbean property experts
                </p>
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  Book Consultation
                </Button>
              </motion.div>

              {/* WhatsApp */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
              >
                <div className="text-5xl mb-6">💬</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  WhatsApp
                </h3>
                <p className="text-slate-600 mb-6">
                  Get instant answers to your Caribbean real estate questions
                </p>
                <Button
                  variant="primary"
                  className="bg-green-500 hover:bg-green-600 text-white w-full"
                >
                  Chat Now
                </Button>
              </motion.div>
            </div>

            {/* Newsletter */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Exclusive Property Updates
              </h3>
              <p className="text-slate-600 mb-6">
                Receive notifications about new listings and exclusive investment opportunities
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-light mb-4">
                MaalCa <span className="text-teal-400">Properties</span>
              </h3>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Your gateway to exclusive Caribbean oceanfront properties. 
                Connecting global dreams with tropical reality.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#properties" className="block hover:text-teal-400 transition-colors">Properties</a>
                <a href="#investment" className="block hover:text-teal-400 transition-colors">Investment</a>
                <a href="#about" className="block hover:text-teal-400 transition-colors">About</a>
                <a href="#contact" className="block hover:text-teal-400 transition-colors">Contact</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-3">
                {[
                  { platform: "Instagram", emoji: "📷", color: "from-pink-500 to-purple-500" },
                  { platform: "LinkedIn", emoji: "💼", color: "from-blue-500 to-blue-600" },
                  { platform: "YouTube", emoji: "📺", color: "from-red-500 to-red-600" }
                ].map((social) => (
                  <a
                    key={social.platform}
                    href="#"
                    className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform`}
                  >
                    {social.emoji}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-slate-700">
            <p className="text-slate-400">
              © 2024 MaalCa Properties - Part of the MaalCa Ecosystem
            </p>
            <p className="text-slate-500 mt-2">
              Licensed Caribbean Real Estate • Serving Global Clients 🌎
            </p>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowContactForm(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-slate-900">Get in Touch</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Investment Range</option>
                    <option>$400K - $700K</option>
                    <option>$700K - $1M</option>
                    <option>$1M - $2M</option>
                    <option>$2M+</option>
                  </select>
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your ideal Caribbean property..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setSelectedProperty(null)}
            ></div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative min-h-screen flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
                {(() => {
                  const property = properties.find(p => p.id === selectedProperty);
                  if (!property) return null;
                  
                  return (
                    <>
                      {/* Property Header */}
                      <div className="relative aspect-[2/1] bg-gradient-to-br from-blue-500 to-teal-500">
                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-70">
                          🏖️
                        </div>
                        <button
                          onClick={() => setSelectedProperty(null)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-4 left-4">
                          <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
                          <p className="text-blue-100">{property.location}</p>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <div className="text-3xl font-light text-white">
                            From {formatPrice(property.priceFrom)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Content */}
                      <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">Property Details</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Bedrooms:</span>
                                <span className="font-medium">{property.bedrooms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Bathrooms:</span>
                                <span className="font-medium">{property.bathrooms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Square Feet:</span>
                                <span className="font-medium">{property.sqft.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Lot Size:</span>
                                <span className="font-medium">{property.lotSize}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                              {property.amenities.map(amenity => (
                                <span
                                  key={amenity}
                                  className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold text-slate-900 mb-4">Description</h3>
                          <p className="text-slate-600 leading-relaxed">{property.description}</p>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button
                            variant="primary"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Schedule Viewing
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white"
                          >
                            Virtual Tour
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <a
          href="https://wa.me/16071234567"
          className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300"
        >
          💬
        </a>
      </motion.div>
    </main>
  );
}