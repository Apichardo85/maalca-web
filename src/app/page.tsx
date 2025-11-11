"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { Counter } from "@/components/ui/Counter";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { projects, affiliates } from "@/data";
import { dominicanMenus } from "@/data/dominican-menus";
import { getActiveEcosystemProjects } from "@/data/ecosystem-projects";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProjectClick = (href: string) => {
    router.push(href);
  const activeEcosystemProjects = getActiveEcosystemProjects();
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section with DRAMATIC MOVING GRADIENT */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
        {/* DRAMATIC ANIMATED GRADIENT BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 dark:from-black dark:via-red-950/20 dark:to-black">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.15) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <span className="text-text-primary">{t('hero.maalca')}</span>
              <br />
              <span className="text-brand-primary">{t('hero.ecosystem')}</span>
              <br />
              <span className="text-text-secondary">{t('hero.creative')}</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed text-text-secondary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
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
              <div className="ml-4">
                <ThemeSwitch />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center cursor-pointer"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => scrollToSection('about')}
          >
            <motion.div
              className="w-1 h-3 bg-text-muted rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About / Storytelling Section */}
      <section id="about" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('about.title')}
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('about.description')}
            </p>
          </motion.div>

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
              <motion.div
                key={item.year}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-5xl font-bold text-brand-primary mb-4">{item.year}</div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{t(item.titleKey)}</h3>
                <p className="text-text-secondary leading-relaxed">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION WITH ANIMATED COUNTERS */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: 7, label: 'Proyectos Activos', suffix: '+' },
              { number: 50, label: 'Colaboradores', suffix: '+' },
              { number: 1000, label: 'Clientes Satisfechos', suffix: '+' },
              { number: 5, label: 'Años de Experiencia', suffix: '' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-5xl font-black text-red-600 dark:text-red-500 mb-2">
                  <Counter to={stat.number} duration={2} />{stat.suffix}
                </div>
                <div className="text-text-secondary font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem / Projects Section */}
      <section id="ecosistema" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('projects.title')}
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('projects.description')}
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                titleKey: "project.editorial.title",
                descriptionKey: "project.editorial.description",
                categoryKey: "project.editorial.category",
                outcomeKey: "project.editorial.outcome",
                color: "red",
                image: "/images/projects/editorial-maalca.svg",
                href: "/editorial"
              },
              {
                titleKey: "project.ciriwhispers.title",
                descriptionKey: "project.ciriwhispers.description",
                categoryKey: "project.ciriwhispers.category",
                outcomeKey: "project.ciriwhispers.outcome",
                color: "gray",
                image: "/images/projects/ciriwhispers.png",
                href: "/ciriwhispers"
              },
              {
                titleKey: "project.cirisonic.title",
                descriptionKey: "project.cirisonic.description",
                categoryKey: "project.cirisonic.category",
                outcomeKey: "project.cirisonic.outcome",
                color: "red",
                image: "/images/projects/cirisonic.svg",
                href: "/cirisonic"
              },
              {
                titleKey: "project.cocinatina.title",
                descriptionKey: "project.cocinatina.description",
                categoryKey: "project.cocinatina.category",
                outcomeKey: "project.cocinatina.outcome",
                color: "gray",
                image: "/images/projects/masa-tina.svg",
                href: "/masa-tina"
              },
              {
                titleKey: "project.properties.title",
                descriptionKey: "project.properties.description",
                categoryKey: "project.properties.category",
                outcomeKey: "project.properties.outcome",
                color: "gray",
                image: "/images/projects/maalca-properties.svg",
                href: "/maalca-properties"
              },
            ].map((project, index) => (
              <motion.div
                key={project.titleKey}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border-2 border-slate-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transition-all duration-500 shadow-2xl hover:shadow-red-500/30 hover:-translate-y-4 cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {t(project.titleKey)}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mb-4">
                  {t(project.descriptionKey)}
                </p>

                <div className="text-xs text-gray-400 dark:text-gray-300 mb-6 font-medium">
                  ✓ {t(project.outcomeKey)}
                </div>

                {/* FUNCTIONAL BUTTON WITH DRAMATIC STYLING */}
                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project.href);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {t('common.viewProject')} →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliates Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              {t('affiliates.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t('affiliates.description')}
            </p>
          </motion.div>

          {/* Affiliates Carousel */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              {
                nameKey: "affiliate.pegote.name",
                descriptionKey: "affiliate.pegote.description",
                href: "/pegote-barber",
                initials: "PB"
              },
              {
                nameKey: "affiliate.studioalpha.name",
                descriptionKey: "affiliate.studioalpha.description",
                href: "#",
                initials: "SA"
              },
              {
                nameKey: "affiliate.creativehub.name",
                descriptionKey: "affiliate.creativehub.description",
                href: "#",
                initials: "CH"
              },
              {
                nameKey: "affiliate.designco.name",
                descriptionKey: "affiliate.designco.description",
                href: "#",
                initials: "DC"
              },
              {
                nameKey: "affiliate.medialab.name",
                descriptionKey: "affiliate.medialab.description",
                href: "#",
                initials: "ML"
              },
              {
                nameKey: "affiliate.artcollective.name",
                descriptionKey: "affiliate.artcollective.description",
                href: "#",
                initials: "AC"
              }
            ].map((affiliate, index) => (
              <motion.div
                key={affiliate.nameKey}
                className="group text-center cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.href = affiliate.href}
              >
                <div className="bg-surface-elevated rounded-xl p-8 h-24 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-all duration-300 border border-border">
                  <span className="text-text-secondary group-hover:text-white font-bold text-lg">
                    {affiliate.initials}
                  </span>
                </div>
                <p className="text-text-primary text-sm group-hover:text-brand-primary transition-colors font-medium">
                  {t(affiliate.nameKey)}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {t(affiliate.descriptionKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Quote Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.blockquote
            className="font-display text-4xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            "{t('quote.philosophy')}"
          </motion.blockquote>
          
          <motion.div
            className="mt-8 w-24 h-1 bg-red-600 mx-auto"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-8">
                {t('contact.title')}
              </h2>

              <form className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder={t('contact.name')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder={t('contact.email')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={6}
                    placeholder={t('contact.message')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-4"
                >
                  {t('contact.send')}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">MaalCa LLC</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Elmira, NY<br />
                    {t('contact.location')}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">{t('contact.emailLabel')}</h3>
                  <a href="mailto:hello@maalca.com" className="text-red-400 hover:text-red-300 transition-colors">
                    hello@maalca.com
                  </a>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-6">{t('contact.followUs')}</h3>
                  <div className="flex space-x-6">
                    {[
                      { name: "Instagram", icon: "📷" },
                      { name: "YouTube", icon: "📺" },
                      { name: "Spotify", icon: "🎵" },
                      { name: "LinkedIn", icon: "💼" }
                    ].map((social) => (
                      <motion.a
                        key={social.name}
                        href="#"
                        className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}