"use client";
import { useState } from "react";
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

type AddOn = {
  id: string;
  name: { es: string; en: string };
  price: number;
  unit: { es: string; en: string };
  desc: { es: string; en: string };
};

const ANNUAL_DISCOUNT = 0.17; // 17% (≈ 2 meses gratis)

const plans: Plan[] = [
  {
    id: "starter",
    name: { es: "Starter", en: "Starter" },
    tagline: {
      es: "Presencia profesional lista para operar: web, menu/catalogo, QR y dashboard desde el dia 1.",
      en: "Professional presence ready to operate: site, menu/catalog, QR and dashboard from day one.",
    },
    price: 125,
    setup: { es: "Setup unico $250", en: "One-time setup $250" },
    highlight: false,
    features: [
      { es: "Landing page one-page con tu marca", en: "Branded one-page landing" },
      { es: "Editor de menu / catalogo (hasta 30 items)", en: "Menu / catalog editor (up to 30 items)" },
      { es: "Codigo QR descargable para mesa / tarjeta / vitrina", en: "Downloadable QR code for table / card / storefront" },
      { es: "Dashboard con analytics basicos (visitas, clics, WhatsApp)", en: "Dashboard with basic analytics (visits, clicks, WhatsApp)" },
      { es: "Formulario de contacto + WhatsApp directo", en: "Contact form + WhatsApp direct" },
      { es: "Hosting, dominio, SSL y SEO basico incluidos", en: "Hosting, domain, SSL & basic SEO included" },
      { es: "Soporte por email (48h)", en: "Email support (48h)" },
    ],
    cta: { es: "Empezar con Starter", en: "Start with Starter" },
  },
  {
    id: "growth",
    name: { es: "Growth", en: "Growth" },
    tagline: {
      es: "Cuando ya vendes: reservas, pagos online, inventario y automatizaciones que te ahorran horas.",
      en: "When you're already selling: bookings, online payments, inventory and automations that save you hours.",
    },
    price: 350,
    setup: { es: "Setup unico $600", en: "One-time setup $600" },
    highlight: true,
    features: [
      { es: "Todo lo del plan Starter (sin limite de items)", en: "Everything in Starter (unlimited items)" },
      { es: "Reservas o pedidos online con panel admin", en: "Online bookings or orders with admin panel" },
      { es: "Inventario en tiempo real + disponibilidad por horario", en: "Real-time inventory + availability by schedule" },
      {
        es: "Automatizaciones email + WhatsApp (confirmaciones, recordatorios, avisos)",
        en: "Email + WhatsApp automations (confirmations, reminders, notices)",
      },
      { es: "Dashboard multi-usuario con roles y analytics de conversion", en: "Multi-user dashboard with roles + conversion analytics" },
      { es: "Pagos con Stripe (tarjeta, Apple Pay, Google Pay)", en: "Stripe payments (card, Apple Pay, Google Pay)" },
      { es: "Soporte prioritario (24h)", en: "Priority support (24h)" },
    ],
    cta: { es: "Quiero Growth", en: "Get Growth" },
  },
  {
    id: "pro",
    name: { es: "Pro", en: "Pro" },
    tagline: {
      es: "Operacion multi-sede con agentes de IA, integraciones a medida y soporte dedicado.",
      en: "Multi-location operation with AI agents, custom integrations and dedicated support.",
    },
    price: 750,
    setup: { es: "Setup desde $2,500 · primer mes incluido", en: "Setup from $2,500 · first month included" },
    highlight: false,
    features: [
      { es: "Todo lo del plan Growth", en: "Everything in Growth" },
      { es: "Multi-sede / multi-marca con branding independiente", en: "Multi-location / multi-brand with independent branding" },
      {
        es: "Agentes de IA (atencion al cliente, ventas, reportes automaticos)",
        en: "AI agents (customer service, sales, automated reports)",
      },
      {
        es: "Automatizaciones avanzadas en n8n (facturacion, marketing, CRM)",
        en: "Advanced n8n automations (billing, marketing, CRM)",
      },
      { es: "Analytics enterprise + reportes custom + BI", en: "Enterprise analytics + custom reports + BI" },
      { es: "Integraciones a tu stack (ERP, contabilidad, POS existente)", en: "Integrations to your stack (ERP, accounting, existing POS)" },
      { es: "Soporte dedicado (4h) + reuniones estrategicas mensuales", en: "Dedicated support (4h) + monthly strategic meetings" },
    ],
    cta: { es: "Hablar con ventas", en: "Talk to sales" },
  },
];

