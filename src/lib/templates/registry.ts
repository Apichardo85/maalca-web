import type { ComponentType } from 'react';
import { RestaurantTemplate } from '@/components/public/templates/Restaurant';
import { BarberTemplate } from '@/components/public/templates/Barber';
import { ServiceTemplate } from '@/components/public/templates/Service';
import { RetailTemplate } from '@/components/public/templates/Retail';
import type { Plan } from '@/lib/plan-limits';
export type { Plan } from '@/lib/plan-limits';
import type { PlanCapabilities } from '@/lib/capabilities';
import type { PublicCanal } from '@/lib/public-contact';

export type BusinessType = 'restaurant' | 'barber' | 'service' | 'retail';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface PublicTemplateProps {
  business: {
    id: string;
    slug: string;
    name: string;
    plan: Plan;
    description?: string | null;
    logo_url?: string | null;
    cover_image_url?: string | null;
    primary_color?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    contactEmail?: string | null;
    canales?: PublicCanal[];
    business_type: BusinessType;
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
    durationMinutes?: number | null;
    status?: string | null;
    is_demo?: boolean;
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
