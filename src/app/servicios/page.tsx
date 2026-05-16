"use client";
import { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { useRouter } from "next/navigation";
import { useTranslation, useSimpleLanguage } from "@/hooks/useSimpleLanguage";

type Plan = {
  id: string;
  name: { es: string; en: string };
  tagline: { es: string; en: string };
  price: number;
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

type ComparisonValue = boolean | string | { es: string; en: string };

const ANNUAL_DISCOUNT = 0.17;

const plans: Plan[] = [
  {
    id: "inicial",
    name: { es: "Plan Inicial", en: "Starter Plan" },
    tagline: {
      es: "Todo lo esencial para tener presencia digital sin costo: página web, catálogo básico, QR y contacto directo.",
      en: "Everything essential for digital presence at no cost: website, basic catalog, QR and direct contact.",
    },
    price: 0,
    setup: null,
    highlight: false,
    features: [
      { es: "Sitio web one-page con tu marca", en: "One-page website with your branding" },
      { es: "Catálogo básico (hasta 10 ítems)", en: "Basic catalog (up to 10 items)" },
      { es: "Código QR promocional descargable", en: "Downloadable promotional QR code" },
      { es: "Formulario de contacto + WhatsApp directo", en: "Contact form + WhatsApp direct" },
      { es: "Dashboard métricas básicas (hasta 100 visitas/mes)", en: "Basic metrics dashboard (up to 100 visits/mo)" },
      { es: "Hosting y SSL incluidos", en: "Hosting and SSL included" },
      { es: "Soporte básico por email (72h)", en: "Basic email support (72h)" },
    ],
    cta: { es: "Comienza gratis", en: "Start for free" },
  },
  {
    id: "emprendedor",
    name: { es: "Emprendedor", en: "Entrepreneur" },
    tagline: {
      es: "Cuando ya vendes: reservas, pagos online, catálogo ilimitado y automatizaciones que te ahorran horas.",
      en: "When you're already selling: bookings, online payments, unlimited catalog and time-saving automations.",
    },
    price: 38,
    setup: { es: "Setup único $150", en: "One-time setup $150" },
    highlight: true,
    features: [
      { es: "Todo lo del Plan Inicial (catálogo ilimitado)", en: "Everything in Starter (unlimited catalog)" },
      { es: "Reservas / pedidos online con panel admin", en: "Online bookings / orders with admin panel" },
      { es: "Dashboard multiusuario con roles", en: "Multi-user dashboard with roles" },
      { es: "Automatizaciones básicas (confirmaciones, recordatorios)", en: "Basic automations (confirmations, reminders)" },
      { es: "Pagos con Stripe (tarjeta, Apple Pay, Google Pay)", en: "Stripe payments (card, Apple Pay, Google Pay)" },
      { es: "Analytics de conversión", en: "Conversion analytics" },
      { es: "Soporte prioritario (24h)", en: "Priority support (24h)" },
    ],
    cta: { es: "Contratar Emprendedor", en: "Get Entrepreneur" },
  },
  {
    id: "profesional",
    name: { es: "Profesional", en: "Professional" },
    tagline: {
      es: "CRM, agente de IA en chat y automatizaciones avanzadas para negocios que quieren escalar.",
      en: "CRM, AI chat agent and advanced automations for businesses ready to scale.",
    },
    price: 95,
    setup: { es: "Setup único $500", en: "One-time setup $500" },
    highlight: false,
    features: [
      { es: "Todo lo del plan Emprendedor", en: "Everything in Entrepreneur" },
      { es: "CRM integrado (clientes, historial, seguimiento)", en: "Integrated CRM (customers, history, follow-up)" },
      { es: "Agente de IA en chat (ventas / atención al cliente)", en: "AI chat agent (sales / customer service)" },
      { es: "Automatizaciones avanzadas (facturación, marketing)", en: "Advanced automations (billing, marketing)" },
      { es: "Reportes personalizados + BI", en: "Custom reports + BI" },
      { es: "Integraciones ERP / contabilidad", en: "ERP / accounting integrations" },
      { es: "Soporte dedicado (4h/mes)", en: "Dedicated support (4h/mo)" },
    ],
    cta: { es: "Contratar Profesional", en: "Get Professional" },
  },
  {
    id: "premium",
    name: { es: "Premium", en: "Premium" },
    tagline: {
      es: "Operación multi-sede, IA avanzada y estrategia BI completa para líderes del mercado.",
      en: "Multi-location operation, advanced AI and full BI strategy for market leaders.",
    },
    price: 195,
    setup: { es: "Setup desde $2,500 · primer mes incluido", en: "Setup from $2,500 · first month included" },
    highlight: false,
    features: [
      { es: "Todo lo del plan Profesional", en: "Everything in Professional" },
      { es: "Multi-sede / multi-marca con branding independiente", en: "Multi-location / multi-brand with independent branding" },
      { es: "IA avanzada (reportes proactivos, análisis predictivo)", en: "Advanced AI (proactive reports, predictive analytics)" },
      { es: "Estrategia BI completa", en: "Complete BI strategy" },
      { es: "Integración con POS / Ticketing", en: "POS / Ticketing integration" },
      { es: "Reuniones estratégicas mensuales", en: "Monthly strategic meetings" },
      { es: "Soporte asignado + SLA", en: "Assigned support + SLA" },
    ],
    cta: { es: "Contratar Premium", en: "Get Premium" },
  },
];

const addOns: AddOn[] = [
  {
    id: "social-posts",
    name: { es: "Publicaciones en redes sociales", en: "Social media posts" },
    price: 75,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "8 publicaciones al mes (Instagram + Facebook) con diseño y copy.",
      en: "8 posts per month (Instagram + Facebook) with design and copy.",
    },
  },
  {
    id: "extra-ai-agent",
    name: { es: "Agente de IA adicional", en: "Extra AI agent" },
    price: 150,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "Agente entrenado en tu negocio (ventas, reservas, FAQs) sobre Emprendedor, Profesional o Premium.",
      en: "AI agent trained on your business (sales, bookings, FAQs) on top of Entrepreneur, Professional or Premium.",
    },
  },
  {
    id: "support-247",
    name: { es: "Soporte 24/7", en: "24/7 support" },
    price: 200,
    unit: { es: "/mes", en: "/mo" },
    desc: {
      es: "Respuesta en menos de 1h, cualquier día, incluidos fines de semana y feriados.",
      en: "Response in under 1h, any day, including weekends and holidays.",
    },
  },
  {
    id: "consulting-block",
    name: { es: "Bloque de consultoría", en: "Consulting block" },
    price: 400,
    unit: { es: "/ 5h", en: "/ 5h" },
    desc: {
      es: "5 horas para integraciones, auditorías o estrategia. No expiran.",
      en: "5 hours for integrations, audits or strategy. No expiration.",
    },
  },
];

