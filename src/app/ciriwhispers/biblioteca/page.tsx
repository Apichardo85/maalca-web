"use client";

import { useState } from "react";
import { stories, storyTypes, getStoriesByType, type StoryType } from "@/data/ciriwhispers/stories";
import StoryCard from "@/components/ciriwhispers/StoryCard";
import StoryReader from "@/components/ciriwhispers/StoryReader";
import type { Story } from "@/data/ciriwhispers/stories";

export default function BibliotecaPage() {
  const [activeFilter, setActiveFilter] = useState<StoryType | undefined>(undefined);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const filteredStories = getStoriesByType(activeFilter);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-4">
            Biblioteca
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Historias cortas, poemas, fragmentos y cartas. Todo gratis. Todo real.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => setActiveFilter(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeFilter
                ? "bg-red-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50"
            }`}
          >
            Todos ({stories.length})
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
                    ? "bg-red-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                }`}
              >
                {type.label} ({count})
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
            <p className="text-slate-500 text-lg font-serif italic">
              Aun no hay historias de este tipo. Pero las hay en el tintero.
            </p>
          </div>
        )}

        {/* Coming soon teaser */}
        <div className="mt-16 text-center border-t border-slate-800 pt-12">
          <p className="font-serif italic text-slate-500 text-lg mb-2">
            Nuevas historias cada semana.
          </p>
          <p className="text-slate-600 text-sm">
            Suscribete abajo para recibirlas antes que nadie.
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
