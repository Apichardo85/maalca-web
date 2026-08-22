"use client";
import { useTranslation } from "@/hooks/useSimpleLanguage";

interface DocModule {
  key: string;
  image: string;
}

const MODULES: DocModule[] = [
  { key: "page", image: "/demos/caso-tld.webp" },
  { key: "kiosk", image: "/demos/kiosko.webp" },
  { key: "board", image: "/demos/pantalla.webp" },
  { key: "agenda", image: "/demos/agenda.webp" },
  { key: "ponche", image: "/demos/ponche.webp" },
];

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full bg-brand-primary/10 text-brand-primary mb-6">
            {t('docs.eyebrow')}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
            {t('docs.title')}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            {t('docs.description')}
          </p>
        </div>

        {/* Cada tarjeta es una captura real de Pegote Barbershop o The Little Dominican —
            negocios que ya operan con MaalCa — no mockups de diseño. */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MODULES.map((mod) => (
            <div
              key={mod.key}
              className="group overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-all duration-300 hover:border-brand-primary hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mod.image}
                  alt={t(`docs.module.${mod.key}.title`)}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-text-primary mb-1.5">
                  {t(`docs.module.${mod.key}.title`)}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t(`docs.module.${mod.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="/contacto"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            {t('docs.cta')}
          </a>
        </div>
      </div>
    </main>
  );
}