const faqItems = [
  {
    q: { es: "¿Es realmente gratis? ¿Hay costos ocultos?", en: "Is it really free? Any hidden costs?" },
    a: {
      es: "Sí, sin costos ocultos ni sorpresas. Gratis significa $0/mes para siempre dentro de los límites descritos. No pedimos tarjeta de crédito. Si quieres más capacidades, puedes actualizar voluntariamente en cualquier momento.",
      en: "Yes, no hidden costs or surprises. Free means $0/mo forever within the described limits. No credit card required. If you want more capabilities, you can upgrade voluntarily at any time.",
    },
  },
  {
    q: { es: "¿Cuándo necesitaría pasar al plan de pago?", en: "When would I need to upgrade to a paid plan?" },
    a: {
      es: "Cuando superes los límites (más productos, más tráfico, funciones avanzadas) o quieras automatizar procesos. Nuestro sistema te avisará cuando te acerques a los límites y podrás cambiar de plan sin perder ningún dato.",
      en: "When you exceed the limits (more products, more traffic, advanced features) or want to automate processes. Our system will notify you as you approach limits and you can change plans without losing any data.",
    },
  },
  {
    q: { es: "¿Qué pasa con mis datos si dejo de usar el plan gratuito?", en: "What happens to my data if I stop using the free plan?" },
    a: {
      es: "Tus datos siempre te pertenecen. Puedes exportarlos en cualquier momento. Si decides no continuar, tu cuenta se inactiva sin penalización. Las cuentas inactivas por más de 6 meses pueden suspenderse con previo aviso.",
      en: "Your data always belongs to you. You can export it at any time. If you decide to stop, your account is deactivated without penalty. Accounts inactive for more than 6 months may be suspended with prior notice.",
    },
  },
  {
    q: { es: "¿Qué soporte incluye el plan gratuito?", en: "What support does the free plan include?" },
    a: {
      es: "Soporte básico por email con respuesta en máximo 72 horas, más acceso a documentación en línea y guía de onboarding paso a paso. Los planes de pago incluyen soporte prioritario o dedicado.",
      en: "Basic email support with a maximum 72-hour response time, plus access to online documentation and a step-by-step onboarding guide. Paid plans include priority or dedicated support.",
    },
  },
  {
    q: { es: "¿La información de mi negocio está segura y es privada?", en: "Is my business information safe and private?" },
    a: {
      es: "Sí. Usamos SSL, backups regulares y los datos de tu negocio son tuyos: no los vendemos ni compartimos con terceros. Consulta nuestros Términos y Política de Privacidad para más detalles.",
      en: "Yes. We use SSL, regular backups and your business data is yours — we don't sell or share it with third parties. See our Terms and Privacy Policy for details.",
    },
  },
];

