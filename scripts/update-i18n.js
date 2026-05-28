const fs = require('fs');
let c = fs.readFileSync('src/hooks/useSimpleLanguage.tsx', 'utf8');

// ── ES: update existing hero keys ─────────────────────────────────────────────
c = c.replace(
  `'hero.maalca': 'Orquestación de agentes AI'`,
  `'hero.eyebrow': 'Plataforma operativa para negocios modernos',    'hero.maalca': 'Tu negocio,'`
);
c = c.replace(`'hero.ecosystem': 'para empresas'`, `'hero.ecosystem': 'en piloto'`);
c = c.replace(`'hero.creative': 'que escalan.'`, `'hero.creative': 'automático.'`);
c = c.replace(
  `'hero.subtitle': 'Automatiza flujos complejos con agentes inteligentes. Sin código. Sin fricción. Con resultados medibles.'`,
  `'hero.subtitle': 'MaalCa conecta tu catálogo, reservas, pagos y atención al cliente en un solo sistema impulsado por IA. Sin código. Listo en 48 horas.'`
);
c = c.replace(`'hero.cta.projects': 'Conoce nuestros proyectos'`, `'hero.cta.projects': 'Empieza gratis — sin tarjeta'`);
c = c.replace(`'hero.cta.join': 'Únete al ecosistema'`, `'hero.cta.join': 'Ver cómo funciona'`);

// ── ES: inject new keys after affiliates.description ─────────────────────────
const esAnchor = `'affiliates.description': 'Clientes reales con presencia física en nuestra comunidad',`;
const esNew = `'affiliates.description': 'Clientes reales con presencia física en nuestra comunidad',
    'cases.title': 'Negocios que ya operan con MaalCa',
    'platform.title': 'Todo lo que necesita tu negocio',
    'platform.subtitle': 'Módulos que trabajan juntos, no en silos.',
    'platform.cta': 'Ver planes y precios →',
    'platform.footnote': 'Todos los módulos incluidos según tu plan. Sin costos ocultos.',
    'platform.mod.presence': 'Presencia digital',
    'platform.mod.presence.desc': 'Sitio web con tu marca, código QR y dominio propio',
    'platform.mod.catalog': 'Catálogo inteligente',
    'platform.mod.catalog.desc': 'Productos y servicios actualizables sin código',
    'platform.mod.bookings': 'Reservas y pedidos',
    'platform.mod.bookings.desc': 'Sistema de booking online con confirmación automática',
    'platform.mod.payments': 'Pagos integrados',
    'platform.mod.payments.desc': 'Stripe, Apple Pay y Google Pay desde el primer día',
    'platform.mod.agent': 'Agente IA',
    'platform.mod.agent.desc': 'Chat entrenado en tu negocio para ventas y atención',
    'platform.mod.analytics': 'Analytics',
    'platform.mod.analytics.desc': 'Dashboard con métricas de visitas, conversión y ventas',
    'platform.mod.automations': 'Automatizaciones',
    'platform.mod.automations.desc': 'Confirmaciones, recordatorios y campañas automáticas',
    'platform.mod.crm': 'CRM',
    'platform.mod.crm.desc': 'Historial de clientes, seguimiento y segmentación',
    'how.title': 'De cero a operando en 48 horas',
    'how.step1.title': 'Conversación inicial',
    'how.step1.desc': 'Entendemos tu negocio, tus productos y lo que necesitas automatizar.',
    'how.step2.title': 'Configuramos tu espacio',
    'how.step2.desc': 'Creamos tu sitio, cargamos tu catálogo y conectamos tus canales.',
    'how.step3.title': 'Activamos los agentes',
    'how.step3.desc': 'Tu agente IA queda listo para atender, reservar y vender por ti.',
    'how.step4.title': 'Tú mides, nosotros optimizamos',
    'how.step4.desc': 'Dashboard en tiempo real. Ajustes proactivos. Tú enfocado en crecer.',
    'pricing.title': 'Planes para cada etapa',
    'pricing.cta': 'Comparar todos los planes →',
    'ecosystem.secondary.title': 'Más allá de la plataforma',
    'ecosystem.secondary.subtitle': 'MaalCa también crea contenido, publica libros y experimenta con IA.',
    'cta.final.title': 'Empieza hoy. Sin tarjeta. Sin compromiso.',
    'cta.final.subtitle': 'Tu primera página, catálogo y código QR: gratis para siempre.',
    'cta.final.btn': 'Crear mi cuenta gratis →',`;
