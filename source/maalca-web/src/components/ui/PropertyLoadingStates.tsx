"use client";

import { motion } from 'framer-motion';

// Skeleton for property cards
export function PropertyCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-4"
    >
      <div className="flex gap-4">
        {/* Image skeleton */}
        <div className="flex-shrink-0 w-32 h-24 rounded-lg bg-gray-200 animate-pulse" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '70%' }} />
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '50%' }} />
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-1" style={{ width: '80px' }} />
              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }} />
            </div>
          </div>

          {/* Details skeleton */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }} />
            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }} />
            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }} />
          </div>

          {/* Amenities skeleton */}
          <div className="flex flex-wrap gap-1 mb-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 bg-gray-200 rounded-full animate-pulse"
                style={{ width: `${60 + i * 20}px` }}
              />
            ))}
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }} />
            <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton for featured property cards (big beautiful cards)
export function FeaturedPropertyCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
    >
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200 animate-pulse relative">
        <div className="absolute top-4 left-4 w-20 h-6 bg-gray-300 rounded-full animate-pulse" />
        <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="p-8">
        {/* Title and location */}
        <div className="mb-4">
          <div className="h-7 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '80%' }} />
          <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '60%' }} />
        </div>

        {/* Price and featured */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }} />
          <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${60 + i * 15}px` }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }} />
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton for property list
export function PropertyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// Skeleton for featured properties grid
export function FeaturedPropertiesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <FeaturedPropertyCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// Skeleton for map
export function PropertyMapSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-teal-400 to-blue-500 opacity-30 animate-pulse" />

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-900">Loading map...</div>
          <div className="text-xs text-gray-600">Preparing property locations</div>
        </div>
      </div>

      {/* Placeholder markers */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.2, type: "spring" }}
          className="absolute w-6 h-6 bg-gray-300 rounded-full animate-pulse"
          style={{
            left: `${30 + i * 20}%`,
            top: `${40 + i * 10}%`
          }}
        />
      ))}
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div
        className={`border-4 border-blue-500 border-t-transparent rounded-full animate-spin ${sizeClasses[size]}`}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

// Error state component
export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Try again'
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-200">
      <div className="text-6xl mb-4">😟</div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-700 text-center mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  message,
  action,
  actionLabel
}: {
  message: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-gray-200">
      <div className="text-6xl mb-4">🏖️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
      <p className="text-gray-600 text-center mb-4 max-w-md">{message}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}