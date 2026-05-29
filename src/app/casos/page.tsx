"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";

const cases = [
  {
    id: "pegote-barbershop",
    nameKey: "cases.pegote.title",
    locationKey: "cases.pegote.location",
    logo: "/images/affiliates/pegote-logo.png",
    fallback: "PB",
    statusKey: "cases.pegote.status",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    descKey: "cases.pegote.desc",
    moduleKeys: ["cases.pegote.module1", "cases.pegote.module2", "cases.pegote.module3"],
    moduleStatusKey: "cases.pegote.moduleStatus",
    href: "/pegote-barber",
  },
  {
    id: "the-little-dominican",
    nameKey: "cases.tld.title",
    locationKey: "cases.tld.location",
    logo: "/images/affiliates/tld/Logo.png",
    fallback: "TLD",
    statusKey: "cases.tld.status",
    statusColor: "text-amber-600 bg-amber-50 border-amber-200",
    descKey: "cases.tld.desc",
    moduleKeys: ["cases.tld.module1", "cases.tld.module2", "cases.tld.module3"],
    moduleStatusKey: "cases.tld.moduleStatus",
    href: "/the-little-dominicana",
  },
];

function CaseLogo({ logo, fallback }: { logo: string; fallback: string }) {
  return (
    <img
      src={logo}
      alt={fallback}
      className="max-h-14 max-w-full object-contain"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        el.parentElement!.querySelector(".fallback-initials")?.classList.remove("hidden");
      }}
    />
  );
}

export default function CasosPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4">
              {t('casos.subtitle')}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('casos.title')}
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {t('cases.hero.text')}
            </p>
          </div>
        </div>
      </section>

      {/* Cases grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {cases.map((c, index) => (
              <div
                key={c.id}
                className="bg-surface-elevated rounded-2xl border border-border overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Logo area */}
                <div className="h-32 bg-surface flex items-center justify-center px-8 border-b border-border">
                  <div className="relative flex items-center justify-center">
                    <CaseLogo logo={c.logo} fallback={c.fallback} />
                    <span className="fallback-initials hidden font-bold text-2xl text-text-primary">
                      {c.fallback}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{t(c.nameKey)}</h2>
                      <p className="text-sm text-text-muted mt-0.5">{t(c.locationKey)}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.statusColor}`}>
                      {t(c.statusKey)}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {t(c.descKey)}
                  </p>

                  {/* Modules */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                      {t('cases.modules.label')} — {t(c.moduleStatusKey)}
                    </p>
                    <ul className="space-y-2">
                      {c.moduleKeys.map((key) => (
                        <li key={key} className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={c.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    {t('cases.cta.profile')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {t('casos.coming')}
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            {t('casos.coming.desc')}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white"
            onClick={() => router.push('/servicios')}
          >
            {t('cases.cta.start')}
          </Button>
        </div>
      </section>
    </main>
  );
}
