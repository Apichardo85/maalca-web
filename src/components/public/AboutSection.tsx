// src/components/public/AboutSection.tsx
// Shared "Sobre nosotros" block used by all public templates, between the
// hero and the catalog. `maxWidth` matches each template's own content
// container so the section lines up with the rest of the page.
export function AboutSection({
  description,
  descriptionEn,
  maxWidth = '768px',
  language = 'es',
}: {
  description?: string | null;
  descriptionEn?: string | null;
  maxWidth?: string;
  language?: 'es' | 'en';
}) {
  // Falls back to the Spanish description when English is selected but no
  // translation was entered — same pattern as item descriptionEn elsewhere.
  const text = language === 'en' && descriptionEn ? descriptionEn : description;
  if (!text) return null;

  return (
    <section style={{ maxWidth, margin: '0 auto' }} className="px-4 pt-10">
      <h2 className="text-lg font-semibold text-neutral-900">
        {language === 'en' ? 'About us' : 'Sobre nosotros'}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 whitespace-pre-line">{text}</p>
    </section>
  );
}
