"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function ManifiestoPage() {
  const { t } = useTranslation();

  const values = [
    { title: t("ciriwhispers.manifiesto.value1.title"), desc: t("ciriwhispers.manifiesto.value1.desc") },
    { title: t("ciriwhispers.manifiesto.value2.title"), desc: t("ciriwhispers.manifiesto.value2.desc") },
    { title: t("ciriwhispers.manifiesto.value3.title"), desc: t("ciriwhispers.manifiesto.value3.desc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero quote */}
      <section className="relative py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0E8] via-[#FAF7F2] to-[#FAF7F2]" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#8B1A1A] text-sm font-semibold tracking-widest uppercase mb-8">
            {t("ciriwhispers.manifiesto.label")}
          </p>
          <blockquote className="font-serif text-3xl md:text-5xl text-[#2D1B11] leading-tight italic mb-8">
            &ldquo;{t("ciriwhispers.manifiesto.quote")}&rdquo;
          </blockquote>
          <div className="w-16 h-0.5 bg-[#8B1A1A] mx-auto" />
        </div>
      </section>

      {/* About */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Author intro */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#6B1414] flex-shrink-0 flex items-center justify-center">
              <span className="font-serif text-5xl text-white italic">C</span>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#2D1B11] mb-1">
                {t("ciriwhispers.manifiesto.name")}
              </h2>
              <p className="text-[#8B1A1A] text-sm font-medium mb-4">
                {t("ciriwhispers.manifiesto.role")}
              </p>
              <p className="text-[#5C3D2E] leading-relaxed">
                {t("ciriwhispers.manifiesto.intro")}
              </p>
            </div>
          </div>

          {/* Manifesto body */}
          <div className="space-y-6 text-[#5C3D2E] leading-relaxed">
            <p>{t("ciriwhispers.manifiesto.p1")}</p>
            <p>{t("ciriwhispers.manifiesto.p2")}</p>

            <div className="border-l-2 border-[#8B1A1A] pl-6 py-2">
              <p className="font-serif text-xl text-[#2D1B11] italic">
                {t("ciriwhispers.manifiesto.pullquote")}
              </p>
            </div>

            <p>{t("ciriwhispers.manifiesto.p3")}</p>
            <p>{t("ciriwhispers.manifiesto.p4")}</p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {values.map((item) => (
              <div key={item.title} className="border border-[#E8DED1] rounded-xl p-5 bg-white">
                <h3 className="font-serif text-lg text-[#8B1A1A] mb-2">{item.title}</h3>
                <p className="text-[#8B7355] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-8">
            <a
              href="https://www.instagram.com/ciriwhispers/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1A1A] hover:bg-[#6B1414] text-white rounded-full text-sm font-semibold transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#E8DED1] hover:border-[#8B1A1A]/40 text-[#5C3D2E] hover:text-[#8B1A1A] rounded-full text-sm font-semibold transition-colors"
            >
              Amazon
            </a>
            <Link
              href="/ciriwhispers/biblioteca"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#E8DED1] hover:border-[#8B1A1A]/40 text-[#5C3D2E] hover:text-[#8B1A1A] rounded-full text-sm font-semibold transition-colors"
            >
              {t("ciriwhispers.manifiesto.cta.read")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
