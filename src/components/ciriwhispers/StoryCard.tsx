"use client";

import type { Story } from "@/data/ciriwhispers/stories";
import { useTranslation } from "@/hooks/useSimpleLanguage";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const typeStyles: Record<string, { border: string; badge: string }> = {
  microcuento: { border: "border-red-800/30", badge: "bg-red-900/30 text-red-400" },
  fragmento: { border: "border-amber-800/30", badge: "bg-amber-900/30 text-amber-400" },
  poema: { border: "border-blue-800/30", badge: "bg-blue-900/30 text-blue-400" },
  carta: { border: "border-emerald-800/30", badge: "bg-emerald-900/30 text-emerald-400" },
  capitulo: { border: "border-purple-800/30", badge: "bg-purple-900/30 text-purple-400" },
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const { t } = useTranslation();
  const style = typeStyles[story.type] || typeStyles.microcuento;

  const title = t(`ciriwhispers.story.${story.id}.title`);
  const excerpt = t(`ciriwhispers.story.${story.id}.excerpt`);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl p-6 border ${style.border} hover:border-red-600/40 transition-all duration-300 group cursor-pointer`}
    >
      {/* Type badge + read time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
          {t(`ciriwhispers.storyType.${story.type}`)}
        </span>
        <span className="text-xs text-slate-500">
          {story.readTime} {t("ciriwhispers.biblioteca.min")}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-bold text-stone-100 mb-2 group-hover:text-red-400 transition-colors">
        {title}
      </h3>

      {/* Excerpt */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
        {excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {story.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-slate-500 border border-slate-700/50 rounded-full px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