const comparisonRows: { label: { es: string; en: string }; values: ComparisonValue[] }[] = [
  {
    label: { es: "Usuarios", en: "Users" },
    values: ["1", { es: "Ilimitados", en: "Unlimited" }, { es: "Ilimitados", en: "Unlimited" }, { es: "Ilimitados", en: "Unlimited" }],
  },
  {
    label: { es: "Catálogo de productos / servicios", en: "Product / service catalog" },
    values: [
      { es: "Hasta 10 ítems", en: "Up to 10 items" },
      { es: "Sin límite", en: "No limit" },
      { es: "Sin límite", en: "No limit" },
      { es: "Sin límite", en: "No limit" },
    ],
  },
  {
    label: { es: "Sitio web y código QR", en: "Website and QR code" },
    values: [true, true, true, true],
  },
  {
    label: { es: "Reservas / pedidos online", en: "Online bookings / orders" },
    values: [false, true, true, true],
  },
  {
    label: { es: "Pagos integrados", en: "Integrated payments" },
    values: [false, true, true, true],
  },
  {
    label: { es: "Automatizaciones básicas", en: "Basic automations" },
    values: [false, true, true, true],
  },
  {
    label: { es: "Automatizaciones avanzadas", en: "Advanced automations" },
    values: [false, false, true, true],
  },
  {
    label: { es: "Agente IA (chat / ventas)", en: "AI agent (chat / sales)" },
    values: [false, false, true, true],
  },
  {
    label: { es: "Analíticas avanzadas", en: "Advanced analytics" },
    values: [false, true, true, true],
  },
  {
    label: { es: "Multi-sede / multi-marca", en: "Multi-location / multi-brand" },
    values: [false, false, false, true],
  },
  {
    label: { es: "Soporte", en: "Support" },
    values: [
      { es: "Email (72h)", en: "Email (72h)" },
      { es: "Prioritario (24h)", en: "Priority (24h)" },
      { es: "Dedicado (4h/mes)", en: "Dedicated (4h/mo)" },
      { es: "Asignado + SLA", en: "Assigned + SLA" },
    ],
  },
];

