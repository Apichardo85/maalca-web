import sanitizeHtmlLib from 'sanitize-html';

/**
 * Whitelist mínima para texto enriquecido del dueño (descripciones, etc.) que se
 * renderiza sin escapar en la página pública — bold/italic/underline, encabezados,
 * listas y párrafos. Nada de scripts, iframes, ni atributos de evento (onClick, etc.).
 * Usar SIEMPRE antes de un dangerouslySetInnerHTML con contenido que viene de un
 * formulario del dashboard, aunque el dueño sea "de confianza": una cuenta
 * comprometida no debería poder inyectar JS en la página pública del negocio.
 *
 * Usa 'sanitize-html' (puro JS, sin jsdom) en vez de isomorphic-dompurify — ese traía
 * jsdom, cuya cadena de dependencias (html-encoding-sniffer → @exodus/bytes, un paquete
 * ESM) rompía el build 'standalone' con "ERR_REQUIRE_ESM" en producción (500 en /[slug]
 * y, por rebote, en CUALQUIER página de /space que compartiera el bundle con el layout —
 * Equipo, Pedidos, etc. — porque todas importan templates/registry.ts, que carga los 4
 * templates públicos, uno de los cuales usaba este archivo). No reintroducir dompurify/jsdom.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtmlLib(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      '*': ['style'],
    },
    // Evita que 'style' cuele url()/expression() u otros vectores — solo permitimos el
    // text-align que pone la extensión TextAlign de Tiptap.
    allowedStyles: {
      '*': {
        'text-align': [/^left$|^right$|^center$|^justify$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  });
}

/**
 * Texto plano sin etiquetas — para <meta description>, og:description, y cualquier otro
 * lugar donde el HTML del RichTextEditor se vería como texto crudo ("<p>Somos...</p>")
 * en vez de renderizarse. No usar esto para el cuerpo visible de la página pública.
 */
export function stripRichTextToPlain(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}
