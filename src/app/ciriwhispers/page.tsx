"use client";

import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CiriWhispersLanding() {
  const { trackEvent } = useAnalytics("ciriwhispers");
  const { t } = useTranslation();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      {/* Background: warm subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] via-[#F5F0E8] to-[#FAF7F2]" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-[#8B1A1A]/30 to-transparent" />
        <div className="absolute top-1/2 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-[#8B1A1A]/20 to-transparent rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-28 h-px bg-gradient-to-r from-transparent via-[#8B1A1A]/20 to-transparent -rotate-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="w-36 h-36 mx-auto mb-8 animate-fade-in">
          <img src="/images/projects/ciriwhispers.png" alt="CiriWhispers" className="w-full h-full object-contain" />
        </div>

        {/* Hook phrase */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
          <span className="text-[#8B1A1A]">
            {t("ciriwhispers.landing.hook")}
          </span>
          <br />
          <span className="text-[#5C3D2E] text-2xl sm:text-3xl md:text-4xl font-light italic">
            {t("ciriwhispers.landing.subhook")}
          </span>
        </h1>

        <p className="text-[#8B7355] text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {t("ciriwhispers.landing.desc")}
        </p>

        {/* 3 CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/ciriwhispers/biblioteca"
            onClick={() => trackEvent("cta_click", "landing", "biblioteca")}
            className="px-8 py-4 bg-[#8B1A1A] hover:bg-[#6B1414] text-white font-semibold rounded-lg shadow-lg transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.read")}
          </Link>

          <Link
            href="/ciriwhispers/obras"
            onClick={() => trackEvent("cta_click", "landing", "obras")}
            className="px-8 py-4 border border-[#8B1A1A]/40 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 rounded-lg font-medium transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.obras")}
          </Link>

          <Link
            href="/hablando-mierda"
            onClick={() => trackEvent("cta_click", "landing", "podcast")}
            className="px-8 py-4 border border-[#E8DED1] text-[#8B7355] hover:border-[#8B1A1A]/30 hover:text-[#8B1A1A] rounded-lg font-medium transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.podcast")}
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 animate-bounce" style={{ animationDelay: "1s" }}>
          <div className="w-0.5 h-10 mx-auto bg-gradient-to-b from-transparent via-[#8B1A1A]/30 to-transparent rounded-full" />
        </div>
      </div>
    </section>
  );
}
