"use client";

import type { Story } from "@/data/ciriwhispers/stories";
import { useTranslation } from "@/hooks/useSimpleLanguage";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const typeAccents: Record<string, string> = {
  microcuento: "#8B1A1A",
  fragmento: "#92400E",
  poema: "#1E40AF",
  carta: "#065F46",
  capitulo: "#6B21A8",
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const { t } = useTranslation();
  const accent = typeAccents[story.type] || typeAccents.microcuento;

  const title = t(`ciriwhispers.story.${story.id}.title`);
  const excerpt = t(`ciriwhispers.story.${story.id}.excerpt`);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-6 transition-all duration-300 group cursor-pointer shadow-sm"
      style={{
        backgroundColor: 'var(--ciri-surface)',
        border: '1px solid var(--ciri-border)',
      }}
    >
      {/* Type badge + read time */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          {t(`ciriwhispers.storyType.${story.type}`)}
        </span>
        <span className="text-xs" style={{ color: 'var(--ciri-text-faint)' }}>
          {story.readTime} {t("ciriwhispers.biblioteca.min")}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-[#8B1A1A] transition-colors"
        style={{ color: 'var(--ciri-text)' }}>
        {title}
      </h3>

      {/* Excerpt */}
      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--ciri-text-secondary)' }}>
        {excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {story.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] rounded-full px-2 py-0.5"
            style={{ color: 'var(--ciri-text-faint)', border: '1px solid var(--ciri-border)' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
