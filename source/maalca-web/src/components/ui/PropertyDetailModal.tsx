import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./buttons";
import PropertyGallery from "./PropertyGallery";

interface Property {
  id: string;
  name: string;
  location: string;
  priceFrom: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;
  type: string;
  amenities: string[];
  description: string;
  images: string[];
  status: string;
  featured: boolean;
}

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduleCall: () => void;
  t: (key: string) => string;
}

export default function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onScheduleCall,
  t
}: PropertyDetailModalProps) {
  if (!property) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="bg-white rounded-3xl shadow-2xl h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {property.name}
                  </h2>
                  <p className="text-slate-600 flex items-center mt-1">
                    <span className="mr-2">📍</span>
                    {property.location}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close"
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
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Gallery */}
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <PropertyGallery
                      images={property.images}
                      title={property.name}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Price and Status */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">
                        {t('properties.from')}
                      </div>
                      <div className="text-4xl font-light text-slate-900">
                        ${property.priceFrom.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">per square meter</div>
                    </div>
                    <div className="flex gap-3">
                      <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                        {property.type}
                      </span>
                      <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold">
                        {property.status}
                      </span>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-semibold text-slate-900">
                        {property.bedrooms}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {t('properties.bedrooms')}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-semibold text-slate-900">
                        {property.bathrooms}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {t('properties.bathrooms')}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-semibold text-slate-900">
                        {property.sqft.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Sq Ft</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-semibold text-slate-900">
                        {property.lotSize}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">Lot Size</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                      Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {property.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                      Amenities & Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investment Highlights */}
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h3 className="text-2xl font-semibold text-blue-900 mb-4">
                      Investment Highlights
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-blue-800">
                        <svg
                          className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Prime oceanfront location with direct beach access</span>
                      </li>
                      <li className="flex items-start gap-3 text-blue-800">
                        <svg
                          className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>High rental potential in premium tourism market</span>
                      </li>
                      <li className="flex items-start gap-3 text-blue-800">
                        <svg
                          className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Turnkey property with full property management available</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer - Sticky CTAs */}
              <div className="border-t border-slate-200 p-6 bg-white">
                <div className="max-w-6xl mx-auto flex gap-4 flex-col sm:flex-row">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onScheduleCall}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {t('properties.scheduleCall')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white font-bold"
                  >
                    {t('properties.virtualTour')}
                  </Button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors font-medium"
                  >
                    {t('properties.closeDetails')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
