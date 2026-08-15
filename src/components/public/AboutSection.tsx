// src/components/public/AboutSection.tsx
// Shared "Sobre nosotros" block used by all public templates, between the
// hero and the catalog. `maxWidthClassName` matches each template's own
// content container (a Tailwind max-w-* class) so the section lines up with
// the rest of the page.
import { sanitizeRichText } from '@/lib/sanitize-html';

export function AboutSection({
  description,
  descriptionEn,
  maxWidthClassName = 'max-w-[768px]',
  language = 'es',
}: {
  description?: string | null;
  descriptionEn?: string | null;
  maxWidthClassName?: string;
  language?: 'es' | 'en';
}) {
  // Falls back to the Spanish description when English is selected but no
  // translation was entered — same pattern as item descriptionEn elsewhere.
  const text = language === 'en' && descriptionEn ? descriptionEn : description;
  if (!text) return null;

  // El dueño escribe esto con el RichTextEditor (src/components/ui/RichTextEditor.tsx) en
  // Diseño → Configuración — llega como HTML. sanitizeRichText es obligatorio antes de
  // renderizarlo sin escapar: ver comentario en src/lib/sanitize-html.ts.
  const html = sanitizeRichText(text);
  // Contenido legado guardado como texto plano (antes de este editor) no trae etiquetas —
  // sanitizeRichText lo deja igual, así que se ve como un solo párrafo sin saltos de línea
  // salvo que el propio texto tenga <br>/<p>. Para no perder saltos de línea de ese texto
  // viejo, seguimos aplicando whitespace-pre-line — no afecta contenido HTML real porque
  // los <p>/<br> ya generan sus propios saltos.
  return (
    <section className={`mx-auto px-4 pt-10 ${maxWidthClassName}`}>
      <h2 className="text-lg font-semibold text-neutral-900">
        {language === 'en' ? 'About us' : 'Sobre nosotros'}
      </h2>
      <div
        className="prose-sm mt-2 max-w-none whitespace-pre-line text-sm leading-relaxed text-neutral-600 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-neutral-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
