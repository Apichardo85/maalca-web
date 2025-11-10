import { motion } from "framer-motion";

interface PropertySkeletonProps {
  count?: number;
}

export default function PropertySkeleton({ count = 6 }: PropertySkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200"
        >
          {/* Image Skeleton */}
          <div className="aspect-[4/3] bg-slate-200 animate-pulse relative">
            <div className="absolute top-4 left-4">
              <div className="bg-slate-300 h-6 w-24 rounded-full animate-pulse" />
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-slate-300 h-6 w-20 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-8 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="bg-slate-200 h-6 w-3/4 rounded animate-pulse" />
              <div className="bg-slate-100 h-4 w-1/2 rounded animate-pulse" />
            </div>

            {/* Price */}
            <div className="bg-slate-200 h-8 w-32 rounded animate-pulse" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="bg-slate-200 h-6 w-8 mx-auto mb-2 rounded animate-pulse" />
                  <div className="bg-slate-100 h-3 w-16 mx-auto rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="bg-slate-100 h-3 w-full rounded animate-pulse" />
              <div className="bg-slate-100 h-3 w-full rounded animate-pulse" />
              <div className="bg-slate-100 h-3 w-2/3 rounded animate-pulse" />
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 h-6 w-16 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-200 h-10 rounded-lg animate-pulse" />
              <div className="flex-1 bg-slate-100 h-10 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
