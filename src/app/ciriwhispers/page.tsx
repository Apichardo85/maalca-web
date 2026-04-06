"use client";

import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CiriWhispersLanding() {
  const { trackEvent } = useAnalytics("ciriwhispers");
  const { t } = useTranslation();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--ciri-bg), var(--ciri-bg-subtle), var(--ciri-bg))' }} />

      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-32 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--ciri-brand), transparent)', opacity: 0.3 }} />
        <div className="absolute top-1/2 right-1/4 w-24 h-px rotate-45" style={{ background: 'linear-gradient(to right, transparent, var(--ciri-brand), transparent)', opacity: 0.2 }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="w-36 h-36 mx-auto mb-8 animate-fade-in">
          <img
            src="/images/projects/ciriwhispers.png"
            alt="CiriWhispers"
            className="w-full h-full object-contain"
            style={{ filter: 'var(--ciri-logo-filter)' }}
          />
        </div>

        {/* Hook phrase */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
          <span style={{ color: 'var(--ciri-brand)' }}>
            {t("ciriwhispers.landing.hook")}
          </span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl font-light italic" style={{ color: 'var(--ciri-text-secondary)' }}>
            {t("ciriwhispers.landing.subhook")}
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ color: 'var(--ciri-text-muted)', animationDelay: '0.3s' }}>
          {t("ciriwhispers.landing.desc")}
        </p>

        {/* 3 CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/ciriwhispers/biblioteca"
            onClick={() => trackEvent("cta_click", "landing", "biblioteca")}
            className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg transition-all text-center"
            style={{ backgroundColor: 'var(--ciri-brand)' }}
          >
            {t("ciriwhispers.landing.cta.read")}
          </Link>

          <Link
            href="/ciriwhispers/obras"
            onClick={() => trackEvent("cta_click", "landing", "obras")}
            className="px-8 py-4 rounded-lg font-medium transition-all text-center"
            style={{ border: '1px solid color-mix(in srgb, var(--ciri-brand) 40%, transparent)', color: 'var(--ciri-brand)' }}
          >
            {t("ciriwhispers.landing.cta.obras")}
          </Link>

          <Link
            href="/hablando-mierda"
            onClick={() => trackEvent("cta_click", "landing", "podcast")}
            className="px-8 py-4 rounded-lg font-medium transition-all text-center"
            style={{ border: '1px solid var(--ciri-border)', color: 'var(--ciri-text-muted)' }}
          >
            {t("ciriwhispers.landing.cta.podcast")}
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 animate-bounce" style={{ animationDelay: "1s" }}>
          <div className="w-0.5 h-10 mx-auto rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, var(--ciri-brand), transparent)', opacity: 0.3 }} />
        </div>
      </div>
    </section>
  );
}
