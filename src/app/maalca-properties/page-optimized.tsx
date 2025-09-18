"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { usePropertyFiltersUrl } from "@/hooks/useUrlState";
import { useOptimizedProperties } from "@/hooks/useOptimizedProperties";
import ConsultationBooking from "@/components/ui/ConsultationBooking";
import WhatsAppIntegration from "@/components/ui/WhatsAppIntegration";
import PropertyNewsletterSubscription from "@/components/ui/PropertyNewsletterSubscription";
import PropertyCardOptimized from "@/components/ui/PropertyCardOptimized";
import PropertyMapPlaceholder from "@/components/ui/PropertyMapPlaceholder";
import {
  PropertyListSkeleton,
  PropertyMapSkeleton,
  LoadingSpinner,
  ErrorState,
  EmptyState
} from "@/components/ui/PropertyLoadingStates";

// Hero section component
function HeroSection({ language, onExplore, onContact }: {
  language: 'en' | 'es';
  onExplore: () => void;
  onContact: () => void;
}) {
  const translations = {
    en: {
      heroTitle: "Your Gateway to Caribbean Paradise",
      heroSubtitle: "Exclusive oceanfront properties where dreams meet reality",
      exploreProperties: "Explore Properties",
      contactUs: "Contact Us"
    },
    es: {
      heroTitle: "Tu Puerta al Paraíso Caribeño",
      heroSubtitle: "Propiedades exclusivas frente al océano donde los sueños se hacen realidad",
      exploreProperties: "Explorar Propiedades",
      contactUs: "Contáctanos"
    }
  };

  const t = translations[language];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-b from-blue-900/20 via-teal-900/30 to-blue-900/40 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-500 to-blue-800">
            <motion.div
              animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-0 w-full h-32 opacity-20"
              style={{
                backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjAwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMEMyNSAxMCA3NSAzMCAxMDAgMjBDMTI1IDEwIDE3NSAzMCAyMDAgMjBWMzJIMFYyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=')",
                backgroundRepeat: "repeat-x",
                backgroundSize: "200px 32px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight">
            {t.heroTitle.split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-2xl font-light mb-12 text-blue-100 max-w-3xl mx-auto"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onExplore}
              className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
            >
              {t.exploreProperties}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onContact}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg"
            >
              {t.contactUs}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Property filters component
function PropertyFilters({ language, filters, updateFilter, availableTypes, availablePriceRanges, onReset }: {
  language: 'en' | 'es';
  filters: any;
  updateFilter: any;
  availableTypes: string[];
  availablePriceRanges: string[];
  onReset: () => void;
}) {
  const translations = {
    en: { propertyType: "Property Type", priceRange: "Price Range", clearFilters: "Clear Filters" },
    es: { propertyType: "Tipo de Propiedad", priceRange: "Rango de Precio", clearFilters: "Limpiar Filtros" }
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.propertyType}</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.priceRange}</label>
          <select
            value={filters.priceRange}
            onChange={(e) => updateFilter('priceRange', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {availablePriceRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// View controls component
function ViewControls({ view, onViewChange, language }: {
  view: 'list' | 'map' | 'split';
  onViewChange: (view: 'list' | 'map' | 'split') => void;
  language: 'en' | 'es';
}) {
  const translations = {
    en: { viewList: "List View", viewMap: "Map View", viewSplit: "Split View" },
    es: { viewList: "Vista Lista", viewMap: "Vista Mapa", viewSplit: "Vista Dividida" }
  };

  const t = translations[language];

  const views = [
    { key: 'list' as const, label: t.viewList, icon: '📋' },
    { key: 'split' as const, label: t.viewSplit, icon: '⚏' },
    { key: 'map' as const, label: t.viewMap, icon: '🗺️' }
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        {views.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MaalCaPropertiesPageOptimized() {
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showConsultationBooking, setShowConsultationBooking] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // URL-based state management
  const { filters, updateFilter, resetFilters } = usePropertyFiltersUrl(language);

  // Optimized data fetching
  const { data, isLoading, error, refetch } = useOptimizedProperties({
    language,
    filters,
    enabled: true
  });

  // Memoized callbacks
  const handlePropertySelect = useCallback((property: any) => {
    setSelectedProperty(property.id);
    updateFilter('selectedId', property.id);
  }, [updateFilter]);

  const handlePropertyHover = useCallback((property: any) => {
    setHoveredProperty(property?.id || null);
  }, []);

  const scrollToProperties = useCallback(() => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Investment benefits data (memoized)
  const investmentBenefits = useMemo(() => [
    {
      icon: "🏖️",
      title: language === 'en' ? "Prime Oceanfront Locations" : "Ubicaciones Privilegiadas Frente al Mar",
      description: language === 'en'
        ? "Exclusive properties with direct beach access and unobstructed ocean views"
        : "Propiedades exclusivas con acceso directo a la playa y vistas despejadas al océano"
    },
    {
      icon: "📈",
      title: language === 'en' ? "Strong ROI Potential" : "Alto Potencial de ROI",
      description: language === 'en'
        ? "Caribbean real estate has shown consistent growth and high rental yields"
        : "Los bienes raíces caribeños han mostrado crecimiento constante y altos rendimientos de alquiler"
    },
    {
      icon: "🌴",
      title: language === 'en' ? "Tropical Lifestyle" : "Estilo de Vida Tropical",
      description: language === 'en'
        ? "Year-round paradise living with world-class amenities and natural beauty"
        : "Vida paradisíaca todo el año con amenidades de clase mundial y belleza natural"
    }
  ], [language]);

  const translations = {
    en: {
      featuredProperties: "Featured Properties",
      allProperties: "All Properties",
      whyInvest: "Why Invest in Caribbean Real Estate",
      propertiesFound: "Properties Found",
      contactTitle: "Ready to Find Your Paradise?",
      scheduleCall: "Schedule a Call"
    },
    es: {
      featuredProperties: "Propiedades Destacadas",
      allProperties: "Todas las Propiedades",
      whyInvest: "Por Qué Invertir en Bienes Raíces Caribeños",
      propertiesFound: "Propiedades Encontradas",
      contactTitle: "¿Listo para Encontrar tu Paraíso?",
      scheduleCall: "Agendar Llamada"
    }
  };

  const t = translations[language];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <HeroSection
        language={language}
        onExplore={scrollToProperties}
        onContact={() => setShowContactForm(true)}
      />

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold text-gray-800">
              MaalCa <span className="font-light">Properties</span>
            </span>
            <button
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
            >
              {language === "en" ? "ES" : "EN"}
            </button>
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

          <Suspense fallback={<PropertyListSkeleton count={1} />}>
            {error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : isLoading ? (
              <PropertyListSkeleton count={1} />
            ) : data.featured.length === 0 ? (
              <EmptyState
                message="No featured properties available at the moment"
                action={refetch}
                actionLabel="Refresh"
              />
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {data.featured.map((property, index) => (
                  <PropertyCardOptimized
                    key={property.id}
                    property={property}
                    index={index}
                    isSelected={selectedProperty === property.id}
                    isHovered={hoveredProperty === property.id}
                    onSelect={handlePropertySelect}
                    onHover={handlePropertyHover}
                    language={language}
                  />
                ))}
              </div>
            )}
          </Suspense>
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

          {/* Filters */}
          <PropertyFilters
            language={language}
            filters={filters}
            updateFilter={updateFilter}
            availableTypes={data.availableTypes}
            availablePriceRanges={data.availablePriceRanges}
            onReset={resetFilters}
          />

          {/* View Controls */}
          <ViewControls
            view={filters.view}
            onViewChange={(view) => updateFilter('view', view)}
            language={language}
          />

          {/* Properties Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property List */}
            {(filters.view === 'list' || filters.view === 'split') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`space-y-6 ${filters.view === 'list' ? 'lg:col-span-2' : ''}`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {data.total} {t.propertiesFound}
                </h3>

                <Suspense fallback={<PropertyListSkeleton />}>
                  {error ? (
                    <ErrorState message={error} onRetry={refetch} />
                  ) : isLoading ? (
                    <PropertyListSkeleton />
                  ) : data.properties.length === 0 ? (
                    <EmptyState
                      message="No properties match your current filters"
                      action={resetFilters}
                      actionLabel="Clear Filters"
                    />
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {data.properties.map((property, index) => (
                        <PropertyCardOptimized
                          key={property.id}
                          property={property}
                          index={index}
                          isSelected={selectedProperty === property.id}
                          isHovered={hoveredProperty === property.id}
                          onSelect={handlePropertySelect}
                          onHover={handlePropertyHover}
                          language={language}
                        />
                      ))}
                    </div>
                  )}
                </Suspense>
              </motion.div>
            )}

            {/* Map */}
            {(filters.view === 'map' || filters.view === 'split') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${filters.view === 'map' ? 'lg:col-span-2' : ''}`}
              >
                <div className="sticky top-4">
                  <Suspense fallback={<PropertyMapSkeleton />}>
                    {isLoading ? (
                      <PropertyMapSkeleton />
                    ) : (
                      <PropertyMapPlaceholder
                        properties={data.properties}
                        selectedProperty={selectedProperty}
                        onPropertySelect={handlePropertySelect}
                        height="600px"
                        className="shadow-lg border border-gray-200"
                      />
                    )}
                  </Suspense>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Investment Benefits */}
      <section className="py-24 bg-white">
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
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {investmentBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
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

      {/* Contact Section */}
      <section className="py-24 bg-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
              {t.contactTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
              >
                <div className="text-5xl mb-6">📞</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t.scheduleCall}
                </h3>
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => setShowConsultationBooking(true)}
                >
                  Book Consultation
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
              >
                <div className="text-5xl mb-6">💬</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  WhatsApp
                </h3>
                <WhatsAppIntegration
                  phoneNumber="+18491234567"
                  businessName="MaalCa Properties"
                  defaultMessage="Hi! I'm interested in your Caribbean properties."
                  className="w-full"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <ConsultationBooking
        isOpen={showConsultationBooking}
        onClose={() => setShowConsultationBooking(false)}
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
          defaultMessage="Hi! I saw your website and I'm interested in Caribbean properties."
          className="w-16 h-16"
        />
      </motion.div>
    </main>
  );
}