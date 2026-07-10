// src/components/public/AboutSection.tsx
// Shared "Sobre nosotros" block used by all public templates, between the
// hero and the catalog. `maxWidth` matches each template's own content
// container so the section lines up with the rest of the page.
export function AboutSection({
  description,
  maxWidth = '768px',
}: {
  description?: string | null;
  maxWidth?: string;
}) {
  if (!description) return null;

  return (
    <section style={{ maxWidth, margin: '0 auto' }} className="px-4 pt-10">
      <h2 className="text-lg font-semibold text-neutral-900">Sobre nosotros</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 whitespace-pre-line">{description}</p>
    </section>
  );
}
