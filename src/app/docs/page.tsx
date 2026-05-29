"use client";
import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-24 bg-background">
      <div className="max-w-2xl text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full bg-brand-primary/10 text-brand-primary mb-6">
          {t('docs.eyebrow')}
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
          {t('docs.title')}
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
          {t('docs.description')}
        </p>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
        >
          {t('docs.cta')}
        </Link>
      </div>
    </main>
  );
}
