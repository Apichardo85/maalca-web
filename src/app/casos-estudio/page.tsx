"use client";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { useTranslation } from "@/hooks/useSimpleLanguage";

type Trend = "up" | "down";
type CaseStudy = {
  id: string;
  active: boolean;
  titleKey: string;
  categoryKey: string;
  challengeKey: string;
  solutionKey: string;
  results: Record<string, string>;
  metrics: { labelKey: string; value: string; trend: Trend }[];
  image: string;
  testimonial: { textKey: string; authorKey: string };
  technologies: string[];
};

const allCaseStudies: CaseStudy[] = [
  {
    id: "editorial-maalca-case",
    active: true,
    titleKey: "casosEstudio.editorial.title",
    categoryKey: "casosEstudio.editorial.category",
    challengeKey: "casosEstudio.editorial.challenge",
    solutionKey: "casosEstudio.editorial.solution",
    results: {
      books: "casosEstudio.editorial.results.books",
      reach: "casosEstudio.editorial.results.reach",
      sales: "casosEstudio.editorial.results.sales",
      impact: "casosEstudio.editorial.results.impact"
    },
    metrics: [
      { labelKey: "casosEstudio.editorial.metrics.launchTime", value: "6 meses", trend: "down" },
      { labelKey: "casosEstudio.editorial.metrics.countriesReached", value: "200+", trend: "up" },
      { labelKey: "casosEstudio.editorial.metrics.distributionCost", value: "-90%", trend: "down" },
      { labelKey: "casosEstudio.editorial.metrics.globalReach", value: "100%", trend: "up" }
    ],
    image: "/images/projects/editorial-maalca.png",
    testimonial: {
      textKey: "casosEstudio.editorial.testimonial.text",
      authorKey: "casosEstudio.editorial.testimonial.author"
    },
    technologies: ["Amazon KDP", "Print on Demand", "Global Distribution", "Digital Marketing"]
  },
  {
    id: "ciriwhispers-case",
    active: true,
    titleKey: "casosEstudio.ciriwhispers.title",
    categoryKey: "casosEstudio.ciriwhispers.category",
    challengeKey: "casosEstudio.ciriwhispers.challenge",
    solutionKey: "casosEstudio.ciriwhispers.solution",
    results: {
      engagement: "casosEstudio.ciriwhispers.results.engagement",
      retention: "casosEstudio.ciriwhispers.results.retention",
      books: "casosEstudio.ciriwhispers.results.books",
      community: "casosEstudio.ciriwhispers.results.community"
    },
    metrics: [
      { labelKey: "casosEstudio.ciriwhispers.metrics.engagementRate", value: "85%", trend: "up" },
      { labelKey: "casosEstudio.ciriwhispers.metrics.readingTime", value: "12 min avg", trend: "up" },
      { labelKey: "casosEstudio.ciriwhispers.metrics.audienceRetention", value: "92%", trend: "up" },
      { labelKey: "casosEstudio.ciriwhispers.metrics.monthlyGrowth", value: "15%", trend: "up" }
    ],
    image: "/images/projects/ciriwhispers.png",
    testimonial: {
      textKey: "casosEstudio.ciriwhispers.testimonial.text",
      authorKey: "casosEstudio.ciriwhispers.testimonial.author"
    },
    technologies: ["Bilingual Content", "Personal Branding", "Digital Storytelling", "Community Building"]
  },
  {
    id: "masa-tina-case",
    active: true,
    titleKey: "casosEstudio.masaTina.title",
    categoryKey: "casosEstudio.masaTina.category",
    challengeKey: "casosEstudio.masaTina.challenge",
    solutionKey: "casosEstudio.masaTina.solution",
    results: {
      orders: "casosEstudio.masaTina.results.orders",
      efficiency: "casosEstudio.masaTina.results.efficiency",
      revenue: "casosEstudio.masaTina.results.revenue",
      satisfaction: "casosEstudio.masaTina.results.satisfaction"
    },
    metrics: [
      { labelKey: "casosEstudio.masaTina.metrics.monthlyOrders", value: "500+", trend: "up" },
      { labelKey: "casosEstudio.masaTina.metrics.processingTime", value: "-60%", trend: "down" },
      { labelKey: "casosEstudio.masaTina.metrics.revenueIncrease", value: "+200%", trend: "up" },
      { labelKey: "casosEstudio.masaTina.metrics.customerSatisfaction", value: "98%", trend: "up" }
    ],
    image: "/images/projects/masa-tina.svg",
    testimonial: {
      textKey: "casosEstudio.masaTina.testimonial.text",
      authorKey: "casosEstudio.masaTina.testimonial.author"
    },
    technologies: ["Stripe Integration", "Custom POS", "Digital Catalog", "Order Management"]
  },
  {
    id: "hbm-podcast-case",
    active: true,
    titleKey: "casosEstudio.hbmPodcast.title",
    categoryKey: "casosEstudio.hbmPodcast.category",
    challengeKey: "casosEstudio.hbmPodcast.challenge",
    solutionKey: "casosEstudio.hbmPodcast.solution",
    results: {
      episodes: "casosEstudio.hbmPodcast.results.episodes",
      downloads: "casosEstudio.hbmPodcast.results.downloads",
      community: "casosEstudio.hbmPodcast.results.community",
      monetization: "casosEstudio.hbmPodcast.results.monetization"
    },
    metrics: [
      { labelKey: "casosEstudio.hbmPodcast.metrics.episodesPublished", value: "50+", trend: "up" },
      { labelKey: "casosEstudio.hbmPodcast.metrics.monthlyDownloads", value: "10K+", trend: "up" },
      { labelKey: "casosEstudio.hbmPodcast.metrics.avgEngagement", value: "78%", trend: "up" },
      { labelKey: "casosEstudio.hbmPodcast.metrics.audienceGrowth", value: "25%", trend: "up" }
    ],
    image: "/images/projects/hbm-podcast.svg",
    testimonial: {
      textKey: "casosEstudio.hbmPodcast.testimonial.text",
      authorKey: "casosEstudio.hbmPodcast.testimonial.author"
    },
    technologies: ["Podcast Production", "Community Building", "Content Strategy", "Monetization"]
  },
  {
    id: "verde-prive-case",
    active: false, // Proyecto en desarrollo — no verificable aun
    titleKey: "casosEstudio.verdePrive.title",
    categoryKey: "casosEstudio.verdePrive.category",
    challengeKey: "casosEstudio.verdePrive.challenge",
    solutionKey: "casosEstudio.verdePrive.solution",
    results: {
      launch: "casosEstudio.verdePrive.results.launch",
      positioning: "casosEstudio.verdePrive.results.positioning",
      privacy: "casosEstudio.verdePrive.results.privacy",
      quality: "casosEstudio.verdePrive.results.quality"
    },
    metrics: [
      { labelKey: "casosEstudio.verdePrive.metrics.launchPrep", value: "90%", trend: "up" },
      { labelKey: "casosEstudio.verdePrive.metrics.productDevelopment", value: "85%", trend: "up" },
      { labelKey: "casosEstudio.verdePrive.metrics.privacySystem", value: "100%", trend: "up" },
      { labelKey: "casosEstudio.verdePrive.metrics.premiumPositioning", value: "Establecido", trend: "up" }
    ],
    image: "/images/projects/verde-prive.svg",
    testimonial: {
      textKey: "casosEstudio.verdePrive.testimonial.text",
      authorKey: "casosEstudio.verdePrive.testimonial.author"
    },
    technologies: ["Privacy Systems", "Premium Branding", "Quality Control", "Discreet Operations"]
  },
  {
    id: "maalca-properties-case",
    active: false, // Metricas sin verificar (25+ propiedades / 18% ROI) — desactivado hasta validar
    titleKey: "casosEstudio.maalcaProperties.title",
    categoryKey: "casosEstudio.maalcaProperties.category",
    challengeKey: "casosEstudio.maalcaProperties.challenge",
    solutionKey: "casosEstudio.maalcaProperties.solution",
    results: {
      properties: "casosEstudio.maalcaProperties.results.properties",
      investors: "casosEstudio.maalcaProperties.results.investors",
      roi: "casosEstudio.maalcaProperties.results.roi",
      satisfaction: "casosEstudio.maalcaProperties.results.satisfaction"
    },
    metrics: [
      { labelKey: "casosEstudio.maalcaProperties.metrics.activeProperties", value: "25+", trend: "up" },
      { labelKey: "casosEstudio.maalcaProperties.metrics.investorCountries", value: "15", trend: "up" },
      { labelKey: "casosEstudio.maalcaProperties.metrics.avgRoi", value: "18%", trend: "up" },
      { labelKey: "casosEstudio.maalcaProperties.metrics.investorSatisfaction", value: "100%", trend: "up" }
    ],
    image: "/images/projects/maalca-properties.svg",
    testimonial: {
      textKey: "casosEstudio.maalcaProperties.testimonial.text",
      authorKey: "casosEstudio.maalcaProperties.testimonial.author"
    },
    technologies: ["Property Management", "International Marketing", "ROI Analytics", "Client Relations"]
  }
];
const caseStudies = allCaseStudies.filter((c) => c.active);

