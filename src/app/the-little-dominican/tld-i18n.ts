"use client";

/**
 * Diccionario bilingüe ES/EN para The Little Dominican.
 *
 * No tocamos el `useTranslation` global (cargado con keys de todo el site)
 * — aquí solo exponemos las cadenas de este restaurante, consumidas por
 * componentes client de TLD (Nav, HomeClient, MenuShell, GalleryShell).
 *
 * Regla: nombres de platos (Pica Pollo, Mofongo, Chicharrón, Moros con Maduro…)
 * NO se traducen — son identidad. Solo chrome UI, headers, CTAs y descripciones.
 */

import { useTranslation } from "@/hooks/useSimpleLanguage";

type TldStrings = {
  // Nav
  navHome: string;
  navMenu: string;
  navGallery: string;
  navReserve: string;
  navCall: string;
  navOrder: string;
  navClose: string;
  navOpen: string;
  // Hero
  heroRatingLabel: string;
  heroTagline: string;
  heroH1Line1: string;
  heroH1Line2: string;
  heroH1Line3: string;
  heroSub: string;
  heroUrgent: string;
  ctaWhatsapp: string;
  ctaViewMenu: string;
  ctaCall: string;
  serviceBadges: string[];
  // Story
  storyLabel: string;
  storyTagline: string;
  storyH2Line1: string;
  storyH2Line2: string;
  storyP1: string;
  storyP2: string;
  statsGoogleReviews: string;
  statsAuthenticDishes: string;
  statsPickupReady: string;
  badgeGoogleReviews: string;
  badgePerfectRating: string;
  badgeLocation: string;
  // Signature
  signatureLabel: string;
  signatureH2Line1: string;
  signatureH2Line2: string;
  ctaFullMenu: string;
  ctaOrderNow: string;
  // Sanctuary
  sanctuaryLabel: string;
  sanctuaryH2Line1: string;
  sanctuaryH2Line2: string;
  sanctuaryP: string;
  chipPickupTitle: string;
  chipPickupSub: string;
  chipFamilyTitle: string;
  chipFamilySub: string;
  chipLocationTitle: string;
  chipLocationSub: string;
  chipHoursTitle: string;
  chipHoursSub: string;
  // Gallery teaser
  galleryLabel: string;
  galleryH2: string;
  ctaFullGallery: string;
  // CTA strip
  ctaStripLabel: string;
  ctaStripH2Line1: string;
  ctaStripH2Line2: string;
  ctaStripP: string;
  // Reservation
  reserveLabelFind: string;
  reserveH2: string;
  reserveLabelHours: string;
  reserveLabelFree: string;
  reserveFormH3: string;
  reserveFormP: string;
  closed: string;
  // Social
  socialLabel: string;
  socialH2: string;
  socialP: string;
  // Footer
  footerTagline: string;
  footerTitleMenu: string;
  footerTitleHours: string;
  footerTitleContact: string;
  footerPoweredBy: string;
  // Menu page
  menuHeroTitle: string;
  menuHeroSubtitle: string;
  menuInfoHours: string;
  menuInfoContact: string;
  menuInfoServices: string;
  menuBackToHome: string;
  bottomNavHome: string;
  bottomNavGallery: string;
  bottomNavCall: string;
  bottomNavReserve: string;
  // Gallery page
  galleryHeroLabel: string;
  galleryHeroH1: string;
  galleryHeroP: string;
  galleryReadyH2: string;
  galleryReserveCta: string;
  galleryViewMenuCta: string;
  // Categorías (para footer links y filtros de menú)
  cats: Record<string, string>;
  menuFilterAll: string;
  menuFilterPopular: string;
  menuAllWeek: string;
  // Language toggle
  switchTo: string;
};

