"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";

export interface AffiliateService {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price?: number;
  priceRange?: { min: number; max: number };
  duration?: string;
  icon?: string;
  popular?: boolean;
  image?: string;
}

interface AffiliateServiceCardProps {
  service: AffiliateService;
  onBook?: (serviceId: string) => void;
  language?: 'es' | 'en';
  index?: number;
  variant?: 'default' | 'medical' | 'barber' | 'design';
}

export function AffiliateServiceCard({
  service,
  onBook,
  language = 'es',
  index = 0,
  variant = 'default'
}: AffiliateServiceCardProps) {
  const getText = (es: string, en?: string) =>
    language === 'en' && en ? en : es;

  const variantStyles = {
    default: "from-blue-50 to-white border-blue-100 hover:border-blue-300",
    medical: "from-blue-50 to-green-50 border-blue-100 hover:border-green-300",
    barber: "from-blue-50 to-red-50 border-gray-200 hover:border-blue-300",
    design: "from-purple-50 to-pink-50 border-purple-100 hover:border-purple-300"
  };

  const buttonStyles = {
    default: "bg-blue-600 hover:bg-blue-700",
    medical: "bg-green-600 hover:bg-green-700",
    barber: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    design: "bg-purple-600 hover:bg-purple-700"
  };

  const renderPrice = () => {
    if (service.priceRange) {
      return (
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">
            {language === 'es' ? 'Sugerido' : 'Suggested'}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${service.priceRange.min} - ${service.priceRange.max}
          </div>
        </div>
      );
    }

    if (service.price) {
      return (
        <div className="text-center">
          <div className="text-3xl font-black text-blue-600">
            ${service.price}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-lg font-bold text-gray-600">
          {language === 'es' ? 'Cotización' : 'Quote'}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group cursor-pointer relative"
    >
      <div className={`bg-gradient-to-br ${variantStyles[variant]} rounded-3xl p-6 md:p-8 border-2 transition-all duration-500 shadow-lg hover:shadow-2xl h-full flex flex-col`}>
        {service.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
              {language === 'es' ? 'MÁS POPULAR' : 'MOST POPULAR'}
            </span>
          </div>
        )}

        <div className="text-center mb-6 flex-grow">
          {service.icon && (
            <div className="text-5xl md:text-6xl mb-4">{service.icon}</div>
          )}

          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {getText(service.name, service.nameEn)}
          </h3>

          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            {getText(service.description, service.descriptionEn)}
          </p>

          {service.duration && (
            <div className="mt-3 text-sm text-gray-500">
              ⏱️ {service.duration}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {renderPrice()}

          {onBook && (
            <Button
              variant="primary"
              onClick={() => onBook(service.id)}
              className={`w-full ${buttonStyles[variant]} text-white font-bold px-6 py-3`}
            >
              {language === 'es' ? 'Reservar' : 'Book Now'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
