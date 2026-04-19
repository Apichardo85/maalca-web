"use client";
import { Button } from "@/components/ui/buttons";
import { useRouter } from "next/navigation";
import { useTranslation, useSimpleLanguage } from "@/hooks/useSimpleLanguage";

type Plan = {
  id: string;
  name: { es: string; en: string };
  tagline: { es: string; en: string };
  price: number; // USD monthly
  setup: { es: string; en: string } | null;
  highlight: boolean;
  features: { es: string; en: string }[];
  cta: { es: string; en: string };
};

const plans: Plan[] = [
  {
    id: "starter",
    name: { es: "Starter", en: "Starter" },
    tagline: {
      es: "Presencia digital profesional para arrancar sin friccion.",
      en: "Professional digital presence to get started without friction.",
    },
    price: 125,
    setup: { es: "Setup unico $250", en: "One-time setup $250" },
    highlight: false,
    features: [
      { es: "Landing page one-page con tu marca", en: "Branded one-page landing" },
      { es: "Formulario de contacto + WhatsApp directo", en: "Contact form + WhatsApp direct" },
      { es: "Hosting, dominio y SSL incluidos", en: "Hosting, domain & SSL included" },
      { es: "Modo claro/oscuro y responsive", en: "Light/dark mode & responsive" },
      { es: "SEO basico + Google Analytics", en: "Basic SEO + Google Analytics" },
      { es: "Soporte por email (48h)", en: "Email support (48h)" },
    ],
    cta: { es: "Empezar con Starter", en: "Start with Starter" },
  },
  {
    id: "growth",
    name: { es: "Growth", en: "Growth" },
    tagline: {
      es: "Para negocios que venden, reservan o gestionan inventario.",
      en: "For businesses that sell, book or manage inventory.",
    },
    price: 350,
    setup: { es: "Setup unico $600", en: "One-time setup $600" },
    highlight: true,
    features: [
      { es: "Todo lo del plan Starter", en: "Everything in Starter" },
      { es: "Menu/catalogo con inventario y disponibilidad", en: "Menu/catalog with inventory & availability" },
      { es: "Reservas o pedidos online con panel admin", en: "Online bookings or orders with admin panel" },
      {
        es: "Automatizaciones (email + WhatsApp) para confirmaciones y recordatorios",
        en: "Automations (email + WhatsApp) for confirmations & reminders",
      },
      { es: "Dashboard multi-usuario con roles", en: "Multi-user dashboard with roles" },
      { es: "Integracion con pasarelas de pago (Stripe)", en: "Payment gateway integration (Stripe)" },
      { es: "Soporte prioritario (24h)", en: "Priority support (24h)" },
    ],
    cta: { es: "Quiero Growth", en: "Get Growth" },
  },
  {
    id: "pro",
    name: { es: "Pro", en: "Pro" },
    tagline: {
      es: "Operacion multi-sede con IA y flujos a medida.",
      en: "Multi-location operation with AI and custom workflows.",
    },
    price: 750,
    setup: { es: "Setup desde $1,500", en: "Setup from $1,500" },
    highlight: false,
    features: [
      { es: "Todo lo del plan Growth", en: "Everything in Growth" },
      { es: "Multi-sede / multi-afiliado con branding propio", en: "Multi-location / multi-affiliate with own branding" },
      {
        es: "Agentes de IA (atencion al cliente, ventas, reportes)",
        en: "AI agents (customer service, sales, reporting)",
      },
      {
        es: "Automatizaciones avanzadas en n8n (facturacion, marketing, CRM)",
        en: "Advanced n8n automations (billing, marketing, CRM)",
      },
      { es: "Analitica avanzada y reportes custom", en: "Advanced analytics & custom reports" },
      { es: "Integraciones a tu stack (ERP, contabilidad, etc.)", en: "Integrations to your stack (ERP, accounting, etc.)" },
      { es: "Soporte dedicado (4h) + reuniones mensuales", en: "Dedicated support (4h) + monthly meetings" },
    ],
    cta: { es: "Hablar con ventas", en: "Talk to sales" },
  },
];