const ES: TldStrings = {
  navHome: "Inicio",
  navMenu: "Menú",
  navGallery: "Galería",
  navReserve: "Reservar",
  navCall: "📞 Llamar",
  navOrder: "💬 Ordenar",
  navClose: "Cerrar menú",
  navOpen: "Abrir menú",

  heroRatingLabel: "Elmira, NY · ★★★★★ Google",
  heroTagline: "Sabor de casa. Lejos de casa.",
  heroH1Line1: "La cocina de",
  heroH1Line2: "la abuela.",
  heroH1Line3: "Ahora aquí.",
  heroSub: "Cocina dominicana tradicional con un toque moderno — el sabor de la abuela directo a tu mesa. Dine-in, pickup y delivery desde el corazón de Elmira.",
  heroUrgent: "Ordena ahora. Listo en minutos.",
  ctaWhatsapp: "Ordenar por WhatsApp",
  ctaViewMenu: "Ver menú y ordenar",
  ctaCall: "📞 Llamar para ordenar",
  serviceBadges: ["Dine-in", "Pickup", "Delivery", "$10–20"],

  storyLabel: "Nuestra historia",
  storyTagline: "Hecho con amor dominicano.",
  storyH2Line1: "Donde la tradición",
  storyH2Line2: "se encuentra con el sabor",
  storyP1: "En The Little Dominican llevamos la esencia de la cocina quisqueyana al corazón de Elmira. Cada plato nace de recetas heredadas, sazonadas con el amor de la familia y adaptadas para quienes buscan autenticidad en cada bocado.",
  storyP2: "Desde el chicharrón crujiente hasta el rabo guisado que se deshace solo — aquí la comida es cultura, es identidad, es hogar.",
  statsGoogleReviews: "Google Reviews",
  statsAuthenticDishes: "Platos auténticos",
  statsPickupReady: "Pickup listo",
  badgeGoogleReviews: "Reseñas Google",
  badgePerfectRating: "Calificación perfecta",
  badgeLocation: "Ubicación",

  signatureLabel: "Especialidades",
  signatureH2Line1: "Nuestras expresiones",
  signatureH2Line2: "de sabor",
  ctaFullMenu: "Ver menú completo →",
  ctaOrderNow: "Ordenar ahora →",

  sanctuaryLabel: "La experiencia",
  sanctuaryH2Line1: "Un pedazo de",
  sanctuaryH2Line2: "la isla en Elmira",
  sanctuaryP: "Ambiente familiar, sazón auténtico y la mejor cocina dominicana de Elmira, NY — lista para pickup, delivery o para comer aquí. Ven a vivir la experiencia.",
  chipPickupTitle: "Pickup listo",
  chipPickupSub: "En 20–30 minutos",
  chipFamilyTitle: "Ambiente familiar",
  chipFamilySub: "Bienvenidos todos",
  chipLocationTitle: "Elmira, NY",
  chipLocationSub: "315 E Water St",
  chipHoursTitle: "Martes–Domingo",
  chipHoursSub: "Desde 11:00 AM",

  galleryLabel: "Galería",
  galleryH2: "Vive la experiencia",
  ctaFullGallery: "Ver galería completa →",

  ctaStripLabel: "Pickup · Delivery · Dine-in",
  ctaStripH2Line1: "Pide tu comida",
  ctaStripH2Line2: "dominicana ahora mismo",
  ctaStripP: "Respuesta en minutos por WhatsApp — te confirmamos disponibilidad y tiempo de entrega al momento.",

  reserveLabelFind: "Encuéntranos",
  reserveH2: "Visítanos",
  reserveLabelHours: "Horario",
  reserveLabelFree: "Sin cargo",
  reserveFormH3: "Reservar Mesa",
  reserveFormP: "Te confirmamos en menos de una hora.",
  closed: "Cerrado",

  socialLabel: "Síguenos",
  socialH2: "Únete a nuestra comunidad",
  socialP: "Ofertas especiales, eventos y el menú del día — directo a tu feed.",

  footerTagline: "Cocina dominicana auténtica en el corazón de Elmira, NY.",
  footerTitleMenu: "Menú",
  footerTitleHours: "Horario",
  footerTitleContact: "Contacto",
  footerPoweredBy: "Powered by",

  menuHeroTitle: "Nuestro Menú",
  menuHeroSubtitle: "Cocina dominicana auténtica — Elmira, NY",
  menuInfoHours: "Horario",
  menuInfoContact: "Contacto",
  menuInfoServices: "Servicios",
  menuBackToHome: "← The Little Dominican",
  bottomNavHome: "Inicio",
  bottomNavGallery: "Galería",
  bottomNavCall: "Llamar",
  bottomNavReserve: "Reservar",

  galleryHeroLabel: "Galería",
  galleryHeroH1: "Vive la experiencia",
  galleryHeroP: "Platos, ambiente y momentos de The Little Dominican en Elmira, NY.",
  galleryReadyH2: "¿Listo para vivir la experiencia?",
  galleryReserveCta: "Reservar Mesa",
  galleryViewMenuCta: "Ver Menú →",

  cats: {
    Desayuno: "Desayuno",
    Criollos: "Criollos",
    Picadera: "Picadera",
    Fritura: "Fritura",
    Carnes: "Carnes",
    Mariscos: "Mariscos",
    Acompañantes: "Acompañantes",
    Postres: "Postres",
  },
  menuFilterAll: "Todos",
  menuFilterPopular: "Popular",
  menuAllWeek: "Toda la semana",

  switchTo: "English",
};

