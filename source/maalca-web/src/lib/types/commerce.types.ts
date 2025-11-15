// ============================================
// COMMERCE TYPES - Sistema E-commerce Reutilizable
// Usado por: Pegote Barber, Dr. Pichardo, BritoColor, etc.
// ============================================

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  compareAtPrice?: number; // Precio original si hay descuento
  images: string[];
  category: ProductCategory;
  brand?: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
}

export type ProductCategory =
  | 'hair-care'
  | 'beard-care'
  | 'accessories'
  | 'merch'
  | 'medical-supplies'
  | 'design-services'
  | 'bundles';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface ProductVariant {
  id: string;
  name: string;
  nameEn: string;
  priceModifier: number; // +/- al precio base
  available: boolean;
}

export interface ShoppingCart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Bundle {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  items: BundleItem[];
  regularPrice: number;
  bundlePrice: number;
  savings: number;
  image: string;
  popular?: boolean;
  category: string;
}

export interface BundleItem {
  type: 'service' | 'product';
  id: string;
  name: string;
  nameEn: string;
  price: number;
  quantity?: number;
}

export interface LoyaltyPoints {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: LoyaltyTier;
  nextTierPoints: number;
  expiringPoints?: {
    amount: number;
    expiryDate: Date;
  };
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PointsTransaction {
  id: string;
  date: Date;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  reason: string;
  reasonEn: string;
  relatedOrderId?: string;
}

export interface Reward {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  pointsCost: number;
  value: number; // Valor en dólares
  type: 'discount' | 'free-service' | 'free-product' | 'upgrade';
  available: boolean;
  image?: string;
}

export interface VIPSubscription {
  tier: 'bronze' | 'silver' | 'gold';
  price: number;
  benefits: VIPBenefit[];
  discountServices: number; // Porcentaje
  discountProducts: number; // Porcentaje
  freeServicesPerMonth: number;
  pointsMultiplier: number; // 1x, 2x, 3x
  priorityBooking: boolean;
  freeShipping: boolean;
  birthdayGift: boolean;
  conciergeSupport: boolean;
}

export interface VIPBenefit {
  name: string;
  nameEn: string;
  icon: string;
  included: boolean;
}

export interface BeforeAfterImage {
  id: string;
  before: string;
  after: string;
  category: string;
  barberOrProvider: string;
  date: Date;
  description?: string;
  descriptionEn?: string;
}

export interface QuickShopConfig {
  businessName: string;
  businessColor: string; // Tailwind class like 'red-600'
  whatsappNumber: string;
  currency: string; // 'USD', 'DOP', etc.
}