const addOns: AddOn[] = [
  {
    id: "social-posts",
    name: { es: "Publicaciones en redes sociales", en: "Social media posts" },
    price: 75,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "8 publicaciones al mes (Instagram + Facebook) con diseno y copy.",
      en: "8 posts per month (Instagram + Facebook) with design and copy.",
    },
  },
  {
    id: "extra-ai-agent",
    name: { es: "Agente de IA adicional", en: "Extra AI agent" },
    price: 150,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "Agente entrenado en tu negocio (ventas, reservas, FAQs) sobre Growth o Pro.",
      en: "AI agent trained on your business (sales, bookings, FAQs) on top of Growth or Pro.",
    },
  },
  {
    id: "support-247",
    name: { es: "Soporte 24/7", en: "24/7 support" },
    price: 200,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "Respuesta en menos de 1h, cualquier dia, incluidos fines de semana y feriados.",
      en: "Response in under 1h, any day, including weekends and holidays.",
    },
  },
  {
    id: "consulting-block",
    name: { es: "Bloque de consultoria", en: "Consulting block" },
    price: 400,
    unit: { es: "/ 5h", en: "/ 5h" },
    desc: {
      es: "5 horas para integraciones, auditorias o estrategia. No expiran.",
      en: "5 hours for integrations, audits or strategy. No expiration.",
    },
  },
];

export default function ServiciosPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
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
          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 bg-surface border border-border rounded-full p-1 shadow-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-brand-primary text-white shadow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {language === "en" ? "Monthly" : "Mensual"}
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billing === "annual"
                    ? "bg-brand-primary text-white shadow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {language === "en" ? "Annual" : "Anual"}
                <span
                  className={`text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded-full ${
                    billing === "annual" ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const effectivePrice =
                billing === "annual"
                  ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT))
                  : plan.price;
              return (
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
                    className={`bg-surface rounded-2xl p-7 h-full border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col ${
                      plan.highlight
                        ? "border-brand-primary shadow-brand-primary/10"
                        : "border-border hover:border-brand-primary/30"
                    }`}
                  >
                    <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-primary">
                      {L(plan.name)}
                    </div>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-text-primary">${effectivePrice}</span>
                      <span className="text-text-muted text-sm">
                        USD / {language === "en" ? "mo" : "mes"}
                      </span>
                    </div>
                    {billing === "annual" && (
                      <div className="text-xs text-brand-primary font-semibold mb-2">
                        {language === "en"
                          ? `Billed $${effectivePrice * 12} / year`
                          : `Facturado $${effectivePrice * 12} / año`}
                      </div>
                    )}
                    {plan.setup && (
                      <div className="text-xs text-text-muted mb-5">{L(plan.setup)}</div>
                    )}
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                      {L(plan.tagline)}
                    </p>
                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-text-secondary"
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
              );
            })}

            {/* Enterprise card — sin precio, genera leads */}
            <div
              className="group animate-fade-in-up relative"
              style={{ animationDelay: `${plans.length * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-brand-primary/5 to-surface rounded-2xl p-7 h-full border-2 border-dashed border-brand-primary/40 hover:border-brand-primary transition-all duration-300 flex flex-col">
                <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-primary">
                  Enterprise
                </div>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-text-primary">
                    {language === "en" ? "Custom" : "A medida"}
                  </span>
                </div>
                <div className="text-xs text-text-muted mb-5">
                  {language === "en"
                    ? "SOW and contract tailored to your operation"
                    : "SOW y contrato a medida de tu operacion"}
                </div>
                <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                  {language === "en"
                    ? "For chains, franchises and corporate clients that need deep integrations, SLAs and on-site support."
                    : "Para cadenas, franquicias y clientes corporativos que necesitan integraciones profundas, SLAs y soporte on-site."}
                </p>
                <ul className="space-y-2.5 mb-8 flex-grow">
                  {[
                    { es: "SLA garantizado y soporte on-site", en: "Guaranteed SLA and on-site support" },
                    { es: "Integraciones a medida con tu infraestructura", en: "Custom integrations with your infrastructure" },
                    { es: "Agentes de IA entrenados en tu data", en: "AI agents trained on your data" },
                    { es: "Infra dedicada y SSO / compliance", en: "Dedicated infra and SSO / compliance" },
                    { es: "Account manager y roadmap compartido", en: "Account manager and shared roadmap" },
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
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
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                  onClick={() => router.push("/contacto")}
                >
                  {language === "en" ? "Contact sales" : "Contactar ventas"}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-text-muted text-sm mt-10 max-w-2xl mx-auto">
            {language === "en"
              ? "All plans include hosting, SSL, regular updates and MaalCa ecosystem integration. 6-12 month minimum term; setup fee is non-refundable."
              : "Todos los planes incluyen hosting, SSL, actualizaciones regulares e integracion con el ecosistema MaalCa. Permanencia minima 6-12 meses; el setup no es reembolsable."}
          </p>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {language === "en" ? "Add-ons" : "Extras opcionales"}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {language === "en"
                ? "Scale your plan without jumping tiers. Stackable on Starter, Growth or Pro."
                : "Escala tu plan sin cambiar de tier. Combinables sobre Starter, Growth o Pro."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {addOns.map((addon, index) => (
              <div
                key={addon.id}
                className="bg-surface-elevated rounded-xl p-6 border border-border hover:border-brand-primary/40 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-brand-primary">+${addon.price}</span>
                  <span className="text-text-muted text-xs">{L(addon.unit)} USD</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 leading-snug">
                  {L(addon.name)}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{L(addon.desc)}</p>
              </div>
            ))}
          </div>
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
