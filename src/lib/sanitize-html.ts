import DOMPurify from 'isomorphic-dompurify';

/**
 * Whitelist mínima para texto enriquecido del dueño (descripciones, etc.) que se
 * renderiza sin escapar en la página pública — bold/italic/underline, encabezados,
 * listas y párrafos. Nada de scripts, iframes, ni atributos de evento (onClick, etc.).
 * Usar SIEMPRE antes de un dangerouslySetInnerHTML con contenido que viene de un
 * formulario del dashboard, aunque el dueño sea "de confianza": una cuenta
 * comprometida no debería poder inyectar JS en la página pública del negocio.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  // 'style' se permite solo para el text-align que pone la extensión TextAlign de
  // Tiptap — DOMPurify igual sanea cualquier valor peligroso (url(), expression(), etc.)
  // dentro del atributo, así que no hace falta whitelistear la propiedad puntualmente.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  });
}

/**
 * Texto plano sin etiquetas — para <meta description>, og:description, y cualquier otro
 * lugar donde el HTML del RichTextEditor se vería como texto crudo ("<p>Somos...</p>")
 * en vez de renderizarse. No usar esto para el cuerpo visible de la página pública.
 */
export function stripRichTextToPlain(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).replace(/\s+/g, ' ').trim();
}
