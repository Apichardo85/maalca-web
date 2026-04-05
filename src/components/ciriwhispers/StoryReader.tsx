"use client";

import type { Story } from "@/data/ciriwhispers/stories";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import SocialShare from "@/components/ui/SocialShare";

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

export default function StoryReader({ story, onClose }: StoryReaderProps) {
  const { t } = useTranslation();

  const title = t(`ciriwhispers.story.${story.id}.title`);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
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
          <span className="text-xs text-red-400 uppercase tracking-widest font-medium">
            {t(`ciriwhispers.storyType.${story.type}`)}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mt-2 mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{story.readTime} {t("ciriwhispers.storyReader.minRead")}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>CiriWhispers</span>
          </div>
        </div>

        {/* Story content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:font-serif
            prose-blockquote:border-red-800/50 prose-blockquote:text-slate-400 prose-blockquote:italic prose-blockquote:font-serif
            prose-strong:text-stone-100
            animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
          dangerouslySetInnerHTML={{ __html: story.content }}
        />

        {/* Footer: share + CTA */}
        <div
          className="mt-16 pt-8 border-t border-slate-800 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="text-center mb-8">
            <p className="font-serif italic text-slate-400 text-lg mb-4">
              {story.series
                ? t("ciriwhispers.storyReader.seriesTeaser")
                : t("ciriwhispers.storyReader.moreTeaser")}
            </p>
            <a
              href="/ciriwhispers/biblioteca"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
