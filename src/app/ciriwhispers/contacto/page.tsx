"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function ContactoCiriWhispersPage() {
  const { t } = useTranslation();

  const collabs = [
    { title: t("ciriwhispers.contacto2.collab1.title"), desc: t("ciriwhispers.contacto2.collab1.desc") },
    { title: t("ciriwhispers.contacto2.collab2.title"), desc: t("ciriwhispers.contacto2.collab2.desc") },
    { title: t("ciriwhispers.contacto2.collab3.title"), desc: t("ciriwhispers.contacto2.collab3.desc") },
    { title: t("ciriwhispers.contacto2.collab4.title"), desc: t("ciriwhispers.contacto2.collab4.desc") },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8B1A1A] text-sm font-semibold tracking-widest uppercase mb-4">
            {t("ciriwhispers.contacto2.label")}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-[#2D1B11] mb-4">
            {t("ciriwhispers.contacto2.title")}
          </h1>
          <p className="text-[#8B7355] max-w-lg mx-auto">
            {t("ciriwhispers.contacto2.desc")}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="border border-[#E8DED1] rounded-xl p-6 bg-white hover:border-[#8B1A1A]/30 transition-colors">
            <div className="text-2xl mb-3">&#9993;</div>
            <h3 className="font-serif text-lg text-[#2D1B11] mb-1">{t("ciriwhispers.contacto2.email.title")}</h3>
            <p className="text-[#8B7355] text-sm mb-3">{t("ciriwhispers.contacto2.email.desc")}</p>
            <a href="mailto:ciriwhispers@maalca.com" className="text-[#8B1A1A] hover:text-[#6B1414] text-sm font-medium transition-colors">
              ciriwhispers@maalca.com
            </a>
          </div>

          <div className="border border-[#E8DED1] rounded-xl p-6 bg-white hover:border-[#8B1A1A]/30 transition-colors">
            <div className="text-2xl mb-3">&#128247;</div>
            <h3 className="font-serif text-lg text-[#2D1B11] mb-1">{t("ciriwhispers.contacto2.instagram.title")}</h3>
            <p className="text-[#8B7355] text-sm mb-3">{t("ciriwhispers.contacto2.instagram.desc")}</p>
            <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="text-[#8B1A1A] hover:text-[#6B1414] text-sm font-medium transition-colors">
              @ciriwhispers
            </a>
          </div>

          <div className="border border-[#E8DED1] rounded-xl p-6 bg-white hover:border-[#8B1A1A]/30 transition-colors">
            <div className="text-2xl mb-3">&#128218;</div>
            <h3 className="font-serif text-lg text-[#2D1B11] mb-1">{t("ciriwhispers.contacto2.amazon.title")}</h3>
            <p className="text-[#8B7355] text-sm mb-3">{t("ciriwhispers.contacto2.amazon.desc")}</p>
            <a href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ" target="_blank" rel="noopener noreferrer" className="text-[#8B1A1A] hover:text-[#6B1414] text-sm font-medium transition-colors">
              {t("ciriwhispers.contacto2.amazon.link")}
            </a>
          </div>

          <div className="border border-[#E8DED1] rounded-xl p-6 bg-white hover:border-[#8B1A1A]/30 transition-colors">
            <div className="text-2xl mb-3">&#127908;</div>
            <h3 className="font-serif text-lg text-[#2D1B11] mb-1">{t("ciriwhispers.contacto2.podcast.title")}</h3>
            <p className="text-[#8B7355] text-sm mb-3">{t("ciriwhispers.contacto2.podcast.desc")}</p>
            <Link href="/hablando-mierda" className="text-[#8B1A1A] hover:text-[#6B1414] text-sm font-medium transition-colors">
              Hablando Mierda &rarr;
            </Link>
          </div>
        </div>

        {/* Collaboration types */}
        <div className="border border-[#E8DED1] rounded-xl p-8 mb-12 bg-white">
          <h2 className="font-serif text-xl text-[#2D1B11] mb-6">
            {t("ciriwhispers.contacto2.collab.title")}
          </h2>
          <div className="space-y-4">
            {collabs.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B1A1A] mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-[#2D1B11] font-semibold text-sm">{item.title}</h3>
                  <p className="text-[#8B7355] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to main contact */}
        <div className="text-center">
          <p className="text-[#A89580] text-sm mb-4">
            {t("ciriwhispers.contacto2.maalca")}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E8DED1] hover:border-[#8B1A1A]/40 text-[#5C3D2E] hover:text-[#8B1A1A] rounded-full text-sm font-semibold transition-colors"
          >
            {t("ciriwhispers.contacto2.maalcaLink")} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
