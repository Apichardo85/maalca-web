"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function ServiciosPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Define services with translation keys
  const services = [
    {
      id: "editorial-kdp",
      icon: "📚",
      titleKey: "services.editorial-kdp.title",
      descriptionKey: "services.editorial-kdp.description",
      features: [
        "services.editorial-kdp.feature1",
        "services.editorial-kdp.feature2",
        "services.editorial-kdp.feature3",
        "services.editorial-kdp.feature4",
        "services.editorial-kdp.feature5",
        "services.editorial-kdp.feature6"
      ],
      pricingKey: "services.editorial-kdp.pricing",
      timelineKey: "services.editorial-kdp.timeline"
    },
    {
      id: "fabrica-ia",
      icon: "🤖",
      titleKey: "services.fabrica-ia.title",
      descriptionKey: "services.fabrica-ia.description",
      features: [
        "services.fabrica-ia.feature1",
        "services.fabrica-ia.feature2",
        "services.fabrica-ia.feature3",
        "services.fabrica-ia.feature4",
        "services.fabrica-ia.feature5",
        "services.fabrica-ia.feature6"
      ],
      pricingKey: "services.fabrica-ia.pricing",
      timelineKey: "services.fabrica-ia.timeline"
    },
    {
      id: "podcast-media",
      icon: "🎙️",
      titleKey: "services.podcast-media.title",
      descriptionKey: "services.podcast-media.description",
      features: [
        "services.podcast-media.feature1",
        "services.podcast-media.feature2",
        "services.podcast-media.feature3",
        "services.podcast-media.feature4",
        "services.podcast-media.feature5",
        "services.podcast-media.feature6"
      ],
      pricingKey: "services.podcast-media.pricing",
      timelineKey: "services.podcast-media.timeline"
    },
    {
      id: "pos-ecommerce",
      icon: "💳",
      titleKey: "services.pos-ecommerce.title",
      descriptionKey: "services.pos-ecommerce.description",
      features: [
        "services.pos-ecommerce.feature1",
        "services.pos-ecommerce.feature2",
        "services.pos-ecommerce.feature3",
        "services.pos-ecommerce.feature4",
        "services.pos-ecommerce.feature5",
        "services.pos-ecommerce.feature6"
      ],
      pricingKey: "services.pos-ecommerce.pricing",
      timelineKey: "services.pos-ecommerce.timeline"
    },
    {
      id: "proptech-real-estate",
      icon: "🏝️",
      titleKey: "services.proptech.title",
      descriptionKey: "services.proptech.description",
      features: [
        "services.proptech.feature1",
        "services.proptech.feature2",
        "services.proptech.feature3",
        "services.proptech.feature4",
        "services.proptech.feature5",
        "services.proptech.feature6"
      ],
      pricingKey: "services.proptech.pricing",
      timelineKey: "services.proptech.timeline"
    },
    {
      id: "consultoria-integral",
      icon: "💡",
      titleKey: "services.consultoria.title",
      descriptionKey: "services.consultoria.description",
      features: [
        "services.consultoria.feature1",
        "services.consultoria.feature2",
        "services.consultoria.feature3",
        "services.consultoria.feature4",
        "services.consultoria.feature5",
        "services.consultoria.feature6"
      ],
      pricingKey: "services.consultoria.pricing",
      timelineKey: "services.consultoria.timeline"
    }
  ];

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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                {t('services.hero.title')}
                <span className="block text-brand-primary">{t('services.hero.subtitle')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t('services.hero.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.section.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('services.section.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-surface rounded-2xl p-8 h-full border border-border hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Icon */}
                  <div className="text-4xl mb-6">{service.icon}</div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-brand-primary transition-colors">
                    {t(service.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    {t(service.descriptionKey)}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {service.features.map((featureKey, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing and Timeline */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">{t('services.investment')}</span>
                      <span className="font-semibold text-brand-primary">{t(service.pricingKey)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">{t('services.timeline')}</span>
                      <span className="font-semibold text-text-secondary">{t(service.timelineKey)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                  >
                    {t('services.moreInfo')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.process.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('services.process.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Teaser */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('services.results.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
              {t('services.results.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-surface rounded-2xl border border-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-4xl font-bold text-brand-primary mb-2">{t(stat.metricKey)}</div>
                <div className="text-text-secondary">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
              >
                {t('services.cta.portfolio')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
