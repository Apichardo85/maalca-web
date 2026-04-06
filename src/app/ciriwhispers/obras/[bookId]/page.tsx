"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookById } from "@/data/ciriwhispers/books";
import { stories } from "@/data/ciriwhispers/stories";
import { amarantaContent, lucesSombrasContent } from "@/data/bookContent";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { useAnalytics } from "@/hooks/useAnalytics";
import SocialShare from "@/components/ui/SocialShare";
import SensitiveNotice from "@/components/ui/SensitiveNotice";
import ProfessionalReader from "@/components/ui/ProfessionalReader";
import DigitalReader from "@/components/ui/DigitalReader";
import StoryCard from "@/components/ciriwhispers/StoryCard";
import StoryReader from "@/components/ciriwhispers/StoryReader";
import type { Story } from "@/data/ciriwhispers/stories";

function getBookContent(bookId: string): string {
  switch (bookId) {
    case "amaranta":
      return amarantaContent;
    case "luz-sombras":
      return lucesSombrasContent;
    default:
      return "<p>Content not available / Contenido no disponible</p>";
  }
}

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = getBookById(bookId);
  const { t } = useTranslation();
  const { trackBookInteraction } = useAnalytics("ciriwhispers");

  const [readerOpen, setReaderOpen] = useState(false);
  const [readerMode, setReaderMode] = useState<"epub" | "html">("html");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#2D1B11] mb-4">404</h1>
        <Link href="/ciriwhispers/obras" className="text-[#8B1A1A] hover:text-[#6B1414]">
          &larr; {t("ciriwhispers.obras2.backToObras")}
        </Link>
      </div>
    );
  }

  const isAvailable = book.statusKey === "ciriwhispers.works.status.available";
  const relatedStories = stories.filter((s) => s.series === bookId).slice(0, 3);

  const openReader = () => {
    setReaderMode(book.hasEpub && book.epubUrl ? "epub" : "html");
    setReaderOpen(true);
    trackBookInteraction(book.id, "reader_open");
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <Link href="/ciriwhispers/obras" className="text-sm text-[#A89580] hover:text-[#8B1A1A] transition-colors">
            &larr; {t("ciriwhispers.obras2.backToObras")}
          </Link>
        </div>

        {/* Book header */}
        <div className="grid md:grid-cols-[300px_1fr] gap-10 mb-16 animate-fade-in-up">
          {/* Cover */}
          <div className="aspect-[3/4] bg-gradient-to-br from-[#F5F0E8] to-[#E8DED1] rounded-2xl overflow-hidden border border-[#E8DED1]">
            <img
              src={book.cover}
              alt={t(book.titleKey)}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Info */}
          <div>
            <span className="text-sm text-[#8B1A1A] font-medium">{book.year}</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D1B11] mt-1 mb-2">
              {t(book.titleKey)}
            </h1>
            <p className="text-[#8B7355] text-lg mb-6 italic">{book.subtitle}</p>

            <p className="text-[#5C3D2E] leading-relaxed mb-8">
              {t(book.synopsisKey)}
            </p>

            {/* Excerpt */}
            <blockquote className="font-serif italic text-[#8B7355] border-l-2 border-[#8B1A1A]/30 pl-4 mb-8">
              &ldquo;{t(book.excerptKey)}&rdquo;
            </blockquote>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {isAvailable && book.hasSimpleReader && (
                <button
                  onClick={openReader}
                  className="px-6 py-3 bg-gradient-to-r from-[#8B1A1A] to-[#6B1414] hover:from-[#6B1414] hover:to-[#8B1A1A] text-[#2D1B11] font-semibold rounded-lg transition-all"
                >
                  {t("ciriwhispers.obras2.readNow")}
                </button>
              )}

              {isAvailable && book.amazonLink !== "#" && (
                <a
                  href={book.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBookInteraction(book.id, "amazon_click")}
                  className="px-6 py-3 border border-[#E8DED1] text-[#5C3D2E] hover:border-[#8B1A1A]/30 rounded-lg font-medium transition-all"
                >
                  {t("ciriwhispers.obras2.buyAmazon")}
                </a>
              )}

              {!isAvailable && (
                <span className="px-6 py-3 bg-slate-800/50 text-[#A89580] rounded-lg font-medium">
                  {t(book.statusKey)}
                </span>
              )}
            </div>

            {/* Sensitive notice */}
            {book.sensitiveTopics && <SensitiveNotice topics={book.sensitiveTopics} />}

            {/* Share */}
            <SocialShare
              title={`${t(book.titleKey)} — CiriWhispers`}
              description={t(book.synopsisKey)}
              platforms={["twitter", "facebook", "whatsapp", "copy"]}
              variant="minimal"
              project="ciriwhispers"
            />
          </div>
        </div>

        {/* Related stories from this book */}
        {relatedStories.length > 0 && (
          <div className="border-t border-[#E8DED1] pt-12">
            <h2 className="font-serif text-2xl font-bold text-[#2D1B11] mb-6">
              {t("ciriwhispers.obras2.relatedStories")}
            </h2>
            <div className="space-y-4">
              {relatedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => setSelectedStory(story)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reader modals */}
      {readerOpen &&
        (readerMode === "epub" && book.epubUrl ? (
          <DigitalReader
            bookId={book.id}
            title={t(book.titleKey)}
            author="Ciriaco A. Pichardo (CiriWhispers)"
            url={book.epubUrl}
            onClose={() => setReaderOpen(false)}
          />
        ) : (
          <ProfessionalReader
            bookId={book.id}
            title={t(book.titleKey)}
            author="Ciriaco A. Pichardo (CiriWhispers)"
            content={getBookContent(book.id)}
            onClose={() => setReaderOpen(false)}
          />
        ))}

      {/* Story reader */}
      {selectedStory && (
        <StoryReader
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
}