export default function ServiciosPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useSimpleLanguage();
  const L = (v: { es: string; en: string }) => (language === "en" ? v.en : v.es);
  const process = [
    {
      step: "01",
      titleKey: "services.process.step1.title",
      descriptionKey: "services.process.step1.description"
    },
    {
      step: "02",
      titleKey: "services.process.step2.title",
      descriptionKey: "services.process.step2.description"
    },
    {
      step: "03",
      titleKey: "services.process.step3.title",
      descriptionKey: "services.process.step3.description"
    },
    {
      step: "04",
      titleKey: "services.process.step4.title",
      descriptionKey: "services.process.step4.description"
    }
  ];
  const stats = [
    { metricKey: "services.results.metric1", labelKey: "services.results.metric1.label" },
    { metricKey: "services.results.metric2", labelKey: "services.results.metric2.label" },
    { metricKey: "services.results.metric3", labelKey: "services.results.metric3.label" }
  ];
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                {t('services.hero.title')}
                <span className="block text-brand-primary">{t('services.hero.subtitle')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t('services.hero.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.section.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('services.section.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className="group animate-fade-in-up relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-block bg-brand-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-wide">
                      {language === "en" ? "Most popular" : "Mas popular"}
                    </span>
                  </div>
                )}
                <div
                  className={`bg-surface rounded-2xl p-8 h-full border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col ${
                    plan.highlight
                      ? "border-brand-primary shadow-brand-primary/10"
                      : "border-border hover:border-brand-primary/30"
                  }`}
                >
                  {/* Plan name */}
                  <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-primary">
                    {L(plan.name)}
                  </div>
                  {/* Price */}
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-text-primary">${plan.price}</span>
                    <span className="text-text-muted text-sm">
                      USD / {language === "en" ? "month" : "mes"}
                    </span>
                  </div>
                  {plan.setup && (
                    <div className="text-xs text-text-muted mb-5">{L(plan.setup)}</div>
                  )}
                  {/* Tagline */}
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    {L(plan.tagline)}
                  </p>
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-text-secondary"
                      >
                        <svg
                          className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{L(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  {/* CTA */}
                  <Button
                    variant={plan.highlight ? "primary" : "outline"}
                    className={`w-full ${
                      plan.highlight
                        ? "bg-brand-primary hover:bg-brand-primary-hover text-white"
                        : "bg-transparent border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white"
                    } transition-all duration-300`}
                    onClick={() => router.push("/contacto")}
                  >
                    {L(plan.cta)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-text-muted text-sm mt-10 max-w-2xl mx-auto">
            {language === "en"
              ? "All plans include hosting, SSL, regular updates and our MaalCa ecosystem integration. Custom tiers available on request."
              : "Todos los planes incluyen hosting, SSL, actualizaciones regulares e integracion con el ecosistema MaalCa. Planes a medida disponibles bajo solicitud."}
          </p>
        </div>
      </section>
      {/* Process Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.process.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('services.process.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div
                key={step.step}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-brand-primary/10 border-2 border-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-brand-primary font-bold text-lg">{step.step}</span>
                  </div>
                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    {t(step.titleKey)}
                  </h3>
                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>
                </div>
                {/* Connector Line */}
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Case Studies Teaser */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.results.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
              {t('services.results.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-surface rounded-2xl border border-border animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl font-bold text-brand-primary mb-2">{t(stat.metricKey)}</div>
                <div className="text-text-secondary">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-border text-text-primary hover:bg-surface"
              onClick={() => router.push('/casos-estudio')}
            >
              {t('services.results.cta')}
            </Button>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.cta.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              {t('services.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
              >
                {t('services.cta.consultation')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border text-text-primary hover:bg-surface"
              >
                {t('services.cta.portfolio')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
