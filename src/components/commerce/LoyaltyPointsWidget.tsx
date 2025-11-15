'use client';

import { motion } from 'framer-motion';
import type { LoyaltyPoints } from '@/lib/types/commerce.types';

interface LoyaltyPointsWidgetProps {
  points: LoyaltyPoints;
  language?: 'es' | 'en';
  brandColor?: string;
  onViewDetails?: () => void;
}

const tierColors = {
  bronze: 'orange-600',
  silver: 'gray-400',
  gold: 'yellow-500',
  platinum: 'purple-500'
};

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
};

export function LoyaltyPointsWidget({
  points,
  language = 'es',
  brandColor = 'red-600',
  onViewDetails
}: LoyaltyPointsWidgetProps) {
  const tierColor = tierColors[points.tier];
  const tierIcon = tierIcons[points.tier];
  const progressPercent = points.nextTierPoints > 0
    ? 100 - ((points.nextTierPoints / (points.lifetimeEarned + points.nextTierPoints)) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">
            {language === 'es' ? 'Puntos Quisqueya' : 'Quisqueya Points'}
          </h3>
          <p className="text-gray-400 text-sm">
            {language === 'es' ? 'Tier' : 'Tier'}: <span className={`text-${tierColor} font-medium uppercase`}>
              {points.tier} {tierIcon}
            </span>
          </p>
        </div>
        <div className={`text-4xl`}>
          {tierIcon}
        </div>
      </div>

      {/* Points Balance */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className={`text-${brandColor} text-5xl font-bold`}>
            {points.currentBalance.toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">
            {language === 'es' ? 'puntos' : 'points'}
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          {language === 'es'
            ? `${(points.currentBalance / 100).toFixed(2)} USD en descuentos disponibles`
            : `${(points.currentBalance / 100).toFixed(2)} USD in discounts available`}
        </p>
      </div>

      {/* Progress to Next Tier */}
      {points.tier !== 'platinum' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">
              {language === 'es' ? 'Progreso al siguiente nivel' : 'Progress to next tier'}
            </span>
            <span className="text-gray-300 font-medium">
              {points.nextTierPoints.toLocaleString()} {language === 'es' ? 'más' : 'more'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`bg-${tierColor} h-3 rounded-full`}
            />
          </div>
        </div>
      )}

      {/* Lifetime Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div>
          <p className="text-gray-400 text-xs">
            {language === 'es' ? 'Ganados' : 'Earned'}
          </p>
          <p className="text-white font-bold">
            {points.lifetimeEarned.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">
            {language === 'es' ? 'Usados' : 'Redeemed'}
          </p>
          <p className="text-white font-bold">
            {points.lifetimeRedeemed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expiring Points Alert */}
      {points.expiringPoints && (
        <div className="mt-4 bg-orange-900/30 border border-orange-700 rounded-lg p-3">
          <p className="text-orange-400 text-xs">
            ⚠️ {points.expiringPoints.amount} {language === 'es' ? 'puntos expiran el' : 'points expire on'} {new Date(points.expiringPoints.expiryDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className={`w-full mt-4 bg-${brandColor} text-white py-2 rounded-md text-sm font-medium hover:bg-${brandColor}/90 transition-colors`}
        >
          {language === 'es' ? 'Ver Historial' : 'View History'}
        </button>
      )}
    </motion.div>
  );
}