export default function CasosEstudioPage() {
  const { t } = useTranslation();
  const getTrendIcon = (trend: Trend) => (trend === "up" ? "↗️" : "↙️");
  const getTrendColor = (trend: Trend) =>
    trend === "up" ? "text-green-600" : "text-blue-600";
  const verticalCount = new Set(caseStudies.map((c) => c.categoryKey)).size;
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
              {t('casosEstudio.hero.titleLine1')}
              <span className="block text-brand-primary">{t('casosEstudio.hero.titleLine2')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              {t('casosEstudio.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-text-muted">
                <span className="font-medium">{caseStudies.length}</span> {t('casosEstudio.hero.casesAnalyzed')}
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                <span className="font-medium">{verticalCount}</span> {t('casosEstudio.hero.verticals')}
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                {t('casosEstudio.hero.resultsPrefix')} <span className="font-medium">{t('casosEstudio.hero.resultsVerifiable')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Case Studies */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <div
                key={study.id}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* Content */}
                  <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {/* Header */}
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30 mb-4">
                        {t(study.categoryKey)}
                      </span>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        {t(study.titleKey)}
                      </h2>
                    </div>
                    {/* Challenge & Solution */}
                    <div className="space-y-6">
                      <div className="bg-surface rounded-xl p-6 border border-border">
                        <h3 className="text-lg font-bold text-red-600 mb-3">{t('casosEstudio.section.challenge')}</h3>
                        <p className="text-text-secondary leading-relaxed">{t(study.challengeKey)}</p>
                      </div>
                      <div className="bg-surface rounded-xl p-6 border border-border">
                        <h3 className="text-lg font-bold text-green-600 mb-3">{t('casosEstudio.section.solution')}</h3>
                        <p className="text-text-secondary leading-relaxed">{t(study.solutionKey)}</p>
                      </div>
                    </div>
                    {/* Key Metrics */}
                    <div className="bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-bold text-text-primary mb-4">{t('casosEstudio.section.metrics')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {study.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center p-4 bg-surface-elevated rounded-lg border border-border">
                            <div className={`text-2xl font-bold ${getTrendColor(metric.trend)} mb-1`}>
                              {metric.value} {getTrendIcon(metric.trend)}
                            </div>
                            <div className="text-sm text-text-muted">{t(metric.labelKey)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Technologies */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-3">{t('casosEstudio.section.technologies')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-surface-elevated text-text-secondary px-2 py-1 rounded-md border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Testimonial */}
                    <div className="bg-brand-primary/5 rounded-xl p-6 border border-brand-primary/20">
                      <blockquote className="text-text-primary italic mb-3">
                        {`"${t(study.testimonial.textKey)}"`}
                      </blockquote>
                      <cite className="text-sm text-brand-primary font-medium">
                        — {t(study.testimonial.authorKey)}
                      </cite>
                    </div>
                  </div>
                  {/* Visual */}
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="aspect-square overflow-hidden rounded-2xl border border-border shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <ProjectImage
                        src={study.image}
                        alt={t(study.titleKey)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Results Summary */}
                    <div className="mt-6 bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-bold text-text-primary mb-4">{t('casosEstudio.section.results')}</h3>
                      <div className="space-y-2">
                        {Object.entries(study.results).map(([key, valueKey]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-text-secondary text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-text-primary font-medium">{t(valueKey)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('casosEstudio.cta.heading')}
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              {t('casosEstudio.cta.paragraph')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
                onClick={() => window.location.href = '/contacto'}
              >
                {t('casosEstudio.cta.startProject')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
                onClick={() => window.location.href = '/servicios'}
              >
                {t('casosEstudio.cta.ourServices')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
