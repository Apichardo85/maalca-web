"use client";

import type { Story } from "@/data/ciriwhispers/stories";
import { useTranslation } from "@/hooks/useSimpleLanguage";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const typeStyles: Record<string, { border: string; badge: string }> = {
  microcuento: { border: "border-[#8B1A1A]/20", badge: "bg-[#8B1A1A]/10 text-[#8B1A1A]" },
  fragmento: { border: "border-amber-700/20", badge: "bg-amber-50 text-amber-800" },
  poema: { border: "border-blue-700/20", badge: "bg-blue-50 text-blue-800" },
  carta: { border: "border-emerald-700/20", badge: "bg-emerald-50 text-emerald-800" },
  capitulo: { border: "border-purple-700/20", badge: "bg-purple-50 text-purple-800" },
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const { t } = useTranslation();
  const style = typeStyles[story.type] || typeStyles.microcuento;

  const title = t(`ciriwhispers.story.${story.id}.title`);
  const excerpt = t(`ciriwhispers.story.${story.id}.excerpt`);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white hover:bg-[#FFFDF9] rounded-2xl p-6 border ${style.border} hover:border-[#8B1A1A]/40 transition-all duration-300 group cursor-pointer shadow-sm`}
    >
      {/* Type badge + read time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
          {t(`ciriwhispers.storyType.${story.type}`)}
        </span>
        <span className="text-xs text-[#A89580]">
          {story.readTime} {t("ciriwhispers.biblioteca.min")}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold text-[#2D1B11] mb-2 group-hover:text-[#8B1A1A] transition-colors">
        {title}
      </h3>

      {/* Excerpt */}
      <p className="text-[#5C3D2E] text-sm leading-relaxed line-clamp-3">
        {excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {story.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-[#A89580] border border-[#E8DED1] rounded-full px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
