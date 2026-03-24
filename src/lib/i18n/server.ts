/**
 * Server-side translations for Next.js App Router
 * Use this to enable Server Components with translations
 */

import 'server-only';
import React from 'react';

/**
 * Server translation function
 * This runs on the server and returns translations without client JavaScript overhead
 * 
 * Usage in Server Components:
 * ```typescript
 * import { getTranslations } from '@/lib/i18n/server';
 * 
 * export default async function Page({ params }: { params: { lang: string } }) {
 *   const t = await getTranslations(params.lang);
 *   
 *   return <h1>{t('hero.maalca')}</h1>;
 * }
 * ```
 */

// Type for translations
type TranslationDict = Record<string, Record<string, string>>;

// Default translations (same as useSimpleLanguage but server-safe)
// In production, this could be loaded from a JSON file or database
const translations: TranslationDict = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.ecosystem': 'Ecosistema',
    'nav.editorial': 'Editorial',
    'nav.services': 'Servicios',
    'nav.contact': 'Contacto',
    
    // Hero
    'hero.maalca': 'MaalCa',
    'hero.ecosistema': 'Ecosistema',
    'hero.creative': 'Creativo',
    'hero.subtitle': 'Con corazón dominicano y espíritu global',
    'hero.cta.projects': 'Conoce nuestros proyectos',
    'hero.cta.join': 'Únete al ecosistema',
    
    // About
    'about.title': 'Sobre MaalCa',
    'about.description': 'Somos un ecosistema creativo y empresarial que conecta ideas, personas y proyectos.',
    'about.foundation': 'Fundación',
    'about.foundation.desc': 'Nace MaalCa como concepto creativo en República Dominicana',
    'about.expansion': 'Expansión',
    'about.expansion.desc': 'Crecimiento del ecosistema con múltiples verticales de negocio',
    'about.consolidation': 'Consolidación',
    'about.consolidation.desc': 'MaalCa LLC establecida en Elmira, NY con proyectos globales',
    
    // Projects
    'projects.title': 'Nuestro Ecosistema',
    'projects.description': 'Proyectos diversos que reflejan nuestra pasión por la creatividad',
    
    // Editorial
    'editorial.title': 'Editorial MaalCa',
    'editorial.description': 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea',
    
    // Contact
    'contact.title': 'Conecta con nosotros',
    'contact.name': 'Nombre',
    'contact.email': 'Correo electrónico',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar mensaje',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.ecosystem': 'Ecosystem',
    'nav.editorial': 'Editorial',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.maalca': 'MaalCa',
    'hero.ecosistema': 'Ecosystem',
    'hero.creative': 'Creative',
    'hero.subtitle': 'With Dominican heart and global spirit',
    'hero.cta.projects': 'Explore our projects',
    'hero.cta.join': 'Join the ecosystem',
    
    // About
    'about.title': 'About MaalCa',
    'about.description': 'We are a creative and business ecosystem that connects ideas, people, and projects.',
    'about.foundation': 'Foundation',
    'about.foundation.desc': 'MaalCa was born as a creative concept in the Dominican Republic',
    'about.expansion': 'Expansion',
    'about.expansion.desc': 'Growth of the ecosystem with multiple business verticals',
    'about.consolidation': 'Consolidation',
    'about.consolidation.desc': 'MaalCa LLC established in Elmira, NY with global projects',
    
    // Projects
    'projects.title': 'Our Ecosystem',
    'projects.description': 'Diverse projects that reflect our passion for creativity',
    
    // Editorial
    'editorial.title': 'MaalCa Editorial',
    'editorial.description': 'We explore the intersection of philosophy, culture, and contemporary society',
    
    // Contact
    'contact.title': 'Connect with us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send message',
  }
};

/**
 * Get translations for a specific language
 * @param lang - Language code ('es' or 'en')
 * @returns Translation function
 */
export async function getTranslations(lang: 'es' | 'en' = 'es') {
  const dict = translations[lang] || translations.es;
  
  return {
    t: (key: string, params?: Record<string, string | number>): string => {
      let text = dict[key] || key;
      
      // Replace parameters like {name} or {count}
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      
      return text;
    },
    lang,
  };
}

/**
 * Get current language from request headers or params
 * @param headers - Optional headers object
 * @returns Language code
 */
export function getLanguage(headers?: Headers): 'es' | 'en' {
  // Check header for language preference
  if (headers) {
    const acceptLanguage = headers.get('accept-language');
    if (acceptLanguage?.startsWith('en')) {
      return 'en';
    }
  }
  
  return 'es';
}

/**
 * Create a translations server component wrapper
 * Use this to easily add translations to any page
 * 
 * @example
 * ```typescript
 * // In app/page.tsx (Server Component)
 * import { withTranslations } from '@/lib/i18n/server';
 * 
 * export default withTranslations(async ({ t }) => {
 *   return (
 *     <h1>{t('hero.maalca')}</h1>
 *   );
 * });
 * ```
 */
export function withTranslations<P extends object>(
  Component: (props: P & { t: (key: string) => string; lang: string }) => Promise<React.JSX.Element>
) {
  return async function WithTranslations(props: P) {
    const lang = 'es'; // Could be dynamic based on URL params
    const { t } = await getTranslations(lang);
    
    return Component({ ...props, t, lang });
  };
}

// Re-export for convenience
export type { TranslationDict };
