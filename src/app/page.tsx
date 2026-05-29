"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { getActiveAffiliates } from "@/data";

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

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeAffiliates = getActiveAffiliates();

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
      titleKey: 'platform.mod.bookings',
      descKey: 'platform.mod.bookings.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
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
      titleKey: 'platform.mod.agent',
      descKey: 'platform.mod.agent.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
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
    {
      titleKey: 'platform.mod.automations',
      descKey: 'platform.mod.automations.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      titleKey: 'platform.mod.crm',
      descKey: 'platform.mod.crm.desc',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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
      name: 'Gratis',
      price: '$0',
      period: '/mes',
      tag: null as string | null,
      bullets: [
        'Sitio web con tu marca',
        'Catálogo básico (10 ítems)',
        'Código QR + contacto directo',
      ],
    },
    {
      name: 'Emprendedor',
      price: '$38',
      period: '/mes',
      tag: 'Más popular' as string | null,
      bullets: [
        'Catálogo ilimitado + reservas online',
        'Pagos con Stripe integrados',
        'Automatizaciones básicas',
      ],
    },
    {
      name: 'Profesional',
      price: '$95',
      period: '/mes',
      tag: null as string | null,
      bullets: [
        'Agente IA entrenado en tu negocio',
        'CRM completo con historial de clientes',
        'Automatizaciones avanzadas + reportes BI',
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
              {t('hero.creative') && (
                <>
                  <br />
                  <span className="text-text-secondary">{t('hero.creative')}</span>
                </>
              )}
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
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary">
              {t('how.title')}
            </h2>
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
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('cases.title')}
            </h2>
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
                    fallback={affiliate.displayInitials ?? affiliate.name.slice(0, 2).toUpperCase()}
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
        </div>
      </section>

      {/* ─── 5. PRICING SNAPSHOT ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary">
              {t('pricing.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 animate-fade-in-up flex flex-col ${
                  plan.tag
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface-elevated'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.tag}
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-sm font-medium text-text-secondary mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary font-display">{plan.price}</span>
                    <span className="text-text-muted text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-brand-primary mt-0.5 flex-shrink-0">✓</span>
                      {bullet}
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
                  Ver plan completo →
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
              <form className="space-y-6">
                <div>
                  <label htmlFor="contact-name" className="sr-only">{t('contact.name')}</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder={t('contact.name')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="sr-only">{t('contact.email')}</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder={t('contact.email')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="sr-only">{t('contact.message')}</label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    placeholder={t('contact.message')}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-6 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-lg py-4"
                >
                  {t('contact.send')}
                </Button>
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
                      {
                        name: 'YouTube',
                        href: '#',
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z"/>
                          </svg>
                        ),
                      },
                      {
                        name: 'Spotify',
                        href: '#',
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.5-1.1a.75.75 0 0 1-.35-1.45c4.6-1.1 8.5-.65 11.6 1.25a.75.75 0 0 1 .25 1.05Zm1.5-3.4a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.4 1.55.45.25.6.85.35 1.35Zm.15-3.5C15.3 8 8.7 7.75 5.05 8.9a1.13 1.13 0 1 1-.65-2.15c4.2-1.3 11.5-1 15.8 1.55a1.13 1.13 0 1 1-1.15 1.95Z"/>
                          </svg>
                        ),
                      },
                      {
                        name: 'LinkedIn',
                        href: '#',
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.3c0-1.27-.03-2.9-1.77-2.9-1.77 0-2.04 1.37-2.04 2.8V21H9V9Z"/>
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
