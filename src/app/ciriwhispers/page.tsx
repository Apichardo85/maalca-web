"use client";

import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CiriWhispersLanding() {
  const { trackEvent } = useAnalytics("ciriwhispers");
  const { t } = useTranslation();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      {/* Background: subtle animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20" />

      {/* Floating elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl text-red-700/40 animate-pulse">&bull;</div>
        <div className="absolute top-40 right-20 text-3xl text-stone-200/40 animate-pulse" style={{ animationDelay: "1s" }}>&bull;</div>
        <div className="absolute bottom-20 left-20 text-4xl text-red-800/40 animate-pulse" style={{ animationDelay: "2s" }}>&bull;</div>
        <div className="absolute top-1/3 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-red-800/20 to-transparent" />
        <div className="absolute top-1/2 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-stone-200/20 to-transparent rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-28 h-px bg-gradient-to-r from-transparent via-red-700/20 to-transparent -rotate-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 animate-fade-in">
          <div className="w-full h-full relative overflow-hidden rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 border border-red-800/30 shadow-2xl">
            <img src="/images/projects/ciriwhispers.png" alt="CiriWhispers" className="w-full h-full object-contain rounded-full" />
          </div>
        </div>

        {/* Hook phrase */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
          <span className="bg-gradient-to-r from-red-800 via-red-500 to-red-800 bg-clip-text text-transparent">
            {t("ciriwhispers.landing.hook")}
          </span>
          <br />
          <span className="text-stone-200 text-2xl sm:text-3xl md:text-4xl font-light italic">
            {t("ciriwhispers.landing.subhook")}
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {t("ciriwhispers.landing.desc")}
        </p>

        {/* 3 CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/ciriwhispers/biblioteca"
            onClick={() => trackEvent("cta_click", "landing", "biblioteca")}
            className="px-8 py-4 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100 font-semibold rounded-lg border border-red-700/30 shadow-lg hover:shadow-red-900/20 transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.read")}
          </Link>

          <Link
            href="/ciriwhispers/obras"
            onClick={() => trackEvent("cta_click", "landing", "obras")}
            className="px-8 py-4 border border-red-600/50 text-red-400 hover:bg-red-600/10 rounded-lg font-medium transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.obras")}
          </Link>

          <Link
            href="/hablando-mierda"
            onClick={() => trackEvent("cta_click", "landing", "podcast")}
            className="px-8 py-4 border border-slate-600/50 text-slate-400 hover:bg-slate-600/10 rounded-lg font-medium transition-all text-center"
          >
            {t("ciriwhispers.landing.cta.podcast")}
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 animate-bounce" style={{ animationDelay: "1s" }}>
          <div className="w-0.5 h-10 mx-auto bg-gradient-to-b from-transparent via-red-600/50 to-transparent rounded-full" />
        </div>
      </div>
    </section>
  );
}
