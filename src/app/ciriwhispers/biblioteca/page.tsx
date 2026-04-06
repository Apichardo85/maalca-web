"use client";

import { useState } from "react";
import { stories, storyTypes, getStoriesByType, type StoryType } from "@/data/ciriwhispers/stories";
import StoryCard from "@/components/ciriwhispers/StoryCard";
import StoryReader from "@/components/ciriwhispers/StoryReader";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import type { Story } from "@/data/ciriwhispers/stories";

export default function BibliotecaPage() {
  const [activeFilter, setActiveFilter] = useState<StoryType | undefined>(undefined);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { t } = useTranslation();

  const filteredStories = getStoriesByType(activeFilter);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D1B11] mb-4">
            {t("ciriwhispers.biblioteca.title")}
          </h1>
          <p className="text-[#8B7355] text-lg max-w-xl mx-auto">
            {t("ciriwhispers.biblioteca.desc")}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setActiveFilter(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeFilter
                ? "bg-[#8B1A1A] text-white"
                : "bg-white text-[#8B7355] hover:text-[#2D1B11] border border-[#E8DED1]"
            }`}
          >
            {t("ciriwhispers.biblioteca.all")} ({stories.length})
          </button>
          {storyTypes.map((type) => {
            const count = stories.filter((s) => s.type === type.key).length;
            if (count === 0) return null;
            return (
              <button
                key={type.key}
                onClick={() => setActiveFilter(type.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === type.key
                    ? "bg-[#8B1A1A] text-white"
                    : "bg-white text-[#8B7355] hover:text-[#2D1B11] border border-[#E8DED1]"
                }`}
              >
                {t(`ciriwhispers.storyType.${type.key}s`)} ({count})
              </button>
            );
          })}
        </div>

        {/* Stories grid */}
        <div className="space-y-4">
          {filteredStories.map((story, index) => (
            <div
              key={story.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <StoryCard
                story={story}
                onClick={() => setSelectedStory(story)}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredStories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#A89580] text-lg font-serif italic">
              {t("ciriwhispers.biblioteca.empty")}
            </p>
          </div>
        )}

        {/* Coming soon teaser */}
        <div className="mt-16 text-center border-t border-[#E8DED1] pt-12">
          <p className="font-serif italic text-[#8B7355] text-lg mb-2">
            {t("ciriwhispers.biblioteca.comingSoon")}
          </p>
          <p className="text-[#A89580] text-sm">
            {t("ciriwhispers.biblioteca.comingSoonSub")}
          </p>
        </div>
      </div>

      {/* Story Reader Modal */}
      {selectedStory && (
        <StoryReader
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}
