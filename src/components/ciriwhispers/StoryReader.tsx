"use client";
import { useEffect } from "react";
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
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in"
      style={{ backgroundColor: 'var(--ciri-bg)' }}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
        style={{
          backgroundColor: 'var(--ciri-surface)',
          border: '1px solid var(--ciri-border)',
          color: 'var(--ciri-text-secondary)',
        }}
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
          <span className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--ciri-brand)' }}>
            {t(`ciriwhispers.storyType.${story.type}`)}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-4" style={{ color: 'var(--ciri-text)' }}>
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--ciri-text-muted)' }}>
            <span>{story.readTime} {t("ciriwhispers.storyReader.minRead")}</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--ciri-border)' }} />
            <span>CiriWhispers</span>
          </div>
        </div>
        {/* Story content */}
        <div
          className="prose prose-lg max-w-none
            prose-p:leading-relaxed prose-p:font-serif
            prose-blockquote:italic prose-blockquote:font-serif
            animate-fade-in-up"
          style={{
            animationDelay: "0.2s",
            '--tw-prose-body': 'var(--ciri-text-secondary)',
            '--tw-prose-headings': 'var(--ciri-text)',
            '--tw-prose-quotes': 'var(--ciri-text-muted)',
            '--tw-prose-quote-borders': 'var(--ciri-brand)',
            '--tw-prose-bold': 'var(--ciri-text)',
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: story.content[language] }}
        />
        {/* Footer: share + CTA */}
        <div
          className="mt-16 pt-8 animate-fade-in-up"
          style={{ borderTop: '1px solid var(--ciri-border)', animationDelay: "0.4s" }}
        >
          <div className="text-center mb-8">
            <p className="font-serif italic text-lg mb-4" style={{ color: 'var(--ciri-text-muted)' }}>
              {story.series
                ? t("ciriwhispers.storyReader.seriesTeaser")
                : t("ciriwhispers.storyReader.moreTeaser")}
            </p>
            <a
              href="/ciriwhispers/biblioteca"
              className="inline-block px-6 py-3 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--ciri-brand)' }}
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
