// src/lib/plan-limits.ts
export type Plan = 'free' | 'entrepreneur';

export interface PlanLimits {
  businesses: number;
  itemsPerBusiness: number;
  imagesPerItem: number;
  customCategories: boolean;
  onlinePayments: boolean;
  bookingCalendar: boolean;
  realtimeStock: boolean;
  menuModifiers: boolean;
  brandingFull: boolean;
  customDomain: boolean;
  hidePoweredBy: boolean;
  warningThresholdItems: number;
}

const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    businesses: 1,
    itemsPerBusiness: 10,
    imagesPerItem: 1,
    customCategories: false,
    onlinePayments: false,
    bookingCalendar: false,
    realtimeStock: false,
    menuModifiers: false,
    brandingFull: false,
    customDomain: false,
    hidePoweredBy: false,
    warningThresholdItems: 7,
  },
  entrepreneur: {
    businesses: Infinity,
    itemsPerBusiness: Infinity,
    imagesPerItem: 5,
    customCategories: true,
    onlinePayments: true,
    bookingCalendar: true,
    realtimeStock: true,
    menuModifiers: true,
    brandingFull: true,
    customDomain: true,
    hidePoweredBy: true,
    warningThresholdItems: Infinity,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return LIMITS[plan];
}

export function canAddItem(plan: Plan, currentRealCount: number): boolean {
  return currentRealCount < LIMITS[plan].itemsPerBusiness;
}

export function canAddBusiness(plan: Plan, currentCount: number): boolean {
  return currentCount < LIMITS[plan].businesses;
}

export function isNearItemLimit(plan: Plan, currentRealCount: number): boolean {
  const limits = LIMITS[plan];
  return (
    currentRealCount >= limits.warningThresholdItems &&
    currentRealCount < limits.itemsPerBusiness
  );
}

export function remainingItems(plan: Plan, currentRealCount: number): number {
  const max = LIMITS[plan].itemsPerBusiness;
  if (max === Infinity) return Infinity;
  return Math.max(0, max - currentRealCount);
}

export const ENTREPRENEUR_PRICE_USD = 38;
