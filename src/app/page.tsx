"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { projects, getActiveAffiliates } from "@/data";
import { dominicanMenus } from "@/data/dominican-menus";
import { getActiveEcosystemProjects } from "@/data/ecosystem-projects";

function AffiliateLogo({ logo, fallback }: { logo?: string; fallback: string }) {
  const [failed, setFailed] = useState(!logo);
  if (failed || !logo) {
    return (
      <span className="text-text-secondary group-hover:text-white font-bold text-lg transition-colors">
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
  const activeEcosystemProjects = getActiveEcosystemProjects();
  const handleProjectClick = (href: string) => {
    router.push(href);
  };
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section with DRAMATIC MOVING GRADIENT */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
        {/* DRAMATIC ANIMATED GRADIENT BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 dark:from-black dark:via-red-950/20 dark:to-black">
          <div
            className="absolute inset-0 animate-gradient-shift"
          />
        </div>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-text-primary">{t('hero.maalca')}</span>
              <br />
              <span className="text-brand-primary">{t('hero.ecosystem')}</span>
              <br />
              <span className="text-text-secondary">{t('hero.creative')}</span>
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
                onClick={() => scrollToSection('ecosistema')}
              >
                {t('hero.cta.projects')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background text-lg px-10 py-3"
                onClick={() => window.location.href = '/ecosistema'}
              >
                {t('hero.cta.join')}
              </Button>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in"
          style={{ animationDelay: '1.5s' }}
        >
          <div
            className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center cursor-pointer animate-bounce-slow"
            onClick={() => scrollToSection('about')}
          >
            <div
              className="w-1 h-3 bg-text-muted rounded-full mt-2 animate-pulse"
            />
          </div>
        </div>
      </section>
      {/* About / Storytelling Section */}
      <section id="about" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('about.title')}
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('about.description')}
            </p>
          </div>
          {/* Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                year: "2020",
                titleKey: "about.foundation",
                descKey: "about.foundation.desc"
              },
              {
                year: "2022",
                titleKey: "about.expansion",
                descKey: "about.expansion.desc"
              },
              {
                year: "2024",
                titleKey: "about.consolidation",
                descKey: "about.consolidation.desc"
              }
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
      {/* Ecosystem / Projects Section */}
      <section id="ecosistema" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('projects.title')}
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('projects.description')}
            </p>
          </div>
          {/* Projects Grid — visibility controlled by active field in ecosystem-projects.ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: "editorial-maalca",
                titleKey: "project.editorial.title",
                descriptionKey: "project.editorial.description",
                categoryKey: "project.editorial.category",
                outcomeKey: "project.editorial.outcome",
                color: "red",
                image: "/images/projects/editorial-maalca.svg",
                href: "/editorial"
              },
              {
                id: "ciriwhispers",
                titleKey: "project.ciriwhispers.title",
                descriptionKey: "project.ciriwhispers.description",
                categoryKey: "project.ciriwhispers.category",
                outcomeKey: "project.ciriwhispers.outcome",
                color: "gray",
                image: "/images/projects/ciriwhispers.png",
                href: "/ciriwhispers"
              },
              {
                id: "cirisonic",
                titleKey: "project.cirisonic.title",
                descriptionKey: "project.cirisonic.description",
                categoryKey: "project.cirisonic.category",
                outcomeKey: "project.cirisonic.outcome",
                color: "red",
                image: "/images/projects/cirisonic.svg",
                href: "/cirisonic"
              },
              {
                id: "masa-tina",
                titleKey: "project.cocinatina.title",
                descriptionKey: "project.cocinatina.description",
                categoryKey: "project.cocinatina.category",
                outcomeKey: "project.cocinatina.outcome",
                color: "gray",
                image: "/images/projects/masa-tina.svg",
                href: "/masa-tina"
              },
            ]
            .filter(p => activeEcosystemProjects.some(ep => ep.id === p.id))
            .map((project, index) => (
              <div
                key={project.titleKey}
                className="group relative bg-surface backdrop-blur-xl rounded-3xl p-8 border-2 border-border hover:border-brand-primary transition-all duration-500 shadow-2xl hover:shadow-brand-primary/30 hover:-translate-y-4 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleProjectClick(project.href)}
              >
                {/* Project Image with OVERLAY */}
                <div className="relative overflow-hidden rounded-2xl mb-6 group-hover:shadow-2xl transition-shadow">
                  <ProjectImage
                    src={project.image}
                    alt={t(project.titleKey)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                  project.color === 'red'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                }`}>
                  {t(project.categoryKey)}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors">
                  {t(project.titleKey)}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm mb-4">
                  {t(project.descriptionKey)}
                </p>
                <div className="text-xs text-text-muted mb-6 font-medium">
                  ✓ {t(project.outcomeKey)}
                </div>
                {/* FUNCTIONAL BUTTON WITH DRAMATIC STYLING */}
                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project.href);
                    }}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {t('common.viewProject')} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Affiliates Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('affiliates.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('affiliates.description')}
            </p>
          </div>
          {/* Affiliates — active partners only (controlled by active field in affiliates.ts) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {getActiveAffiliates().map((affiliate, index) => (
              <div
                key={affiliate.id}
                className="group text-center cursor-pointer animate-fade-in-scale hover:scale-105 transition-transform"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.location.href = affiliate.website ?? '/'}
              >
                <div className="bg-surface-elevated rounded-xl p-4 h-24 flex items-center justify-center mb-4 group-hover:border-brand-primary transition-all duration-300 border border-border overflow-hidden">
                  <AffiliateLogo
                    logo={affiliate.logo}
                    fallback={affiliate.displayInitials ?? affiliate.name.slice(0, 2).toUpperCase()}
                  />
                </div>
                <p className="text-text-primary text-sm group-hover:text-brand-primary transition-colors font-medium">
                  {affiliate.name}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {affiliate.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Philosophy / Quote Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <blockquote
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-snug animate-fade-in-scale"
          >
            {`"${t('quote.philosophy')}"`}
          </blockquote>
          <div
            className="mt-8 w-24 h-1 bg-brand-primary mx-auto animate-expand-width"
          />
        </div>
      </section>
      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
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
            {/* Contact Info */}
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
                        name: "Instagram",
                        href: "https://www.instagram.com/maalca_llc",
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.21 8.78 2.2 12 2.2Zm0 1.8c-3.17 0-3.54 0-4.78.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.04C2.46 8.84 2.45 9.21 2.45 12s0 3.16.07 4.4c.05 1.07.23 1.65.38 2.04.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.04.38 1.24.06 1.61.07 4.78.07s3.54 0 4.78-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.04.06-1.24.07-1.61.07-4.4s0-3.16-.07-4.4c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.82-1.26 3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.04-.38C15.54 4 15.17 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/>
                          </svg>
                        ),
                      },
                      {
                        name: "YouTube",
                        href: "#",
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z"/>
                          </svg>
                        ),
                      },
                      {
                        name: "Spotify",
                        href: "#",
                        svg: (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.5-1.1a.75.75 0 0 1-.35-1.45c4.6-1.1 8.5-.65 11.6 1.25a.75.75 0 0 1 .25 1.05Zm1.5-3.4a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.4 1.55.45.25.6.85.35 1.35Zm.15-3.5C15.3 8 8.7 7.75 5.05 8.9a1.13 1.13 0 1 1-.65-2.15c4.2-1.3 11.5-1 15.8 1.55a1.13 1.13 0 1 1-1.15 1.95Z"/>
                          </svg>
                        ),
                      },
                      {
                        name: "LinkedIn",
                        href: "#",
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
