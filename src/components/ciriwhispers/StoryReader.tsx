"use client";

import type { Story } from "@/data/ciriwhispers/stories";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import SocialShare from "@/components/ui/SocialShare";

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

export default function StoryReader({ story, onClose }: StoryReaderProps) {
  const { t, language } = useTranslation();

  const title = t(`ciriwhispers.story.${story.id}.title`);

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2]/98 overflow-y-auto animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-[#F5F0E8] rounded-full flex items-center justify-center text-[#5C3D2E] hover:text-[#8B1A1A] transition-colors shadow-sm border border-[#E8DED1]"
        aria-label={t("ciriwhispers.storyReader.close")}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="text-xs text-[#8B1A1A] uppercase tracking-widest font-medium">
            {t(`ciriwhispers.storyType.${story.type}`)}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D1B11] mt-2 mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#8B7355]">
            <span>{story.readTime} {t("ciriwhispers.storyReader.minRead")}</span>
            <span className="w-1 h-1 rounded-full bg-[#E8DED1]" />
            <span>CiriWhispers</span>
          </div>
        </div>

        {/* Story content */}
        <div
          className="prose prose-lg max-w-none
            prose-p:text-[#3D2B1F] prose-p:leading-relaxed prose-p:font-serif
            prose-blockquote:border-[#8B1A1A]/30 prose-blockquote:text-[#5C3D2E] prose-blockquote:italic prose-blockquote:font-serif
            prose-strong:text-[#2D1B11]
            animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
          dangerouslySetInnerHTML={{ __html: story.content[language] }}
        />

        {/* Footer: share + CTA */}
        <div
          className="mt-16 pt-8 border-t border-[#E8DED1] animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="text-center mb-8">
            <p className="font-serif italic text-[#8B7355] text-lg mb-4">
              {story.series
                ? t("ciriwhispers.storyReader.seriesTeaser")
                : t("ciriwhispers.storyReader.moreTeaser")}
            </p>
            <a
              href="/ciriwhispers/biblioteca"
              className="inline-block px-6 py-3 bg-[#8B1A1A] hover:bg-[#6B1414] text-white rounded-lg font-medium transition-colors"
            >
              {t("ciriwhispers.storyReader.keepReading")}
            </a>
          </div>

          <SocialShare
            title={`${title} — CiriWhispers`}
            description={t(`ciriwhispers.story.${story.id}.excerpt`)}
            platforms={["twitter", "whatsapp", "copy"]}
            variant="minimal"
            project="ciriwhispers"
          />
        </div>
      </div>
    </div>
  );
}