export default function ServiciosPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useSimpleLanguage();
  const L = (v: { es: string; en: string }) => (language === "en" ? v.en : v.es);

  const renderComparisonValue = (val: ComparisonValue) => {
    if (val === true) {
      return (
        <svg className="w-5 h-5 text-brand-primary mx-auto" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (val === false) {
      return <span className="text-text-muted text-lg leading-none">—</span>;
    }
    if (typeof val === "string") return <span className="text-text-secondary text-xs">{val}</span>;
    return <span className="text-text-secondary text-xs">{L(val)}</span>;
  };

  const process = [
    { step: "01", titleKey: "services.process.step1.title", descriptionKey: "services.process.step1.description" },
    { step: "02", titleKey: "services.process.step2.title", descriptionKey: "services.process.step2.description" },
    { step: "03", titleKey: "services.process.step3.title", descriptionKey: "services.process.step3.description" },
    { step: "04", titleKey: "services.process.step4.title", descriptionKey: "services.process.step4.description" },
  ];

  const stats = [
    { metricKey: "services.results.metric1", labelKey: "services.results.metric1.label" },
    { metricKey: "services.results.metric2", labelKey: "services.results.metric2.label" },
    { metricKey: "services.results.metric3", labelKey: "services.results.metric3.label" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                {t("services.hero.title")}
                <span className="block text-brand-primary">{t("services.hero.subtitle")}</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t("services.hero.description")}
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
              {t("services.section.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t("services.section.description")}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const isFree = plan.price === 0;
              const effectivePrice = isFree
                ? 0
                : billing === "annual"
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
                        {language === "en" ? "Most popular" : "Más popular"}
                      </span>
                    </div>
                  )}
                  {isFree && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-block bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-wide">
                        {language === "en" ? "Free forever" : "Gratis siempre"}
                      </span>
                    </div>
                  )}
                  <div
                    className={`bg-surface rounded-2xl p-7 h-full border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col ${
                      plan.highlight
                        ? "border-brand-primary shadow-brand-primary/10"
                        : isFree
                        ? "border-emerald-600/30 hover:border-emerald-600/60"
                        : "border-border hover:border-brand-primary/30"
                    }`}
                  >
                    <div
                      className={`mb-2 text-sm font-semibold uppercase tracking-widest ${
                        isFree ? "text-emerald-600" : "text-brand-primary"
                      }`}
                    >
                      {L(plan.name)}
                    </div>

                    <div className="mb-1 flex items-baseline gap-2">
                      {isFree ? (
                        <span className="text-4xl font-bold text-emerald-600">
                          {language === "en" ? "Free" : "Gratis"}
                        </span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-text-primary">${effectivePrice}</span>
                          <span className="text-text-muted text-sm">
                            USD / {language === "en" ? "mo" : "mes"}
                          </span>
                        </>
                      )}
                    </div>

                    {!isFree && billing === "annual" && (
                      <div className="text-xs text-brand-primary font-semibold mb-2">
                        {language === "en"
                          ? `Billed $${effectivePrice * 12} / year`
                          : `Facturado $${effectivePrice * 12} / año`}
                      </div>
                    )}

                    {isFree && (
                      <div className="text-xs text-emerald-600 font-semibold mb-2">
                        {language === "en" ? "No credit card required" : "Sin tarjeta, sin compromiso"}
                      </div>
                    )}

                    {plan.setup && (
                      <div className="text-xs text-text-muted mb-5">{L(plan.setup)}</div>
                    )}
                    {!plan.setup && <div className="mb-5" />}

                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">{L(plan.tagline)}</p>

                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                          <svg
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isFree ? "text-emerald-600" : "text-brand-primary"}`}
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

                    {isFree ? (
                      <button
                        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-300 cursor-pointer"
                        onClick={() => router.push("/contacto")}
                      >
                        {L(plan.cta)}
                      </button>
                    ) : (
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
                    )}
                  </div>
                </div>
              );
            })}

            {/* Corporativo card */}
            <div
              className="group animate-fade-in-up relative"
              style={{ animationDelay: `${plans.length * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-brand-primary/5 to-surface rounded-2xl p-7 h-full border-2 border-dashed border-brand-primary/40 hover:border-brand-primary transition-all duration-300 flex flex-col">
                <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-primary">
                  {language === "en" ? "Corporate" : "Corporativo"}
                </div>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-text-primary">
                    {language === "en" ? "Custom" : "A medida"}
                  </span>
                </div>
                <div className="text-xs text-text-muted mb-5">
                  {language === "en"
                    ? "From $350 / mo · SOW and contract tailored to your operation"
                    : "Desde $350 / mes · SOW y contrato a medida de tu operación"}
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
                    { es: "Infraestructura dedicada y SSO / compliance", en: "Dedicated infrastructure and SSO / compliance" },
                    { es: "Account manager y roadmap compartido", en: "Account manager and shared roadmap" },
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
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
              ? "Paid plans include hosting, SSL, regular updates and MaalCa ecosystem integration. 6-12 month minimum term; setup fee is non-refundable."
              : "Los planes de pago incluyen hosting, SSL, actualizaciones regulares e integración con el ecosistema MaalCa. Permanencia mínima 6-12 meses; el setup no es reembolsable."}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {language === "en" ? "Compare plans" : "Compara los planes"}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {language === "en"
                ? "Find the plan that fits your stage of growth."
                : "Encuentra el plan que va con tu etapa de crecimiento."}
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-4 px-5 text-text-muted font-medium text-sm w-2/5">
                    {language === "en" ? "Feature" : "Característica"}
                  </th>
                  <th className="text-center py-4 px-3">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {language === "en" ? "Free" : "Gratis"}
                    </span>
                    <span className="text-xs text-text-muted">$0</span>
                  </th>
                  <th className="text-center py-4 px-3">
                    <span className="text-xs font-bold text-text-primary block">Emprendedor</span>
                    <span className="text-xs text-text-muted">$38</span>
                  </th>
                  <th className="text-center py-4 px-3">
                    <span className="text-xs font-bold text-text-primary block">Profesional</span>
                    <span className="text-xs text-text-muted">$95</span>
                  </th>
                  <th className="text-center py-4 px-3">
                    <span className="text-xs font-bold text-text-primary block">Premium</span>
                    <span className="text-xs text-text-muted">$195</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/40 ${i % 2 === 0 ? "bg-surface/40" : "bg-surface"}`}
                  >
                    <td className="py-3.5 px-5 text-sm text-text-secondary">{L(row.label)}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3.5 px-3 text-center">
                        {renderComparisonValue(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                ? "Scale your plan without jumping tiers. Stackable on Emprendedor, Profesional or Premium."
                : "Escala tu plan sin cambiar de tier. Combinables sobre Emprendedor, Profesional o Premium."}
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
                <h3 className="text-base font-bold text-text-primary mb-2 leading-snug">{L(addon.name)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{L(addon.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {language === "en" ? "Frequently asked questions" : "Preguntas frecuentes"}
            </h2>
            <p className="text-lg text-text-secondary">
              {language === "en"
                ? "Everything you need to know about the free plan and upgrades."
                : "Todo lo que necesitas saber sobre el plan gratuito y las actualizaciones."}
            </p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-text-primary text-sm md:text-base">{L(item.q)}</span>
                  <svg
                    className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-1 text-text-secondary text-sm leading-relaxed border-t border-border/50">
                    {L(item.a)}
                  </div>
                )}
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
              {t("services.process.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t("services.process.description")}
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
                  <div className="w-16 h-16 bg-brand-primary/10 border-2 border-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-brand-primary font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">{t(step.titleKey)}</h3>
                  <p className="text-text-secondary leading-relaxed">{t(step.descriptionKey)}</p>
                </div>
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
              {t("services.results.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
              {t("services.results.description")}
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
              onClick={() => router.push("/casos-estudio")}
            >
              {t("services.results.cta")}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t("services.cta.title")}
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              {t("services.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
              >
                {t("services.cta.consultation")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border text-text-primary hover:bg-surface"
              >
                {t("services.cta.portfolio")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