if (!c.includes(esAnchor)) { console.error('ES anchor not found'); process.exit(1); }
c = c.replace(esAnchor, esNew);

// ── EN: update existing hero keys ─────────────────────────────────────────────
c = c.replace(
  `'hero.maalca': 'AI Agent Orchestration'`,
  `'hero.eyebrow': 'Operational platform for modern businesses',    'hero.maalca': 'Your business,'`
);
c = c.replace(`'hero.ecosystem': 'for businesses'`, `'hero.ecosystem': 'on autopilot.'`);
c = c.replace(`'hero.creative': 'that scale.'`, `'hero.creative': ''`);
c = c.replace(
  `'hero.subtitle': 'Automate complex workflows with intelligent agents. No code. No friction. Measurable results.'`,
  `'hero.subtitle': 'MaalCa connects your catalog, bookings, payments and customer service in one AI-powered system. No code. Live in 48 hours.'`
);
c = c.replace(`'hero.cta.projects': 'Explore our projects'`, `'hero.cta.projects': 'Start free — no card required'`);
c = c.replace(`'hero.cta.join': 'Join the ecosystem'`, `'hero.cta.join': 'See how it works'`);

// ── EN: inject new keys after affiliates.description ─────────────────────────
const enAnchor = `'affiliates.description': 'Real clients with physical presence in our community',`;
const enNew = `'affiliates.description': 'Real clients with physical presence in our community',
    'cases.title': 'Businesses already running on MaalCa',
    'platform.title': 'Everything your business needs',
    'platform.subtitle': 'Modules that work together, not in silos.',
    'platform.cta': 'See plans and pricing →',
    'platform.footnote': 'All modules included based on your plan. No hidden fees.',
    'platform.mod.presence': 'Digital presence',
    'platform.mod.presence.desc': 'Branded website, QR code and custom domain',
    'platform.mod.catalog': 'Smart catalog',
    'platform.mod.catalog.desc': 'Products and services updatable without code',
    'platform.mod.bookings': 'Bookings and orders',
    'platform.mod.bookings.desc': 'Online booking system with automatic confirmation',
    'platform.mod.payments': 'Integrated payments',
    'platform.mod.payments.desc': 'Stripe, Apple Pay and Google Pay from day one',
    'platform.mod.agent': 'AI Agent',
    'platform.mod.agent.desc': 'Chat trained on your business for sales and support',
    'platform.mod.analytics': 'Analytics',
    'platform.mod.analytics.desc': 'Dashboard with visit, conversion and sales metrics',
    'platform.mod.automations': 'Automations',
    'platform.mod.automations.desc': 'Confirmations, reminders and automatic campaigns',
    'platform.mod.crm': 'CRM',
    'platform.mod.crm.desc': 'Customer history, follow-up and segmentation',
    'how.title': 'From zero to live in 48 hours',
    'how.step1.title': 'Initial conversation',
    'how.step1.desc': 'We understand your business, your products and what you need to automate.',
    'how.step2.title': 'We set up your space',
    'how.step2.desc': 'We build your site, load your catalog and connect your channels.',
    'how.step3.title': 'We activate the agents',
    'how.step3.desc': 'Your AI agent is ready to serve, book and sell for you.',
    'how.step4.title': 'You measure, we optimize',
    'how.step4.desc': 'Real-time dashboard. Proactive adjustments. You focused on growth.',
    'pricing.title': 'Plans for every stage',
    'pricing.cta': 'Compare all plans →',
    'ecosystem.secondary.title': 'Beyond the platform',
    'ecosystem.secondary.subtitle': 'MaalCa also creates content, publishes books and experiments with AI.',
    'cta.final.title': 'Start today. No card. No commitment.',
    'cta.final.subtitle': 'Your first page, catalog and QR code: free forever.',
    'cta.final.btn': 'Create my free account →',`;
if (!c.includes(enAnchor)) { console.error('EN anchor not found'); process.exit(1); }
c = c.replace(enAnchor, enNew);

fs.writeFileSync('src/hooks/useSimpleLanguage.tsx', c, 'utf8');
console.log('i18n updated OK');
