import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { Plan } from '@/lib/plan-limits';
export type { Plan } from '@/lib/plan-limits';
import type { PlanCapabilities } from '@/lib/capabilities';
import type { PublicCanal } from '@/lib/public-contact';
import type { MealPeriod, WeekDay, MenuItemFlags } from '@/lib/types';

export type BusinessType = 'restaurant' | 'barber' | 'service' | 'retail' | 'community';

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
    /** "USD" | "DOP" — cómo el negocio muestra sus precios. Default "USD" para negocios que
     *  todavía no la configuraron en Settings (ver SettingsContent.tsx). */
    currency?: 'USD' | 'DOP';
    /** Apagador explícito por sección opcional (Pasos, Galería) — clave ausente =
     *  visible. Independiente de si la sección tiene contenido.
     *
     *  Llaves reservadas para businessType Community (módulos — no todo trial comunitario
     *  acepta lo mismo, ver backlog Comunidad):
     *  - "monetaryDonations": calculadora de impacto + botón Donar (Fase 3, Stripe Connect).
     *    Un comedor sin cuenta de donaciones configurada no debe mostrar esto.
     *  - "causas": causas individuales con tipo dinero/tiempo/especie (entidad Causa,
     *    /api/affiliates/{id}/causas -- ver Causa.cs, movida de columna JSON 2026-09-25).
     *  - "puntoDeEntrega": bloque de entrega en persona (Fase 4, entidad PuntoDeEntrega).
     *  "eventos"/agenda de actividades (2026-09-25) ya tiene entidad propia y transversal
     *  (Activity.cs, tabla Activities) en vez de vivir acá — sigue sin llave en
     *  sectionVisibility a propósito: no es un módulo Community-only que se pueda apagar por
     *  afiliado, es una entidad con su propio CRUD (/space/[slug]/activities) que ya devuelve
     *  [] cuando no hay eventos, así que Community.tsx la oculta por lista vacía, no por
     *  toggle. Lanzamiento inicial solo businessType Community (ver SpaceSidebar).
     *  "causas" (tabla Causas) y "puntoDeEntrega" (Affiliate.CommunityImpact) ya tienen backend
     *  real y gatean las secciones correspondientes en Community.tsx. "monetaryDonations"
     *  sigue gateando la calculadora de impacto + botón Donar. */
    sectionVisibility?: Record<string, boolean> | null;
    /** Solo fotos, sin caption — máximo 12. */
    galleryImages?: string[] | null;
    /** Solo businessType Community (WEB-COM-002/003) — viene de un fetch aparte a
     *  /api/public/affiliates/{slug}/community-metrics, no del catálogo. null/undefined =
     *  todavía no se pudo cargar o el afiliado no es Community; el template debe ocultar los
     *  bloques que dependan de esto en vez de mostrar un 0 falso. */
    communityMetrics?: { mealsServedThisMonth: number; avgCostPerPlate: number | null } | null;
    /** Comunidad — causas individuales publicadas por el afiliado (dinero/tiempo/especie),
     *  editables en Dashboard > Contenido. Entidad propia con su propio CRUD (backlog
     *  2026-09-25, /api/affiliates/{id}/causas, ver Causa.cs) -- ya NO es un reemplazo total
     *  de un array JSON como processSteps/faq (asi era hasta la migracion MoveCausasToTable).
     *  Igual que activities, el endpoint publico ya devuelve solo las activas. */
    causas?: Array<{
      id: string;
      title: string;
      type: 'money' | 'time' | 'in_kind';
      description?: string | null;
      goalAmount?: number | null;
      currentAmount?: number | null;
    }> | null;
    /** Comunidad (Fase 4) — punto de entrega en persona y meta/recaudado del mes. Recaudado es
     *  lo que el afiliado REPORTA a mano (no hay integración de donaciones vía Stripe Connect
     *  todavía) — el template debe mostrarlo como algo reportado por el negocio, nunca como un
     *  contador "en vivo" automático. */
    communityImpact?: {
      fundraisingGoalAmount?: number | null;
      fundraisingCurrentAmount?: number | null;
      deliverySchedule?: string | null;
      deliveryAcceptedItems?: string | null;
    } | null;
    /** Eventos/Actividades (backlog 2026-09-25) -- entidad propia y transversal (ver
     *  Activity.cs), no un campo de contenido reemplazado entero como causas/processSteps.
     *  Ya vienen filtrados a "proximos" (StartsAt >= ahora, IsActive) por el endpoint publico
     *  /public/affiliates/{slug}/activities -- el template no necesita filtrar de nuevo.
     *  Lanzamiento inicial solo businessType Community; null/[] = sin eventos o afiliado no
     *  es Community todavia. */
    activities?: Array<{
      id: string;
      title: string;
      titleEn?: string | null;
      description?: string | null;
      descriptionEn?: string | null;
      location?: string | null;
      startsAt: string;
      endsAt?: string | null;
    }> | null;
    /** Solo Community con Stripe Connect activo (backlog 2026-09-26, DonationService) — total
     *  real recaudado (Status=Paid) este mes calendario, calculado en el backend a partir de
     *  la tabla Donations. null = el afiliado no tiene Connect activo todavia (nunca puede
     *  haber donaciones Paid en ese caso); el template debe caer al monto reportado a mano en
     *  communityImpact.fundraisingCurrentAmount, nunca mostrar $0 falso. */
    donationsRaisedThisMonth?: number | null;
  };
  items: Array<{
    id: string;
    name: string;
    /** English translation of `name`, shown to visitors with English selected. */
    nameEn?: string | null;
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

// Imports perezosos: antes esto importaba los 4 templates completos (Restaurant/Barber/
// Service/Retail) de forma estática arriba, así que CUALQUIER archivo que importara este
// registry.ts (aunque solo fuera por un tipo o por BUSINESS_TYPE_LABELS — layout.tsx,
// SpaceSidebar, IdentidadContent, etc.) arrastraba los 4 árboles de componentes completos a
// su bundle. Con next/dynamic, cada template se separa en su propio chunk que solo se carga
// cuando TEMPLATES[tipo] realmente se renderiza (solo pasa en 3 lugares: la página pública,
// /preview/[slug] y el PreviewFrame del editor de Diseño).
export const TEMPLATES: Record<BusinessType, ComponentType<PublicTemplateProps>> = {
  restaurant: dynamic(() => import('@/components/public/templates/Restaurant').then((m) => m.RestaurantTemplate)),
  barber: dynamic(() => import('@/components/public/templates/Barber').then((m) => m.BarberTemplate)),
  service: dynamic(() => import('@/components/public/templates/Service').then((m) => m.ServiceTemplate)),
  retail: dynamic(() => import('@/components/public/templates/Retail').then((m) => m.RetailTemplate)),
  community: dynamic(() => import('@/components/public/templates/Community').then((m) => m.CommunityTemplate)),
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: 'Restaurante',
  barber: 'Barbería',
  service: 'Servicios',
  retail: 'Tienda',
  community: 'Comunidad',
};

/** Same emoji as the onboarding business-type selector (BUSINESS_TYPES in
 *  OnboardingForm.tsx) — kept here instead of imported from there so the read-only
 *  display in ConfigTab.tsx doesn't reach into an unrelated route's form file. */
export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  restaurant: '🍽️',
  barber: '💈',
  service: '🛠️',
  retail: '🛍️',
  community: '🤝',
};

