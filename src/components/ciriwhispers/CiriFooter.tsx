"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

export default function CiriFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#2D1B11] text-[#E8DED1]">
      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl font-bold text-white mb-2">
            {t("ciriwhispers.footer.newsletter.title")}
          </h3>
          <p className="text-[#A89580] text-sm">
            {t("ciriwhispers.footer.newsletter.desc")}
          </p>
        </div>
        <NewsletterSignup source="ciriwhispers" className="max-w-md mx-auto" />
      </div>

      {/* Links + Credits */}
      <div className="border-t border-[#5C3D2E]/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-serif text-lg font-bold text-[#8B1A1A] mb-3">{t("ciriwhispers.footer.nav")}</h4>
              <div className="space-y-2">
                <Link href="/ciriwhispers/biblioteca" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  {t("ciriwhispers.footer.biblioteca")}
                </Link>
                <Link href="/ciriwhispers/obras" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  {t("ciriwhispers.footer.obras")}
                </Link>
                <Link href="/hablando-mierda" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  {t("ciriwhispers.footer.podcast")}
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#8B1A1A] mb-3">{t("ciriwhispers.footer.connect")}</h4>
              <div className="space-y-2">
                <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  Instagram
                </a>
                <a href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ" target="_blank" rel="noopener noreferrer" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  Amazon
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#8B1A1A] mb-3">{t("ciriwhispers.footer.ecosystem")}</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  MaalCa
                </Link>
                <Link href="/editorial" className="block text-[#A89580] hover:text-white transition-colors text-sm">
                  {t("ciriwhispers.footer.editorial")}
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-[#5C3D2E]/30">
            <p className="font-serif italic text-[#8B7355] text-sm">
              &ldquo;{t("ciriwhispers.footer.quote")}&rdquo;
            </p>
            <p className="text-[#5C3D2E] text-xs mt-2">
              &copy; {new Date().getFullYear()} CiriWhispers &mdash; Editorial MaalCa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
