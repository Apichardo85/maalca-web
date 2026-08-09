import type { ComponentType } from 'react';
import { RestaurantTemplate } from '@/components/public/templates/Restaurant';
import { BarberTemplate } from '@/components/public/templates/Barber';
import { ServiceTemplate } from '@/components/public/templates/Service';
import { RetailTemplate } from '@/components/public/templates/Retail';
import type { Plan } from '@/lib/plan-limits';
export type { Plan } from '@/lib/plan-limits';
import type { PlanCapabilities } from '@/lib/capabilities';
import type { PublicCanal } from '@/lib/public-contact';
import type { MealPeriod, WeekDay, MenuItemFlags } from '@/lib/types';

export type BusinessType = 'restaurant' | 'barber' | 'service' | 'retail';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** `dia` uses lowercase weekday keys (monday..sunday), matching WeekDay. */
export interface HorarioDay {
  dia: string;
  abre: string;
  cierra: string;
  cerrado: boolean;
}

export interface PublicTemplateProps {
  business: {
    id: string;
    slug: string;
    name: string;
    plan: Plan;
    description?: string | null;
    /** English translation of `description`, shown to visitors with English selected. */
    descriptionEn?: string | null;
    logo_url?: string | null;
    cover_image_url?: string | null;
    primary_color?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    contactEmail?: string | null;
    canales?: PublicCanal[];
    business_type: BusinessType;
    processSteps?: ProcessStep[] | null;
    faq?: FaqEntry[] | null;
    /** IANA timezone (e.g. "America/New_York"). Null if not configured yet. */
    timezone?: string | null;
    horario?: HorarioDay[] | null;
  };
  items: Array<{
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    category?: string | null;
    category_id?: string | null;
    image_url?: string | null;
    imageUrl?: string | null;
    /** Menu Board only (Fase 9 Etapa A) — clip corto de video en vez de foto. Product-only en el backend. */
    video_url?: string | null;
    durationMinutes?: number | null;
    status?: string | null;
    is_demo?: boolean;
    /** English translation of `description`, when the catalog was migrated with i18n. */
    descriptionEn?: string | null;
    /** Meal periods the item is served in. Empty/undefined = available all day. */
    periods?: MealPeriod[];
    /** Days of the week the item is available. Empty/undefined = every day. */
    weekDays?: WeekDay[];
    flags?: Array<keyof MenuItemFlags>;
    featured?: boolean;
    popular?: boolean;
  }>;
  categories: Category[];
  capabilities: PlanCapabilities;
}

export const TEMPLATES: Record<BusinessType, ComponentType<PublicTemplateProps>> = {
  restaurant: RestaurantTemplate,
  barber: BarberTemplate,
  service: ServiceTemplate,
  retail: RetailTemplate,
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: 'Restaurante',
  barber: 'Barbería',
  service: 'Servicios',
  retail: 'Tienda',
};

/** Same emoji as the onboarding business-type selector (BUSINESS_TYPES in
 *  OnboardingForm.tsx) — kept here instead of imported from there so the read-only
 *  display in ConfigTab.tsx doesn't reach into an unrelated route's form file. */
export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  restaurant: '🍽️',
  barber: '💈',
  service: '🛠️',
  retail: '🛍️',
};

/** Label for the /space nav item that leads to the catalog editor — the generic
 *  "Catálogo" doesn't match what a restaurant or barbershop actually calls it. */
export const CATALOG_NAV_LABELS: Record<BusinessType, { es: string; en: string }> = {
  restaurant: { es: 'Menú', en: 'Menu' },
  barber: { es: 'Servicios', en: 'Services' },
  service: { es: 'Servicios', en: 'Services' },
  retail: { es: 'Catálogo', en: 'Catalog' },
};