/** Label for the /space nav item that leads to the catalog editor — the generic
 *  "Catálogo" doesn't match what a restaurant or barbershop actually calls it. */
export const CATALOG_NAV_LABELS: Record<BusinessType, { es: string; en: string }> = {
  restaurant: { es: 'Menú', en: 'Menu' },
  barber: { es: 'Servicios', en: 'Services' },
  service: { es: 'Servicios', en: 'Services' },
  retail: { es: 'Catálogo', en: 'Catalog' },
  community: { es: 'Programas', en: 'Programs' },
};

// TODO (backlog, 2026-09-25): "Programas" para Community sigue siendo el modulo
// generico de Catalogo (tabla Services) con el campo Precio relabeled a "Meta
// (opcional)" -- un parche, no un rediseno. El campo real que un programa
// comunitario necesita no es precio/meta en dolares: es cupos, horario,
// dias de la semana, voluntarios requeridos, etc. -- mas parecido a las Causas
// (goalAmount/currentAmount) o a un modulo propio, no a un item vendible.
// A diferencia de Eventos/Actividades (ya resuelto 2026-09-25 con su propia entidad
// Activity.cs), esto queda fuera del alcance actual: se decidio arreglar el bug de
// guardado (BusinessType.Community faltante en los switches de CatalogCrudService)
// y relabeled el precio, sin rediseno de datos.
