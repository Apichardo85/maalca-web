/**
 * Layout de correo compartido — tarea #3 del backlog de documentos/correos (ver
 * docs/audits/business-type-flows-audit.md, 2026-09-29). Antes cada una de las 13 funciones en
 * resend-service.ts armaba su propio wrapper `<div style="...">` a mano, con el color de marca
 * hardcodeado y repetido en cada una. Efecto real de esa duplicación, no solo cosmético: cinco
 * de esas funciones (buildWelcomeEmail, buildOnboardingWelcomeEmail, buildTeamInviteEmail,
 * sendPlatformTeamInviteEmail, buildOrderStatusEmail) seguían usando el rojo viejo (#DC2626) de
 * antes del rebrand a azul (#045AFE, ver globals.css) porque nadie las tocó cuando se rebrandeó
 * el resto del sitio -- nadie iba a acordarse de actualizar 5 copias sueltas.
 *
 * Dos estilos, migrados de los dos patrones reales que ya existían en el archivo:
 *  - `renderCardEmail`: la tarjeta ilustrada (header "MaalCa" + caja blanca + separador +
 *    disclaimer) que usaban bienvenida/invitaciones/pedidos.
 *  - `renderPlainEmail`: el wrapper liviano sin caja que usaban cita/factura/propuesta -- a
 *    propósito sin el diseño pesado, según el comentario original en
 *    sendAppointmentConfirmationEmail ("el dueño pidió algo liviano, sin diseño pesado").
 *
 * `MAALCA_BRAND_COLOR` es el único lugar donde vive el azul de marca ahora -- si vuelve a
 * cambiar, cambia una vez, no en 13 funciones.
 */

export const MAALCA_BRAND_COLOR = '#045AFE';

/** Botón CTA reutilizable -- mismo markup que ya usaban las tarjetas ilustradas. */
export function emailCtaButton(label: string, url: string, color: string = MAALCA_BRAND_COLOR): string {
  return `
    <div style="margin: 24px 0;">
      <a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 14px;">
        ${label}
      </a>
    </div>
  `;
}

/**
 * Tarjeta ilustrada -- bienvenida, invitaciones de equipo, estado de pedido. `bodyHtml` es el
 * contenido propio de cada correo (título, párrafos, botón vía emailCtaButton); este helper solo
 * pone el header "MaalCa", la caja blanca y el disclaimer del footer.
 */
export interface EmailBrand {
  name: string;
  logoUrl?: string | null;
  color?: string | null;
}

/** Solo acepta #RGB/#RRGGBB; cualquier otra cosa cae al azul de MaalCa (el valor entra a un style=""). */
export function safeBrandColor(color?: string | null): string {
  return color && /^#[0-9a-fA-F]{3,8}$/.test(color.trim()) ? color.trim() : MAALCA_BRAND_COLOR;
}

function escHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderCardEmail(opts: { bodyHtml: string; footerText: string; brandColor?: string; brand?: EmailBrand }): string {
  const color = opts.brand ? safeBrandColor(opts.brand.color) : opts.brandColor || MAALCA_BRAND_COLOR;
  const logo = opts.brand?.logoUrl && /^https:\/\//i.test(opts.brand.logoUrl)
    ? `<img src="${escHtml(opts.brand.logoUrl)}" alt="${escHtml(opts.brand.name)}" height="56" style="max-height: 56px; max-width: 200px; display: block; margin: 0 auto 8px;" />`
    : '';
  const header = opts.brand
    ? `${logo}<h1 style="color: ${color}; font-size: 22px; margin: 0;">${escHtml(opts.brand.name)}</h1>`
    : `<h1 style="color: ${color}; font-size: 24px; margin: 0;">MaalCa</h1>`;
  const poweredBy = opts.brand
    ? `<p style="text-align: center; color: #a3a3a3; font-size: 11px; margin: 16px 0 0;">Enviado con MaalCa</p>`
    : '';
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px 12px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        ${header}
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px 20px; border: 1px solid #e5e5e5; word-break: break-word; overflow-wrap: anywhere;">
        ${opts.bodyHtml}
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #a3a3a3; font-size: 12px; margin: 0;">${opts.footerText}</p>
      </div>
      ${poweredBy}
    </div>
  `;
}

/**
 * Wrapper liviano -- cita, factura, propuesta, formulario de contacto. Sin caja ni disclaimer;
 * solo el margen/tipografía consistente que ya compartían estas funciones a mano.
 */
export function renderPlainEmail(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      ${bodyHtml}
    </div>
  `;
}
