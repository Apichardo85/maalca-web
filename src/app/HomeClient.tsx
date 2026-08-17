"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { useContactForm } from "@/hooks/useContactForm";
import { PRICE_FREE, PRICE_ENTREPRENEUR, PRICE_PROFESSIONAL } from "@/config/pricing";

export interface FeaturedAffiliate {
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

interface Props {
  featuredAffiliates: FeaturedAffiliate[];
}

function AffiliateLogo({ logo, fallback }: { logo?: string; fallback: string }) {
  const [failed, setFailed] = useState(!logo);
  if (failed || !logo) {
    return (
      <span className="font-bold text-lg text-white/90 rounded-lg px-4 py-2 bg-gradient-to-br from-red-800 to-red-950">
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt={fallback}
      className="max-h-16 max-w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeClient({ featuredAffiliates }: Props) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Formulario de contacto de la home — antes no tenía ni onSubmit ni estado, el botón
  // "Enviar mensaje" no hacía nada. Reusa el mismo /api/contact que /contacto/page.tsx.
  const { submitForm, isLoading: contactLoading, isSuccess: contactSuccess, isError: contactError, message: contactMessage } = useContactForm('home');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim() || contactLoading) return;
    const result = await submitForm({ name: contactName, email: contactEmail, company: '', project: 'home', message: contactMsg });
    if (result.success) {
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }
  };

  // Same shape the section already rendered when it read from the mock — mapped here so the
  // JSX below (id/website/logo/name/description) didn't need to change field names throughout.
  const activeAffiliates = featuredAffiliates.map((a) => ({
    id: a.slug,
    name: a.name,
    description: a.description ?? '',
    logo: a.logoUrl ?? undefined,
    website: `/${a.slug}`,
  }));

  const platformModules = [
    {
      titleKey: 'platform.mod.presence',
      descKey: 'platform.mod.presence.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.catalog',
      descKey: 'platform.mod.catalog.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.identity',
      descKey: 'platform.mod.identity.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75H4.5a.75.75 0 00-.75.75v2.25m14.25-3H19.5a.75.75 0 01.75.75v2.25m-18 10.5v2.25c0 .414.336.75.75.75h2.25m11.25 0h2.25a.75.75 0 00.75-.75v-2.25M6.75 6.75h.75v.75h-.75v-.75zm0 9.75h.75v.75h-.75v-.75zm9.75-9.75h.75v.75h-.75v-.75z" />
        </svg>
      ),
    },
    // Estas tres estaban traducidas (es+en) en useSimpleLanguage.tsx desde hace tiempo pero
    // nunca se agregaron acá — la home solo mostraba 4 de 9 módulos reales que ya existen
    // (Agenda, Reservas, POS, Cocina, Kiosko caen bajo "bookings"; Stripe Connect bajo
    // "payments"; recordatorios + bloqueo de horario bajo "automations").
    {
      titleKey: 'platform.mod.bookings',
      descKey: 'platform.mod.bookings.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.payments',
      descKey: 'platform.mod.payments.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.automations',
      descKey: 'platform.mod.automations.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.analytics',
      descKey: 'platform.mod.analytics.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ];

  const howSteps = [
    { num: '01', titleKey: 'how.step1.title', descKey: 'how.step1.desc' },
    { num: '02', titleKey: 'how.step2.title', descKey: 'how.step2.desc' },
    { num: '03', titleKey: 'how.step3.title', descKey: 'how.step3.desc' },
    { num: '04', titleKey: 'how.step4.title', descKey: 'how.step4.desc' },
  ];

  const pricingPlans = [
    {
      name: { es: 'Gratis', en: 'Free' },
      price: `$${PRICE_FREE}`,
      period: language === 'en' ? '/mo' : '/mes',
      tag: null as { es: string; en: string } | null,
      bullets: [
        { es: 'Sitio web con tu marca', en: 'Branded website' },
        { es: 'Catálogo básico (10 ítems)', en: 'Basic catalog (10 items)' },
        { es: 'Código QR + contacto directo', en: 'QR code + direct contact' },
      ],
    },
    {
      name: { es: 'Emprendedor', en: 'Growth' },
      price: `$${PRICE_ENTREPRENEUR}`,
      period: language === 'en' ? '/mo' : '/mes',
      tag: { es: 'Más popular', en: 'Most popular' } as { es: string; en: string } | null,
      bullets: [
        { es: 'Catálogo ilimitado + reservas online', en: 'Unlimited catalog + online bookings' },
        { es: 'Pagos con Stripe integrados', en: 'Integrated Stripe payments' },
        { es: 'Automatizaciones básicas', en: 'Basic automations' },
      ],
    },
    {
      name: { es: 'Profesional', en: 'Professional' },
      price: `$${PRICE_PROFESSIONAL}`,
      period: language === 'en' ? '/mo' : '/mes',
      tag: null as { es: string; en: string } | null,
      // Sincronizado con las features reales del plan Profesional en /servicios/page.tsx —
      // este array vive por separado (vista previa de precios de la home) y quedó
      // desactualizado con features que nunca existieron (CRM completo, Agente IA).
      bullets: [
        { es: 'Facturas y propuestas con firma digital', en: 'Invoices and proposals with e-signature' },
        { es: 'Recordatorios y bloqueo de horario automáticos', en: 'Automatic reminders and schedule blocking' },
        { es: 'Reportes y analíticas ampliadas', en: 'Extended reports and analytics' },
      ],
    },
  ];


  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ─── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 dark:from-black dark:via-red-950/20 dark:to-black">
          <div className="absolute inset-0 animate-gradient-shift" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <p
              className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {t('hero.eyebrow')}
            </p>
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-text-primary">{t('hero.maalca')}</span>
              <br />
              <span className="text-brand-primary">{t('hero.ecosystem')}</span>
            </h1>
            <p
              className="text-lg sm:text-xl lg:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed text-text-secondary animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              {t('hero.subtitle')}
            </p>
            <div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up"
              style={{ animationDelay: '0.9s' }}
            >
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white border-brand-primary hover:border-brand-primary-hover text-lg px-10 py-3"
                onClick={() => router.push('/servicios')}
              >
                {t('hero.cta.projects')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background text-lg px-10 py-3"
                onClick={() => scrollToSection('como-funciona')}
              >
                {t('hero.cta.join')}
              </Button>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in"
          style={{ animationDelay: '1.5s' }}
        >
          <div
            className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center cursor-pointer animate-bounce-slow"
            onClick={() => scrollToSection('plataforma')}
          >
            <div className="w-1 h-3 bg-text-muted rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── 2. PLATFORM MODULES ─────────────────────────────────────────────── */}
      <section id="plataforma" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              {t('platform.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('platform.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformModules.map((mod, index) => (
              <div
                key={mod.titleKey}
                className="bg-surface-elevated rounded-2xl p-6 border border-border hover:border-brand-primary transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                  {mod.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{t(mod.titleKey)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t(mod.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-text-muted mb-4">{t('platform.footnote')}</p>
            <Link href="/servicios" className="text-brand-primary hover:text-brand-primary-hover font-medium text-sm transition-colors">
              {t('platform.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              {t('how.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('how.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howSteps.map((step, index) => (
              <div
                key={step.num}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {index < howSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-border -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-5xl font-bold text-brand-primary/20 mb-4 font-display leading-none">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">{t(step.titleKey)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{t(step.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. CASES / CLIENTS ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              {t('cases.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('cases.preview.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {activeAffiliates.map((affiliate, index) => (
              <div
                key={affiliate.id}
                className="group bg-surface-elevated rounded-2xl p-6 border border-border hover:border-brand-primary transition-all duration-300 cursor-pointer animate-fade-in-scale hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.location.href = affiliate.website ?? '/'}
              >
                <div className="h-20 flex items-center justify-center mb-4 overflow-hidden">
                  <AffiliateLogo
                    logo={affiliate.logo}
                    fallback={affiliate.name.slice(0, 2).toUpperCase()}
                  />
                </div>
                <h3 className="text-text-primary font-semibold mb-1 group-hover:text-brand-primary transition-colors">
                  {affiliate.name}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {affiliate.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/casos" className="text-brand-primary hover:text-brand-primary-hover font-medium text-sm transition-colors">
              {t('cases.preview.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5. PRICING SNAPSHOT ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name.es}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 animate-fade-in-up flex flex-col ${
                  plan.tag
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface-elevated'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.tag[language]}
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-sm font-medium text-text-secondary mb-1">{plan.name[language]}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary font-display">{plan.price}</span>
                    <span className="text-text-muted text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet.es} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-brand-primary mt-0.5 flex-shrink-0">✓</span>
                      {bullet[language]}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/servicios"
                  className={`text-center text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ${
                    plan.tag
                      ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                      : 'border border-border text-text-primary hover:border-brand-primary hover:text-brand-primary'
                  }`}
                >
                  {t('pricing.plan.cta')}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/servicios#comparar" className="text-brand-primary hover:text-brand-primary-hover font-medium text-sm transition-colors">
              {t('pricing.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. ABOUT / TIMELINE ─────────────────────────────────────────────── */}
      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('about.title')}
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('about.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { year: '2020', titleKey: 'about.foundation', descKey: 'about.foundation.desc' },
              { year: '2022', titleKey: 'about.expansion', descKey: 'about.expansion.desc' },
              { year: '2024', titleKey: 'about.consolidation', descKey: 'about.consolidation.desc' },
              { year: '2026', titleKey: 'about.platform', descKey: 'about.platform.desc' },
            ].map((item, index) => (
              <div
                key={item.year}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-5xl font-bold text-brand-primary mb-4">{item.year}</div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{t(item.titleKey)}</h3>
                <p className="text-text-secondary leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6 animate-fade-in-scale"
          >
            {t('cta.final.title')}
          </h2>
          <p className="text-lg text-text-secondary mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('cta.final.subtitle')}
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              variant="primary"
              size="lg"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white text-lg px-12 py-4"
              onClick={() => router.push('/servicios')}
            >
              {t('cta.final.btn')}
            </Button>
          </div>
          <div className="mt-8 w-24 h-1 bg-brand-primary mx-auto animate-expand-width" />
        </div>
      </section>

      {/* ─── 9. BEYOND ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-text-primary mb-3">
              {t('beyond.title')}
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              {t('beyond.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Editorial MaalCa */}
            <div className="group rounded-2xl border border-border bg-surface-elevated p-8 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 group-hover:text-amber-600 transition-colors">
                {t('beyond.editorial.title')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {t('beyond.editorial.desc')}
              </p>
              <Link
                href="/editorial"
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                {t('beyond.editorial.cta')}
              </Link>
            </div>
            {/* CiriWhispers */}
            <div className="group rounded-2xl border border-border bg-surface-elevated p-8 hover:border-text-secondary transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-secondary mb-5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary mb-2 group-hover:text-text-secondary transition-colors">
                {t('beyond.ciri.title')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {t('beyond.ciri.desc')}
              </p>
              <Link
                href="/ciriwhispers"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('beyond.ciri.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. CONTACT ─────────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="animate-fade-in-left">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
                {t('contact.title')}
              </h2>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div>
                  <label htmlFor="contact-name" className="sr-only">{t('contact.name')}</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t('contact.name')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">{t('contact.email')}</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={t('contact.email')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="sr-only">{t('contact.message')}</label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder={t('contact.message')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={contactLoading}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-lg py-4 disabled:opacity-50"
                >
                  {contactLoading ? '...' : t('contact.send')}
                </Button>
                {contactSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">{contactMessage}</p>
                )}
                {contactError && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{contactMessage}</p>
                )}
              </form>
            </div>
            <div className="animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">MaalCa LLC</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Elmira, NY<br />
                    {t('contact.location')}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">{t('contact.emailLabel')}</h3>
                  <a href="mailto:hello@maalca.com" className="text-brand-primary hover:text-brand-primary-hover transition-colors">
                    hello@maalca.com
                  </a>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6">{t('contact.followUs')}</h3>
                  <div className="flex gap-3">
                    {/* Solo Instagram es una cuenta real hoy — YouTube/Spotify/LinkedIn
                        apuntaban a href="#" (no llevaban a ningún lado). Los quitamos hasta
                        que existan esas cuentas; agregarlos de vuelta es trivial cuando pase. */}
                    {[
                      {
                        name: 'Instagram',
                        href: 'https://www.instagram.com/maalca_llc',
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.21 8.78 2.2 12 2.2Zm0 1.8c-3.17 0-3.54 0-4.78.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.04C2.46 8.84 2.45 9.21 2.45 12s0 3.16.07 4.4c.05 1.07.23 1.65.38 2.04.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.04.38 1.24.06 1.61.07 4.78.07s3.54 0 4.78-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.04.06-1.24.07-1.61.07-4.4s0-3.16-.07-4.4c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.82-1.26 3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.04-.38C15.54 4 15.17 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/>
                          </svg>
                        ),
                      },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={social.name}
                        className="w-11 h-11 bg-surface-elevated border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-primary hover:border-brand-primary transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        {social.svg}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
