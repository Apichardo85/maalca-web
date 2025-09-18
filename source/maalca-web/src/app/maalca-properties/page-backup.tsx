"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { usePropertiesI18n, usePropertySearchI18n } from "@/hooks/usePropertiesI18n";
import ConsultationBooking from "@/components/ui/ConsultationBooking";
import WhatsAppIntegration from "@/components/ui/WhatsAppIntegration";
import PropertyNewsletterSubscription from "@/components/ui/PropertyNewsletterSubscription";
import { PropertyFilter } from "@/lib/types/property";
import PropertyGallery from "@/components/ui/PropertyGallery";
import LazyPropertyMap from "@/components/ui/LazyPropertyMap";

// Los datos ahora vienen de Umbraco o fallback

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
  const [filters, setFilters] = useState<PropertyFilter>({
    type: "All Properties",
    priceRange: "All Prices"
  });
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showConsultationBooking, setShowConsultationBooking] = useState(false);
  
  // Use new i18n hooks
  const { properties, loading, error, getPropertyTypes, getPriceRanges } = usePropertiesI18n(language);
  const { searchResult, searchProperties } = usePropertySearchI18n(language);

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

  // Filter properties when filters change
  useEffect(() => {
    if (properties.length > 0) {
      searchProperties(filters);
    }
  }, [filters, properties]);
  
  const filteredProperties = (searchResult?.properties?.length > 0) ? searchResult.properties : properties;
  const featuredProperties = properties.filter(property => property.featured);
  
  // Types dinámicos desde Umbraco o fallback (ya traducidos)
  const propertyTypes = (searchResult.filters?.availableTypes?.length > 0) 
    ? searchResult.filters.availableTypes 
    : getPropertyTypes();
    
  const priceRanges = (searchResult.filters?.priceRanges?.length > 0)
    ? searchResult.filters.priceRanges
    : getPriceRanges();

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
                    <PropertyGallery 
                      images={property.images} 
                      title={property.name}
                      className="w-full h-full"
                    />
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

      {/* Interactive Properties with Map */}
      <section className="py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.allProperties}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore our exclusive properties with interactive map and detailed listings
            </p>
          </motion.div>
          
          {/* Enhanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ type: propertyTypes[0], priceRange: priceRanges[0] })}
                  className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>

          {/* Interactive List with Map */}
          <LazyPropertyMap
            properties={filteredProperties}
            onPropertySelect={(property) => setSelectedProperty(property.id)}
            language={language}
          />
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
                  onClick={() => setShowConsultationBooking(true)}
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
                <WhatsAppIntegration
                  phoneNumber="+18491234567"
                  businessName="MaalCa Properties"
                  defaultMessage="Hi! I'm interested in your Caribbean properties and would like more information."
                  className="w-full"
                />
              </motion.div>
            </div>

            {/* Newsletter */}
            <PropertyNewsletterSubscription
              title="Exclusive Property Updates"
              description="Receive notifications about new listings and exclusive investment opportunities"
              buttonText="Subscribe"
            />
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
                        <PropertyGallery 
                          images={property.images} 
                          title={property.name}
                          className="w-full h-full"
                        />
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
        <WhatsAppIntegration
          phoneNumber="+18491234567"
          businessName="MaalCa Properties"
          defaultMessage="Hi! I saw your website and I'm interested in Caribbean properties. Can you help me?"
          className="w-16 h-16"
        />
      </motion.div>

      {/* Consultation Booking Modal */}
      <ConsultationBooking
        isOpen={showConsultationBooking}
        onClose={() => setShowConsultationBooking(false)}
      />
    </main>
  );
}