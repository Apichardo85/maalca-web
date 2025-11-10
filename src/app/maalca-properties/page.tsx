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
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import PropertySkeleton from "@/components/ui/PropertySkeleton";
import PropertyDetailModal from "@/components/ui/PropertyDetailModal";

// Los datos ahora vienen de Umbraco o fallback

export default function MaalCaPropertiesPage() {
  const { t, language } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [filters, setFilters] = useState<PropertyFilter>({
    type: "All Properties",
    priceRange: "All Prices"
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [showConsultationBooking, setShowConsultationBooking] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });

  // Use new i18n hooks (convertir 'es'|'en' a string y luego de vuelta)
  const { properties, loading, error, getPropertyTypes, getPriceRanges } = usePropertiesI18n(language as "en" | "es");
  const { searchResult, searchProperties } = usePropertySearchI18n(language as "en" | "es");

  const investmentBenefits = [
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: t('properties.benefits.oceanfront.title'),
      description: t('properties.benefits.oceanfront.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: t('properties.benefits.roi.title'),
      description: t('properties.benefits.roi.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: t('properties.benefits.lifestyle.title'),
      description: t('properties.benefits.lifestyle.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('properties.benefits.accessibility.title'),
      description: t('properties.benefits.accessibility.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: t('properties.benefits.market.title'),
      description: t('properties.benefits.market.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('properties.benefits.support.title'),
      description: t('properties.benefits.support.description')
    }
  ];

  const testimonials = [
    {
      name: "Michael & Sarah Thompson",
      location: "Toronto, Canada",
      property: "Beachfront Villa, Punta Cana",
      rating: 5,
      text: language === 'es'
        ? "Encontrar nuestra villa frente al mar con MaalCa Properties fue un sueño hecho realidad. El equipo nos guió en cada paso, desde la primera visita hasta la gestión de alquileres. ¡Nuestra inversión se ha pagado sola en solo 3 años!"
        : "Finding our beachfront villa with MaalCa Properties was a dream come true. The team guided us through every step, from initial viewing to rental management. Our investment has paid for itself in just 3 years!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
    },
    {
      name: "Carlos Rodríguez",
      location: "Madrid, España",
      property: "Ocean View Condo, Las Terrenas",
      rating: 5,
      text: language === 'es'
        ? "Como inversor internacional, aprecié profundamente el conocimiento local de MaalCa y su red global. Aseguraron mi propiedad con vistas al océano a un precio excelente, y el proceso legal fue impecable. ¡Altamente recomendado!"
        : "As an international investor, I deeply appreciated MaalCa's local knowledge and global network. They secured my ocean-view property at an excellent price, and the legal process was seamless. Highly recommended!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    },
    {
      name: "Jennifer & Mark Wilson",
      location: "New York, USA",
      property: "Luxury Penthouse, Cap Cana",
      rating: 5,
      text: language === 'es'
        ? "Después de años de buscar la propiedad perfecta en el Caribe, finalmente encontramos nuestro penthouse de lujo a través de MaalCa. Su atención al detalle y servicio personalizado superó nuestras expectativas. ¡Esto es el paraíso!"
        : "After years of searching for the perfect Caribbean property, we finally found our luxury penthouse through MaalCa. Their attention to detail and personalized service exceeded our expectations. This is paradise!",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    }
  ];

  const formatPrice = (price: number) => {
    // For virgin land, show per square meter pricing
    return `$20 per sq meter`;
  };

  // Handle property detail view
  const handleViewDetails = (property: any) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleCloseModal = () => {
    setShowPropertyModal(false);
    setTimeout(() => setSelectedProperty(null), 300); // Clear after animation
  };

  // Handle Lead Magnet form submission
  const handleLeadMagnetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the data to your backend/CRM
    console.log('Lead Magnet Form Data:', leadFormData);

    // Simulate download (in production, you'd trigger actual PDF download)
    alert(language === 'es'
      ? '¡Gracias! Tu guía será descargada automáticamente.'
      : 'Thank you! Your guide will be downloaded automatically.'
    );

    // Close modal and reset form
    setShowLeadMagnetModal(false);
    setLeadFormData({ name: '', email: '', phone: '', country: '' });
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
                  animate={prefersReducedMotion ? {} : {
                    backgroundPosition: ["0% 0%", "100% 0%"],
                  }}
                  transition={prefersReducedMotion ? {} : {
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
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight">
              {t('properties.hero.title').split(" ").map((word, index) => (
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
              {t('properties.hero.subtitle')}
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
                {t('properties.hero.explore')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowContactForm(true)}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg"
              >
                {t('properties.hero.contact')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
          transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">{t('properties.hero.discover')}</span>
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#properties" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                {t('properties.nav.properties')}
              </a>
              <a href="#investment" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                {t('properties.nav.investment')}
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                {t('properties.nav.about')}
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                {t('properties.nav.contact')}
              </a>
              <LanguageToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-3">
                  <a
                    href="#properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('properties.nav.properties')}
                  </a>
                  <a
                    href="#investment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('properties.nav.investment')}
                  </a>
                  <a
                    href="#about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('properties.nav.about')}
                  </a>
                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('properties.nav.contact')}
                  </a>
                  <div className="px-4 pt-2">
                    <LanguageToggle />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              {t('properties.featured.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('properties.featured.subtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {loading ? (
              <PropertySkeleton count={3} />
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property, index) => (
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
                        <div className="flex justify-center mb-2">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="font-semibold">{t('properties.viewDetails')}</p>
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
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="text-3xl font-light text-slate-900">
                        {t('properties.from')} {formatPrice(property.priceFrom)}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-semibold text-slate-900">{property.bedrooms}</div>
                        <div className="text-sm text-slate-600">{t('properties.bedrooms')}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-semibold text-slate-900">{property.bathrooms}</div>
                        <div className="text-sm text-slate-600">{t('properties.bathrooms')}</div>
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
                        onClick={() => handleViewDetails(property)}
                      >
                        {t('properties.viewDetails')}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white"
                      >
                        {t('properties.virtualTour')}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-600 text-lg">No properties available</p>
              </div>
            )}
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
              {t('properties.all.title')}
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
            {/* Results Counter */}
            <div className="mb-4 text-sm text-slate-600">
              {t('properties.filters.showing')} <span className="font-semibold text-slate-900">{filteredProperties.length}</span> {t('properties.filters.of')} <span className="font-semibold text-slate-900">{properties.length}</span> {t('properties.filters.properties')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('properties.filters.type')}
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('properties.filters.price')}
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  {t('properties.filters.clear')}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Interactive List with Map */}
          <LazyPropertyMap
            properties={filteredProperties}
            onPropertySelect={(property) => handleViewDetails(property)}
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
              {t('properties.investment.title')}
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
                <div className="flex justify-center mb-6">{benefit.icon}</div>
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

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t('properties.testimonials.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('properties.testimonials.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 flex-shrink-0">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {testimonial.location}
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                      {testimonial.property}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-4xl font-light text-blue-600 mb-2">100+</div>
              <div className="text-slate-600">{language === 'es' ? 'Clientes Satisfechos' : 'Happy Clients'}</div>
            </div>
            <div>
              <div className="text-4xl font-light text-teal-600 mb-2">$100M+</div>
              <div className="text-slate-600">{language === 'es' ? 'En Transacciones' : 'In Transactions'}</div>
            </div>
            <div>
              <div className="text-4xl font-light text-purple-600 mb-2">15+</div>
              <div className="text-slate-600">{language === 'es' ? 'Años de Experiencia' : 'Years Experience'}</div>
            </div>
            <div>
              <div className="text-4xl font-light text-orange-600 mb-2">98%</div>
              <div className="text-slate-600">{language === 'es' ? 'Tasa de Satisfacción' : 'Satisfaction Rate'}</div>
            </div>
          </motion.div>
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
                {t('properties.about.title')}
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
                <div className="w-full h-full flex items-center justify-center opacity-70">
                  <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-teal-500 text-white p-4 rounded-2xl shadow-lg"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12.95L5.5 11l5.5 4.5L21.5 3v18H2v-8.05zm1.47-7.45c2.13-1.07 4.45-1.97 6.74-2.5 2.29-.53 4.53-.7 6.73-.46 2.2.23 4.27.83 6.33 1.76v3.48c-2.06-.92-4.13-1.53-6.33-1.76-2.2-.24-4.44-.07-6.73.46-2.29.53-4.61 1.43-6.74 2.5V5.5z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-blue-600 text-white p-4 rounded-2xl shadow-lg"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-teal-600 to-blue-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Text & Features */}
              <div className="text-white">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-block bg-yellow-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                    {language === 'es' ? '📚 DESCARGA GRATUITA' : '📚 FREE DOWNLOAD'}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {t('properties.leadMagnet.title')}
                  </h2>
                  <p className="text-2xl font-light text-blue-100 mb-6">
                    {t('properties.leadMagnet.subtitle')}
                  </p>
                  <p className="text-lg text-blue-50 mb-8">
                    {t('properties.leadMagnet.description')}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      t('properties.leadMagnet.feature1'),
                      t('properties.leadMagnet.feature2'),
                      t('properties.leadMagnet.feature3'),
                      t('properties.leadMagnet.feature4')
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <svg className="w-6 h-6 text-teal-300 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-lg">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Button
                    variant="primary"
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    onClick={() => setShowLeadMagnetModal(true)}
                  >
                    {t('properties.leadMagnet.cta')} →
                  </Button>
                </motion.div>
              </div>

              {/* Right Column: Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex flex-col items-center justify-center p-6">
                    <svg className="w-24 h-24 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="text-center">
                      <p className="text-slate-900 font-bold text-xl mb-2">
                        {language === 'es' ? 'GUÍA DE INVERSIÓN' : 'INVESTMENT GUIDE'}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {language === 'es' ? '30 Páginas | PDF' : '30 Pages | PDF'}
                      </p>
                      <p className="text-blue-600 font-semibold mt-4 text-lg">
                        {language === 'es' ? 'Valorado en $49' : 'Worth $49'}
                      </p>
                      <p className="text-emerald-600 font-bold text-2xl">
                        {language === 'es' ? '¡GRATIS!' : 'FREE!'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lead Magnet Modal */}
      <AnimatePresence>
        {showLeadMagnetModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadMagnetModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 relative">
                  <button
                    onClick={() => setShowLeadMagnetModal(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-2xl font-bold mb-2">
                    {t('properties.leadMagnet.modal.title')}
                  </h3>
                  <p className="text-blue-100">
                    {t('properties.leadMagnet.modal.subtitle')}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLeadMagnetSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('properties.leadMagnet.modal.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'es' ? 'Juan Pérez' : 'John Doe'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('properties.leadMagnet.modal.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="juan@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('properties.leadMagnet.modal.phone')}
                    </label>
                    <input
                      type="tel"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('properties.leadMagnet.modal.country')}
                    </label>
                    <input
                      type="text"
                      value={leadFormData.country}
                      onChange={(e) => setLeadFormData({ ...leadFormData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'es' ? 'España' : 'United States'}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg"
                    >
                      {t('properties.leadMagnet.modal.download')}
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500 text-center pt-2">
                    {t('properties.leadMagnet.modal.privacy')}
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t('properties.contact.title')}
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
                <div className="flex justify-center mb-6">
                  <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t('properties.scheduleCall')}
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
                <div className="flex justify-center mb-6">
                  <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
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
                {t('properties.footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('properties.footer.quickLinks')}</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#properties" className="block hover:text-teal-400 transition-colors">{t('properties.nav.properties')}</a>
                <a href="#investment" className="block hover:text-teal-400 transition-colors">{t('properties.nav.investment')}</a>
                <a href="#about" className="block hover:text-teal-400 transition-colors">{t('properties.nav.about')}</a>
                <a href="#contact" className="block hover:text-teal-400 transition-colors">{t('properties.nav.contact')}</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('properties.footer.connect')}</h4>
              <div className="flex gap-3">
                {[
                  {
                    platform: "Instagram",
                    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
                    color: "from-pink-500 to-purple-500"
                  },
                  {
                    platform: "LinkedIn",
                    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                    color: "from-blue-500 to-blue-600"
                  },
                  {
                    platform: "YouTube",
                    icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                    color: "from-red-500 to-red-600"
                  }
                ].map((social) => (
                  <a
                    key={social.platform}
                    href="#"
                    className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-slate-700">
            <p className="text-slate-400">
              {t('properties.footer.copyright')}
            </p>
            <p className="text-slate-500 mt-2 flex items-center justify-center gap-2">
              {t('properties.footer.license')}
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
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
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={showPropertyModal}
        onClose={handleCloseModal}
        onScheduleCall={() => {
          handleCloseModal();
          setShowConsultationBooking(true);
        }}
        t={t}
      />

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
        language={language}
      />
    </main>
  );
}