const EN: TldStrings = {
  navHome: "Home",
  navMenu: "Menu",
  navGallery: "Gallery",
  navReserve: "Reserve",
  navCall: "📞 Call",
  navOrder: "💬 Order",
  navClose: "Close menu",
  navOpen: "Open menu",

  heroRatingLabel: "Elmira, NY · ★★★★★ Google",
  heroTagline: "Taste of home. Far from home.",
  heroH1Line1: "Grandma's",
  heroH1Line2: "cooking.",
  heroH1Line3: "Right here.",
  heroSub: "Traditional Dominican with a modern spin — bringing abuela's cooking straight to you. Dine-in, pickup and delivery from the heart of Elmira.",
  heroUrgent: "Order now. Ready in minutes.",
  ctaWhatsapp: "Order via WhatsApp",
  ctaViewMenu: "See menu & order",
  ctaCall: "📞 Call to order",
  serviceBadges: ["Dine-in", "Pickup", "Delivery", "$10–20"],

  storyLabel: "Our story",
  storyTagline: "Made with Dominican love.",
  storyH2Line1: "Where tradition",
  storyH2Line2: "meets flavor",
  storyP1: "At The Little Dominican we bring the soul of Dominican cooking to the heart of Elmira. Every dish is born from family recipes, seasoned with love and made for those who want authenticity in every bite.",
  storyP2: "From crispy chicharrón to fall-off-the-bone rabo guisado — here, food is culture, identity, home.",
  statsGoogleReviews: "Google Reviews",
  statsAuthenticDishes: "Authentic dishes",
  statsPickupReady: "Pickup ready",
  badgeGoogleReviews: "Google Reviews",
  badgePerfectRating: "Perfect rating",
  badgeLocation: "Location",

  signatureLabel: "Specialties",
  signatureH2Line1: "Our flavor",
  signatureH2Line2: "expressions",
  ctaFullMenu: "See full menu →",
  ctaOrderNow: "Order now →",

  sanctuaryLabel: "The experience",
  sanctuaryH2Line1: "A piece of",
  sanctuaryH2Line2: "the island in Elmira",
  sanctuaryP: "Family atmosphere, authentic seasoning and the best Dominican cooking in Elmira, NY — ready for pickup, delivery or dine-in. Come live the experience.",
  chipPickupTitle: "Pickup ready",
  chipPickupSub: "In 20–30 minutes",
  chipFamilyTitle: "Family atmosphere",
  chipFamilySub: "Everyone welcome",
  chipLocationTitle: "Elmira, NY",
  chipLocationSub: "315 E Water St",
  chipHoursTitle: "Tuesday–Sunday",
  chipHoursSub: "From 11:00 AM",

  galleryLabel: "Gallery",
  galleryH2: "Live the experience",
  ctaFullGallery: "See full gallery →",

  ctaStripLabel: "Pickup · Delivery · Dine-in",
  ctaStripH2Line1: "Order your Dominican",
  ctaStripH2Line2: "food right now",
  ctaStripP: "Reply in minutes on WhatsApp — we confirm availability and delivery time instantly.",

  reserveLabelFind: "Find us",
  reserveH2: "Visit us",
  reserveLabelHours: "Hours",
  reserveLabelFree: "Free",
  reserveFormH3: "Reserve a Table",
  reserveFormP: "We'll confirm in under an hour.",
  closed: "Closed",

  socialLabel: "Follow us",
  socialH2: "Join our community",
  socialP: "Specials, events and today's menu — straight to your feed.",

  footerTagline: "Authentic Dominican cooking in the heart of Elmira, NY.",
  footerTitleMenu: "Menu",
  footerTitleHours: "Hours",
  footerTitleContact: "Contact",
  footerPoweredBy: "Powered by",

  menuHeroTitle: "Our Menu",
  menuHeroSubtitle: "Authentic Dominican cuisine — Elmira, NY",
  menuInfoHours: "Hours",
  menuInfoContact: "Contact",
  menuInfoServices: "Services",
  menuBackToHome: "← The Little Dominican",
  bottomNavHome: "Home",
  bottomNavGallery: "Gallery",
  bottomNavCall: "Call",
  bottomNavReserve: "Reserve",

  galleryHeroLabel: "Gallery",
  galleryHeroH1: "Live the experience",
  galleryHeroP: "Dishes, atmosphere and moments from The Little Dominican in Elmira, NY.",
  galleryReadyH2: "Ready to live the experience?",
  galleryReserveCta: "Reserve a Table",
  galleryViewMenuCta: "View Menu →",

  cats: {
    Desayuno: "Breakfast",
    Criollos: "Dominican Classics",
    Picadera: "Appetizers",
    Fritura: "Fried",
    Carnes: "Meats",
    Mariscos: "Seafood",
    Acompañantes: "Sides",
    Postres: "Desserts",
  },
  menuFilterAll: "All",
  menuFilterPopular: "Popular",
  menuAllWeek: "All week",

  switchTo: "Español",
};

export function useTldI18n() {
  const { language } = useTranslation();
  const t = language === "en" ? EN : ES;
  return { t, language };
}

export type { TldStrings };
