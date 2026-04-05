"use client";

import { useState, useEffect } from 'react';

type Language = 'es' | 'en';

// Comprehensive translations for the entire site
const translations = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.ecosystem': 'Ecosistema',
    'nav.editorial': 'Editorial',
    'nav.services': 'Servicios',
    'nav.contact': 'Contacto',
    'nav.explore': 'Explorar',
    'nav.join': 'Únete al Ecosistema',

    // Homepage Hero
    'hero.maalca': 'MaalCa',
    'hero.ecosystem': 'Ecosistema',
    'hero.creative': 'Creativo',
    'hero.subtitle': 'Con corazón dominicano y espíritu global',
    'hero.cta.projects': 'Conoce nuestros proyectos',
    'hero.cta.join': 'Únete al ecosistema',

    // Ecosystem Section
    'ecosystem.title': 'El Ecosistema',
    'ecosystem.description': 'Diferentes proyectos, una sola visión: conectar creatividad, comunidad y crecimiento.',
    'ecosystem.explore': 'Explorar proyecto',

    // Affiliates Section
    'affiliates.title': 'Afiliados',
    'affiliates.description': 'Empresas y proyectos que comparten nuestra visión',

    // Editorial
    'editorial.title': 'Editorial MaalCa',
    'editorial.description': 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea',
    'editorial.read': 'Leer artículos',
    'editorial.subscribe': 'Suscribirse al Newsletter',

    // About Section
    'about.title': 'Sobre MaalCa',
    'about.description': 'Somos un ecosistema creativo y empresarial que conecta ideas, personas y proyectos. Desde República Dominicana hacia el mundo, construimos puentes entre la creatividad y los negocios.',
    'about.foundation': 'Fundación',
    'about.foundation.desc': 'Nace MaalCa como concepto creativo en República Dominicana',
    'about.expansion': 'Expansión',
    'about.expansion.desc': 'Crecimiento del ecosistema con múltiples verticales de negocio',
    'about.consolidation': 'Consolidación',
    'about.consolidation.desc': 'MaalCa LLC establecida en Elmira, NY con proyectos globales',

    // Projects Section
    'projects.title': 'Nuestro Ecosistema',
    'projects.description': 'Proyectos diversos que reflejan nuestra pasión por la creatividad, la innovación y la comunidad',

    // Individual Projects
    'project.editorial.title': 'Editorial MaalCa',
    'project.editorial.description': 'Publicaciones que exploran cultura, creatividad y sociedad con distribución global en Amazon KDP',
    'project.editorial.category': 'Editorial + KDP',
    'project.editorial.outcome': 'Libros publicados y distribuidos globalmente',

    'project.ciriwhispers.title': 'CiriWhispers',
    'project.ciriwhispers.description': 'Autor y escritor creativo especializado en narrativas íntimas y conversaciones profundas',
    'project.ciriwhispers.category': 'Autor + Escritor Creativo',
    'project.ciriwhispers.outcome': 'Contenido auténtico y conexiones humanas genuinas',

    'project.cirisonic.title': 'CiriSonic',
    'project.cirisonic.description': 'Fábrica de contenido IA con automatización inteligente y estrategia de engagement optimizada',
    'project.cirisonic.category': 'Fábrica IA',
    'project.cirisonic.outcome': 'Contenido automatizado y engagement aumentado',

    'project.hbm.title': 'Hablando Mierda (HBM)',
    'project.hbm.description': 'Podcast y plataforma de conversaciones sin filtros',
    'project.hbm.category': 'Podcast + Media',
    'project.hbm.outcome': 'Comunidad activa y monetización por episodio',

    'project.masatina.title': 'Cocina Tina',
    'project.masatina.description': 'Cocina dominicana auténtica con platos tradicionales, delivery y catering para eventos',
    'project.masatina.category': 'Gastronomía Dominicana',
    'project.cocinatina.title': 'Cocina Tina',
    'project.cocinatina.description': 'Cocina dominicana auténtica con platos tradicionales, delivery y catering para eventos',
    'project.cocinatina.category': 'Gastronomía Dominicana',
    'project.cocinatina.outcome': 'Platos auténticos y eventos memorables',

    'project.masatina.outcome': 'Platos auténticos y eventos memorables',

    'project.verdeprive.title': 'Verde Privé',
    'project.verdeprive.description': 'Lifestyle cannabis premium con máxima privacidad y calidad artesanal para adultos conscientes',
    'project.verdeprive.category': 'Cannabis + Lifestyle',
    'project.verdeprive.outcome': 'Experiencias premium y bienestar entregados discretamente',

    'project.properties.title': 'MaalCa Properties',
    'project.properties.description': 'Propiedades turísticas frente al océano en República Dominicana, conectando clientes globales con el paraíso caribeño',
    'project.properties.category': 'Turismo + Real Estate',
    'project.properties.outcome': 'Propiedades vendidas a inversores globales',

    // Affiliates Section (detailed)
    'affiliate.drpichardo.name': 'Dr. Pichardo',
    'affiliate.drpichardo.description': 'Cirugía y medicina estética',
    'affiliate.pegote.name': 'Pegote Barbershop',
    'affiliate.pegote.description': 'Barbería dominicana en Elmira, NY',
    'affiliate.studioalpha.name': 'Studio Alpha',
    'affiliate.studioalpha.description': 'Estudio creativo',
    'affiliate.creativehub.name': 'Creative Hub',
    'affiliate.creativehub.description': 'Hub de creatividad',
    'affiliate.designco.name': 'Design Co.',
    'affiliate.designco.description': 'Compañía de diseño',
    'affiliate.medialab.name': 'Media Lab',
    'affiliate.medialab.description': 'Laboratorio de medios',
    'affiliate.artcollective.name': 'Art Collective',
    'affiliate.artcollective.description': 'Colectivo artístico',
    'affiliate.tld.name': 'The Little Dominican',
    'affiliate.tld.description': 'Restaurante dominicano · Elmira, NY',

    // Quote Section
    'quote.philosophy': 'Donde la creatividad se encuentra con la comunidad y la innovación',

    // Contact Section
    'contact.title': 'Conecta con nosotros',
    'contact.name': 'Nombre',
    'contact.email': 'Correo electrónico',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar mensaje',
    'contact.location': 'Estados Unidos',
    'contact.emailLabel': 'Correo',
    'contact.followUs': 'Síguenos',

    // Ecosistema Page
    'ecosystem.hero.title': 'Nuestro',
    'ecosystem.hero.subtitle': 'Ecosistema',
    'ecosystem.hero.description': 'Seis proyectos únicos que reflejan nuestra pasión por la creatividad, la innovación y la conexión humana desde República Dominicana hacia el mundo.',
    'ecosystem.stats.projects': 'Proyectos Activos',
    'ecosystem.stats.verticals': 'Verticales de Negocio',
    'ecosystem.stats.founded': 'Fundado en',
    'ecosystem.keyFeatures': 'Características clave:',
    'ecosystem.launched': 'Lanzado',
    'ecosystem.exploreProject': 'Explorar',
    'ecosystem.cta.title': '¿Tienes un proyecto en mente?',
    'ecosystem.cta.description': 'Nuestro ecosistema está en constante evolución. Si tienes una idea que resuene con nuestra filosofía de sentido humano, conversemos.',
    'ecosystem.cta.collaborate': 'Proponer Colaboración',
    'ecosystem.cta.services': 'Ver Nuestros Servicios',
    'ecosystem.status.active': 'Activo',
    'ecosystem.status.beta': 'Beta',
    'ecosystem.status.development': 'Desarrollo',

    // Project Details (Ecosistema specific)
    'details.editorial.1': 'Filosofía contemporánea y pensamiento crítico',
    'details.editorial.2': 'Análisis cultural desde perspectiva caribeña',
    'details.editorial.3': 'Distribución global a través de Amazon KDP',
    'details.editorial.4': 'Formato digital y físico disponible',

    'details.ciriwhispers.1': 'Narrativas íntimas y personales auténticas',
    'details.ciriwhispers.2': 'Escritura creativa con perspectiva única',
    'details.ciriwhispers.3': 'Conversaciones profundas y reflexivas',
    'details.ciriwhispers.4': 'Conexión genuina con audiencias',

    'details.cirisonic.1': 'Sistema IA para generación de contenido personalizado',
    'details.cirisonic.2': 'Automatización de calendario de publicaciones',
    'details.cirisonic.3': 'Engagement analytics en tiempo real',
    'details.cirisonic.4': 'A/B testing automatizado para optimización',

    'details.hbm.1': 'Conversaciones auténticas sin censura',
    'details.hbm.2': 'Filosofía callejera con sentido humano',
    'details.hbm.3': 'Comunidad comprometida de oyentes',
    'details.hbm.4': 'Monetización directa por episodio',

    'details.masatina.1': 'Gastronomía dominicana auténtica',
    'details.masatina.2': 'Sistema POS integrado con Stripe',
    'details.masatina.3': 'Catálogo digital de productos',
    'details.masatina.4': 'Experiencias culinarias personalizadas',

    'details.verdeprive.1': 'Cannabis artesanal de máxima calidad',
    'details.verdeprive.2': 'Privacidad y discreción garantizada',
    'details.verdeprive.3': 'Lifestyle premium para adultos conscientes',
    'details.verdeprive.4': 'Productos wellness y bienestar integral',

    'details.properties.1': 'Propiedades frente al océano en RD',
    'details.properties.2': 'Inversión turística para clientes globales',
    'details.properties.3': 'Gestión completa de propiedades',
    'details.properties.4': 'ROI optimizado para inversores internacionales',

    // Common
    'common.learnMore': 'Conoce más',
    'common.comingSoon': 'Próximamente',
    'common.available': 'Disponible',
    'common.readMore': 'Leer más',
    'common.viewProject': 'Ver proyecto',
    'common.close': 'Cerrar',
    'common.send': 'Enviar',
    'common.loading': 'Cargando...',

    // Editorial Page
    'editorial.hero.title': 'Editorial',
    'editorial.hero.brand': 'MaalCa',
    'editorial.hero.description': 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea. Pensamientos profundos con la autenticidad del Caribe y la perspectiva global.',

    // Featured Articles Section
    'editorial.featured.title': 'Artículos Destacados',

    // All Articles Section
    'editorial.all.title': 'Todos los Artículos',

    // Categories
    'editorial.category.all': 'Todos',
    'editorial.category.philosophy': 'Filosofía',
    'editorial.category.technology': 'Tecnología',
    'editorial.category.business': 'Negocios',
    'editorial.category.culture': 'Cultura',
    'editorial.category.society': 'Sociedad',
    'editorial.category.art': 'Arte',

    // Articles
    'editorial.article.filosofia-calle.title': 'Filosofía de la Calle: Reflexiones desde el Asfalto Dominicano',
    'editorial.article.filosofia-calle.excerpt': 'Una exploración profunda sobre cómo la sabiduría popular dominicana se convierte en filosofía práctica para la vida moderna.',

    'editorial.article.creatividad-ia.title': 'Creatividad Humana en la Era de la IA: Mantener el Alma en el Arte',
    'editorial.article.creatividad-ia.excerpt': 'Análisis de cómo los creadores pueden mantener su esencia humana mientras abrazan las herramientas de inteligencia artificial.',

    'editorial.article.ecosistemas-creativos.title': 'Construyendo Ecosistemas Creativos: Lecciones desde el Caribe',
    'editorial.article.ecosistemas-creativos.excerpt': 'Cómo crear redes de colaboración auténticas que nutran tanto la creatividad individual como el crecimiento colectivo.',

    'editorial.article.identidad-global.title': 'Identidad Global con Corazón Local: El Dilema del Creador Moderno',
    'editorial.article.identidad-global.excerpt': 'Reflexiones sobre mantener las raíces culturales mientras se compite en un mercado global digitalizado.',

    'editorial.article.futuro-trabajo.title': 'El Futuro del Trabajo Humano: Más Allá de la Productividad',
    'editorial.article.futuro-trabajo.excerpt': 'Una visión alternativa del trabajo que prioriza el bienestar, la creatividad y la conexión humana por encima de la eficiencia pura.',

    'editorial.article.arte-resistencia.title': 'Arte como Resistencia en la Era Digital',
    'editorial.article.arte-resistencia.excerpt': 'Cómo los artistas latinoamericanos utilizan medios digitales para preservar y transformar narrativas culturales.',

    // Books Section
    'editorial.books.title': 'Nuestros Libros',
    'editorial.books.description': 'Pensamientos profundos compilados en formato libro, disponibles globalmente a través de Amazon KDP',

    'editorial.book.filosofia-callejera.title': 'Filosofía Callejera: Sabiduría del Asfalto Dominicano',
    'editorial.book.filosofia-callejera.description': 'Una colección de reflexiones filosóficas nacidas en las calles de República Dominicana',
    'editorial.book.filosofia-callejera.status': 'Disponible en Amazon KDP',

    'editorial.book.ecosistemas.title': 'Ecosistemas Creativos: Manual para Constructores de Cultura',
    'editorial.book.ecosistemas.description': 'Guía práctica para crear y mantener comunidades creativas sostenibles',
    'editorial.book.ecosistemas.status': 'Próximamente',

    'editorial.book.humanidad-digital.title': 'Humanidad Digital: Preservando el Alma en Tiempos Tecnológicos',
    'editorial.book.humanidad-digital.description': 'Reflexiones sobre mantener nuestra esencia humana en un mundo cada vez más digital',
    'editorial.book.humanidad-digital.status': 'En desarrollo',

    'editorial.book.cta.buy': 'Comprar en Amazon',
    'editorial.book.cta.comingSoon': 'Próximamente',

    // Newsletter Section
    'editorial.newsletter.title': 'Mantente Conectado',
    'editorial.newsletter.description': 'Recibe nuestros artículos más profundos directamente en tu correo. Filosofía, cultura y reflexiones auténticas desde el Caribe.',
    'editorial.newsletter.placeholder': 'tu@email.com',
    'editorial.newsletter.submit': 'Suscribirse',
    'editorial.newsletter.submitting': 'Enviando...',
    'editorial.newsletter.success': '¡Suscripción exitosa! Revisa tu email.',
    'editorial.newsletter.error': 'Error al suscribirse',
    'editorial.newsletter.errorConnection': 'Error de conexión. Intenta de nuevo.',
    'editorial.newsletter.disclaimer': 'Sin spam. Solo reflexiones profundas cada semana.',

    // Meta
    'editorial.author': 'MaalCa Editorial',
    'editorial.readTime': 'min',
    'editorial.contentNotAvailable': 'Contenido no disponible',

    // Services Page - Hero
    'services.hero.title': 'Servicios con',
    'services.hero.subtitle': 'Sentido Humano',
    'services.hero.description': 'Transformamos ideas en realidades rentables. Cada servicio está diseñado para generar resultados tangibles mientras mantenemos la esencia humana en cada proyecto.',

    // Services Page - Services Section
    'services.section.title': 'Nuestros Servicios',
    'services.section.description': 'Soluciones integrales que combinan tecnología de punta con estrategia humanizada',

    // Individual Services
    'services.editorial-kdp.title': 'Publica tu libro · Amazon KDP',
    'services.editorial-kdp.description': 'De la idea al libro publicado: escribimos, diseñamos y distribuimos tu obra en Amazon con alcance global desde el primer día.',
    'services.editorial-kdp.feature1': 'Proceso editorial completo con revisión humana',
    'services.editorial-kdp.feature2': 'Diseño de portada e interior profesional',
    'services.editorial-kdp.feature3': 'Publicación en KDP: ebook + impreso bajo demanda',
    'services.editorial-kdp.feature4': 'ISBN, copyright y derechos del autor incluidos',
    'services.editorial-kdp.feature5': 'Estrategia de lanzamiento y primeras reseñas',
    'services.editorial-kdp.feature6': 'Panel de regalías y ventas en tiempo real',
    'services.editorial-kdp.pricing': 'Desde $2,500',
    'services.editorial-kdp.timeline': '4-6 semanas',

    'services.fabrica-ia.title': 'Fábrica de Contenido IA',
    'services.fabrica-ia.description': 'Automatización inteligente de tu estrategia de contenido con IA',
    'services.fabrica-ia.feature1': 'Sistema de autopost calendárizado',
    'services.fabrica-ia.feature2': 'Generación de contenido personalizado',
    'services.fabrica-ia.feature3': 'Optimización para engagement',
    'services.fabrica-ia.feature4': 'Analytics en tiempo real',
    'services.fabrica-ia.feature5': 'A/B testing automatizado',
    'services.fabrica-ia.feature6': 'Integración con todas las plataformas',
    'services.fabrica-ia.pricing': 'Desde $1,800/mes',
    'services.fabrica-ia.timeline': '2-3 semanas setup',

    'services.podcast-media.title': 'Producción Podcast + Media',
    'services.podcast-media.description': 'Tu voz al mundo con producción profesional y distribución estratégica',
    'services.podcast-media.feature1': 'Producción de audio profesional',
    'services.podcast-media.feature2': 'Edición y post-producción',
    'services.podcast-media.feature3': 'Distribución en todas las plataformas',
    'services.podcast-media.feature4': 'Creación de audiencias',
    'services.podcast-media.feature5': 'Monetización desde el primer episodio',
    'services.podcast-media.feature6': 'Branding completo del show',
    'services.podcast-media.pricing': 'Desde $3,200',
    'services.podcast-media.timeline': '3-4 semanas',

    'services.pos-ecommerce.title': 'Presencia Digital + Ventas',
    'services.pos-ecommerce.description': 'Menú QR, tienda online o catálogo de servicios con punto de venta y pagos Stripe. Sistema completo listo para operar.',
    'services.pos-ecommerce.feature1': 'Menú QR y catálogo digital responsive',
    'services.pos-ecommerce.feature2': 'Sistema de órdenes online y pickup',
    'services.pos-ecommerce.feature3': 'POS con inventario en tiempo real',
    'services.pos-ecommerce.feature4': 'Pagos integrados vía Stripe',
    'services.pos-ecommerce.feature5': 'Dashboard de ventas, clientes y analytics',
    'services.pos-ecommerce.feature6': 'Panel de administración multi-dispositivo',
    'services.pos-ecommerce.pricing': 'Desde $4,500',
    'services.pos-ecommerce.timeline': '6-8 semanas',

    'services.proptech.title': 'PropTech + Real Estate',
    'services.proptech.description': 'Tecnología inmobiliaria para maximizar tus inversiones turísticas',
    'services.proptech.feature1': 'Plataforma de gestión de propiedades',
    'services.proptech.feature2': 'Marketing digital especializado',
    'services.proptech.feature3': 'Captación de inversores globales',
    'services.proptech.feature4': 'Análisis de ROI automatizado',
    'services.proptech.feature5': 'Documentación legal completa',
    'services.proptech.feature6': 'Seguimiento post-venta',
    'services.proptech.pricing': 'Consultoría personalizada',
    'services.proptech.timeline': '8-12 semanas',

    'services.consultoria.title': 'Ecosistema Digital Completo',
    'services.consultoria.description': 'Construimos tu presencia digital de cero: estrategia, marca, web y dashboard. Todo conectado bajo el músculo del ecosistema MaalCa.',
    'services.consultoria.feature1': 'Diagnóstico y estrategia de negocio personalizada',
    'services.consultoria.feature2': 'Identidad de marca y presencia web completa',
    'services.consultoria.feature3': 'Dashboard de gestión a medida',
    'services.consultoria.feature4': 'Integración en el ecosistema MaalCa',
    'services.consultoria.feature5': 'Mentoría ejecutiva y acompañamiento continuo',
    'services.consultoria.feature6': 'Acceso preferencial a todos los módulos',
    'services.consultoria.pricing': 'Desde $8,000',
    'services.consultoria.timeline': 'Ongoing',

    // Services - Common Labels
    'services.investment': 'Inversión:',
    'services.timeline': 'Timeline:',
    'services.moreInfo': 'Más Información',

    // Process Section
    'services.process.title': 'Nuestro Proceso',
    'services.process.description': 'Un enfoque sistemático que garantiza resultados mientras mantenemos la comunicación transparente',
    'services.process.step1.title': 'Conversación Inicial',
    'services.process.step1.description': 'Entendemos tu visión, objetivos y desafíos específicos',
    'services.process.step2.title': 'Estrategia Personalizada',
    'services.process.step2.description': 'Diseñamos una propuesta única adaptada a tus necesidades',
    'services.process.step3.title': 'Implementación',
    'services.process.step3.description': 'Ejecutamos con excelencia mientras te mantenemos informado',
    'services.process.step4.title': 'Lanzamiento y Optimización',
    'services.process.step4.description': 'Ponemos en marcha y optimizamos basado en resultados reales',

    // Results Section
    'services.results.title': 'Resultados Reales',
    'services.results.description': 'Nuestros clientes no solo obtienen servicios, obtienen resultados medibles y crecimiento sostenible',
    'services.results.metric1': '200%',
    'services.results.metric1.label': 'Crecimiento promedio en engagement',
    'services.results.metric2': '15+',
    'services.results.metric2.label': 'Proyectos lanzados exitosamente',
    'services.results.metric3': '98%',
    'services.results.metric3.label': 'Satisfacción del cliente',
    'services.results.cta': 'Ver Casos de Estudio Completos',

    // CTA Section
    'services.cta.title': '¿Listo para transformar tu proyecto?',
    'services.cta.description': 'Cada proyecto único merece una propuesta personalizada. Conversemos sobre tu visión y creemos algo extraordinario juntos.',
    'services.cta.consultation': 'Solicitar Consulta Gratuita',
    'services.cta.portfolio': 'Ver Nuestro Portafolio',

    // Contact Page - Hero
    'contactPage.hero.title': 'Hablemos de tu',
    'contactPage.hero.subtitle': 'Proyecto',
    'contactPage.hero.description': 'Cada gran proyecto comienza con una conversación. Cuéntanos tu visión y exploremos juntos las posibilidades.',

    // Contact Page - Form
    'contactPage.form.title': 'Envíanos un mensaje',
    'contactPage.form.name': 'Nombre',
    'contactPage.form.namePlaceholder': 'Tu nombre completo',
    'contactPage.form.email': 'Email',
    'contactPage.form.emailPlaceholder': 'tu@email.com',
    'contactPage.form.company': 'Empresa/Organización',
    'contactPage.form.companyPlaceholder': 'Nombre de tu empresa (opcional)',
    'contactPage.form.projectType': 'Tipo de Proyecto',
    'contactPage.form.projectPlaceholder': 'Selecciona un tipo de proyecto',
    'contactPage.form.message': 'Mensaje',
    'contactPage.form.messagePlaceholder': 'Cuéntanos sobre tu proyecto, ideas o cómo podemos colaborar...',
    'contactPage.form.submit': 'Enviar Mensaje',
    'contactPage.form.submitting': 'Enviando...',
    'contactPage.form.disclaimer': 'Al enviar este formulario, aceptas que podamos contactarte sobre tu consulta.',

    // Contact Page - Project Options
    'contactPage.project.editorial': 'Editorial y Publicaciones',
    'contactPage.project.tech': 'Desarrollo Tecnológico',
    'contactPage.project.content': 'Creación de Contenido',
    'contactPage.project.realEstate': 'Bienes Raíces',
    'contactPage.project.catering': 'Servicios de Catering',
    'contactPage.project.consulting': 'Consultoría',
    'contactPage.project.collaboration': 'Colaboración/Partnership',
    'contactPage.project.other': 'Otro',

    // Contact Page - Contact Info
    'contactPage.info.title': 'Información de Contacto',
    'contactPage.info.company': 'MaalCa LLC',
    'contactPage.info.ecosystem': 'Ecosistema Creativo',
    'contactPage.info.location': 'Elmira, NY • Estados Unidos',
    'contactPage.info.emailLabel': 'Email',
    'contactPage.info.responseTime': 'Tiempo de Respuesta',
    'contactPage.info.responseTimeValue': '24-48 horas hábiles',

    // Contact Page - Philosophy Quote
    'contactPage.quote.text': 'Cada conversación es una oportunidad de crear algo extraordinario. En MaalCa creemos que los mejores proyectos nacen del diálogo genuino y la conexión humana.',
    'contactPage.quote.author': 'Filosofía MaalCa',

    // Form Validation Messages
    'validation.required': 'Este campo es requerido',
    'validation.minLength': 'Debe tener al menos {min} caracteres',
    'validation.maxLength': 'No puede exceder {max} caracteres',
    'validation.emailInvalid': 'Por favor ingresa un email válido',
    'validation.formatInvalid': 'Formato inválido',
    'validation.fullName': 'Por favor ingresa tu nombre completo',

    // Form Success Messages
    'form.success.message1': '¡Gracias por tu mensaje! Te contactaremos en las próximas 24-48 horas.',
    'form.success.message2': '¡Mensaje recibido! Nuestro equipo revisará tu solicitud y te responderá pronto.',
    'form.success.message3': '¡Perfecto! Hemos recibido tu consulta. Te escribiremos a la brevedad.',

    // Form Error Messages
    'form.error.submission': 'Error en el envío. Por favor verifica tu email e intenta nuevamente.',
    'form.error.spam': 'Su mensaje ha sido marcado como spam. Por favor contacte directamente.',
    'form.error.unexpected': 'Error inesperado. Por favor intenta nuevamente.',

    // CiriWhispers Page - Navigation
    'ciriwhispers.nav.about': 'Sobre Mí',
    'ciriwhispers.nav.works': 'Obras',
    'ciriwhispers.nav.letters': 'Cartas',

    // CiriWhispers - Hero
    'ciriwhispers.hero.subtitle': 'Palabras que susurran al alma',
    'ciriwhispers.hero.description': 'Bienvenido a mi laberinto literario, donde cada palabra es un eco de lo no dicho, cada frase una puerta hacia lo profundo. Aquí convergen las sombras de Poe, la crudeza de Bukowski y el realismo mágico que habita entre lo cotidiano y lo extraordinario.',
    'ciriwhispers.hero.quote': 'En la penumbra del alma, las palabras encuentran su verdad más íntima',
    'ciriwhispers.hero.enterLabyrinth': 'Entrar al Laberinto',
    'ciriwhispers.hero.soulWhispers': 'Susurros del Alma',

    // CiriWhispers - About Section
    'ciriwhispers.about.title': 'El Susurro detrás de las Palabras',
    'ciriwhispers.about.heading': 'Sobre Ciriaco',
    'ciriwhispers.about.p1': 'Dominicano, amante de las palabras y de los mundos que nacen de ellas. Empecé a escribir como un acto reflexivo, inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida.',
    'ciriwhispers.about.p2': 'Escritor empírico con cuentos, un poemario y una novela publicada (Amaranta), sigo explorando la narrativa romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski por su capacidad de transformar lo cotidiano en arte.',
    'ciriwhispers.about.p3': 'Actualmente trabajo en Almas rotas. Si buscas poesía, historias con alma y un espacio donde las emociones toman forma, este es tu lugar.',
    'ciriwhispers.about.location': 'Elmira, NY.',
    'ciriwhispers.about.inspirations.title': 'Inspiraciones',
    'ciriwhispers.about.inspirations.poe': 'Edgar Allan Poe - El maestro de lo macabro poético',
    'ciriwhispers.about.inspirations.bukowski': 'Charles Bukowski - La honestidad brutal',
    'ciriwhispers.about.inspirations.magical': 'Realismo Mágico - Donde lo cotidiano se vuelve extraordinario',
    'ciriwhispers.about.inspirations.night': 'La noche como musa y confidente',
    'ciriwhispers.about.process.title': 'Mi Proceso',
    'ciriwhispers.about.process.description': 'Escribo principalmente en las horas más silenciosas, cuando el mundo duerme y las palabras fluyen sin filtros. Cada texto nace de una emoción visceral, de un susurro del inconsciente que demanda ser escuchado.',

    // Sensitive content warnings
    'warning.sensitiveContent': 'Aviso de contenido sensible',
    'warning.contains': 'Contiene temas de: {topics}.',
    'warning.recommended': 'Recomendado para lectores +16.',
    'warning.traumaFamiliar': 'trauma familiar',
    'warning.duelo': 'duelo',
    'warning.temasPsicologicos': 'temas psicológicos',
    'warning.violencia': 'violencia',
    'warning.prision': 'prisión',
    'warning.estigmaSocial': 'estigma social',

    // CiriWhispers - Works Section
    'ciriwhispers.works.title': 'Los Manuscritos del Laberinto',
    'ciriwhispers.works.description': 'Cada libro es un fragmento de alma transformado en palabras, una invitación a explorar los rincones más profundos de la experiencia humana.',
    'ciriwhispers.works.readerNotice': '¡Ya disponible! Lector digital integrado - Demo funcional con libros de prueba',
    'ciriwhispers.works.readerSubnotice': 'Los libros disponibles cargan contenido demo para probar la experiencia de lectura inmersiva',
    'ciriwhispers.works.status.available': 'Disponible',
    'ciriwhispers.works.status.inProgress': 'En progreso',
    'ciriwhispers.works.status.development': 'En desarrollo',
    'ciriwhispers.works.readButton': 'Leer en CiriWhispers',
    'ciriwhispers.works.readSoonButton': 'Leer Aquí (Próximamente)',
    'ciriwhispers.works.buyButton': 'Comprar en Amazon',
    'ciriwhispers.works.fullLetterButton': 'Leer carta completa →',

    // CiriWhispers - Books
    'ciriwhispers.book.amaranta.title': 'Amaranta',
    'ciriwhispers.book.amaranta.subtitle': 'Thriller psicológico',
    'ciriwhispers.book.amaranta.synopsis': 'Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar también puede ser una forma de perdón.',
    'ciriwhispers.book.amaranta.excerpt': 'En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida...',
    'ciriwhispers.book.amaranta.tags': 'novela, psicológico, drama íntimo',

    'ciriwhispers.book.luzsombras.title': 'Luces & Sombras',
    'ciriwhispers.book.luzsombras.subtitle': 'Poemario narrativo',
    'ciriwhispers.book.luzsombras.synopsis': '106 poemas que rozan la piel y la contradicción: amor, pérdida y el resplandor que solo se ve cuando todo oscurece.',
    'ciriwhispers.book.luzsombras.excerpt': 'Hay luces que solo brillan en la oscuridad más absoluta, como las estrellas que nacen del vacío...',
    'ciriwhispers.book.luzsombras.tags': 'poesía, amor, intimidad',

    'ciriwhispers.book.cartashiedra.title': 'Cartas a la Hiedra',
    'ciriwhispers.book.cartashiedra.subtitle': 'Colección epistolar',
    'ciriwhispers.book.cartashiedra.synopsis': 'Treinta cartas íntimas a una presencia viva: la hiedra. Deseo, frontera y lo que crece incluso en el muro más frío.',
    'ciriwhispers.book.cartashiedra.excerpt': 'Querida Hiedra, tus brazos abrazan muros como yo abrazo palabras: con la desesperación de quien sabe que todo es efímero...',
    'ciriwhispers.book.cartashiedra.tags': 'epistolar, prosa poética',

    'ciriwhispers.book.cosasnocontar.title': 'Cosas que no hay que contar',
    'ciriwhispers.book.cosasnocontar.subtitle': 'Relatos de filo íntimo',
    'ciriwhispers.book.cosasnocontar.synopsis': 'Pequeñas heridas en voz baja: escenas que nadie confiesa, contadas con delicadeza y crudeza a la vez.',
    'ciriwhispers.book.cosasnocontar.excerpt': 'Hay historias que se escriben con lágrimas en papel invisible, para que solo el alma las pueda leer...',
    'ciriwhispers.book.cosasnocontar.tags': 'cuentos, realismo crudo',

    'ciriwhispers.book.elmirarny.title': 'Elmira, NY',
    'ciriwhispers.book.elmirarny.subtitle': 'Crónicas del exilio',
    'ciriwhispers.book.elmirarny.synopsis': 'Mapa emocional de Elmira: soledades, trabajos, vínculos y los fantasmas que se cuelan por las ventanas de invierno.',
    'ciriwhispers.book.elmirarny.excerpt': 'El exilio no es un lugar, es un estado del alma que se lleva a todas partes...',
    'ciriwhispers.book.elmirarny.tags': 'crónica, autoficción, ensayo',

    'ciriwhispers.book.ramirito.title': 'Ramirito',
    'ciriwhispers.book.ramirito.subtitle': 'Novela — memoria y estigma',
    'ciriwhispers.book.ramirito.synopsis': 'Regresar al barrio tras la prisión: el respeto ya no alcanza, los jóvenes no temen y el nombre pesa más que la carne.',
    'ciriwhispers.book.ramirito.excerpt': '—Ese es Ramirito, el que mató a su mamá.',
    'ciriwhispers.book.ramirito.tags': 'novela, realismo social',

    // CiriWhispers - Letters/Blog Section
    'ciriwhispers.letters.title': 'Susurros desde el Laberinto',
    'ciriwhispers.letters.description': 'Reflexiones íntimas, fragmentos de vida y susurros nocturnos compartidos en la intimidad de estas páginas digitales.',
    'ciriwhispers.letters.shareTitle': 'CiriWhispers - Palabras que susurran al alma',
    'ciriwhispers.letters.shareDescription': 'Literatura íntima, poesía y reflexiones nocturnas desde el laberinto de las emociones.',

    // CiriWhispers - Blog Posts
    'ciriwhispers.blog.perfilautor.title': 'Sobre Ciriaco A. Pichardo',
    'ciriwhispers.blog.perfilautor.date': 'Actualizado 2025',
    'ciriwhispers.blog.perfilautor.excerpt': 'Dominicano, amante de las palabras y de los mundos que nacen de ellas.',
    'ciriwhispers.blog.perfilautor.content': 'Empecé a escribir como un acto reflexivo, inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida. Escritor empírico con cuentos, un poemario y una novela publicada (Amaranta), sigo explorando la narrativa romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski por su capacidad de transformar lo cotidiano en arte. Actualmente trabajo en mi próxima novela, Almas rotas. Si buscas poesía, historias con alma y un espacio donde las emociones toman forma, este es tu lugar. Elmira, NY.',

    'ciriwhispers.blog.invierno.title': 'Invierno en Elmira',
    'ciriwhispers.blog.invierno.date': 'Enero 2024',
    'ciriwhispers.blog.invierno.excerpt': 'La nieve cubre los secretos...',
    'ciriwhispers.blog.invierno.content': 'Este pueblo me enseñó a escuchar el crujido de la madera vieja y a llamar hogar a una silla en silencio.',

    // CiriWhispers - Contact Section
    'ciriwhispers.contact.title': 'Conectemos Almas',
    'ciriwhispers.contact.description': 'Para colaboraciones, encargos literarios o simplemente para compartir un susurro en la inmensidad digital.',
    'ciriwhispers.contact.form.title': 'Envíame un Mensaje',
    'ciriwhispers.contact.form.name': 'Tu nombre',
    'ciriwhispers.contact.form.email': 'Tu email',
    'ciriwhispers.contact.form.message': 'Tu mensaje...',
    'ciriwhispers.contact.form.submit': 'Enviar Susurro',
    'ciriwhispers.contact.social.title': 'Sígueme',
    'ciriwhispers.contact.social.instagram': 'Instagram @CiriWhispers',
    'ciriwhispers.contact.social.youtube': 'YouTube - Lecturas (Próximamente)',
    'ciriwhispers.contact.social.spotify': 'Spotify - Audiolibros (Próximamente)',
    'ciriwhispers.contact.social.editorial': 'Editorial MaalCa',
    'ciriwhispers.contact.services.title': 'Servicios',
    'ciriwhispers.contact.services.texts': 'Textos personalizados',
    'ciriwhispers.contact.services.prologues': 'Prólogos y reseñas',
    'ciriwhispers.contact.services.workshops': 'Talleres de escritura creativa',
    'ciriwhispers.contact.services.ghostwriting': 'Ghostwriting literario',
    'ciriwhispers.contact.signature': '"Siempre tuyo, @CiriWhispers"',

    // CiriWhispers Ecosystem - New pages
    'ciriwhispers.landing.hook': 'Lo bello tambien sangra',
    'ciriwhispers.landing.subhook': '...pero aqui se escribe.',
    'ciriwhispers.landing.desc': 'Microcuentos, poemas, cartas y novelas. Historias que no se cuentan en voz alta — hasta ahora.',
    'ciriwhispers.landing.cta.read': 'Leer gratis',
    'ciriwhispers.landing.cta.obras': 'Ver obras',
    'ciriwhispers.landing.cta.podcast': 'Podcast',

    'ciriwhispers.nav2.inicio': 'Inicio',
    'ciriwhispers.nav2.biblioteca': 'Biblioteca',
    'ciriwhispers.nav2.obras': 'Obras',
    'ciriwhispers.nav2.manifiesto': 'Manifiesto',
    'ciriwhispers.nav2.contacto': 'Contacto',

    'ciriwhispers.biblioteca.title': 'Biblioteca',
    'ciriwhispers.biblioteca.desc': 'Historias cortas, poemas, fragmentos y cartas. Todo gratis. Todo real.',
    'ciriwhispers.biblioteca.all': 'Todos',
    'ciriwhispers.biblioteca.microcuentos': 'Microcuentos',
    'ciriwhispers.biblioteca.fragmentos': 'Fragmentos',
    'ciriwhispers.biblioteca.poemas': 'Poemas',
    'ciriwhispers.biblioteca.cartas': 'Cartas',
    'ciriwhispers.biblioteca.empty': 'No hay historias de este tipo todavia.',
    'ciriwhispers.biblioteca.readMore': 'Seguir leyendo',
    'ciriwhispers.biblioteca.min': 'min',

    'ciriwhispers.obras2.title': 'Obras',
    'ciriwhispers.obras2.desc': 'Novelas, poemarios y colecciones. Algunas publicadas, otras en camino. Todas escritas con lo que no se dice en voz alta.',
    'ciriwhispers.obras2.readNow': 'Leer ahora',
    'ciriwhispers.obras2.buyAmazon': 'Comprar en Amazon',
    'ciriwhispers.obras2.backToObras': 'Obras',
    'ciriwhispers.obras2.relatedStories': 'Fragmentos de esta obra',

    'ciriwhispers.manifiesto.label': 'Manifiesto',
    'ciriwhispers.manifiesto.quote': 'No escribo para gustarte. Escribo para que te reconozcas en lo que escondes.',
    'ciriwhispers.manifiesto.name': 'Ciriaco A. Pichardo',
    'ciriwhispers.manifiesto.role': 'Escritor, fundador de Editorial MaalCa',
    'ciriwhispers.manifiesto.intro': 'Dominicano. Inmigrante. Padre. Escribo porque no se como callarme. Porque las cosas que importan no se dicen en voz alta, se escriben a las 3 de la manana cuando nadie esta mirando.',
    'ciriwhispers.manifiesto.p1': 'No vengo de una familia de escritores. No estudie literatura en una universidad prestigiosa. Aprendi a escribir como se aprende a pelear: por necesidad. Porque habia cosas dentro de mi que si no salian por la pluma, iban a salir de otra forma.',
    'ciriwhispers.manifiesto.p2': 'Mis historias no son bonitas. Son reales. Hablan de lo que pasa cuando cruzas un oceano con una maleta y un sueno que nadie mas entiende. De lo que significa construir algo desde cero en un lugar donde nadie te conoce. De lo que escondes detras de la sonrisa que le das al mundo.',
    'ciriwhispers.manifiesto.pullquote': 'Lo bello tambien sangra. Pero aqui se escribe.',
    'ciriwhispers.manifiesto.p3': 'CiriWhispers nacio como un susurro. Un lugar donde las historias que no cabian en ningun otro sitio pudieran existir. Microcuentos que se leen en un minuto pero te persiguen por dias. Poemas que no riman pero duelen. Cartas que nunca se enviaron. Novelas que se escribieron a pedazos, entre turnos de trabajo y noches sin dormir.',
    'ciriwhispers.manifiesto.p4': 'No escribo para un publico. Escribo para esa persona que a las 2 AM siente que nadie la entiende. Si una sola frase mia te hace sentir menos sola, entonces ya valio la pena todo.',
    'ciriwhispers.manifiesto.value1.title': 'Honestidad brutal',
    'ciriwhispers.manifiesto.value1.desc': 'Sin filtros, sin decoracion. Las historias crudas son las que sanan.',
    'ciriwhispers.manifiesto.value2.title': 'Acceso libre',
    'ciriwhispers.manifiesto.value2.desc': 'La literatura no deberia ser un lujo. La biblioteca es gratis. Siempre.',
    'ciriwhispers.manifiesto.value3.title': 'Comunidad',
    'ciriwhispers.manifiesto.value3.desc': 'No somos lectores. Somos complices. Cada historia nos conecta.',
    'ciriwhispers.manifiesto.cta.read': 'Leer gratis',

    'ciriwhispers.contacto2.label': 'Contacto',
    'ciriwhispers.contacto2.title': 'Hablemos',
    'ciriwhispers.contacto2.desc': 'Para colaboraciones, prensa, derechos de publicacion o simplemente para decir que una historia te movio algo.',
    'ciriwhispers.contacto2.email.title': 'Email',
    'ciriwhispers.contacto2.email.desc': 'Para consultas, colaboraciones o derechos de publicacion.',
    'ciriwhispers.contacto2.instagram.title': 'Instagram',
    'ciriwhispers.contacto2.instagram.desc': 'Fragmentos, detras de camara y contenido exclusivo.',
    'ciriwhispers.contacto2.amazon.title': 'Amazon',
    'ciriwhispers.contacto2.amazon.desc': 'Todos los libros publicados disponibles en formato fisico y digital.',
    'ciriwhispers.contacto2.amazon.link': 'Pagina de autor en Amazon',
    'ciriwhispers.contacto2.podcast.title': 'Podcast',
    'ciriwhispers.contacto2.podcast.desc': 'Conversaciones sin filtro sobre escritura, vida e inmigracion.',
    'ciriwhispers.contacto2.collab.title': 'Tipos de colaboracion',
    'ciriwhispers.contacto2.collab1.title': 'Prensa & Entrevistas',
    'ciriwhispers.contacto2.collab1.desc': 'Disponible para entrevistas, podcasts y articulos sobre literatura, inmigracion y emprendimiento.',
    'ciriwhispers.contacto2.collab2.title': 'Publicacion & Derechos',
    'ciriwhispers.contacto2.collab2.desc': 'Para traducciones, adaptaciones o publicacion en antologias y revistas literarias.',
    'ciriwhispers.contacto2.collab3.title': 'Eventos & Lecturas',
    'ciriwhispers.contacto2.collab3.desc': 'Lecturas en vivo, presentaciones de libros y eventos literarios.',
    'ciriwhispers.contacto2.collab4.title': 'Contenido & Creacion',
    'ciriwhispers.contacto2.collab4.desc': 'Colaboraciones con otros escritores, ilustradores y creadores de contenido.',
    'ciriwhispers.contacto2.maalca': 'Para proyectos empresariales o tecnologicos con MaalCa:',
    'ciriwhispers.contacto2.maalcaLink': 'Contacto MaalCa Ecosistema',

    // CiriWhispers — Biblioteca extras
    'ciriwhispers.biblioteca.comingSoon': 'Nuevas historias cada semana.',
    'ciriwhispers.biblioteca.comingSoonSub': 'Suscribete abajo para recibirlas antes que nadie.',

    // CiriWhispers — Story type labels
    'ciriwhispers.storyType.microcuento': 'Microcuento',
    'ciriwhispers.storyType.fragmento': 'Fragmento',
    'ciriwhispers.storyType.poema': 'Poema',
    'ciriwhispers.storyType.carta': 'Carta',
    'ciriwhispers.storyType.capitulo': 'Capitulo',
    'ciriwhispers.storyType.microcuentos': 'Microcuentos',
    'ciriwhispers.storyType.fragmentos': 'Fragmentos',
    'ciriwhispers.storyType.poemas': 'Poemas',
    'ciriwhispers.storyType.cartas': 'Cartas',
    'ciriwhispers.storyType.capitulos': 'Capitulos',

    // CiriWhispers — StoryReader UI
    'ciriwhispers.storyReader.minRead': 'min de lectura',
    'ciriwhispers.storyReader.seriesTeaser': 'Este texto es parte de algo mas grande.',
    'ciriwhispers.storyReader.moreTeaser': 'Hay mas donde esto salio.',
    'ciriwhispers.storyReader.keepReading': 'Seguir leyendo',
    'ciriwhispers.storyReader.close': 'Cerrar',

    // CiriWhispers — Footer
    'ciriwhispers.footer.newsletter.title': 'Susurros al oido',
    'ciriwhispers.footer.newsletter.desc': 'Historias que no se publican. Fragmentos que no llegan a libro. Solo para ti.',
    'ciriwhispers.footer.nav': 'Navegar',
    'ciriwhispers.footer.biblioteca': 'Biblioteca',
    'ciriwhispers.footer.obras': 'Obras',
    'ciriwhispers.footer.podcast': 'Hablando Mierda (Podcast)',
    'ciriwhispers.footer.connect': 'Conectar',
    'ciriwhispers.footer.ecosystem': 'Ecosistema',
    'ciriwhispers.footer.editorial': 'Editorial',
    'ciriwhispers.footer.quote': 'No escribo para gustarte. Escribo para que te reconozcas en lo que escondes.',

    // CiriWhispers — Story titles (ES)
    'ciriwhispers.story.amaranta-eco-culpa.title': 'El Eco de una Culpa',
    'ciriwhispers.story.amaranta-eco-culpa.excerpt': 'En la penumbra de su memoria, Amaranta encontro las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos...',
    'ciriwhispers.story.amaranta-voces-silencio.title': 'Voces en el Silencio',
    'ciriwhispers.story.amaranta-voces-silencio.excerpt': 'Las noches se habian vuelto territorio de voces que nadie mas podia escuchar. Amaranta despertaba sobresaltada, creyendo haber oido su nombre...',
    'ciriwhispers.story.poema-eclipse.title': 'Eclipse',
    'ciriwhispers.story.poema-eclipse.excerpt': 'Hay luces que solo brillan en la oscuridad mas absoluta, como las estrellas que nacen del vacio...',
    'ciriwhispers.story.poema-herida-abierta.title': 'Herida Abierta',
    'ciriwhispers.story.poema-herida-abierta.excerpt': 'No me pidas que cierre esta herida. Es lo unico que me queda de ti...',
    'ciriwhispers.story.bloqueado.title': 'Bloqueado',
    'ciriwhispers.story.bloqueado.excerpt': 'Le bloquee el numero. No porque no lo quisiera, sino porque cada vez que sonaba el telefono...',
    'ciriwhispers.story.nevera-bebidas.title': 'La Nevera de las Bebidas',
    'ciriwhispers.story.nevera-bebidas.excerpt': 'En casa de abuela habia una nevera vieja que solo servia para las bebidas. Nadie la limpiaba...',
    'ciriwhispers.story.jardin-pelirroja.title': 'El Jardin y la Pelirroja',
    'ciriwhispers.story.jardin-pelirroja.excerpt': 'La vi por primera vez en el jardin de la biblioteca publica. Leia un libro que no tenia titulo en el lomo...',
    'ciriwhispers.story.carta-01-no-vuelvas.title': 'Carta I: No Vuelvas',
    'ciriwhispers.story.carta-01-no-vuelvas.excerpt': 'Querida hiedra: no vuelvas a crecer por mi pared. Ya no tengo fuerza para arrancarte...',
    'ciriwhispers.story.carta-02-invierno.title': 'Carta II: Invierno',
    'ciriwhispers.story.carta-02-invierno.excerpt': 'Hiedra: hoy nevo por primera vez desde que llegue a esta ciudad. Todo esta blanco, menos tu...',

    // CiriSonic Page - Hero Section
    'cirisonic.hero.title': 'CiriSonic',
    'cirisonic.hero.subtitle': 'Fábrica IA de Contenido',
    'cirisonic.hero.description.part1': 'La plataforma de inteligencia artificial que genera textos, imágenes, audio y video con',
    'cirisonic.hero.description.strategy': 'estrategia',
    'cirisonic.hero.description.and': 'y',
    'cirisonic.hero.description.engagement': 'engagement aumentado',
    'cirisonic.hero.button.demo': 'Solicitar Demo',
    'cirisonic.hero.button.features': 'Ver Funciones',
    'cirisonic.hero.stat1.value': '10x',
    'cirisonic.hero.stat1.label': 'Más Rápido',
    'cirisonic.hero.stat2.value': '80%',
    'cirisonic.hero.stat2.label': 'Menos Costos',
    'cirisonic.hero.stat3.value': '24/7',
    'cirisonic.hero.stat3.label': 'Siempre Activo',
    'cirisonic.hero.scroll': 'Descubrir',

    // CiriSonic - Navigation
    'cirisonic.nav.services': 'Servicios',
    'cirisonic.nav.howItWorks': 'Cómo Funciona',
    'cirisonic.nav.demo': 'Demo',
    'cirisonic.nav.pricing': 'Precios',
    'cirisonic.nav.requestDemo': 'Solicitar Demo',

    // CiriSonic - Services Section
    'cirisonic.services.title': '¿Qué hace CiriSonic?',
    'cirisonic.services.description': 'Una suite completa de herramientas de IA para crear contenido de nivel profesional en minutos, no horas.',
    'cirisonic.services.viewDemo': 'Ver Demo',

    // CiriSonic - Service 1: Text AI
    'cirisonic.service.text.title': 'Textos IA',
    'cirisonic.service.text.subtitle': 'Content Generation',
    'cirisonic.service.text.description': 'Artículos, posts, newsletters y copy optimizado generado por IA avanzada con tu tono de marca.',
    'cirisonic.service.text.feature1': 'SEO optimizado',
    'cirisonic.service.text.feature2': 'Múltiples tonos',
    'cirisonic.service.text.feature3': 'Personalización',
    'cirisonic.service.text.feature4': 'Auto-planning',

    // CiriSonic - Service 2: Image AI
    'cirisonic.service.image.title': 'Imágenes & Logos',
    'cirisonic.service.image.subtitle': 'Visual Creation',
    'cirisonic.service.image.description': 'Diseños únicos, logos profesionales e imágenes para redes sociales creadas por IA.',
    'cirisonic.service.image.feature1': 'Marca consistente',
    'cirisonic.service.image.feature2': 'Formatos múltiples',
    'cirisonic.service.image.feature3': 'Estilos variados',
    'cirisonic.service.image.feature4': 'Templates',

    // CiriSonic - Service 3: Audio AI
    'cirisonic.service.audio.title': 'Audio Narrado',
    'cirisonic.service.audio.subtitle': 'Voice Synthesis',
    'cirisonic.service.audio.description': 'Convierte texto en audio profesional con voces sintéticas naturales para podcasts y contenido.',
    'cirisonic.service.audio.feature1': 'Voces naturales',
    'cirisonic.service.audio.feature2': 'Múltiples idiomas',
    'cirisonic.service.audio.feature3': 'Emociones',
    'cirisonic.service.audio.feature4': 'Música de fondo',

    // CiriSonic - Service 4: Video AI
    'cirisonic.service.video.title': 'Video Automatizado',
    'cirisonic.service.video.subtitle': 'Motion Graphics',
    'cirisonic.service.video.description': 'Reels, presentaciones y videos promocionales generados automáticamente con IA.',
    'cirisonic.service.video.feature1': 'Templates pro',
    'cirisonic.service.video.feature2': 'Auto-subtitulado',
    'cirisonic.service.video.feature3': 'Transiciones',
    'cirisonic.service.video.feature4': 'Optimización',

    // CiriSonic - How It Works
    'cirisonic.howItWorks.title': 'Cómo Funciona',
    'cirisonic.howItWorks.description': 'Un proceso simple de 4 pasos que transforma tus ideas en contenido viral',
    'cirisonic.howItWorks.step1.title': 'Genera',
    'cirisonic.howItWorks.step1.description': 'Describe tu idea y la IA crea contenido optimizado',
    'cirisonic.howItWorks.step2.title': 'Personaliza',
    'cirisonic.howItWorks.step2.description': 'Ajusta el tono, estilo y marca según tu audiencia',
    'cirisonic.howItWorks.step3.title': 'Publica',
    'cirisonic.howItWorks.step3.description': 'Programa y publica en múltiples plataformas',
    'cirisonic.howItWorks.step4.title': 'Mide Impacto',
    'cirisonic.howItWorks.step4.description': 'Analiza métricas y optimiza el rendimiento',

    // CiriSonic - Dashboard Section
    'cirisonic.dashboard.title': 'Dashboard CiriSonic',
    'cirisonic.dashboard.description': 'Una interfaz intuitiva que pone el poder de la IA al alcance de todos',
    'cirisonic.dashboard.greeting': '¡Hola, Creator!',
    'cirisonic.dashboard.pendingProjects': 'Tienes 3 proyectos pendientes de publicar',
    'cirisonic.dashboard.createContent': '+ Crear Contenido',
    'cirisonic.dashboard.stat.engagement': 'Engagement',
    'cirisonic.dashboard.stat.contentCreated': 'Contenido Creado',
    'cirisonic.dashboard.stat.totalReach': 'Alcance Total',
    'cirisonic.dashboard.stat.avgROI': 'ROI Promedio',
    'cirisonic.dashboard.tool.generateText.title': 'Generar Texto',
    'cirisonic.dashboard.tool.generateText.description': 'Artículos, posts y copy optimizado',
    'cirisonic.dashboard.tool.generateText.status': 'Activo',
    'cirisonic.dashboard.tool.createReel.title': 'Crear Reel',
    'cirisonic.dashboard.tool.createReel.description': 'Videos virales para redes sociales',
    'cirisonic.dashboard.tool.createReel.status': 'Procesando...',
    'cirisonic.dashboard.tool.voiceOver.title': 'Hacer VoiceOver',
    'cirisonic.dashboard.tool.voiceOver.description': 'Narración profesional en segundos',
    'cirisonic.dashboard.tool.voiceOver.status': 'Disponible',
    'cirisonic.dashboard.tool.use': 'Usar',
    'cirisonic.dashboard.cta': 'Probar Dashboard Gratis',

    // CiriSonic - Use Cases
    'cirisonic.useCases.title': 'Casos de Uso',
    'cirisonic.useCases.description': 'CiriSonic se adapta a cualquier industria y tamaño de empresa',
    'cirisonic.useCase.startups.title': 'Startups',
    'cirisonic.useCase.startups.description': 'Marketing automatizado sin equipo grande',
    'cirisonic.useCase.startups.benefit1': 'Reduce costos 80%',
    'cirisonic.useCase.startups.benefit2': 'Velocidad x10',
    'cirisonic.useCase.startups.benefit3': 'Marca consistente',
    'cirisonic.useCase.startups.benefit4': 'Escalabilidad',
    'cirisonic.useCase.creators.title': 'Autores/Creadores',
    'cirisonic.useCase.creators.description': 'Contenido editorial profesional',
    'cirisonic.useCase.creators.benefit1': 'Más audiencia',
    'cirisonic.useCase.creators.benefit2': 'Engagement alto',
    'cirisonic.useCase.creators.benefit3': 'Contenido diario',
    'cirisonic.useCase.creators.benefit4': 'Monetización',
    'cirisonic.useCase.pymes.title': 'PYMEs',
    'cirisonic.useCase.pymes.description': 'Presencia digital sin complicaciones',
    'cirisonic.useCase.pymes.benefit1': 'Setup rápido',
    'cirisonic.useCase.pymes.benefit2': 'ROI medible',
    'cirisonic.useCase.pymes.benefit3': 'Multi-plataforma',
    'cirisonic.useCase.pymes.benefit4': 'Auto-gestión',
    'cirisonic.useCase.corporate.title': 'Corporativos',
    'cirisonic.useCase.corporate.description': 'Análisis y escalabilidad empresarial',
    'cirisonic.useCase.corporate.benefit1': 'Analytics profundo',
    'cirisonic.useCase.corporate.benefit2': 'Multi-marca',
    'cirisonic.useCase.corporate.benefit3': 'Compliance',
    'cirisonic.useCase.corporate.benefit4': 'Integración API',

    // CiriSonic - Pricing
    'cirisonic.pricing.title': 'Planes y Precios',
    'cirisonic.pricing.description': 'Elige el plan que mejor se adapte a tu nivel de creación de contenido',
    'cirisonic.pricing.popular': 'Más Popular',
    'cirisonic.pricing.starter.name': 'Starter',
    'cirisonic.pricing.starter.price': '$29',
    'cirisonic.pricing.starter.period': 'mes',
    'cirisonic.pricing.starter.description': 'Para creadores individuales y startups pequeñas',
    'cirisonic.pricing.starter.feature1': '50 textos IA/mes',
    'cirisonic.pricing.starter.feature2': '20 imágenes/mes',
    'cirisonic.pricing.starter.feature3': '5 audios/mes',
    'cirisonic.pricing.starter.feature4': '2 videos/mes',
    'cirisonic.pricing.starter.feature5': 'Plantillas básicas',
    'cirisonic.pricing.starter.feature6': 'Soporte por email',
    'cirisonic.pricing.pro.name': 'Pro',
    'cirisonic.pricing.pro.price': '$79',
    'cirisonic.pricing.pro.period': 'mes',
    'cirisonic.pricing.pro.description': 'Para equipos y empresas en crecimiento',
    'cirisonic.pricing.pro.feature1': '500 textos IA/mes',
    'cirisonic.pricing.pro.feature2': '200 imágenes/mes',
    'cirisonic.pricing.pro.feature3': '50 audios/mes',
    'cirisonic.pricing.pro.feature4': '20 videos/mes',
    'cirisonic.pricing.pro.feature5': 'Templates premium',
    'cirisonic.pricing.pro.feature6': 'Analytics avanzado',
    'cirisonic.pricing.pro.feature7': 'Colaboración en equipo',
    'cirisonic.pricing.pro.feature8': 'Soporte prioritario',
    'cirisonic.pricing.enterprise.name': 'Enterprise',
    'cirisonic.pricing.enterprise.price': 'Custom',
    'cirisonic.pricing.enterprise.period': 'contacto',
    'cirisonic.pricing.enterprise.description': 'Para organizaciones con necesidades específicas',
    'cirisonic.pricing.enterprise.feature1': 'Generación ilimitada',
    'cirisonic.pricing.enterprise.feature2': 'Marca personalizada',
    'cirisonic.pricing.enterprise.feature3': 'API dedicada',
    'cirisonic.pricing.enterprise.feature4': 'Integraciones custom',
    'cirisonic.pricing.enterprise.feature5': 'Soporte 24/7',
    'cirisonic.pricing.enterprise.feature6': 'Training personalizado',
    'cirisonic.pricing.enterprise.feature7': 'SLA garantizado',
    'cirisonic.pricing.button.choose': 'Elegir',
    'cirisonic.pricing.button.comingSoon': 'Próximamente',

    // CiriSonic - Lead Capture
    'cirisonic.leadCapture.title': 'Sé de los Primeros',
    'cirisonic.leadCapture.description': 'Únete a los pioneros que están transformando su creación de contenido con inteligencia artificial avanzada',
    'cirisonic.leadCapture.cardTitle': 'Acceso Anticipado',
    'cirisonic.leadCapture.cardDescription': 'Obtén acceso prioritario al futuro del contenido inteligente. Sin spam, solo actualizaciones importantes.',
    'cirisonic.leadCapture.emailPlaceholder': 'tu@email.com',
    'cirisonic.leadCapture.button': 'Reservar Acceso',
    'cirisonic.leadCapture.disclaimer': 'Al suscribirte, aceptas recibir emails sobre CiriSonic. Puedes cancelar en cualquier momento.',
    'cirisonic.leadCapture.success.title': '¡Perfecto!',
    'cirisonic.leadCapture.success.message': 'Te contactaremos pronto con tu acceso prioritario a CiriSonic.',
    'cirisonic.leadCapture.proof.waitlist': 'En lista de espera',
    'cirisonic.leadCapture.proof.betaTesters': 'Beta testers',
    'cirisonic.leadCapture.proof.satisfaction': 'Satisfacción',

    // CiriSonic - Footer
    'cirisonic.footer.description': 'La fábrica de IA que transforma ideas en contenido viral. Parte del ecosistema MaalCa, construyendo el futuro del contenido inteligente.',
    'cirisonic.footer.aiResponsible': 'Inteligencia Artificial Responsable',
    'cirisonic.footer.ethicalContent': 'Creación de Contenido Ético',
    'cirisonic.footer.product': 'Producto',
    'cirisonic.footer.services': 'Servicios',
    'cirisonic.footer.howItWorks': 'Cómo Funciona',
    'cirisonic.footer.pricing': 'Precios',
    'cirisonic.footer.apiDocs': 'API Docs',
    'cirisonic.footer.ecosystem': 'MaalCa Ecosystem',
    'cirisonic.footer.maalcaHome': 'MaalCa Home',
    'cirisonic.footer.ciriwhispers': 'CiriWhispers',
    'cirisonic.footer.hablandoMierda': 'Hablando Mierda',
    'cirisonic.footer.masaTina': 'Cocina Tina',
    'cirisonic.footer.copyright': '© 2024 CiriSonic - Parte del ecosistema MaalCa',
    'cirisonic.footer.tagline': '"El futuro del contenido es inteligente"',

    // Hablando Mierda (HBM) Page
    'hbm.hero.title': 'HABLANDO MIERDA',
    'hbm.hero.subtitle': 'El podcast más irreverente del internet hispanohablante.',
    'hbm.hero.tagline': 'Sin filtros. Sin diplomacia. Con mucho estilo.',
    'hbm.hero.listenNow': '🎧 ESCUCHAR AHORA',
    'hbm.hero.watchClips': '📺 VER CLIPS',
    'hbm.hero.liveNow': 'EN VIVO AHORA',
    'hbm.hero.nextTransmission': 'PRÓXIMA TRANSMISIÓN',
    'hbm.hero.transmittingNow': 'TRANSMITIENDO AHORA',
    'hbm.hero.offAir': 'FUERA DEL AIRE',
    'hbm.hero.nextShow': 'Próxima transmisión: Viernes 8:00 PM EST',

    // Navigation
    'hbm.nav.episodes': 'Episodios',
    'hbm.nav.team': 'Equipo',
    'hbm.nav.clips': 'Clips',
    'hbm.nav.contact': 'Contacto',

    // Episodes Section
    'hbm.episodes.title': 'ÚLTIMOS EPISODIOS',
    'hbm.episodes.subtitle': 'Conversaciones sin filtros sobre todo lo que importa (y lo que no).',
    'hbm.episodes.play': '▶️ Reproducir',
    'hbm.episodes.spotify': '💚 Spotify',
    'hbm.episodes.viewAll': 'VER TODOS LOS EPISODIOS',
    'hbm.episodes.category.philosophy': 'Filosofía Callejera',
    'hbm.episodes.category.politics': 'Política Sin Filtro',
    'hbm.episodes.category.love': 'Amor & Caos',
    'hbm.episodes.category.culture': 'Cultura Digital',

    // Episode Titles & Descriptions
    'hbm.episode.01.title': 'El Arte de No Saber Nada',
    'hbm.episode.01.description': 'Ciri y El Nolte reflexionan sobre la sabiduría de admitir ignorancia en un mundo de expertos falsos.',
    'hbm.episode.02.title': 'Política para Dummies',
    'hbm.episode.02.description': 'Desentrañando el circo político con humor negro y cero diplomacia.',
    'hbm.episode.03.title': 'Amor en Tiempos de Redes',
    'hbm.episode.03.description': 'Las relaciones modernas vistas desde el caos digital y la soledad analógica.',
    'hbm.episode.04.title': 'El Negocio de Ser Influencer',
    'hbm.episode.04.description': 'Analizando la economía de la atención y por qué todos quieren ser famosos.',

    // Live Radio Section
    'hbm.radio.title': 'RADIO EN VIVO',
    'hbm.radio.listenLive': '🔴 ESCUCHAR EN VIVO',
    'hbm.radio.nextTransmission': '⏸️ PRÓXIMA TRANSMISIÓN',

    // Hosts Section
    'hbm.hosts.title': 'LOS HOSTS',
    'hbm.hosts.subtitle': 'Los cerebros (y bocas) detrás del caos organizado.',
    'hbm.hosts.ciri.name': 'Ciri',
    'hbm.hosts.ciri.role': 'Co-Host & Provocador Principal',
    'hbm.hosts.ciri.description': 'Escritor, filósofo callejero y maestro del arte de decir verdades incómodas con elegancia brutal.',
    'hbm.hosts.ciri.phrase': '"La verdad duele, pero la mentira mata."',
    'hbm.hosts.nolte.name': 'El Nolte',
    'hbm.hosts.nolte.role': 'Co-Host & Voz de la Razón',
    'hbm.hosts.nolte.description': 'El equilibrio perfecto entre cordura e irreverencia. Experto en convertir el caos en conversación.',
    'hbm.hosts.nolte.phrase': '"Si no te incomoda, no estamos haciendo bien nuestro trabajo."',

    // Clips Section
    'hbm.clips.title': 'CLIPS VIRALES',
    'hbm.clips.subtitle': 'Los momentos más épicos condensados para tu consumo rápido.',
    'hbm.clips.viewMore': 'VER MÁS CLIPS',
    'hbm.clips.01.title': 'Cuando el Wi-Fi se cae',
    'hbm.clips.02.title': 'Explicando la Inflación',
    'hbm.clips.03.title': 'Dating Apps vs Realidad',

    // Support Section
    'hbm.support.title': 'APÓYANOS',
    'hbm.support.subtitle': 'Mantén viva la irreverencia. Tu apoyo nos permite seguir hablando mierda sin filtros.',
    'hbm.support.cap': 'Gorra HBM',
    'hbm.support.tshirt': 'Camiseta Oficial',
    'hbm.support.stickers': 'Stickers Pack',
    'hbm.support.buy': 'COMPRAR',
    'hbm.support.donate': '❤️ DONACIÓN DIRECTA',

    // Contact Section
    'hbm.contact.title': 'ÚNETE AL CAOS',
    'hbm.contact.subtitle': '¿Tienes una anécdota loca? ¿Una opinión controversial? ¿Quieres ser parte del show? Contáctanos y seamos cómplices del mejor contenido.',
    'hbm.contact.whatsapp.title': 'WhatsApp',
    'hbm.contact.whatsapp.description': 'Envíanos tus historias más locas directamente',
    'hbm.contact.whatsapp.button': 'ENVIAR MENSAJE',
    'hbm.contact.discord.title': 'Discord',
    'hbm.contact.discord.description': 'Únete a la comunidad más irreverente',
    'hbm.contact.discord.button': 'UNIRSE AL SERVER',

    // Footer
    'hbm.footer.phrase': 'Recuerden, que aquí lo que estamos es hablando mierda.',
    'hbm.footer.copyright': '© 2024 Hablando Mierda (HBM) - Parte del ecosistema MaalCa',
    'hbm.footer.location': 'Desde Elmira, NY para el mundo 🌎',

    // MaalCa Properties Page
    'properties.hero.title': 'Tu Puerta al Paraíso Caribeño',
    'properties.hero.subtitle': 'Propiedades exclusivas frente al océano donde los sueños se hacen realidad',
    'properties.hero.explore': 'Explorar Propiedades',
    'properties.hero.contact': 'Contáctanos',
    'properties.hero.discover': 'Descubrir',

    // Navigation
    'properties.nav.properties': 'Propiedades',
    'properties.nav.investment': 'Inversión',
    'properties.nav.about': 'Acerca de',
    'properties.nav.contact': 'Contacto',

    // Featured Properties Section
    'properties.featured.title': 'Propiedades Destacadas',
    'properties.featured.subtitle': 'Selección cuidadosamente curada de nuestras propiedades más exclusivas frente al océano',
    'properties.all.title': 'Todas las Propiedades',
    'properties.from': 'Desde',
    'properties.bedrooms': 'Habitaciones',
    'properties.bathrooms': 'Baños',
    'properties.viewDetails': 'Ver Detalles',
    'properties.virtualTour': 'Tour Virtual',
    'properties.showMore': 'Ver Más Detalles',
    'properties.showLess': 'Mostrar Menos Detalles',
    'properties.scheduleCall': 'Agendar Llamada',
    'properties.closeDetails': 'Cerrar',

    // Investment Benefits
    'properties.investment.title': 'Por Qué Invertir en Bienes Raíces Caribeños',
    'properties.investment.subtitle': 'Descubre las ventajas de invertir en propiedades frente al océano en la República Dominicana',
    'properties.benefits.oceanfront.title': 'Ubicaciones Premium Frente al Océano',
    'properties.benefits.oceanfront.description': 'Propiedades exclusivas con acceso directo a la playa y vistas despejadas al océano',
    'properties.benefits.roi.title': 'Fuerte Potencial de ROI',
    'properties.benefits.roi.description': 'Los bienes raíces caribeños han mostrado un crecimiento constante y altos rendimientos de alquiler',
    'properties.benefits.lifestyle.title': 'Estilo de Vida Tropical',
    'properties.benefits.lifestyle.description': 'Vida en el paraíso durante todo el año con comodidades de clase mundial y belleza natural',
    'properties.benefits.accessibility.title': 'Accesibilidad Global',
    'properties.benefits.accessibility.description': 'Fácil acceso desde los principales aeropuertos internacionales con vuelos directos en todo el mundo',
    'properties.benefits.market.title': 'Mercado Estable',
    'properties.benefits.market.description': 'Marco legal establecido y condiciones de inversión favorables',
    'properties.benefits.support.title': 'Soporte de Servicio Completo',
    'properties.benefits.support.description': 'Asistencia de principio a fin desde la compra hasta la gestión de propiedades',

    // About Section
    'properties.about.title': 'La Diferencia MaalCa Properties',
    'properties.about.subtitle': 'Conectando inversores globales con oportunidades inmobiliarias premium en el Caribe',
    'properties.about.experience.title': 'Experiencia Local',
    'properties.about.experience.description': 'Conocimiento profundo del mercado inmobiliario dominicano',
    'properties.about.network.title': 'Red Global',
    'properties.about.network.description': 'Conectando compradores de todo el mundo con propiedades premium',
    'properties.about.service.title': 'Servicio Personalizado',
    'properties.about.service.description': 'Atención dedicada en cada paso del proceso de inversión',

    // Contact Section
    'properties.contact.title': '¿Listo para Encontrar tu Paraíso?',
    'properties.contact.subtitle': 'Agenda una consulta gratuita con nuestros expertos en inversión inmobiliaria',
    'properties.contact.schedule': 'Agendar Consulta',
    'properties.contact.whatsapp': 'WhatsApp',
    'properties.contact.email': 'Email',

    // Filters
    'properties.filters.type': 'Tipo de Propiedad',
    'properties.filters.price': 'Rango de Precio',
    'properties.filters.all': 'Todas las Propiedades',
    'properties.filters.allPrices': 'Todos los Precios',
    'properties.filters.clear': 'Limpiar Filtros',
    'properties.filters.showing': 'Mostrando',
    'properties.filters.of': 'de',
    'properties.filters.properties': 'propiedades',

    // Testimonials Section
    'properties.testimonials.title': 'Lo Que Dicen Nuestros Clientes',
    'properties.testimonials.subtitle': 'Historias reales de inversores satisfechos que encontraron su paraíso caribeño',

    // Lead Magnet Section
    'properties.leadMagnet.title': 'Descarga Tu Guía Gratuita de Inversión',
    'properties.leadMagnet.subtitle': 'Guía Completa para Invertir en Bienes Raíces Caribeños',
    'properties.leadMagnet.description': 'Aprende los secretos de la inversión inmobiliaria exitosa en República Dominicana. Esta guía de 30 páginas incluye:',
    'properties.leadMagnet.feature1': 'Análisis del mercado inmobiliario caribeño',
    'properties.leadMagnet.feature2': 'Estrategias de financiamiento e impuestos',
    'properties.leadMagnet.feature3': 'Checklist completo de compra de propiedades',
    'properties.leadMagnet.feature4': 'Calculadora de ROI y análisis de rentabilidad',
    'properties.leadMagnet.cta': 'Descargar Guía Gratuita',
    'properties.leadMagnet.modal.title': 'Recibe Tu Guía Gratuita',
    'properties.leadMagnet.modal.subtitle': 'Ingresa tus datos para descargar la Guía de Inversión Inmobiliaria Caribeña',
    'properties.leadMagnet.modal.name': 'Nombre Completo',
    'properties.leadMagnet.modal.email': 'Correo Electrónico',
    'properties.leadMagnet.modal.phone': 'Teléfono (Opcional)',
    'properties.leadMagnet.modal.country': 'País',
    'properties.leadMagnet.modal.download': 'Descargar Ahora',
    'properties.leadMagnet.modal.close': 'Cerrar',
    'properties.leadMagnet.modal.privacy': 'Respetamos tu privacidad. Sin spam, solo contenido valioso.',

    // Footer
    'properties.footer.tagline': 'Tu puerta de entrada a propiedades exclusivas frente al océano en el Caribe. Conectando sueños globales con realidad tropical.',
    'properties.footer.quickLinks': 'Enlaces Rápidos',
    'properties.footer.connect': 'Conectar',
    'properties.footer.copyright': '© 2024 MaalCa Properties - Parte del Ecosistema MaalCa',
    'properties.footer.license': 'Bienes Raíces Licenciados en el Caribe • Sirviendo a Clientes Globales',

    // Cocina Tina Page
    'cocinatina.hero.title': 'Cocina Tina',
    'cocinatina.hero.tagline': 'Como en casa, pero mejor',
    'cocinatina.hero.description': 'Comida dominicana hecha en casa, para compartir donde quieras.',
    'cocinatina.hero.cta.menu': 'Ver el menú',
    'cocinatina.hero.cta.order': 'Hacer pedido',
    'cocinatina.hero.badge.homemade': 'Hecho en casa',
    'cocinatina.hero.badge.fresh': 'Ingredientes frescos',
    'cocinatina.nav.menu': 'Menú',
    'cocinatina.nav.subscriptions': 'Suscripciones',
    'cocinatina.nav.experiences': 'Experiencias',
    'cocinatina.nav.about': 'Nosotros',
    'cocinatina.nav.cart': 'Carrito',
    'cocinatina.menu.title': 'Nuestro Menú',
    'cocinatina.menu.subtitle': 'Platos tradicionales dominicanos, hechos con amor y recetas de familia',
    'cocinatina.menu.includes': 'Incluye:',
    'cocinatina.menu.seeMore': 'más...',
    'cocinatina.menu.seeLess': 'Ver menos',
    'cocinatina.menu.exploreMenu': 'Explorar el Menú',
    'cocinatina.menu.categories.all': 'Todos',
    'cocinatina.menu.categories.combos': 'Combos',
    'cocinatina.menu.categories.catering': 'Catering',
    'cocinatina.menu.categories.breakfast': 'Desayunos',
    'cocinatina.menu.categories.desserts': 'Postres',
    'cocinatina.menu.categories.experiences': 'Experiencias',
    'cocinatina.menu.add': 'Agregar',
    'cocinatina.menu.customize': 'Personalizar',
    'cocinatina.menu.perWeek': 'por semana',

    // Subscriptions Section
    'cocinatina.subscriptions.title': 'Suscripciones',
    'cocinatina.subscriptions.subtitle': 'Recibe el sabor de casa cada semana. Elige el plan que mejor se adapte a tu familia.',
    'cocinatina.subscriptions.popular': 'Más Popular',
    'cocinatina.subscriptions.choosePlan': 'Elegir Plan',

    // Experiences Section
    'cocinatina.experiences.title': 'Experiencias Especiales',
    'cocinatina.experiences.subtitle': 'Más que comida, creamos momentos. Únete a nuestros eventos y vive la cultura dominicana.',
    'cocinatina.experiences.bookClub.title': 'Club de Lectura Chocolate',
    'cocinatina.experiences.bookClub.description': 'Cada último sábado del mes nos reunimos para discutir un libro mientras disfrutamos de chocolate caliente dominicano y dulces tradicionales. Un espacio para el alma y el paladar.',
    'cocinatina.experiences.bookClub.nextSession': 'Próxima sesión:',
    'cocinatina.experiences.bookClub.date': 'Sábado 28 de Enero, 3:00 PM',
    'cocinatina.experiences.bookClub.book': 'Libro: "La Mujer que Buceaba en los Sueños"',
    'cocinatina.experiences.bookClub.reserve': 'Reservar mi lugar',
    'cocinatina.experiences.workshop.title': 'Talleres de Cocina Dominicana',
    'cocinatina.experiences.workshop.description': 'Aprende los secretos de la cocina dominicana directo de nuestras manos a las tuyas. Talleres íntimos donde compartimos técnicas, historias y mucho sabor.',
    'cocinatina.experiences.workshop.nextWorkshop': 'Próximo taller:',
    'cocinatina.experiences.workshop.date': 'Sábado 14 de Enero, 10:00 AM',
    'cocinatina.experiences.workshop.topic': 'Tema: "El Arte del Mangú Perfecto"',
    'cocinatina.experiences.workshop.register': 'Inscribirse',

    // Testimonials Section
    'cocinatina.testimonials.title': 'Historias de Nuestra Mesa',
    'cocinatina.testimonials.subtitle': 'Cada cliente es parte de nuestra familia extendida. Estas son sus palabras de amor.',

    // About Section
    'cocinatina.about.title': 'Nuestra Historia',
    'cocinatina.about.paragraph1': 'Cocina Tina nació del amor por nuestra tierra y la nostalgia del sabor de casa. Desde Elmira, NY, llevamos el corazón de República Dominicana a cada mesa americana.',
    'cocinatina.about.paragraph2': 'Somos una familia que cocina con las recetas de nuestras abuelas, pero con la frescura de ingredientes locales y la pasión de quien extraña su hogar.',
    'cocinatina.about.quote': '"Cada empanada es un abrazo, cada plato una historia, cada cliente un familiar más."',
    'cocinatina.about.familyLabel': 'La Familia Cocina Tina',

    // Contact Section
    'cocinatina.contact.title': '¡Hablemos!',
    'cocinatina.contact.subtitle': '¿Tienes una ocasión especial? ¿Quieres probar nuestros platos? Contáctanos y hagamos magia culinaria juntos.',
    'cocinatina.contact.whatsapp.title': 'WhatsApp',
    'cocinatina.contact.whatsapp.description': 'La forma más rápida de hacer tu pedido',
    'cocinatina.contact.whatsapp.button': 'Chatear Ahora',
    'cocinatina.contact.email.title': 'Email',
    'cocinatina.contact.email.description': 'Para consultas detalladas y cotizaciones',
    'cocinatina.contact.email.button': 'Enviar Email',

    // Cart
    'cocinatina.cart.title': 'Tu Pedido',
    'cocinatina.cart.empty': 'Tu carrito está vacío',
    'cocinatina.cart.emptyDescription': 'Agrega algunos platos deliciosos para comenzar',
    'cocinatina.cart.total': 'Total',
    'cocinatina.cart.sendOrder': 'Enviar Pedido',
    'cocinatina.cart.clearCart': 'Vaciar Carrito',
    'cocinatina.cart.remove': 'Eliminar',

    // Mobile Menu
    'cocinatina.mobileMenu.title': 'Menú',

    // Menu Items Data
    'cocinatina.items.picaderas.name': 'Caja de Picaderas',
    'cocinatina.items.picaderas.description': 'La mezcla perfecta de empanadas, pastelitos, quipes y croquetas. Ideal para compartir.',
    'cocinatina.items.picaderas.serves': '4-6 personas',
    'cocinatina.items.catering.name': 'Mini Catering Familiar',
    'cocinatina.items.catering.description': 'Bandeja completa con nuestros mejores platillos dominicanos. Perfecto para eventos pequeños.',
    'cocinatina.items.catering.serves': '8-10 personas',
    'cocinatina.items.breakfast.name': 'Desayuno Tradicional',
    'cocinatina.items.breakfast.description': 'Mangu con cebollitas, huevos fritos, salami y queso. Como en casa de abuela.',
    'cocinatina.items.breakfast.serves': '2 personas',
    'cocinatina.items.desserts.name': 'Dulces de la Casa',
    'cocinatina.items.desserts.description': 'Selección artesanal de nuestros dulces favoritos: majarete, tres golpes y flan de coco.',
    'cocinatina.items.desserts.serves': '4-5 personas',
    'cocinatina.items.custom.name': 'Caja Personalizada',
    'cocinatina.items.custom.description': 'Arma tu propia selección con nuestros platillos favoritos. Tú decides qué va adentro.',
    'cocinatina.items.custom.serves': 'Variable',
    'cocinatina.items.cafe.name': 'Café y Tertulia',
    'cocinatina.items.cafe.description': 'Café dominicano premium con selección de pastelitos dulces y salados para acompañar.',
    'cocinatina.items.cafe.serves': '2-3 personas',

    // Subscription Plans Data
    'cocinatina.plans.basic.name': 'Plan Básico',
    'cocinatina.plans.basic.description': 'Una caja de picaderas cada semana',
    'cocinatina.plans.family.name': 'Plan Familiar',
    'cocinatina.plans.family.description': 'Combinación perfecta para toda la familia',
    'cocinatina.plans.premium.name': 'Plan Premium',
    'cocinatina.plans.premium.description': 'La experiencia completa Cocina Tina',

    // Newsletter & Footer
    'cocinatina.newsletter.title': 'Newsletter Cocina Tina',
    'cocinatina.newsletter.description': 'Recibe recetas secretas, promociones exclusivas y noticias de nuestros eventos.',
    'cocinatina.newsletter.placeholder': 'tu@email.com',
    'cocinatina.newsletter.button': 'Suscribirse',
    'cocinatina.footer.tagline': 'Comida dominicana hecha con amor, desde nuestro hogar hasta el tuyo.',
    'cocinatina.footer.follow': 'Síguenos',
    'cocinatina.footer.location': 'Ubicación',
    'cocinatina.footer.locationText': 'Elmira, NY',
    'cocinatina.footer.service': 'Servicio a toda la región',
    'cocinatina.footer.copyright': '© 2024 Cocina Tina - Parte del ecosistema MaalCa ❤️',

    // Affiliates Pages
    'affiliates.page.title': 'Nuestros',
    'affiliates.page.titleHighlight': 'Afiliados',
    'affiliates.page.description': 'Partners estratégicos del ecosistema MaalCa. Empresas que comparten nuestra visión de excelencia y calidad.',
    'affiliates.filter.category': 'Categoría',
    'affiliates.filter.allCategories': 'Todas las categorías',
    'affiliates.filter.status': 'Estado',
    'affiliates.filter.allStatuses': 'Todos los estados',
    'affiliates.filter.showing': 'Mostrando',
    'affiliates.filter.affiliates': 'afiliados',
    'affiliates.card.services': 'servicios disponibles',
    'affiliates.card.projects': 'Proyectos',
    'affiliates.card.rating': 'Rating',
    'affiliates.card.response': 'Respuesta',
    'affiliates.cta.title': '¿Quieres ser parte del ecosistema?',
    'affiliates.cta.description': 'Únete a nuestra red de partners estratégicos y accede a tecnología, branding, sistemas de facturación y más.',
    'affiliates.cta.button': 'Solicitar Afiliación',
    'affiliates.empty': 'No se encontraron afiliados con los filtros seleccionados.',

    // Affiliate Detail Page
    'affiliate.detail.back': 'Volver',
    'affiliate.detail.notFound': 'Afiliado no encontrado',
    'affiliate.detail.notFoundDesc': 'El afiliado que buscas no existe en nuestro ecosistema.',
    'affiliate.detail.viewAll': 'Ver todos los afiliados',
    'affiliate.detail.contact.title': 'Información de Contacto',
    'affiliate.detail.contact.person': 'Persona de contacto',
    'affiliate.detail.contact.email': 'Email',
    'affiliate.detail.contact.phone': 'Teléfono',
    'affiliate.detail.contact.address': 'Dirección',
    'affiliate.detail.services.title': 'Servicios',
    'affiliate.detail.metrics.title': 'Métricas de Desempeño',
    'affiliate.detail.metrics.projects': 'Proyectos Completados',
    'affiliate.detail.metrics.rating': 'Rating Promedio',
    'affiliate.detail.metrics.response': 'Tiempo de Respuesta',
    'affiliate.detail.metrics.reliability': 'Confiabilidad',
    'affiliate.detail.metrics.efficiency': 'Eficiencia de Costos',
    'affiliate.detail.partnership.title': 'Detalles de la Asociación',
    'affiliate.detail.partnership.type': 'Tipo de Partner',
    'affiliate.detail.partnership.contract': 'Tipo de Contrato',
    'affiliate.detail.partnership.since': 'Socio desde',
    'affiliate.detail.partnership.payment': 'Términos de pago',
    'affiliate.detail.locations.title': 'Ubicaciones',
    'affiliate.detail.certifications.title': 'Certificaciones',
    'affiliate.detail.social.title': 'Redes Sociales',
    'affiliate.detail.cta.title': '¿Quieres trabajar con',
    'affiliate.detail.cta.description': 'Contacta directamente o solicita una conexión a través del ecosistema MaalCa.',
    'affiliate.detail.cta.email': 'Contactar por Email',
    'affiliate.detail.cta.viewMore': 'Ver más afiliados',

    // Affiliate Categories
    'category.proveedor-ingredientes': 'Proveedor de Ingredientes',
    'category.equipamiento-cocina': 'Equipamiento de Cocina',
    'category.decoracion-eventos': 'Decoración de Eventos',
    'category.logistica-transporte': 'Logística y Transporte',
    'category.venues-espacios': 'Venues y Espacios',
    'category.fotografia-video': 'Fotografía y Video',
    'category.mobiliario-eventos': 'Mobiliario para Eventos',
    'category.floreria-plantas': 'Florería y Plantas',
    'category.vinos-bebidas': 'Vinos y Bebidas',
    'category.tecnologia-eventos': 'Tecnología para Eventos',
    'category.limpieza-mantenimiento': 'Limpieza y Mantenimiento',
    'category.seguros-eventos': 'Seguros para Eventos',
    'category.comunicacion-visual-diseno': 'Comunicación Visual y Diseño',

    // Affiliate Statuses
    'status.active': 'Activo',
    'status.preferred': 'Preferente',
    'status.premium': 'Premium',
    'status.inactive': 'Inactivo',
    'status.pending': 'Pendiente',

    // Partnership Types
    'partnership.supplier': 'Proveedor',
    'partnership.vendor': 'Vendedor',
    'partnership.strategic': 'Estratégico',
    'partnership.franchise': 'Franquicia',

    // Contract Types
    'contract.exclusive': 'Exclusivo',
    'contract.non-exclusive': 'No exclusivo',
    'contract.preferred': 'Preferente',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.ecosystem': 'Ecosystem',
    'nav.editorial': 'Editorial',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.explore': 'Explore',
    'nav.join': 'Join the Ecosystem',

    // Homepage Hero
    'hero.maalca': 'MaalCa',
    'hero.ecosystem': 'Ecosystem',
    'hero.creative': 'Creative',
    'hero.subtitle': 'With Dominican heart and global spirit',
    'hero.cta.projects': 'Discover our projects',
    'hero.cta.join': 'Join the ecosystem',

    // Ecosystem Section
    'ecosystem.title': 'The Ecosystem',
    'ecosystem.description': 'Different projects, one vision: connecting creativity, community and growth.',
    'ecosystem.explore': 'Explore project',

    // Affiliates Section
    'affiliates.title': 'Affiliates',
    'affiliates.description': 'Companies and projects that share our vision',

    // Editorial
    'editorial.title': 'MaalCa Editorial',
    'editorial.description': 'Exploring the intersection of philosophy, culture and contemporary society',
    'editorial.read': 'Read articles',
    'editorial.subscribe': 'Subscribe to Newsletter',

    // About Section
    'about.title': 'About MaalCa',
    'about.description': 'We are a creative and business ecosystem that connects ideas, people and projects. From the Dominican Republic to the world, we build bridges between creativity and business.',
    'about.foundation': 'Foundation',
    'about.foundation.desc': 'MaalCa is born as a creative concept in the Dominican Republic',
    'about.expansion': 'Expansion',
    'about.expansion.desc': 'Ecosystem growth with multiple business verticals',
    'about.consolidation': 'Consolidation',
    'about.consolidation.desc': 'MaalCa LLC established in Elmira, NY with global projects',

    // Projects Section
    'projects.title': 'Our Ecosystem',
    'projects.description': 'Diverse projects reflecting our passion for creativity, innovation and community',

    // Individual Projects
    'project.editorial.title': 'MaalCa Editorial',
    'project.editorial.description': 'Publications exploring culture, creativity and society with global distribution on Amazon KDP',
    'project.editorial.category': 'Editorial + KDP',
    'project.editorial.outcome': 'Books published and distributed globally',

    'project.ciriwhispers.title': 'CiriWhispers',
    'project.ciriwhispers.description': 'Author and creative writer specialized in intimate narratives and deep conversations',
    'project.ciriwhispers.category': 'Author + Creative Writer',
    'project.ciriwhispers.outcome': 'Authentic content and genuine human connections',

    'project.cirisonic.title': 'CiriSonic',
    'project.cirisonic.description': 'AI content factory with intelligent automation and optimized engagement strategy',
    'project.cirisonic.category': 'AI Factory',
    'project.cirisonic.outcome': 'Automated content and increased engagement',

    'project.hbm.title': 'Hablando Mierda (HBM)',
    'project.hbm.description': 'Podcast and unfiltered conversations platform',
    'project.hbm.category': 'Podcast + Media',
    'project.hbm.outcome': 'Active community and per-episode monetization',

    'project.masatina.title': 'Cocina Tina',
    'project.masatina.description': 'Authentic Dominican cuisine with traditional dishes, delivery and event catering',
    'project.masatina.category': 'Dominican Gastronomy',
    'project.masatina.outcome': 'Authentic dishes and memorable events',
    'project.cocinatina.title': 'Cocina Tina',
    'project.cocinatina.description': 'Authentic Dominican cuisine with traditional dishes, delivery and event catering',
    'project.cocinatina.category': 'Dominican Gastronomy',
    'project.cocinatina.outcome': 'Authentic dishes and memorable events',


    'project.verdeprive.title': 'Verde Privé',
    'project.verdeprive.description': 'Premium cannabis lifestyle with maximum privacy and artisanal quality for conscious adults',
    'project.verdeprive.category': 'Cannabis + Lifestyle',
    'project.verdeprive.outcome': 'Premium experiences and wellness delivered discreetly',

    'project.properties.title': 'MaalCa Properties',
    'project.properties.description': 'Oceanfront tourist properties in the Dominican Republic, connecting global clients with Caribbean paradise',
    'project.properties.category': 'Tourism + Real Estate',
    'project.properties.outcome': 'Properties sold to global investors',

    // Affiliates (individual items)
    'affiliate.drpichardo.name': 'Dr. Pichardo',
    'affiliate.drpichardo.description': 'Surgery and aesthetic medicine',
    'affiliate.pegote.name': 'Pegote Barbershop',
    'affiliate.pegote.description': 'Dominican barbershop in Elmira, NY',
    'affiliate.studioalpha.name': 'Studio Alpha',
    'affiliate.studioalpha.description': 'Creative studio',
    'affiliate.creativehub.name': 'Creative Hub',
    'affiliate.creativehub.description': 'Creativity hub',
    'affiliate.designco.name': 'Design Co.',
    'affiliate.designco.description': 'Design company',
    'affiliate.medialab.name': 'Media Lab',
    'affiliate.medialab.description': 'Media laboratory',
    'affiliate.artcollective.name': 'Art Collective',
    'affiliate.artcollective.description': 'Artistic collective',
    'affiliate.tld.name': 'The Little Dominican',
    'affiliate.tld.description': 'Dominican restaurant · Elmira, NY',

    // Quote Section
    'quote.philosophy': 'Where creativity meets community and innovation',

    // Contact Section
    'contact.title': 'Connect with us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send message',
    'contact.location': 'United States',
    'contact.emailLabel': 'Email',
    'contact.followUs': 'Follow us',

    // Ecosistema Page
    'ecosystem.hero.title': 'Our',
    'ecosystem.hero.subtitle': 'Ecosystem',
    'ecosystem.hero.description': 'Six unique projects that reflect our passion for creativity, innovation and human connection from the Dominican Republic to the world.',
    'ecosystem.stats.projects': 'Active Projects',
    'ecosystem.stats.verticals': 'Business Verticals',
    'ecosystem.stats.founded': 'Founded in',
    'ecosystem.keyFeatures': 'Key features:',
    'ecosystem.launched': 'Launched',
    'ecosystem.exploreProject': 'Explore',
    'ecosystem.cta.title': 'Have a project in mind?',
    'ecosystem.cta.description': 'Our ecosystem is constantly evolving. If you have an idea that resonates with our philosophy of human sense, let\'s talk.',
    'ecosystem.cta.collaborate': 'Propose Collaboration',
    'ecosystem.cta.services': 'View Our Services',
    'ecosystem.status.active': 'Active',
    'ecosystem.status.beta': 'Beta',
    'ecosystem.status.development': 'Development',

    // Project Details (Ecosistema specific)
    'details.editorial.1': 'Contemporary philosophy and critical thinking',
    'details.editorial.2': 'Cultural analysis from Caribbean perspective',
    'details.editorial.3': 'Global distribution through Amazon KDP',
    'details.editorial.4': 'Digital and physical format available',

    'details.ciriwhispers.1': 'Authentic intimate and personal narratives',
    'details.ciriwhispers.2': 'Creative writing with unique perspective',
    'details.ciriwhispers.3': 'Deep and reflective conversations',
    'details.ciriwhispers.4': 'Genuine connection with audiences',

    'details.cirisonic.1': 'AI system for personalized content generation',
    'details.cirisonic.2': 'Publication calendar automation',
    'details.cirisonic.3': 'Real-time engagement analytics',
    'details.cirisonic.4': 'Automated A/B testing for optimization',

    'details.hbm.1': 'Authentic uncensored conversations',
    'details.hbm.2': 'Street philosophy with human sense',
    'details.hbm.3': 'Engaged listener community',
    'details.hbm.4': 'Direct per-episode monetization',

    'details.masatina.1': 'Authentic Dominican gastronomy',
    'details.masatina.2': 'POS system integrated with Stripe',
    'details.masatina.3': 'Digital product catalog',
    'details.masatina.4': 'Personalized culinary experiences',

    'details.verdeprive.1': 'Highest quality artisanal cannabis',
    'details.verdeprive.2': 'Privacy and discretion guaranteed',
    'details.verdeprive.3': 'Premium lifestyle for conscious adults',
    'details.verdeprive.4': 'Wellness and integral wellbeing products',

    'details.properties.1': 'Oceanfront properties in DR',
    'details.properties.2': 'Tourist investment for global clients',
    'details.properties.3': 'Complete property management',
    'details.properties.4': 'Optimized ROI for international investors',

    // Common
    'common.learnMore': 'Learn more',
    'common.comingSoon': 'Coming soon',
    'common.available': 'Available',
    'common.readMore': 'Read more',
    'common.viewProject': 'View project',
    'common.close': 'Close',
    'common.send': 'Send',
    'common.loading': 'Loading...',

    // Editorial Page
    'editorial.hero.title': 'Editorial',
    'editorial.hero.brand': 'MaalCa',
    'editorial.hero.description': 'Exploring the intersection between philosophy, culture and contemporary society. Deep thoughts with Caribbean authenticity and global perspective.',

    // Featured Articles Section
    'editorial.featured.title': 'Featured Articles',

    // All Articles Section
    'editorial.all.title': 'All Articles',

    // Categories
    'editorial.category.all': 'All',
    'editorial.category.philosophy': 'Philosophy',
    'editorial.category.technology': 'Technology',
    'editorial.category.business': 'Business',
    'editorial.category.culture': 'Culture',
    'editorial.category.society': 'Society',
    'editorial.category.art': 'Art',

    // Articles
    'editorial.article.filosofia-calle.title': 'Street Philosophy: Reflections from the Dominican Asphalt',
    'editorial.article.filosofia-calle.excerpt': 'A deep exploration of how Dominican popular wisdom becomes practical philosophy for modern life.',

    'editorial.article.creatividad-ia.title': 'Human Creativity in the AI Era: Keeping the Soul in Art',
    'editorial.article.creatividad-ia.excerpt': 'Analysis of how creators can maintain their human essence while embracing artificial intelligence tools.',

    'editorial.article.ecosistemas-creativos.title': 'Building Creative Ecosystems: Lessons from the Caribbean',
    'editorial.article.ecosistemas-creativos.excerpt': 'How to create authentic collaboration networks that nurture both individual creativity and collective growth.',

    'editorial.article.identidad-global.title': 'Global Identity with Local Heart: The Modern Creator\'s Dilemma',
    'editorial.article.identidad-global.excerpt': 'Reflections on maintaining cultural roots while competing in a digitized global market.',

    'editorial.article.futuro-trabajo.title': 'The Future of Human Work: Beyond Productivity',
    'editorial.article.futuro-trabajo.excerpt': 'An alternative vision of work that prioritizes wellbeing, creativity and human connection over pure efficiency.',

    'editorial.article.arte-resistencia.title': 'Art as Resistance in the Digital Age',
    'editorial.article.arte-resistencia.excerpt': 'How Latin American artists use digital media to preserve and transform cultural narratives.',

    // Books Section
    'editorial.books.title': 'Our Books',
    'editorial.books.description': 'Deep thoughts compiled in book format, available globally through Amazon KDP',

    'editorial.book.filosofia-callejera.title': 'Street Philosophy: Wisdom from the Dominican Asphalt',
    'editorial.book.filosofia-callejera.description': 'A collection of philosophical reflections born in the streets of the Dominican Republic',
    'editorial.book.filosofia-callejera.status': 'Available on Amazon KDP',

    'editorial.book.ecosistemas.title': 'Creative Ecosystems: Handbook for Culture Builders',
    'editorial.book.ecosistemas.description': 'Practical guide to create and maintain sustainable creative communities',
    'editorial.book.ecosistemas.status': 'Coming Soon',

    'editorial.book.humanidad-digital.title': 'Digital Humanity: Preserving the Soul in Technological Times',
    'editorial.book.humanidad-digital.description': 'Reflections on maintaining our human essence in an increasingly digital world',
    'editorial.book.humanidad-digital.status': 'In Development',

    'editorial.book.cta.buy': 'Buy on Amazon',
    'editorial.book.cta.comingSoon': 'Coming Soon',

    // Newsletter Section
    'editorial.newsletter.title': 'Stay Connected',
    'editorial.newsletter.description': 'Receive our deepest articles directly in your inbox. Philosophy, culture and authentic reflections from the Caribbean.',
    'editorial.newsletter.placeholder': 'your@email.com',
    'editorial.newsletter.submit': 'Subscribe',
    'editorial.newsletter.submitting': 'Sending...',
    'editorial.newsletter.success': 'Subscription successful! Check your email.',
    'editorial.newsletter.error': 'Error subscribing',
    'editorial.newsletter.errorConnection': 'Connection error. Please try again.',
    'editorial.newsletter.disclaimer': 'No spam. Just deep reflections every week.',

    // Meta
    'editorial.author': 'MaalCa Editorial',
    'editorial.readTime': 'min',
    'editorial.contentNotAvailable': 'Content not available',

    // Services Page - Hero
    'services.hero.title': 'Services with',
    'services.hero.subtitle': 'Human Sense',
    'services.hero.description': 'We transform ideas into profitable realities. Each service is designed to generate tangible results while maintaining the human essence in every project.',

    // Services Page - Services Section
    'services.section.title': 'Our Services',
    'services.section.description': 'Comprehensive solutions that combine cutting-edge technology with humanized strategy',

    // Individual Services
    'services.editorial-kdp.title': 'Publish your book · Amazon KDP',
    'services.editorial-kdp.description': 'From idea to published book: we write, design, and distribute your work on Amazon with global reach from day one.',
    'services.editorial-kdp.feature1': 'Full editorial process with human review',
    'services.editorial-kdp.feature2': 'Professional cover and interior design',
    'services.editorial-kdp.feature3': 'KDP publishing: ebook + print on demand',
    'services.editorial-kdp.feature4': 'ISBN, copyright and author rights included',
    'services.editorial-kdp.feature5': 'Launch strategy and early reviews',
    'services.editorial-kdp.feature6': 'Real-time royalties and sales dashboard',
    'services.editorial-kdp.pricing': 'From $2,500',
    'services.editorial-kdp.timeline': '4-6 weeks',

    'services.fabrica-ia.title': 'AI Content Factory',
    'services.fabrica-ia.description': 'Intelligent automation of your content strategy with AI',
    'services.fabrica-ia.feature1': 'Scheduled autopost system',
    'services.fabrica-ia.feature2': 'Personalized content generation',
    'services.fabrica-ia.feature3': 'Engagement optimization',
    'services.fabrica-ia.feature4': 'Real-time analytics',
    'services.fabrica-ia.feature5': 'Automated A/B testing',
    'services.fabrica-ia.feature6': 'Integration with all platforms',
    'services.fabrica-ia.pricing': 'From $1,800/month',
    'services.fabrica-ia.timeline': '2-3 weeks setup',

    'services.podcast-media.title': 'Podcast + Media Production',
    'services.podcast-media.description': 'Your voice to the world with professional production and strategic distribution',
    'services.podcast-media.feature1': 'Professional audio production',
    'services.podcast-media.feature2': 'Editing and post-production',
    'services.podcast-media.feature3': 'Distribution on all platforms',
    'services.podcast-media.feature4': 'Audience building',
    'services.podcast-media.feature5': 'Monetization from the first episode',
    'services.podcast-media.feature6': 'Complete show branding',
    'services.podcast-media.pricing': 'From $3,200',
    'services.podcast-media.timeline': '3-4 weeks',

    'services.pos-ecommerce.title': 'Digital Presence + Sales',
    'services.pos-ecommerce.description': 'QR menu, online store or service catalog with a point-of-sale and Stripe payments. Full system ready to operate.',
    'services.pos-ecommerce.feature1': 'QR menu and responsive digital catalog',
    'services.pos-ecommerce.feature2': 'Online ordering and pickup system',
    'services.pos-ecommerce.feature3': 'POS with real-time inventory',
    'services.pos-ecommerce.feature4': 'Integrated payments via Stripe',
    'services.pos-ecommerce.feature5': 'Sales, customer and analytics dashboard',
    'services.pos-ecommerce.feature6': 'Multi-device admin panel',
    'services.pos-ecommerce.pricing': 'From $4,500',
    'services.pos-ecommerce.timeline': '6-8 weeks',

    'services.proptech.title': 'PropTech + Real Estate',
    'services.proptech.description': 'Real estate technology to maximize your tourism investments',
    'services.proptech.feature1': 'Property management platform',
    'services.proptech.feature2': 'Specialized digital marketing',
    'services.proptech.feature3': 'Global investor acquisition',
    'services.proptech.feature4': 'Automated ROI analysis',
    'services.proptech.feature5': 'Complete legal documentation',
    'services.proptech.feature6': 'Post-sale follow-up',
    'services.proptech.pricing': 'Personalized consulting',
    'services.proptech.timeline': '8-12 weeks',

    'services.consultoria.title': 'Full Digital Ecosystem',
    'services.consultoria.description': 'We build your digital presence from scratch: strategy, brand, web, and dashboard. Everything connected under the MaalCa ecosystem.',
    'services.consultoria.feature1': 'Personalized business diagnosis and strategy',
    'services.consultoria.feature2': 'Brand identity and full web presence',
    'services.consultoria.feature3': 'Custom management dashboard',
    'services.consultoria.feature4': 'Integration into the MaalCa ecosystem',
    'services.consultoria.feature5': 'Executive mentoring and ongoing support',
    'services.consultoria.feature6': 'Priority access to all modules',
    'services.consultoria.pricing': 'From $8,000',
    'services.consultoria.timeline': 'Ongoing',

    // Services - Common Labels
    'services.investment': 'Investment:',
    'services.timeline': 'Timeline:',
    'services.moreInfo': 'More Information',

    // Process Section
    'services.process.title': 'Our Process',
    'services.process.description': 'A systematic approach that guarantees results while maintaining transparent communication',
    'services.process.step1.title': 'Initial Conversation',
    'services.process.step1.description': 'We understand your vision, objectives and specific challenges',
    'services.process.step2.title': 'Personalized Strategy',
    'services.process.step2.description': 'We design a unique proposal adapted to your needs',
    'services.process.step3.title': 'Implementation',
    'services.process.step3.description': 'We execute with excellence while keeping you informed',
    'services.process.step4.title': 'Launch and Optimization',
    'services.process.step4.description': 'We launch and optimize based on real results',

    // Results Section
    'services.results.title': 'Real Results',
    'services.results.description': 'Our clients not only get services, they get measurable results and sustainable growth',
    'services.results.metric1': '200%',
    'services.results.metric1.label': 'Average growth in engagement',
    'services.results.metric2': '15+',
    'services.results.metric2.label': 'Successfully launched projects',
    'services.results.metric3': '98%',
    'services.results.metric3.label': 'Client satisfaction',
    'services.results.cta': 'View Complete Case Studies',

    // CTA Section
    'services.cta.title': 'Ready to transform your project?',
    'services.cta.description': 'Each unique project deserves a personalized proposal. Let\'s talk about your vision and create something extraordinary together.',
    'services.cta.consultation': 'Request Free Consultation',
    'services.cta.portfolio': 'View Our Portfolio',

    // Contact Page - Hero
    'contactPage.hero.title': 'Let\'s talk about your',
    'contactPage.hero.subtitle': 'Project',
    'contactPage.hero.description': 'Every great project starts with a conversation. Tell us your vision and let\'s explore the possibilities together.',

    // Contact Page - Form
    'contactPage.form.title': 'Send us a message',
    'contactPage.form.name': 'Name',
    'contactPage.form.namePlaceholder': 'Your full name',
    'contactPage.form.email': 'Email',
    'contactPage.form.emailPlaceholder': 'your@email.com',
    'contactPage.form.company': 'Company/Organization',
    'contactPage.form.companyPlaceholder': 'Your company name (optional)',
    'contactPage.form.projectType': 'Project Type',
    'contactPage.form.projectPlaceholder': 'Select a project type',
    'contactPage.form.message': 'Message',
    'contactPage.form.messagePlaceholder': 'Tell us about your project, ideas or how we can collaborate...',
    'contactPage.form.submit': 'Send Message',
    'contactPage.form.submitting': 'Sending...',
    'contactPage.form.disclaimer': 'By submitting this form, you agree that we can contact you about your inquiry.',

    // Contact Page - Project Options
    'contactPage.project.editorial': 'Editorial and Publications',
    'contactPage.project.tech': 'Technological Development',
    'contactPage.project.content': 'Content Creation',
    'contactPage.project.realEstate': 'Real Estate',
    'contactPage.project.catering': 'Catering Services',
    'contactPage.project.consulting': 'Consulting',
    'contactPage.project.collaboration': 'Collaboration/Partnership',
    'contactPage.project.other': 'Other',

    // Contact Page - Contact Info
    'contactPage.info.title': 'Contact Information',
    'contactPage.info.company': 'MaalCa LLC',
    'contactPage.info.ecosystem': 'Creative Ecosystem',
    'contactPage.info.location': 'Elmira, NY • United States',
    'contactPage.info.emailLabel': 'Email',
    'contactPage.info.responseTime': 'Response Time',
    'contactPage.info.responseTimeValue': '24-48 business hours',

    // Contact Page - Philosophy Quote
    'contactPage.quote.text': 'Every conversation is an opportunity to create something extraordinary. At MaalCa we believe the best projects are born from genuine dialogue and human connection.',
    'contactPage.quote.author': 'MaalCa Philosophy',

    // Form Validation Messages
    'validation.required': 'This field is required',
    'validation.minLength': 'Must be at least {min} characters',
    'validation.maxLength': 'Cannot exceed {max} characters',
    'validation.emailInvalid': 'Please enter a valid email',
    'validation.formatInvalid': 'Invalid format',
    'validation.fullName': 'Please enter your full name',

    // Form Success Messages
    'form.success.message1': 'Thank you for your message! We will contact you within the next 24-48 hours.',
    'form.success.message2': 'Message received! Our team will review your request and respond soon.',
    'form.success.message3': 'Perfect! We have received your inquiry. We will write to you shortly.',

    // Form Error Messages
    'form.error.submission': 'Error sending. Please check your email and try again.',
    'form.error.spam': 'Your message has been marked as spam. Please contact directly.',
    'form.error.unexpected': 'Unexpected error. Please try again.',

    // CiriWhispers Page - Navigation
    'ciriwhispers.nav.about': 'About Me',
    'ciriwhispers.nav.works': 'Works',
    'ciriwhispers.nav.letters': 'Letters',

    // CiriWhispers - Hero
    'ciriwhispers.hero.subtitle': 'Words that whisper to the soul',
    'ciriwhispers.hero.description': 'Welcome to my literary labyrinth, where every word is an echo of the unspoken, every sentence a door to the profound. Here converge the shadows of Poe, the rawness of Bukowski, and the magical realism that dwells between the mundane and the extraordinary.',
    'ciriwhispers.hero.quote': 'In the twilight of the soul, words find their most intimate truth',
    'ciriwhispers.hero.enterLabyrinth': 'Enter the Labyrinth',
    'ciriwhispers.hero.soulWhispers': 'Soul Whispers',

    // CiriWhispers - About Section
    'ciriwhispers.about.title': 'The Whisper Behind the Words',
    'ciriwhispers.about.heading': 'About Ciriaco',
    'ciriwhispers.about.p1': 'Dominican, lover of words and the worlds born from them. I started writing as a reflective act, inspired by readings, songs, and those questions that confront us with life.',
    'ciriwhispers.about.p2': 'Empirical writer with short stories, a poetry collection, and a published novel (Amaranta), I continue exploring romantic narrative and poetry as ways to understand and express the world. I admire García Márquez, Poe, and Bukowski for their ability to transform the ordinary into art.',
    'ciriwhispers.about.p3': 'Currently working on Broken Souls. If you seek poetry, stories with soul, and a space where emotions take form, this is your place.',
    'ciriwhispers.about.location': 'Elmira, NY.',
    'ciriwhispers.about.inspirations.title': 'Inspirations',
    'ciriwhispers.about.inspirations.poe': 'Edgar Allan Poe - The master of poetic macabre',
    'ciriwhispers.about.inspirations.bukowski': 'Charles Bukowski - Brutal honesty',
    'ciriwhispers.about.inspirations.magical': 'Magical Realism - Where the ordinary becomes extraordinary',
    'ciriwhispers.about.inspirations.night': 'The night as muse and confidant',
    'ciriwhispers.about.process.title': 'My Process',
    'ciriwhispers.about.process.description': 'I write mainly in the quietest hours, when the world sleeps and words flow without filters. Each text is born from a visceral emotion, from a whisper of the unconscious that demands to be heard.',

    // Sensitive content warnings
    'warning.sensitiveContent': 'Sensitive content warning',
    'warning.contains': 'Contains themes of: {topics}.',
    'warning.recommended': 'Recommended for readers 16+.',
    'warning.traumaFamiliar': 'family trauma',
    'warning.duelo': 'grief',
    'warning.temasPsicologicos': 'psychological themes',
    'warning.violencia': 'violence',
    'warning.prision': 'prison',
    'warning.estigmaSocial': 'social stigma',

    // CiriWhispers - Works Section
    'ciriwhispers.works.title': 'The Manuscripts of the Labyrinth',
    'ciriwhispers.works.description': 'Each book is a fragment of soul transformed into words, an invitation to explore the deepest corners of human experience.',
    'ciriwhispers.works.readerNotice': 'Now available! Integrated digital reader - Functional demo with test books',
    'ciriwhispers.works.readerSubnotice': 'Available books load demo content to test the immersive reading experience',
    'ciriwhispers.works.status.available': 'Available',
    'ciriwhispers.works.status.inProgress': 'In Progress',
    'ciriwhispers.works.status.development': 'In Development',
    'ciriwhispers.works.readButton': 'Read on CiriWhispers',
    'ciriwhispers.works.readSoonButton': 'Read Here (Coming Soon)',
    'ciriwhispers.works.buyButton': 'Buy on Amazon',
    'ciriwhispers.works.fullLetterButton': 'Read full letter →',

    // CiriWhispers - Books
    'ciriwhispers.book.amaranta.title': 'Amaranta',
    'ciriwhispers.book.amaranta.subtitle': 'Psychological thriller',
    'ciriwhispers.book.amaranta.synopsis': 'A young woman faces the echo of inherited guilt. Between borrowed memories and voices that insist on speaking to her, she discovers that loving can also be a form of forgiveness.',
    'ciriwhispers.book.amaranta.excerpt': 'In the twilight of her memory, Amaranta found the words she could never say in life...',
    'ciriwhispers.book.amaranta.tags': 'novel, psychological, intimate drama',

    'ciriwhispers.book.luzsombras.title': 'Lights & Shadows',
    'ciriwhispers.book.luzsombras.subtitle': 'Narrative poetry collection',
    'ciriwhispers.book.luzsombras.synopsis': '106 poems that touch the skin and contradiction: love, loss, and the brightness seen only when everything darkens.',
    'ciriwhispers.book.luzsombras.excerpt': 'There are lights that only shine in absolute darkness, like stars born from the void...',
    'ciriwhispers.book.luzsombras.tags': 'poetry, love, intimacy',

    'ciriwhispers.book.cartashiedra.title': 'Letters to the Ivy',
    'ciriwhispers.book.cartashiedra.subtitle': 'Epistolary collection',
    'ciriwhispers.book.cartashiedra.synopsis': 'Thirty intimate letters to a living presence: the ivy. Desire, boundary, and what grows even on the coldest wall.',
    'ciriwhispers.book.cartashiedra.excerpt': 'Dear Ivy, your arms embrace walls as I embrace words: with the desperation of one who knows everything is ephemeral...',
    'ciriwhispers.book.cartashiedra.tags': 'epistolary, poetic prose',

    'ciriwhispers.book.cosasnocontar.title': 'Things Not to Tell',
    'ciriwhispers.book.cosasnocontar.subtitle': 'Tales of intimate edge',
    'ciriwhispers.book.cosasnocontar.synopsis': 'Small wounds in hushed voice: scenes no one confesses, told with delicacy and rawness at once.',
    'ciriwhispers.book.cosasnocontar.excerpt': 'There are stories written with tears on invisible paper, so only the soul can read them...',
    'ciriwhispers.book.cosasnocontar.tags': 'short stories, raw realism',

    'ciriwhispers.book.elmirarny.title': 'Elmira, NY',
    'ciriwhispers.book.elmirarny.subtitle': 'Chronicles of exile',
    'ciriwhispers.book.elmirarny.synopsis': 'Emotional map of Elmira: solitudes, jobs, bonds, and ghosts that slip through winter windows.',
    'ciriwhispers.book.elmirarny.excerpt': 'Exile is not a place, it is a state of the soul carried everywhere...',
    'ciriwhispers.book.elmirarny.tags': 'chronicle, autofiction, essay',

    'ciriwhispers.book.ramirito.title': 'Ramirito',
    'ciriwhispers.book.ramirito.subtitle': 'Novel — memory and stigma',
    'ciriwhispers.book.ramirito.synopsis': 'Returning to the neighborhood after prison: respect is no longer enough, the young fear nothing, and the name weighs more than flesh.',
    'ciriwhispers.book.ramirito.excerpt': '—That\'s Ramirito, the one who killed his mom.',
    'ciriwhispers.book.ramirito.tags': 'novel, social realism',

    // CiriWhispers - Letters/Blog Section
    'ciriwhispers.letters.title': 'Whispers from the Labyrinth',
    'ciriwhispers.letters.description': 'Intimate reflections, life fragments, and nocturnal whispers shared in the intimacy of these digital pages.',
    'ciriwhispers.letters.shareTitle': 'CiriWhispers - Words that whisper to the soul',
    'ciriwhispers.letters.shareDescription': 'Intimate literature, poetry, and nocturnal reflections from the labyrinth of emotions.',

    // CiriWhispers - Blog Posts
    'ciriwhispers.blog.perfilautor.title': 'About Ciriaco A. Pichardo',
    'ciriwhispers.blog.perfilautor.date': 'Updated 2025',
    'ciriwhispers.blog.perfilautor.excerpt': 'Dominican, lover of words and the worlds born from them.',
    'ciriwhispers.blog.perfilautor.content': 'I started writing as a reflective act, inspired by readings, songs, and those questions that confront us with life. Empirical writer with short stories, a poetry collection, and a published novel (Amaranta), I continue exploring romantic narrative and poetry as ways to understand and express the world. I admire García Márquez, Poe, and Bukowski for their ability to transform the ordinary into art. Currently working on my next novel, Broken Souls. If you seek poetry, stories with soul, and a space where emotions take form, this is your place. Elmira, NY.',

    'ciriwhispers.blog.invierno.title': 'Winter in Elmira',
    'ciriwhispers.blog.invierno.date': 'January 2024',
    'ciriwhispers.blog.invierno.excerpt': 'The snow covers secrets...',
    'ciriwhispers.blog.invierno.content': 'This town taught me to listen to the creak of old wood and to call home a chair in silence.',

    // CiriWhispers - Contact Section
    'ciriwhispers.contact.title': 'Let\'s Connect Souls',
    'ciriwhispers.contact.description': 'For collaborations, literary commissions, or simply to share a whisper in the digital vastness.',
    'ciriwhispers.contact.form.title': 'Send Me a Message',
    'ciriwhispers.contact.form.name': 'Your name',
    'ciriwhispers.contact.form.email': 'Your email',
    'ciriwhispers.contact.form.message': 'Your message...',
    'ciriwhispers.contact.form.submit': 'Send Whisper',
    'ciriwhispers.contact.social.title': 'Follow Me',
    'ciriwhispers.contact.social.instagram': 'Instagram @CiriWhispers',
    'ciriwhispers.contact.social.youtube': 'YouTube - Readings (Coming Soon)',
    'ciriwhispers.contact.social.spotify': 'Spotify - Audiobooks (Coming Soon)',
    'ciriwhispers.contact.social.editorial': 'MaalCa Editorial',
    'ciriwhispers.contact.services.title': 'Services',
    'ciriwhispers.contact.services.texts': 'Personalized texts',
    'ciriwhispers.contact.services.prologues': 'Prologues and reviews',
    'ciriwhispers.contact.services.workshops': 'Creative writing workshops',
    'ciriwhispers.contact.services.ghostwriting': 'Literary ghostwriting',
    'ciriwhispers.contact.signature': '"Always yours, @CiriWhispers"',

    // CiriWhispers Ecosystem - New pages
    'ciriwhispers.landing.hook': 'Beauty bleeds too',
    'ciriwhispers.landing.subhook': '...but here, we write.',
    'ciriwhispers.landing.desc': 'Flash fiction, poems, letters and novels. Stories that are never told out loud — until now.',
    'ciriwhispers.landing.cta.read': 'Read free',
    'ciriwhispers.landing.cta.obras': 'See works',
    'ciriwhispers.landing.cta.podcast': 'Podcast',

    'ciriwhispers.nav2.inicio': 'Home',
    'ciriwhispers.nav2.biblioteca': 'Library',
    'ciriwhispers.nav2.obras': 'Works',
    'ciriwhispers.nav2.manifiesto': 'Manifesto',
    'ciriwhispers.nav2.contacto': 'Contact',

    'ciriwhispers.biblioteca.title': 'Library',
    'ciriwhispers.biblioteca.desc': 'Short stories, poems, fragments and letters. All free. All real.',
    'ciriwhispers.biblioteca.all': 'All',
    'ciriwhispers.biblioteca.microcuentos': 'Flash Fiction',
    'ciriwhispers.biblioteca.fragmentos': 'Fragments',
    'ciriwhispers.biblioteca.poemas': 'Poems',
    'ciriwhispers.biblioteca.cartas': 'Letters',
    'ciriwhispers.biblioteca.empty': 'No stories of this type yet.',
    'ciriwhispers.biblioteca.readMore': 'Keep reading',
    'ciriwhispers.biblioteca.min': 'min',

    'ciriwhispers.obras2.title': 'Works',
    'ciriwhispers.obras2.desc': 'Novels, poetry collections, and anthologies. Some published, others on the way. All written with what is never said out loud.',
    'ciriwhispers.obras2.readNow': 'Read now',
    'ciriwhispers.obras2.buyAmazon': 'Buy on Amazon',
    'ciriwhispers.obras2.backToObras': 'Works',
    'ciriwhispers.obras2.relatedStories': 'Fragments from this work',

    'ciriwhispers.manifiesto.label': 'Manifesto',
    'ciriwhispers.manifiesto.quote': "I don't write to please you. I write so you recognize yourself in what you hide.",
    'ciriwhispers.manifiesto.name': 'Ciriaco A. Pichardo',
    'ciriwhispers.manifiesto.role': 'Writer, founder of Editorial MaalCa',
    'ciriwhispers.manifiesto.intro': "Dominican. Immigrant. Father. I write because I don't know how to shut up. Because the things that matter aren't said out loud — they're written at 3 AM when nobody's watching.",
    'ciriwhispers.manifiesto.p1': "I don't come from a family of writers. I didn't study literature at a prestigious university. I learned to write the way you learn to fight: out of necessity. Because there were things inside me that if they didn't come out through the pen, they'd come out some other way.",
    'ciriwhispers.manifiesto.p2': "My stories aren't pretty. They're real. They talk about what happens when you cross an ocean with a suitcase and a dream nobody else understands. About what it means to build something from scratch in a place where nobody knows you. About what you hide behind the smile you give the world.",
    'ciriwhispers.manifiesto.pullquote': 'Beauty bleeds too. But here, we write.',
    'ciriwhispers.manifiesto.p3': "CiriWhispers was born as a whisper. A place where stories that didn't fit anywhere else could exist. Flash fiction you read in a minute but that haunts you for days. Poems that don't rhyme but hurt. Letters that were never sent. Novels written in pieces, between work shifts and sleepless nights.",
    'ciriwhispers.manifiesto.p4': "I don't write for an audience. I write for that person who at 2 AM feels like nobody understands them. If a single sentence of mine makes you feel less alone, then it was all worth it.",
    'ciriwhispers.manifiesto.value1.title': 'Brutal honesty',
    'ciriwhispers.manifiesto.value1.desc': 'No filters, no decoration. Raw stories are the ones that heal.',
    'ciriwhispers.manifiesto.value2.title': 'Free access',
    'ciriwhispers.manifiesto.value2.desc': "Literature shouldn't be a luxury. The library is free. Always.",
    'ciriwhispers.manifiesto.value3.title': 'Community',
    'ciriwhispers.manifiesto.value3.desc': "We're not readers. We're accomplices. Every story connects us.",
    'ciriwhispers.manifiesto.cta.read': 'Read free',

    'ciriwhispers.contacto2.label': 'Contact',
    'ciriwhispers.contacto2.title': "Let's talk",
    'ciriwhispers.contacto2.desc': 'For collaborations, press, publishing rights, or simply to say a story moved you.',
    'ciriwhispers.contacto2.email.title': 'Email',
    'ciriwhispers.contacto2.email.desc': 'For inquiries, collaborations, or publishing rights.',
    'ciriwhispers.contacto2.instagram.title': 'Instagram',
    'ciriwhispers.contacto2.instagram.desc': 'Fragments, behind the scenes, and exclusive content.',
    'ciriwhispers.contacto2.amazon.title': 'Amazon',
    'ciriwhispers.contacto2.amazon.desc': 'All published books available in physical and digital format.',
    'ciriwhispers.contacto2.amazon.link': 'Author page on Amazon',
    'ciriwhispers.contacto2.podcast.title': 'Podcast',
    'ciriwhispers.contacto2.podcast.desc': 'Unfiltered conversations about writing, life, and immigration.',
    'ciriwhispers.contacto2.collab.title': 'Collaboration types',
    'ciriwhispers.contacto2.collab1.title': 'Press & Interviews',
    'ciriwhispers.contacto2.collab1.desc': 'Available for interviews, podcasts, and articles about literature, immigration, and entrepreneurship.',
    'ciriwhispers.contacto2.collab2.title': 'Publishing & Rights',
    'ciriwhispers.contacto2.collab2.desc': 'For translations, adaptations, or publication in anthologies and literary magazines.',
    'ciriwhispers.contacto2.collab3.title': 'Events & Readings',
    'ciriwhispers.contacto2.collab3.desc': 'Live readings, book presentations, and literary events.',
    'ciriwhispers.contacto2.collab4.title': 'Content & Creation',
    'ciriwhispers.contacto2.collab4.desc': 'Collaborations with other writers, illustrators, and content creators.',
    'ciriwhispers.contacto2.maalca': 'For business or tech projects with MaalCa:',
    'ciriwhispers.contacto2.maalcaLink': 'MaalCa Ecosystem Contact',

    // CiriWhispers — Biblioteca extras
    'ciriwhispers.biblioteca.comingSoon': 'New stories every week.',
    'ciriwhispers.biblioteca.comingSoonSub': 'Subscribe below to get them before anyone else.',

    // CiriWhispers — Story type labels
    'ciriwhispers.storyType.microcuento': 'Flash Fiction',
    'ciriwhispers.storyType.fragmento': 'Fragment',
    'ciriwhispers.storyType.poema': 'Poem',
    'ciriwhispers.storyType.carta': 'Letter',
    'ciriwhispers.storyType.capitulo': 'Chapter',
    'ciriwhispers.storyType.microcuentos': 'Flash Fiction',
    'ciriwhispers.storyType.fragmentos': 'Fragments',
    'ciriwhispers.storyType.poemas': 'Poems',
    'ciriwhispers.storyType.cartas': 'Letters',
    'ciriwhispers.storyType.capitulos': 'Chapters',

    // CiriWhispers — StoryReader UI
    'ciriwhispers.storyReader.minRead': 'min read',
    'ciriwhispers.storyReader.seriesTeaser': 'This text is part of something bigger.',
    'ciriwhispers.storyReader.moreTeaser': "There's more where this came from.",
    'ciriwhispers.storyReader.keepReading': 'Keep reading',
    'ciriwhispers.storyReader.close': 'Close',

    // CiriWhispers — Footer
    'ciriwhispers.footer.newsletter.title': 'Whispers in your ear',
    'ciriwhispers.footer.newsletter.desc': "Stories that don't get published. Fragments that never make it to a book. Just for you.",
    'ciriwhispers.footer.nav': 'Navigate',
    'ciriwhispers.footer.biblioteca': 'Library',
    'ciriwhispers.footer.obras': 'Works',
    'ciriwhispers.footer.podcast': 'Hablando Mierda (Podcast)',
    'ciriwhispers.footer.connect': 'Connect',
    'ciriwhispers.footer.ecosystem': 'Ecosystem',
    'ciriwhispers.footer.editorial': 'Editorial',
    'ciriwhispers.footer.quote': "I don't write to please you. I write so you recognize yourself in what you hide.",

    // CiriWhispers — Story titles (EN)
    'ciriwhispers.story.amaranta-eco-culpa.title': 'The Echo of a Guilt',
    'ciriwhispers.story.amaranta-eco-culpa.excerpt': "In the shadows of her memory, Amaranta found the words she could never say in life. The house breathed with the weight of secrets...",
    'ciriwhispers.story.amaranta-voces-silencio.title': 'Voices in the Silence',
    'ciriwhispers.story.amaranta-voces-silencio.excerpt': "Nights had become territory for voices no one else could hear. Amaranta woke startled, believing she'd heard her name...",
    'ciriwhispers.story.poema-eclipse.title': 'Eclipse',
    'ciriwhispers.story.poema-eclipse.excerpt': 'There are lights that only shine in the deepest darkness, like stars born from the void...',
    'ciriwhispers.story.poema-herida-abierta.title': 'Open Wound',
    'ciriwhispers.story.poema-herida-abierta.excerpt': "Don't ask me to close this wound. It's the only thing I have left of you...",
    'ciriwhispers.story.bloqueado.title': 'Blocked',
    'ciriwhispers.story.bloqueado.excerpt': "I blocked his number. Not because I didn't love him, but because every time the phone rang...",
    'ciriwhispers.story.nevera-bebidas.title': 'The Drinks Fridge',
    'ciriwhispers.story.nevera-bebidas.excerpt': "At grandma's house there was an old fridge that was only for drinks. Nobody cleaned it...",
    'ciriwhispers.story.jardin-pelirroja.title': 'The Garden and the Redhead',
    'ciriwhispers.story.jardin-pelirroja.excerpt': "I saw her for the first time in the public library garden. She was reading a book with no title on the spine...",
    'ciriwhispers.story.carta-01-no-vuelvas.title': "Letter I: Don't Come Back",
    'ciriwhispers.story.carta-01-no-vuelvas.excerpt': "Dear ivy: don't grow on my wall again. I no longer have the strength to tear you out...",
    'ciriwhispers.story.carta-02-invierno.title': 'Letter II: Winter',
    'ciriwhispers.story.carta-02-invierno.excerpt': "Ivy: it snowed for the first time today since I arrived in this city. Everything is white, except you...",

    // CiriSonic Page - Hero Section
    'cirisonic.hero.title': 'CiriSonic',
    'cirisonic.hero.subtitle': 'AI Content Factory',
    'cirisonic.hero.description.part1': 'The artificial intelligence platform that generates text, images, audio and video with',
    'cirisonic.hero.description.strategy': 'strategy',
    'cirisonic.hero.description.and': 'and',
    'cirisonic.hero.description.engagement': 'increased engagement',
    'cirisonic.hero.button.demo': 'Request Demo',
    'cirisonic.hero.button.features': 'View Features',
    'cirisonic.hero.stat1.value': '10x',
    'cirisonic.hero.stat1.label': 'Faster',
    'cirisonic.hero.stat2.value': '80%',
    'cirisonic.hero.stat2.label': 'Lower Costs',
    'cirisonic.hero.stat3.value': '24/7',
    'cirisonic.hero.stat3.label': 'Always Active',
    'cirisonic.hero.scroll': 'Discover',

    // CiriSonic - Navigation
    'cirisonic.nav.services': 'Services',
    'cirisonic.nav.howItWorks': 'How It Works',
    'cirisonic.nav.demo': 'Demo',
    'cirisonic.nav.pricing': 'Pricing',
    'cirisonic.nav.requestDemo': 'Request Demo',

    // CiriSonic - Services Section
    'cirisonic.services.title': 'What Does CiriSonic Do?',
    'cirisonic.services.description': 'A complete suite of AI tools to create professional-level content in minutes, not hours.',
    'cirisonic.services.viewDemo': 'View Demo',

    // CiriSonic - Service 1: Text AI
    'cirisonic.service.text.title': 'AI Texts',
    'cirisonic.service.text.subtitle': 'Content Generation',
    'cirisonic.service.text.description': 'Articles, posts, newsletters and optimized copy generated by advanced AI with your brand tone.',
    'cirisonic.service.text.feature1': 'SEO optimized',
    'cirisonic.service.text.feature2': 'Multiple tones',
    'cirisonic.service.text.feature3': 'Personalization',
    'cirisonic.service.text.feature4': 'Auto-planning',

    // CiriSonic - Service 2: Image AI
    'cirisonic.service.image.title': 'Images & Logos',
    'cirisonic.service.image.subtitle': 'Visual Creation',
    'cirisonic.service.image.description': 'Unique designs, professional logos and social media images created by AI.',
    'cirisonic.service.image.feature1': 'Consistent branding',
    'cirisonic.service.image.feature2': 'Multiple formats',
    'cirisonic.service.image.feature3': 'Varied styles',
    'cirisonic.service.image.feature4': 'Templates',

    // CiriSonic - Service 3: Audio AI
    'cirisonic.service.audio.title': 'Narrated Audio',
    'cirisonic.service.audio.subtitle': 'Voice Synthesis',
    'cirisonic.service.audio.description': 'Convert text to professional audio with natural synthetic voices for podcasts and content.',
    'cirisonic.service.audio.feature1': 'Natural voices',
    'cirisonic.service.audio.feature2': 'Multiple languages',
    'cirisonic.service.audio.feature3': 'Emotions',
    'cirisonic.service.audio.feature4': 'Background music',

    // CiriSonic - Service 4: Video AI
    'cirisonic.service.video.title': 'Automated Video',
    'cirisonic.service.video.subtitle': 'Motion Graphics',
    'cirisonic.service.video.description': 'Reels, presentations and promotional videos automatically generated with AI.',
    'cirisonic.service.video.feature1': 'Pro templates',
    'cirisonic.service.video.feature2': 'Auto-subtitles',
    'cirisonic.service.video.feature3': 'Transitions',
    'cirisonic.service.video.feature4': 'Optimization',

    // CiriSonic - How It Works
    'cirisonic.howItWorks.title': 'How It Works',
    'cirisonic.howItWorks.description': 'A simple 4-step process that transforms your ideas into viral content',
    'cirisonic.howItWorks.step1.title': 'Generate',
    'cirisonic.howItWorks.step1.description': 'Describe your idea and AI creates optimized content',
    'cirisonic.howItWorks.step2.title': 'Customize',
    'cirisonic.howItWorks.step2.description': 'Adjust tone, style and brand according to your audience',
    'cirisonic.howItWorks.step3.title': 'Publish',
    'cirisonic.howItWorks.step3.description': 'Schedule and publish on multiple platforms',
    'cirisonic.howItWorks.step4.title': 'Measure Impact',
    'cirisonic.howItWorks.step4.description': 'Analyze metrics and optimize performance',

    // CiriSonic - Dashboard Section
    'cirisonic.dashboard.title': 'CiriSonic Dashboard',
    'cirisonic.dashboard.description': 'An intuitive interface that puts AI power within everyone\'s reach',
    'cirisonic.dashboard.greeting': 'Hello, Creator!',
    'cirisonic.dashboard.pendingProjects': 'You have 3 pending projects to publish',
    'cirisonic.dashboard.createContent': '+ Create Content',
    'cirisonic.dashboard.stat.engagement': 'Engagement',
    'cirisonic.dashboard.stat.contentCreated': 'Content Created',
    'cirisonic.dashboard.stat.totalReach': 'Total Reach',
    'cirisonic.dashboard.stat.avgROI': 'Average ROI',
    'cirisonic.dashboard.tool.generateText.title': 'Generate Text',
    'cirisonic.dashboard.tool.generateText.description': 'Articles, posts and optimized copy',
    'cirisonic.dashboard.tool.generateText.status': 'Active',
    'cirisonic.dashboard.tool.createReel.title': 'Create Reel',
    'cirisonic.dashboard.tool.createReel.description': 'Viral videos for social media',
    'cirisonic.dashboard.tool.createReel.status': 'Processing...',
    'cirisonic.dashboard.tool.voiceOver.title': 'Make VoiceOver',
    'cirisonic.dashboard.tool.voiceOver.description': 'Professional narration in seconds',
    'cirisonic.dashboard.tool.voiceOver.status': 'Available',
    'cirisonic.dashboard.tool.use': 'Use',
    'cirisonic.dashboard.cta': 'Try Dashboard Free',

    // CiriSonic - Use Cases
    'cirisonic.useCases.title': 'Use Cases',
    'cirisonic.useCases.description': 'CiriSonic adapts to any industry and company size',
    'cirisonic.useCase.startups.title': 'Startups',
    'cirisonic.useCase.startups.description': 'Automated marketing without large team',
    'cirisonic.useCase.startups.benefit1': 'Reduce costs 80%',
    'cirisonic.useCase.startups.benefit2': 'Speed x10',
    'cirisonic.useCase.startups.benefit3': 'Consistent branding',
    'cirisonic.useCase.startups.benefit4': 'Scalability',
    'cirisonic.useCase.creators.title': 'Authors/Creators',
    'cirisonic.useCase.creators.description': 'Professional editorial content',
    'cirisonic.useCase.creators.benefit1': 'More audience',
    'cirisonic.useCase.creators.benefit2': 'High engagement',
    'cirisonic.useCase.creators.benefit3': 'Daily content',
    'cirisonic.useCase.creators.benefit4': 'Monetization',
    'cirisonic.useCase.pymes.title': 'SMBs',
    'cirisonic.useCase.pymes.description': 'Digital presence without complications',
    'cirisonic.useCase.pymes.benefit1': 'Fast setup',
    'cirisonic.useCase.pymes.benefit2': 'Measurable ROI',
    'cirisonic.useCase.pymes.benefit3': 'Multi-platform',
    'cirisonic.useCase.pymes.benefit4': 'Self-management',
    'cirisonic.useCase.corporate.title': 'Corporate',
    'cirisonic.useCase.corporate.description': 'Analysis and enterprise scalability',
    'cirisonic.useCase.corporate.benefit1': 'Deep analytics',
    'cirisonic.useCase.corporate.benefit2': 'Multi-brand',
    'cirisonic.useCase.corporate.benefit3': 'Compliance',
    'cirisonic.useCase.corporate.benefit4': 'API Integration',

    // CiriSonic - Pricing
    'cirisonic.pricing.title': 'Plans and Pricing',
    'cirisonic.pricing.description': 'Choose the plan that best fits your content creation level',
    'cirisonic.pricing.popular': 'Most Popular',
    'cirisonic.pricing.starter.name': 'Starter',
    'cirisonic.pricing.starter.price': '$29',
    'cirisonic.pricing.starter.period': 'month',
    'cirisonic.pricing.starter.description': 'For individual creators and small startups',
    'cirisonic.pricing.starter.feature1': '50 AI texts/month',
    'cirisonic.pricing.starter.feature2': '20 images/month',
    'cirisonic.pricing.starter.feature3': '5 audios/month',
    'cirisonic.pricing.starter.feature4': '2 videos/month',
    'cirisonic.pricing.starter.feature5': 'Basic templates',
    'cirisonic.pricing.starter.feature6': 'Email support',
    'cirisonic.pricing.pro.name': 'Pro',
    'cirisonic.pricing.pro.price': '$79',
    'cirisonic.pricing.pro.period': 'month',
    'cirisonic.pricing.pro.description': 'For growing teams and businesses',
    'cirisonic.pricing.pro.feature1': '500 AI texts/month',
    'cirisonic.pricing.pro.feature2': '200 images/month',
    'cirisonic.pricing.pro.feature3': '50 audios/month',
    'cirisonic.pricing.pro.feature4': '20 videos/month',
    'cirisonic.pricing.pro.feature5': 'Premium templates',
    'cirisonic.pricing.pro.feature6': 'Advanced analytics',
    'cirisonic.pricing.pro.feature7': 'Team collaboration',
    'cirisonic.pricing.pro.feature8': 'Priority support',
    'cirisonic.pricing.enterprise.name': 'Enterprise',
    'cirisonic.pricing.enterprise.price': 'Custom',
    'cirisonic.pricing.enterprise.period': 'contact',
    'cirisonic.pricing.enterprise.description': 'For organizations with specific needs',
    'cirisonic.pricing.enterprise.feature1': 'Unlimited generation',
    'cirisonic.pricing.enterprise.feature2': 'Custom branding',
    'cirisonic.pricing.enterprise.feature3': 'Dedicated API',
    'cirisonic.pricing.enterprise.feature4': 'Custom integrations',
    'cirisonic.pricing.enterprise.feature5': '24/7 support',
    'cirisonic.pricing.enterprise.feature6': 'Personalized training',
    'cirisonic.pricing.enterprise.feature7': 'Guaranteed SLA',
    'cirisonic.pricing.button.choose': 'Choose',
    'cirisonic.pricing.button.comingSoon': 'Coming Soon',

    // CiriSonic - Lead Capture
    'cirisonic.leadCapture.title': 'Be Among the First',
    'cirisonic.leadCapture.description': 'Join the pioneers who are transforming their content creation with advanced artificial intelligence',
    'cirisonic.leadCapture.cardTitle': 'Early Access',
    'cirisonic.leadCapture.cardDescription': 'Get priority access to the future of intelligent content. No spam, only important updates.',
    'cirisonic.leadCapture.emailPlaceholder': 'your@email.com',
    'cirisonic.leadCapture.button': 'Reserve Access',
    'cirisonic.leadCapture.disclaimer': 'By subscribing, you agree to receive emails about CiriSonic. You can cancel anytime.',
    'cirisonic.leadCapture.success.title': 'Perfect!',
    'cirisonic.leadCapture.success.message': 'We will contact you soon with your priority access to CiriSonic.',
    'cirisonic.leadCapture.proof.waitlist': 'On waiting list',
    'cirisonic.leadCapture.proof.betaTesters': 'Beta testers',
    'cirisonic.leadCapture.proof.satisfaction': 'Satisfaction',

    // CiriSonic - Footer
    'cirisonic.footer.description': 'The AI factory that transforms ideas into viral content. Part of the MaalCa ecosystem, building the future of intelligent content.',
    'cirisonic.footer.aiResponsible': 'Responsible Artificial Intelligence',
    'cirisonic.footer.ethicalContent': 'Ethical Content Creation',
    'cirisonic.footer.product': 'Product',
    'cirisonic.footer.services': 'Services',
    'cirisonic.footer.howItWorks': 'How It Works',
    'cirisonic.footer.pricing': 'Pricing',
    'cirisonic.footer.apiDocs': 'API Docs',
    'cirisonic.footer.ecosystem': 'MaalCa Ecosystem',
    'cirisonic.footer.maalcaHome': 'MaalCa Home',
    'cirisonic.footer.ciriwhispers': 'CiriWhispers',
    'cirisonic.footer.hablandoMierda': 'Hablando Mierda',
    'cirisonic.footer.masaTina': 'Cocina Tina',
    'cirisonic.footer.copyright': '© 2024 CiriSonic - Part of the MaalCa ecosystem',
    'cirisonic.footer.tagline': '"The future of content is intelligent"',

    // Hablando Mierda (HBM) Page
    'hbm.hero.title': 'TALKING SHIT',
    'hbm.hero.subtitle': 'The most irreverent podcast on the Spanish-speaking internet.',
    'hbm.hero.tagline': 'No filters. No diplomacy. With plenty of style.',
    'hbm.hero.listenNow': '🎧 LISTEN NOW',
    'hbm.hero.watchClips': '📺 WATCH CLIPS',
    'hbm.hero.liveNow': 'LIVE NOW',
    'hbm.hero.nextTransmission': 'NEXT BROADCAST',
    'hbm.hero.transmittingNow': 'BROADCASTING NOW',
    'hbm.hero.offAir': 'OFF AIR',
    'hbm.hero.nextShow': 'Next broadcast: Friday 8:00 PM EST',

    // Navigation
    'hbm.nav.episodes': 'Episodes',
    'hbm.nav.team': 'Team',
    'hbm.nav.clips': 'Clips',
    'hbm.nav.contact': 'Contact',

    // Episodes Section
    'hbm.episodes.title': 'LATEST EPISODES',
    'hbm.episodes.subtitle': 'Unfiltered conversations about everything that matters (and what doesn\'t).',
    'hbm.episodes.play': '▶️ Play',
    'hbm.episodes.spotify': '💚 Spotify',
    'hbm.episodes.viewAll': 'VIEW ALL EPISODES',
    'hbm.episodes.category.philosophy': 'Street Philosophy',
    'hbm.episodes.category.politics': 'Politics Unfiltered',
    'hbm.episodes.category.love': 'Love & Chaos',
    'hbm.episodes.category.culture': 'Digital Culture',

    // Episode Titles & Descriptions
    'hbm.episode.01.title': 'The Art of Knowing Nothing',
    'hbm.episode.01.description': 'Ciri and El Nolte reflect on the wisdom of admitting ignorance in a world of fake experts.',
    'hbm.episode.02.title': 'Politics for Dummies',
    'hbm.episode.02.description': 'Unraveling the political circus with dark humor and zero diplomacy.',
    'hbm.episode.03.title': 'Love in the Age of Social Media',
    'hbm.episode.03.description': 'Modern relationships seen through digital chaos and analog loneliness.',
    'hbm.episode.04.title': 'The Business of Being an Influencer',
    'hbm.episode.04.description': 'Analyzing the attention economy and why everyone wants to be famous.',

    // Live Radio Section
    'hbm.radio.title': 'LIVE RADIO',
    'hbm.radio.listenLive': '🔴 LISTEN LIVE',
    'hbm.radio.nextTransmission': '⏸️ NEXT BROADCAST',

    // Hosts Section
    'hbm.hosts.title': 'THE HOSTS',
    'hbm.hosts.subtitle': 'The brains (and mouths) behind the organized chaos.',
    'hbm.hosts.ciri.name': 'Ciri',
    'hbm.hosts.ciri.role': 'Co-Host & Chief Provocateur',
    'hbm.hosts.ciri.description': 'Writer, street philosopher, and master of the art of saying uncomfortable truths with brutal elegance.',
    'hbm.hosts.ciri.phrase': '"The truth hurts, but lies kill."',
    'hbm.hosts.nolte.name': 'El Nolte',
    'hbm.hosts.nolte.role': 'Co-Host & Voice of Reason',
    'hbm.hosts.nolte.description': 'The perfect balance between sanity and irreverence. Expert at turning chaos into conversation.',
    'hbm.hosts.nolte.phrase': '"If it doesn\'t make you uncomfortable, we\'re not doing our job right."',

    // Clips Section
    'hbm.clips.title': 'VIRAL CLIPS',
    'hbm.clips.subtitle': 'The most epic moments condensed for your quick consumption.',
    'hbm.clips.viewMore': 'VIEW MORE CLIPS',
    'hbm.clips.01.title': 'When the Wi-Fi Goes Down',
    'hbm.clips.02.title': 'Explaining Inflation',
    'hbm.clips.03.title': 'Dating Apps vs Reality',

    // Support Section
    'hbm.support.title': 'SUPPORT US',
    'hbm.support.subtitle': 'Keep irreverence alive. Your support allows us to keep talking shit without filters.',
    'hbm.support.cap': 'HBM Cap',
    'hbm.support.tshirt': 'Official T-Shirt',
    'hbm.support.stickers': 'Stickers Pack',
    'hbm.support.buy': 'BUY',
    'hbm.support.donate': '❤️ DIRECT DONATION',

    // Contact Section
    'hbm.contact.title': 'JOIN THE CHAOS',
    'hbm.contact.subtitle': 'Got a crazy story? A controversial opinion? Want to be part of the show? Contact us and let\'s be accomplices in creating the best content.',
    'hbm.contact.whatsapp.title': 'WhatsApp',
    'hbm.contact.whatsapp.description': 'Send us your craziest stories directly',
    'hbm.contact.whatsapp.button': 'SEND MESSAGE',
    'hbm.contact.discord.title': 'Discord',
    'hbm.contact.discord.description': 'Join the most irreverent community',
    'hbm.contact.discord.button': 'JOIN SERVER',

    // Footer
    'hbm.footer.phrase': 'Remember, what we\'re doing here is talking shit.',
    'hbm.footer.copyright': '© 2024 Hablando Mierda (HBM) - Part of the MaalCa ecosystem',
    'hbm.footer.location': 'From Elmira, NY to the world 🌎',

    // MaalCa Properties Page
    'properties.hero.title': 'Your Gateway to Caribbean Paradise',
    'properties.hero.subtitle': 'Exclusive oceanfront properties where dreams meet reality',
    'properties.hero.explore': 'Explore Properties',
    'properties.hero.contact': 'Contact Us',
    'properties.hero.discover': 'Discover',

    // Navigation
    'properties.nav.properties': 'Properties',
    'properties.nav.investment': 'Investment',
    'properties.nav.about': 'About',
    'properties.nav.contact': 'Contact',

    // Featured Properties Section
    'properties.featured.title': 'Featured Properties',
    'properties.featured.subtitle': 'Carefully curated selection of our most exclusive oceanfront properties',
    'properties.all.title': 'All Properties',
    'properties.from': 'Starting at',
    'properties.bedrooms': 'Bedrooms',
    'properties.bathrooms': 'Bathrooms',
    'properties.viewDetails': 'View Details',
    'properties.virtualTour': 'Virtual Tour',
    'properties.showMore': 'Show More Details',
    'properties.showLess': 'Show Less Details',
    'properties.scheduleCall': 'Schedule a Call',
    'properties.closeDetails': 'Close',

    // Investment Benefits
    'properties.investment.title': 'Why Invest in Caribbean Real Estate',
    'properties.investment.subtitle': 'Discover the advantages of investing in oceanfront properties in the Dominican Republic',
    'properties.benefits.oceanfront.title': 'Prime Oceanfront Locations',
    'properties.benefits.oceanfront.description': 'Exclusive properties with direct beach access and unobstructed ocean views',
    'properties.benefits.roi.title': 'Strong ROI Potential',
    'properties.benefits.roi.description': 'Caribbean real estate has shown consistent growth and high rental yields',
    'properties.benefits.lifestyle.title': 'Tropical Lifestyle',
    'properties.benefits.lifestyle.description': 'Year-round paradise living with world-class amenities and natural beauty',
    'properties.benefits.accessibility.title': 'Global Accessibility',
    'properties.benefits.accessibility.description': 'Easy access from major international airports with direct flights worldwide',
    'properties.benefits.market.title': 'Stable Market',
    'properties.benefits.market.description': 'Established legal framework and favorable investment conditions',
    'properties.benefits.support.title': 'Full-Service Support',
    'properties.benefits.support.description': 'End-to-end assistance from purchase to property management',

    // About Section
    'properties.about.title': 'The MaalCa Properties Difference',
    'properties.about.subtitle': 'Connecting global investors with premium Caribbean real estate opportunities',
    'properties.about.experience.title': 'Local Expertise',
    'properties.about.experience.description': 'Deep knowledge of the Dominican real estate market',
    'properties.about.network.title': 'Global Network',
    'properties.about.network.description': 'Connecting buyers worldwide with premium properties',
    'properties.about.service.title': 'Personalized Service',
    'properties.about.service.description': 'Dedicated attention at every step of your investment journey',

    // Contact Section
    'properties.contact.title': 'Ready to Find Your Paradise?',
    'properties.contact.subtitle': 'Schedule a free consultation with our real estate investment experts',
    'properties.contact.schedule': 'Schedule Consultation',
    'properties.contact.whatsapp': 'WhatsApp',
    'properties.contact.email': 'Email',

    // Filters
    'properties.filters.type': 'Property Type',
    'properties.filters.price': 'Price Range',
    'properties.filters.all': 'All Properties',
    'properties.filters.allPrices': 'All Prices',
    'properties.filters.clear': 'Clear Filters',
    'properties.filters.showing': 'Showing',
    'properties.filters.of': 'of',
    'properties.filters.properties': 'properties',

    // Testimonials Section
    'properties.testimonials.title': 'What Our Clients Say',
    'properties.testimonials.subtitle': 'Real stories from satisfied investors who found their Caribbean paradise',

    // Lead Magnet Section
    'properties.leadMagnet.title': 'Download Your Free Investment Guide',
    'properties.leadMagnet.subtitle': 'Complete Guide to Investing in Caribbean Real Estate',
    'properties.leadMagnet.description': 'Learn the secrets of successful real estate investment in the Dominican Republic. This 30-page guide includes:',
    'properties.leadMagnet.feature1': 'Caribbean real estate market analysis',
    'properties.leadMagnet.feature2': 'Financing strategies and tax planning',
    'properties.leadMagnet.feature3': 'Complete property purchase checklist',
    'properties.leadMagnet.feature4': 'ROI calculator and profitability analysis',
    'properties.leadMagnet.cta': 'Download Free Guide',
    'properties.leadMagnet.modal.title': 'Get Your Free Guide',
    'properties.leadMagnet.modal.subtitle': 'Enter your details to download the Caribbean Real Estate Investment Guide',
    'properties.leadMagnet.modal.name': 'Full Name',
    'properties.leadMagnet.modal.email': 'Email Address',
    'properties.leadMagnet.modal.phone': 'Phone (Optional)',
    'properties.leadMagnet.modal.country': 'Country',
    'properties.leadMagnet.modal.download': 'Download Now',
    'properties.leadMagnet.modal.close': 'Close',
    'properties.leadMagnet.modal.privacy': 'We respect your privacy. No spam, only valuable content.',

    // Footer
    'properties.footer.tagline': 'Your gateway to exclusive Caribbean oceanfront properties. Connecting global dreams with tropical reality.',
    'properties.footer.quickLinks': 'Quick Links',
    'properties.footer.connect': 'Connect',
    'properties.footer.copyright': '© 2024 MaalCa Properties - Part of the MaalCa Ecosystem',
    'properties.footer.license': 'Licensed Caribbean Real Estate • Serving Global Clients',

    // Cocina Tina Page
    'cocinatina.hero.title': 'Cocina Tina',
    'cocinatina.hero.tagline': 'Like home, but better',
    'cocinatina.hero.description': 'Homemade Dominican food, to share wherever you want.',
    'cocinatina.hero.cta.menu': 'See the menu',
    'cocinatina.hero.cta.order': 'Place order',
    'cocinatina.hero.badge.homemade': 'Homemade',
    'cocinatina.hero.badge.fresh': 'Fresh ingredients',
    'cocinatina.nav.menu': 'Menu',
    'cocinatina.nav.subscriptions': 'Subscriptions',
    'cocinatina.nav.experiences': 'Experiences',
    'cocinatina.nav.about': 'About Us',
    'cocinatina.nav.cart': 'Cart',
    'cocinatina.menu.title': 'Our Menu',
    'cocinatina.menu.subtitle': 'Traditional Dominican dishes, made with love and family recipes',
    'cocinatina.menu.includes': 'Includes:',
    'cocinatina.menu.seeMore': 'more...',
    'cocinatina.menu.seeLess': 'See less',
    'cocinatina.menu.exploreMenu': 'Explore the Menu',
    'cocinatina.menu.categories.all': 'All',
    'cocinatina.menu.categories.combos': 'Combos',
    'cocinatina.menu.categories.catering': 'Catering',
    'cocinatina.menu.categories.breakfast': 'Breakfast',
    'cocinatina.menu.categories.desserts': 'Desserts',
    'cocinatina.menu.categories.experiences': 'Experiences',
    'cocinatina.menu.add': 'Add',
    'cocinatina.menu.customize': 'Customize',
    'cocinatina.menu.perWeek': 'per week',

    // Subscriptions Section
    'cocinatina.subscriptions.title': 'Subscriptions',
    'cocinatina.subscriptions.subtitle': 'Get the taste of home every week. Choose the plan that best fits your family.',
    'cocinatina.subscriptions.popular': 'Most Popular',
    'cocinatina.subscriptions.choosePlan': 'Choose Plan',

    // Experiences Section
    'cocinatina.experiences.title': 'Special Experiences',
    'cocinatina.experiences.subtitle': 'More than food, we create moments. Join our events and experience Dominican culture.',
    'cocinatina.experiences.bookClub.title': 'Chocolate Book Club',
    'cocinatina.experiences.bookClub.description': 'Every last Saturday of the month we meet to discuss a book while enjoying Dominican hot chocolate and traditional sweets. A space for the soul and the palate.',
    'cocinatina.experiences.bookClub.nextSession': 'Next session:',
    'cocinatina.experiences.bookClub.date': 'Saturday, January 28, 3:00 PM',
    'cocinatina.experiences.bookClub.book': 'Book: "The Woman Who Dived Into Dreams"',
    'cocinatina.experiences.bookClub.reserve': 'Reserve my spot',
    'cocinatina.experiences.workshop.title': 'Dominican Cooking Workshops',
    'cocinatina.experiences.workshop.description': 'Learn the secrets of Dominican cuisine directly from our hands to yours. Intimate workshops where we share techniques, stories and lots of flavor.',
    'cocinatina.experiences.workshop.nextWorkshop': 'Next workshop:',
    'cocinatina.experiences.workshop.date': 'Saturday, January 14, 10:00 AM',
    'cocinatina.experiences.workshop.topic': 'Topic: "The Art of the Perfect Mangú"',
    'cocinatina.experiences.workshop.register': 'Sign up',

    // Testimonials Section
    'cocinatina.testimonials.title': 'Stories From Our Table',
    'cocinatina.testimonials.subtitle': 'Every customer is part of our extended family. These are their words of love.',

    // About Section
    'cocinatina.about.title': 'Our Story',
    'cocinatina.about.paragraph1': 'Cocina Tina was born from love for our land and nostalgia for the taste of home. From Elmira, NY, we bring the heart of the Dominican Republic to every American table.',
    'cocinatina.about.paragraph2': 'We are a family that cooks with our grandmothers\' recipes, but with the freshness of local ingredients and the passion of those who miss their home.',
    'cocinatina.about.quote': '"Every empanada is a hug, every dish a story, every customer one more family member."',
    'cocinatina.about.familyLabel': 'The Cocina Tina Family',

    // Contact Section
    'cocinatina.contact.title': 'Let\'s Talk!',
    'cocinatina.contact.subtitle': 'Do you have a special occasion? Want to try our dishes? Contact us and let\'s make culinary magic together.',
    'cocinatina.contact.whatsapp.title': 'WhatsApp',
    'cocinatina.contact.whatsapp.description': 'The fastest way to place your order',
    'cocinatina.contact.whatsapp.button': 'Chat Now',
    'cocinatina.contact.email.title': 'Email',
    'cocinatina.contact.email.description': 'For detailed inquiries and quotes',
    'cocinatina.contact.email.button': 'Send Email',

    // Cart
    'cocinatina.cart.title': 'Your Order',
    'cocinatina.cart.empty': 'Your cart is empty',
    'cocinatina.cart.emptyDescription': 'Add some delicious dishes to get started',
    'cocinatina.cart.total': 'Total',
    'cocinatina.cart.sendOrder': 'Send Order',
    'cocinatina.cart.clearCart': 'Clear Cart',
    'cocinatina.cart.remove': 'Remove',

    // Mobile Menu
    'cocinatina.mobileMenu.title': 'Menu',

    // Menu Items Data
    'cocinatina.items.picaderas.name': 'Snack Box',
    'cocinatina.items.picaderas.description': 'The perfect mix of empanadas, pastelitos, quipes and croquettes. Ideal for sharing.',
    'cocinatina.items.picaderas.serves': '4-6 people',
    'cocinatina.items.catering.name': 'Family Mini Catering',
    'cocinatina.items.catering.description': 'Complete tray with our best Dominican dishes. Perfect for small events.',
    'cocinatina.items.catering.serves': '8-10 people',
    'cocinatina.items.breakfast.name': 'Traditional Breakfast',
    'cocinatina.items.breakfast.description': 'Mangu with onions, fried eggs, salami and cheese. Like grandma\'s house.',
    'cocinatina.items.breakfast.serves': '2 people',
    'cocinatina.items.desserts.name': 'House Sweets',
    'cocinatina.items.desserts.description': 'Artisanal selection of our favorite sweets: majarete, tres golpes and coconut flan.',
    'cocinatina.items.desserts.serves': '4-5 people',
    'cocinatina.items.custom.name': 'Custom Box',
    'cocinatina.items.custom.description': 'Build your own selection with our favorite dishes. You decide what goes inside.',
    'cocinatina.items.custom.serves': 'Variable',
    'cocinatina.items.cafe.name': 'Coffee & Chat',
    'cocinatina.items.cafe.description': 'Premium Dominican coffee with a selection of sweet and savory pastries to accompany.',
    'cocinatina.items.cafe.serves': '2-3 people',

    // Subscription Plans Data
    'cocinatina.plans.basic.name': 'Basic Plan',
    'cocinatina.plans.basic.description': 'One snack box every week',
    'cocinatina.plans.family.name': 'Family Plan',
    'cocinatina.plans.family.description': 'Perfect combination for the whole family',
    'cocinatina.plans.premium.name': 'Premium Plan',
    'cocinatina.plans.premium.description': 'The complete Cocina Tina experience',

    // Newsletter & Footer
    'cocinatina.newsletter.title': 'Cocina Tina Newsletter',
    'cocinatina.newsletter.description': 'Receive secret recipes, exclusive promotions and news about our events.',
    'cocinatina.newsletter.placeholder': 'your@email.com',
    'cocinatina.newsletter.button': 'Subscribe',
    'cocinatina.footer.tagline': 'Dominican food made with love, from our home to yours.',
    'cocinatina.footer.follow': 'Follow us',
    'cocinatina.footer.location': 'Location',
    'cocinatina.footer.locationText': 'Elmira, NY',
    'cocinatina.footer.service': 'Service to the entire region',
    'cocinatina.footer.copyright': '© 2024 Cocina Tina - Part of the MaalCa ecosystem ❤️',

    // Affiliates Pages
    'affiliates.page.title': 'Our',
    'affiliates.page.titleHighlight': 'Affiliates',
    'affiliates.page.description': 'Strategic partners of the MaalCa ecosystem. Companies that share our vision of excellence and quality.',
    'affiliates.filter.category': 'Category',
    'affiliates.filter.allCategories': 'All categories',
    'affiliates.filter.status': 'Status',
    'affiliates.filter.allStatuses': 'All statuses',
    'affiliates.filter.showing': 'Showing',
    'affiliates.filter.affiliates': 'affiliates',
    'affiliates.card.services': 'services available',
    'affiliates.card.projects': 'Projects',
    'affiliates.card.rating': 'Rating',
    'affiliates.card.response': 'Response',
    'affiliates.cta.title': 'Want to be part of the ecosystem?',
    'affiliates.cta.description': 'Join our network of strategic partners and access technology, branding, billing systems and more.',
    'affiliates.cta.button': 'Request Affiliation',
    'affiliates.empty': 'No affiliates found with the selected filters.',

    // Affiliate Detail Page
    'affiliate.detail.back': 'Back',
    'affiliate.detail.notFound': 'Affiliate not found',
    'affiliate.detail.notFoundDesc': 'The affiliate you are looking for does not exist in our ecosystem.',
    'affiliate.detail.viewAll': 'View all affiliates',
    'affiliate.detail.contact.title': 'Contact Information',
    'affiliate.detail.contact.person': 'Contact person',
    'affiliate.detail.contact.email': 'Email',
    'affiliate.detail.contact.phone': 'Phone',
    'affiliate.detail.contact.address': 'Address',
    'affiliate.detail.services.title': 'Services',
    'affiliate.detail.metrics.title': 'Performance Metrics',
    'affiliate.detail.metrics.projects': 'Projects Completed',
    'affiliate.detail.metrics.rating': 'Average Rating',
    'affiliate.detail.metrics.response': 'Response Time',
    'affiliate.detail.metrics.reliability': 'Reliability',
    'affiliate.detail.metrics.efficiency': 'Cost Efficiency',
    'affiliate.detail.partnership.title': 'Partnership Details',
    'affiliate.detail.partnership.type': 'Partner Type',
    'affiliate.detail.partnership.contract': 'Contract Type',
    'affiliate.detail.partnership.since': 'Partner since',
    'affiliate.detail.partnership.payment': 'Payment terms',
    'affiliate.detail.locations.title': 'Locations',
    'affiliate.detail.certifications.title': 'Certifications',
    'affiliate.detail.social.title': 'Social Media',
    'affiliate.detail.cta.title': 'Want to work with',
    'affiliate.detail.cta.description': 'Contact directly or request a connection through the MaalCa ecosystem.',
    'affiliate.detail.cta.email': 'Contact by Email',
    'affiliate.detail.cta.viewMore': 'View more affiliates',

    // Affiliate Categories
    'category.proveedor-ingredientes': 'Ingredient Supplier',
    'category.equipamiento-cocina': 'Kitchen Equipment',
    'category.decoracion-eventos': 'Event Decoration',
    'category.logistica-transporte': 'Logistics and Transportation',
    'category.venues-espacios': 'Venues and Spaces',
    'category.fotografia-video': 'Photography and Video',
    'category.mobiliario-eventos': 'Event Furniture',
    'category.floreria-plantas': 'Floristry and Plants',
    'category.vinos-bebidas': 'Wines and Beverages',
    'category.tecnologia-eventos': 'Event Technology',
    'category.limpieza-mantenimiento': 'Cleaning and Maintenance',
    'category.seguros-eventos': 'Event Insurance',
    'category.comunicacion-visual-diseno': 'Visual Communication and Design',

    // Affiliate Statuses
    'status.active': 'Active',
    'status.preferred': 'Preferred',
    'status.premium': 'Premium',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',

    // Partnership Types
    'partnership.supplier': 'Supplier',
    'partnership.vendor': 'Vendor',
    'partnership.strategic': 'Strategic',
    'partnership.franchise': 'Franchise',

    // Contract Types
    'contract.exclusive': 'Exclusive',
    'contract.non-exclusive': 'Non-exclusive',
    'contract.preferred': 'Preferred',
  }
};

// Global state (simple singleton pattern)
let globalLanguage: Language = 'es';
const listeners = new Set<(lang: Language) => void>();

function setGlobalLanguage(lang: Language) {
  globalLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('maalca-language', lang);
  }
  listeners.forEach(listener => listener(lang));
}

function getGlobalLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('maalca-language') as Language | null;
    if (saved) return saved;
  }
  return globalLanguage;
}

export function useSimpleLanguage() {
  const [language, setLanguage] = useState<Language>(getGlobalLanguage);

  useEffect(() => {
    const listener = (lang: Language) => setLanguage(lang);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const changeLanguage = (lang: Language) => {
    setGlobalLanguage(lang);
  };

  return { language, setLanguage: changeLanguage };
}

export function useTranslation() {
  const { language } = useSimpleLanguage();

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return { t, language };
}

