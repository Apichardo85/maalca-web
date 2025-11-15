'use client';

import { motion } from 'framer-motion';
import type { Bundle } from '@/lib/types/commerce.types';

interface BundleCardProps {
  bundle: Bundle;
  onSelect: (bundle: Bundle) => void;
  language?: 'es' | 'en';
  brandColor?: string;
}

export function BundleCard({
  bundle,
  onSelect,
  language = 'es',
  brandColor = 'red-600'
}: BundleCardProps) {
  const name = language === 'es' ? bundle.name : bundle.nameEn;
  const description = language === 'es' ? bundle.description : bundle.descriptionEn;
  const savingsPercent = Math.round((bundle.savings / bundle.regularPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border-2 ${
        bundle.popular ? `border-${brandColor}` : 'border-gray-700'
      } transition-all`}
    >
      {/* Popular Badge */}
      {bundle.popular && (
        <div className={`absolute top-0 right-0 bg-${brandColor} text-white px-4 py-1 text-xs font-bold z-10`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}
        >
          {language === 'es' ? 'POPULAR' : 'POPULAR'}
        </div>
      )}

      {/* Savings Badge */}
      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
        {language === 'es' ? 'Ahorra' : 'Save'} {savingsPercent}%
      </div>

      <div className="p-6 space-y-4">
        {/* Icon/Emoji */}
        <div className="text-6xl">🎁</div>

        {/* Name */}
        <div>
          <h3 className="text-white text-2xl font-bold">{name}</h3>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>

        {/* Items Included */}
        <div className="space-y-2">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
            {language === 'es' ? 'Incluye:' : 'Includes:'}
          </p>
          {bundle.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className={`text-${brandColor} mt-1`}>✓</span>
              <span className="text-gray-300 text-sm">
                {language === 'es' ? item.name : item.nameEn}
                {item.quantity && item.quantity > 1 && ` (x${item.quantity})`}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-3xl font-bold">
              ${bundle.bundlePrice.toFixed(2)}
            </span>
            <span className="text-gray-500 text-lg line-through">
              ${bundle.regularPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-green-500 text-sm font-medium mt-1">
            {language === 'es' ? 'Ahorras' : 'You save'} ${bundle.savings.toFixed(2)}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(bundle)}
          className={`w-full bg-${brandColor} text-white py-3 rounded-md font-bold hover:bg-${brandColor}/90 transition-all hover:scale-[1.02]`}
        >
          {language === 'es' ? 'Agregar Bundle' : 'Add Bundle'}
        </button>
      </div>
    </motion.div>
  );
}
