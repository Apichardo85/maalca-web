import { Resend } from 'resend'
import { renderCardEmail, renderPlainEmail, emailCtaButton, MAALCA_BRAND_COLOR } from '@/lib/email/layout'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MaalCa <noreply@maalca.com>'

/**
 * Add a contact to the Resend audience and send a welcome email.
 * Gracefully skips if RESEND_API_KEY is not configured.
 */
export async function addSubscriber(email: string, source: string): Promise<{ added: boolean; welcomed: boolean }> {
  if (!resend) {
    console.log('[Resend] Skipped — RESEND_API_KEY not set')
    return { added: false, welcomed: false }
  }

  let added = false
  let welcomed = false

  // 1. Add contact to audience (if audience configured)
  if (AUDIENCE_ID) {
    try {
      await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
        firstName: source,
        unsubscribed: false,
      })
      added = true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // 409 = already exists — that's fine
      if (msg.includes('already exists') || msg.includes('409')) {
        added = true
      } else {
        console.error('[Resend] Contact create failed:', msg)
      }
    }
  }

  // 2. Send welcome email
  try {
    const welcomeHtml = buildWelcomeEmail(source)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: welcomeSubject(source),
      html: welcomeHtml,
    })
    welcomed = true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Resend] Welcome email failed:', msg)
  }

  return { added, welcomed }
}

function welcomeSubject(source: string): string {
  switch (source) {
    case 'ciriwhispers': return '¡Bienvenido a las Cartas de CiriWhispers!'
    case 'editorial': return '¡Bienvenido a Editorial MaalCa!'
    case 'properties': return '¡Bienvenido a MaalCa Properties!'
    case 'dr-pichardo': return '¡Suscripción confirmada — Dr. Pichardo!'
    default: return '¡Bienvenido al ecosistema MaalCa!'
  }
}

function buildWelcomeEmail(source: string): string {
  const greeting = sourceGreeting(source)

  return renderCardEmail({
    bodyHtml: `
      <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">${greeting.title}</h2>
      <p style="color: #525252; line-height: 1.6; font-size: 15px;">${greeting.body}</p>
      <p style="color: #525252; line-height: 1.6; font-size: 15px;">
        Si tienes preguntas, responde a este email — estamos aquí.
      </p>
    `,
    footerText: `Recibes este email porque te suscribiste en <a href="https://maalca.com" style="color: ${MAALCA_BRAND_COLOR};">maalca.com</a>.<br/>Puedes cancelar tu suscripción en cualquier momento.`,
  })
}

/**
 * Send welcome email to new business owner after onboarding.
 */
export async function sendOnboardingWelcome(
  email: string,
  businessName: string,
  slug: string,
): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped onboarding welcome — RESEND_API_KEY not set');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `¡${businessName} está en línea! 🚀`,
      html: buildOnboardingWelcomeEmail(businessName, slug),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Onboarding welcome failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Notify MaalCa team of a new space creation.
 */
export async function notifyNewSpace(
  userEmail: string,
  businessName: string,
  slug: string,
  businessType: string,
): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped new space notification — RESEND_API_KEY not set');
    return false;
  }

  const teamEmail = process.env.MAALCA_TEAM_EMAIL || 'alejandropichardo85@gmail.com';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: teamEmail,
      subject: `🆕 Nuevo espacio: ${businessName} (${businessType})`,
      html: buildNewSpaceNotificationEmail(userEmail, businessName, slug, businessType),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] New space notification failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

function buildOnboardingWelcomeEmail(businessName: string, slug: string): string {
  const publicUrl = `https://maalca.com/${slug}`;
  const dashboardUrl = `https://maalca.com/space/${slug}`;

  return renderCardEmail({
    bodyHtml: `
      <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">¡${businessName} está en línea! 🚀</h2>
      <p style="color: #525252; line-height: 1.6; font-size: 15px;">
        Tu espacio ya está creado y visible para tus clientes. Aquí están tus links:
      </p>
      ${emailCtaButton('Ver mi página →', publicUrl)}
      <p style="color: #525252; line-height: 1.6; font-size: 14px;">
        <strong>Tu página pública:</strong> <a href="${publicUrl}" style="color: ${MAALCA_BRAND_COLOR};">${publicUrl}</a><br/>
        <strong>Tu dashboard:</strong> <a href="${dashboardUrl}" style="color: ${MAALCA_BRAND_COLOR};">${dashboardUrl}</a>
      </p>
      <p style="color: #525252; line-height: 1.6; font-size: 14px;">
        Próximos pasos: agrega tus productos, conecta WhatsApp y comparte tu link.
      </p>
    `,
    footerText: `Recibes este email porque creaste tu espacio en <a href="https://maalca.com" style="color: ${MAALCA_BRAND_COLOR};">maalca.com</a>.`,
  });
}

function buildNewSpaceNotificationEmail(
  userEmail: string, businessName: string, slug: string, businessType: string
): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2>🆕 Nuevo espacio creado</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Negocio:</td><td style="padding: 8px;">${businessName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Tipo:</td><td style="padding: 8px;">${businessType}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${userEmail}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Slug:</td><td style="padding: 8px;">${slug}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Página:</td><td style="padding: 8px;"><a href="https://maalca.com/${slug}">https://maalca.com/${slug}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Dashboard:</td><td style="padding: 8px;"><a href="https://maalca.com/space/${slug}">https://maalca.com/space/${slug}</a></td></tr>
      </table>
    </div>
  `;
}

/**
 * Aviso de invitación al equipo — disparado por POST /api/space/{slug}/team cuando el dueño
 * invita a alguien (ver route.ts). No es crítico para el flujo (el invite-claim funciona
 * igual sin esto, por email verificado en el próximo login) — es solo para que la persona
 * se entere sin que el dueño tenga que avisarle a mano.
 */
export async function sendTeamInviteEmail(params: {
  inviteeEmail: string;
  businessName: string;
  slug: string;
  role: string;
  inviterEmail: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped team invite — RESEND_API_KEY not set');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.inviteeEmail,
      subject: `Te invitaron a ${params.businessName} en MaalCa`,
      html: buildTeamInviteEmail(params),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Team invite email failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

const ROLE_LABELS_ES: Record<string, string> = { Owner: 'Dueño', Manager: 'Gerente', Staff: 'Empleado' };

function buildTeamInviteEmail(params: {
  businessName: string;
  slug: string;
  role: string;
  inviterEmail: string | null;
}): string {
  const roleLabel = ROLE_LABELS_ES[params.role] ?? params.role;
  const signupUrl = `https://maalca.com/login`;
  const inviterLine = params.inviterEmail
    ? `<strong>${params.inviterEmail}</strong> te invitó`
    : 'Te invitaron';

  return renderCardEmail({
    bodyHtml: `
      <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Te invitaron a ${params.businessName} 🤝</h2>
      <p style="color: #525252; line-height: 1.6; font-size: 15px;">
        ${inviterLine} a ayudar a administrar <strong>${params.businessName}</strong> en MaalCa, con acceso de <strong>${roleLabel}</strong>.
      </p>
      ${emailCtaButton('Iniciar sesión →', signupUrl)}
      <p style="color: #525252; line-height: 1.6; font-size: 14px;">
        Entra con este mismo correo (creando una cuenta si aún no tienes una) y verás el negocio automáticamente.
      </p>
    `,
    footerText: `Recibes este correo porque alguien te invitó a un negocio en <a href="https://maalca.com" style="color: ${MAALCA_BRAND_COLOR};">maalca.com</a>.`,
  });
}

const PLATFORM_ROLE_LABELS_ES: Record<string, string> = { Owner: 'Dueño', Support: 'Soporte' };

/**
 * Aviso de invitación al equipo INTERNO de plataforma (/ops/equipo) — distinto de
 * sendTeamInviteEmail, que es para el equipo por-afiliado (/space/{slug}/equipo). Este nunca
 * se había disparado: POST /api/ops/team solo guardaba el registro en el backend y no
 * mandaba ningún correo — por eso las invitaciones desde /ops/equipo no llegaban aunque las
 * de /space/{slug}/equipo sí (esas sí llaman a sendTeamInviteEmail desde hace tiempo).
 */
export async function sendPlatformTeamInviteEmail(params: {
  inviteeEmail: string;
  role: string;
  inviterEmail: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped platform team invite — RESEND_API_KEY not set');
    return false;
  }

  const roleLabel = PLATFORM_ROLE_LABELS_ES[params.role] ?? params.role;
  const loginUrl = 'https://maalca.com/login';
  const inviterLine = params.inviterEmail
    ? `<strong>${params.inviterEmail}</strong> te invitó`
    : 'Te invitaron';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.inviteeEmail,
      subject: 'Te invitaron al equipo interno de MaalCa',
      html: renderCardEmail({
        bodyHtml: `
          <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Te invitaron al equipo de MaalCa 🤝</h2>
          <p style="color: #525252; line-height: 1.6; font-size: 15px;">
            ${inviterLine} a formar parte del equipo interno de MaalCa, con acceso de <strong>${roleLabel}</strong> al panel de operaciones.
          </p>
          ${emailCtaButton('Iniciar sesión →', loginUrl)}
          <p style="color: #525252; line-height: 1.6; font-size: 14px;">
            Entra con este mismo correo (creando una cuenta si aún no tienes una) y tendrás acceso automáticamente a /ops.
          </p>
        `,
        footerText: `Recibes este correo porque alguien te invitó al equipo interno en <a href="https://maalca.com" style="color: ${MAALCA_BRAND_COLOR};">maalca.com</a>.`,
      }),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Platform team invite email failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

export interface OrderEmailItem {
  name: string;
  price: number;
  qty: number;
}

/**
 * Confirmación de pago al cliente — disparada por maalca-api cuando un Order pasa a Paid
 * (ver OrderService.ConfirmCheckoutAsync). El afiliado es el merchant of record (direct
 * charge de Stripe Connect); este correo solo confirma que el pedido quedó registrado.
 */
export async function sendOrderConfirmationEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  slug: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  currency: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped order confirmation — RESEND_API_KEY not set');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Pedido confirmado — ${params.businessName}`,
      html: buildOrderStatusEmail({ ...params, kind: 'confirmed' }),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Order confirmation failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Aviso de "pedido listo" al cliente — disparado cuando el afiliado marca un Order como
 * Fulfilled desde el panel admin (ver OrderService.UpdateStatusAsync).
 */
export async function sendOrderFulfilledEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  slug: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  currency: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped order fulfilled notice — RESEND_API_KEY not set');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Tu pedido está listo — ${params.businessName}`,
      html: buildOrderStatusEmail({ ...params, kind: 'fulfilled' }),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Order fulfilled notice failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

function buildOrderStatusEmail(params: {
  kind: 'confirmed' | 'fulfilled';
  customerName: string | null;
  businessName: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  currency: string;
}): string {
  const greeting = params.customerName ? `¡Hola, ${params.customerName}!` : '¡Hola!';
  const title =
    params.kind === 'confirmed'
      ? `Tu pedido en ${params.businessName} fue confirmado ✅`
      : `Tu pedido en ${params.businessName} está listo 🎉`;
  const body =
    params.kind === 'confirmed'
      ? 'Recibimos tu pago y tu pedido ya está en proceso. Te avisaremos cuando esté listo.'
      : 'Tu pedido ya está listo. Si tienes dudas, responde a este correo o contacta directamente al negocio.';

  const itemRows = params.items
    .map(
      (i) => `
        <tr>
          <td style="padding: 8px 0; color: #525252; font-size: 14px;">${i.qty}× ${i.name}</td>
          <td style="padding: 8px 0; color: #525252; font-size: 14px; text-align: right;">${params.currency} ${(i.price * i.qty).toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  return renderCardEmail({
    bodyHtml: `
      <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">${title}</h2>
      <p style="color: #525252; line-height: 1.6; font-size: 15px;">${greeting} ${body}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">
        ${itemRows}
        <tr>
          <td style="padding: 12px 0 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">Total</td>
          <td style="padding: 12px 0 0; font-weight: 600; color: #1a1a1a; font-size: 15px; text-align: right;">${params.currency} ${params.total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="color: #a3a3a3; font-size: 12px; margin: 0;">Pedido #${params.orderId.slice(0, 8)}</p>
    `,
    footerText: `Recibes este correo porque hiciste un pedido a través de <a href="https://maalca.com" style="color: ${MAALCA_BRAND_COLOR};">maalca.com</a>.`,
  });
}

/**
 * Confirmación simple de cita — disparada por POST /api/space/{slug}/agenda cuando el
 * cliente tiene email guardado. A propósito NO usa el template ilustrado de bienvenida/pedido
 * (el dueño pidió algo liviano, sin diseño pesado) — es solo texto con los datos clave.
 */
export async function sendAppointmentConfirmationEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  serviceName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  staffName?: string | null;
  // Tarea #247 — link a /cita/{token} (self-service, sin login). Opcional para no romper al
  // llamador existente (POST /api/space/{slug}/agenda) hasta que también lo pase.
  manageUrl?: string | null;
  // Tarea #405/#408 — solo viene cuando la cita quedó marcada IsVirtual=true (ver
  // Service.Modality/Appointment.IsVirtual). El link fijo de Zoom del negocio.
  zoomLink?: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped appointment confirmation — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const dateFmt = new Date(`${params.date}T00:00:00`).toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const staffLine = params.staffName ? `<br/>Con: ${params.staffName}` : '';
  const footer = params.manageUrl
    ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.manageUrl}" style="display: inline-block; background: ${MAALCA_BRAND_COLOR}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Gestiona tu cita</a>
        </div>
        <p style="font-size: 13px; color: #737373;">Desde ese link puedes confirmar, reagendar o cancelar sin llamar al negocio.</p>
      `
    : `<p style="font-size: 13px; color: #737373;">Si necesitas cambiarla o cancelarla, contacta directamente al negocio.</p>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Cita confirmada — ${params.businessName}`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        <p style="font-size: 15px; line-height: 1.6;">Tu cita en <strong>${params.businessName}</strong> quedó confirmada:</p>
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>${params.serviceName}</strong><br/>
          ${dateFmt} · ${params.time}${staffLine}
        </p>
        ${params.zoomLink ? `<div style="text-align: center; margin: 16px 0;"><a href="${params.zoomLink}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">💻 Unirme a la reunión (Zoom)</a></div>` : ''}
        ${footer}
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Appointment confirmation failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/** Task #193 — recordatorio automático, enviado por el cron /api/cron/appointment-reminders
 *  unas horas antes de la cita. Mismo diseño de correo que sendAppointmentConfirmationEmail
 *  a propósito, para que el cliente reconozca el formato. */
export async function sendAppointmentReminderEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  serviceName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  staffName?: string | null;
  // Tarea #247 — mismo link que la confirmación, para que el recordatorio también deje
  // reagendar/cancelar sin tener que llamar al negocio.
  manageUrl?: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped appointment reminder — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const dateFmt = new Date(`${params.date}T00:00:00`).toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const staffLine = params.staffName ? `<br/>Con: ${params.staffName}` : '';
  const footer = params.manageUrl
    ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.manageUrl}" style="display: inline-block; background: ${MAALCA_BRAND_COLOR}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Gestiona tu cita</a>
        </div>
        <p style="font-size: 13px; color: #737373;">¿No puedes venir? Reagenda o cancela desde ese link.</p>
      `
    : `<p style="font-size: 13px; color: #737373;">Si necesitas cambiarla o cancelarla, contacta directamente al negocio.</p>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Recordatorio: tu cita hoy en ${params.businessName}`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        <p style="font-size: 15px; line-height: 1.6;">Recordatorio de tu cita en <strong>${params.businessName}</strong>:</p>
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>${params.serviceName}</strong><br/>
          ${dateFmt} · ${params.time}${staffLine}
        </p>
        ${footer}
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Appointment reminder failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Formulario de contacto general (home + /contacto) — hasta ahora `useContactForm.ts` solo
 * simulaba el envío con localStorage, no llegaba a ningún lado. Esto es lo que realmente
 * manda el mensaje: notifica a hello@maalca.com y confirma por correo a quien escribió.
 */
export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  company?: string | null;
  project?: string | null;
  message: string;
}): Promise<{ notified: boolean; confirmed: boolean }> {
  const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || 'hello@maalca.com';

  if (!resend) {
    console.log('[Resend] Skipped contact form — RESEND_API_KEY not set');
    return { notified: false, confirmed: false };
  }

  let notified = false;
  let confirmed = false;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: params.email,
      subject: `Nuevo mensaje de contacto — ${params.name}`,
      html: renderPlainEmail(`
        <h2 style="font-size: 18px;">Nuevo mensaje desde maalca.com</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 8px; font-weight: bold; width: 120px;">Nombre:</td><td style="padding: 6px 8px;">${params.name}</td></tr>
          <tr><td style="padding: 6px 8px; font-weight: bold;">Correo:</td><td style="padding: 6px 8px;">${params.email}</td></tr>
          ${params.company ? `<tr><td style="padding: 6px 8px; font-weight: bold;">Negocio:</td><td style="padding: 6px 8px;">${params.company}</td></tr>` : ''}
          ${params.project ? `<tr><td style="padding: 6px 8px; font-weight: bold;">Tipo:</td><td style="padding: 6px 8px;">${params.project}</td></tr>` : ''}
        </table>
        <p style="font-size: 14px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px; margin-top: 16px; white-space: pre-line;">${params.message}</p>
      `),
    });
    notified = true;
  } catch (err: unknown) {
    console.error('[Resend] Contact notify email failed:', err instanceof Error ? err.message : String(err));
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: 'Recibimos tu mensaje — MaalCa',
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">Hola ${params.name},</p>
        <p style="font-size: 15px; line-height: 1.6;">Recibimos tu mensaje y te respondemos pronto, normalmente en menos de 24 horas.</p>
        <p style="font-size: 13px; color: #737373;">Si necesitas algo urgente, responde directamente a este correo.</p>
      `),
    });
    confirmed = true;
  } catch (err: unknown) {
    console.error('[Resend] Contact confirmation email failed:', err instanceof Error ? err.message : String(err));
  }

  return { notified, confirmed };
}

function sourceGreeting(source: string): { title: string; body: string } {
  switch (source) {
    case 'ciriwhispers':
      return {
        title: '¡Bienvenido a CiriWhispers!',
        body: 'Gracias por suscribirte a las cartas. Recibirás nuevas reflexiones y contenido literario directamente en tu correo — como secretos susurrados entre amigos de alma.',
      }
    case 'editorial':
      return {
        title: '¡Bienvenido a Editorial MaalCa!',
        body: 'Gracias por unirte. Recibirás nuestros artículos más profundos sobre filosofía, cultura y sociedad contemporánea directamente en tu correo.',
      }
    case 'properties':
      return {
        title: '¡Bienvenido a MaalCa Properties!',
        body: 'Gracias por suscribirte. Te enviaremos las mejores oportunidades inmobiliarias en República Dominicana según tus preferencias.',
      }
    case 'dr-pichardo':
      return {
        title: '¡Suscripción confirmada!',
        body: 'Gracias por suscribirte a las actualizaciones del Dr. Pichardo. Recibirás información sobre operativos de salud y consejos médicos.',
      }
    default:
      return {
        title: '¡Bienvenido al ecosistema MaalCa!',
        body: 'Gracias por suscribirte. Te mantendremos al día con lo último de nuestros proyectos creativos y empresariales.',
      }
  }
}

/**
 * Link de cobro real (Stripe Checkout) para una factura — disparado por maalca-api cuando el
 * negocio genera el link desde el dashboard (ver InvoiceService.CreateInvoiceCheckoutAsync).
 * "Marcar pagada" manual (cash/transferencia/Zelle) no pasa por acá, sigue siendo un flujo
 * aparte sin email automático.
 */
export async function sendInvoicePaymentLinkEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  paymentLink: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped invoice payment link — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Factura ${params.invoiceNumber} — ${params.businessName}`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        <p style="font-size: 15px; line-height: 1.6;"><strong>${params.businessName}</strong> te envió una factura por cobrar:</p>
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>Factura ${params.invoiceNumber}</strong><br/>
          Total: ${params.currency} ${params.total.toFixed(2)}
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.paymentLink}" style="display: inline-block; background: ${MAALCA_BRAND_COLOR}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Pagar ahora</a>
        </div>
        <p style="font-size: 13px; color: #737373;">Pago seguro procesado por Stripe.</p>
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Invoice payment link failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Propuesta de servicio enviada al cliente (task #194 + fix posterior) — antes "Enviar" solo
 * marcaba el estado y el dueño tenía que copiar/mandar el link a mano; ahora, si el cliente
 * dejó su correo, le llega este email directo con el link de aceptación.
 */
export async function sendProposalEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  expiresAt: string | null;
  proposalLink: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped proposal email — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const expiresLine = params.expiresAt
    ? `<p style="font-size: 13px; color: #737373;">Válida hasta el ${new Date(params.expiresAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`
    : '';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Propuesta: ${params.title} — ${params.businessName}`,
      html: renderPlainEmail(`
          <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
          <p style="font-size: 15px; line-height: 1.6;"><strong>${params.businessName}</strong> te envió una propuesta:</p>
          <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
            <strong>${params.title}</strong><br/>
            ${params.description ? `${params.description}<br/>` : ''}
            Monto: ${params.currency} ${params.amount.toFixed(2)}
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${params.proposalLink}" style="display: inline-block; background: ${MAALCA_BRAND_COLOR}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Ver y aceptar propuesta</a>
          </div>
          ${expiresLine}
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Proposal email failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Aviso al NEGOCIO (no al cliente) de que su propuesta fue aceptada/firmada (tarea #338) —
 * disparado desde ProposalService.AcceptPublicProposalAsync, solo si el afiliado tiene
 * ContactEmail configurado. Antes de esto el dueño solo se enteraba entrando al dashboard.
 */
export async function sendProposalAcceptedEmail(params: {
  businessEmail: string;
  businessName: string;
  title: string;
  amount: number;
  currency: string;
  acceptedByName: string | null;
  acceptedAt: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped proposal-accepted email — RESEND_API_KEY not set');
    return false;
  }

  const acceptedDate = params.acceptedAt
    ? new Date(params.acceptedAt).toLocaleString('es-DO', { dateStyle: 'long', timeStyle: 'short' })
    : '';
  const contactLine = [
    params.customerEmail ? `Correo: ${params.customerEmail}` : null,
    params.customerPhone ? `Teléfono: ${params.customerPhone}` : null,
  ].filter(Boolean).join(' · ');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.businessEmail,
      subject: `✅ Propuesta aceptada: ${params.title}`,
      html: renderPlainEmail(`
          <p style="font-size: 15px; line-height: 1.6;">Hola,</p>
          <p style="font-size: 15px; line-height: 1.6;">Tu cliente aceptó la propuesta <strong>${params.title}</strong> por <strong>${params.currency} ${params.amount.toFixed(2)}</strong>.</p>
          <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
            Firmado por: <strong>${params.acceptedByName ?? 'N/A'}</strong>${acceptedDate ? `<br/>Fecha: ${acceptedDate}` : ''}${contactLine ? `<br/>${contactLine}` : ''}
          </p>
          <p style="font-size: 13px; color: #737373;">Entra a tu panel de Propuestas en MaalCa para ver el detalle y dar seguimiento.</p>
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Proposal-accepted email failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Recibo de pago (tarea #4 del backlog de documentos/correos, ver
 * docs/audits/business-type-flows-audit.md, 2026-09-29) — dispara desde
 * InvoiceService.UpdateInvoiceAsync (maalca-api) cuando "Marcar pagada" pasa una factura a
 * Paid manualmente (cash/transferencia/Zelle). No se dispara en pagos por Stripe Checkout —
 * esos ya traen su propio recibo automático de Stripe si el negocio lo tiene activado; mandar
 * otro acá sería duplicar.
 */
export async function sendInvoiceReceiptEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  paidDate: string | null;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped invoice receipt — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const paidDateLine = params.paidDate
    ? new Date(params.paidDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Recibo de pago — Factura ${params.invoiceNumber} (${params.businessName})`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        <p style="font-size: 15px; line-height: 1.6;">Confirmamos tu pago a <strong>${params.businessName}</strong>:</p>
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>Factura ${params.invoiceNumber}</strong><br/>
          Total pagado: ${params.currency} ${params.total.toFixed(2)}<br/>
          Fecha de pago: ${paidDateLine}
        </p>
        <p style="font-size: 13px; color: #737373;">Este correo es tu comprobante de pago. Consérvalo para tus registros.</p>
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Invoice receipt failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Recordatorio de propuesta sin firmar (tarea #4 del backlog) — corre vía Vercel Cron
 * (/api/cron/proposal-reminders), pide a maalca-api las propuestas "Sent" hace varios días que
 * siguen sin firmar (Proposal.ReminderSentAt == null), manda este correo una sola vez, y marca
 * cada una como recordada para no repetir. Antes de esto una propuesta enviada y olvidada se
 * quedaba así para siempre — nadie le daba seguimiento al cliente.
 */
export async function sendProposalReminderEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  title: string;
  amount: number;
  currency: string;
  expiresAt: string | null;
  proposalLink: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped proposal reminder — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const expiresLine = params.expiresAt
    ? `<p style="font-size: 13px; color: #737373;">Válida hasta el ${new Date(params.expiresAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`
    : '';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Recordatorio: propuesta pendiente — ${params.businessName}`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        <p style="font-size: 15px; line-height: 1.6;">Sigue pendiente la propuesta que te envió <strong>${params.businessName}</strong>:</p>
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>${params.title}</strong><br/>
          Monto: ${params.currency} ${params.amount.toFixed(2)}
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.proposalLink}" style="display: inline-block; background: ${MAALCA_BRAND_COLOR}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">Ver y aceptar propuesta</a>
        </div>
        ${expiresLine}
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Proposal reminder failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Recordatorio de factura por vencer/vencida (tarea #4 del backlog) — corre vía Vercel Cron
 * (/api/cron/invoice-due-reminders), pide a maalca-api las facturas Pending/Overdue con
 * vencimiento próximo o ya pasado (Invoice.ReminderSentAt == null), manda este correo una sola
 * vez. A propósito sin botón de pago: generar un link de cobro real requiere Stripe conectado
 * por el negocio (no todos lo tienen — muchos cobran cash/transferencia), así que el recordatorio
 * es informativo y remite al cliente a contactar al negocio directamente.
 */
export async function sendInvoiceDueReminderEmail(params: {
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: string | null;
  isOverdue: boolean;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped invoice due reminder — RESEND_API_KEY not set');
    return false;
  }

  const greeting = params.customerName ? `Hola, ${params.customerName}` : 'Hola';
  const dueDateLine = params.dueDate
    ? new Date(params.dueDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const statusLine = params.isOverdue
    ? `<p style="font-size: 15px; line-height: 1.6; color: #B42828; font-weight: 600;">Esta factura está vencida.</p>`
    : `<p style="font-size: 15px; line-height: 1.6;">Esta factura vence pronto.</p>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `${params.isOverdue ? 'Factura vencida' : 'Recordatorio de pago'} — ${params.invoiceNumber} (${params.businessName})`,
      html: renderPlainEmail(`
        <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
        ${statusLine}
        <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
          <strong>Factura ${params.invoiceNumber}</strong> — <strong>${params.businessName}</strong><br/>
          Total: ${params.currency} ${params.total.toFixed(2)}${dueDateLine ? `<br/>Vencimiento: ${dueDateLine}` : ''}
        </p>
        <p style="font-size: 13px; color: #737373;">Contacta a ${params.businessName} para coordinar el pago.</p>
      `),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Invoice due reminder failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * Digest semanal a afiliados (tarea #4 del backlog, cierre) — corre vía Vercel Cron
 * (/api/cron/affiliate-digest, lunes), pide a maalca-api el resumen de la semana anterior por
 * afiliado y manda este correo. A propósito usa la tarjeta ilustrada (renderCardEmail), no el
 * wrapper liviano -- es un resumen para leer con calma, no una notificación transaccional.
 */
export async function sendAffiliateDigestEmail(params: {
  businessEmail: string;
  businessName: string;
  slug: string | null;
  currency: string;
  revenueThisWeek: number;
  invoicesPaidCount: number;
  proposalsSentCount: number;
  proposalsAcceptedCount: number;
  newCustomersCount: number;
}): Promise<boolean> {
  if (!resend) {
    console.log('[Resend] Skipped affiliate digest — RESEND_API_KEY not set');
    return false;
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com').replace(/\/$/, '');
  const dashboardUrl = params.slug ? `${origin}/space/${params.slug}` : origin;

  const hasActivity =
    params.revenueThisWeek > 0 ||
    params.proposalsSentCount > 0 ||
    params.proposalsAcceptedCount > 0 ||
    params.newCustomersCount > 0;

  const summaryRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: #5a5a5a;">${label}</td>
      <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; font-weight: 600; text-align: right;">${value}</td>
    </tr>
  `;

  const bodyHtml = `
    <h2 style="font-size: 18px; margin: 0 0 4px 0;">Tu semana en ${params.businessName}</h2>
    <p style="font-size: 13px; color: #a3a3a3; margin: 0 0 20px 0;">Resumen de los últimos 7 días</p>
    ${
      hasActivity
        ? `<table style="width: 100%; border-collapse: collapse;">
            ${summaryRow('Ingresos cobrados', `${params.currency} ${params.revenueThisWeek.toFixed(2)}`)}
            ${summaryRow('Facturas pagadas', String(params.invoicesPaidCount))}
            ${summaryRow('Propuestas enviadas', String(params.proposalsSentCount))}
            ${summaryRow('Propuestas aceptadas', String(params.proposalsAcceptedCount))}
            ${summaryRow('Clientes nuevos', String(params.newCustomersCount))}
          </table>`
        : `<p style="font-size: 14px; line-height: 1.6; color: #5a5a5a;">No hubo actividad registrada esta semana (sin facturas pagadas, propuestas ni clientes nuevos).</p>`
    }
    ${emailCtaButton('Ver mi panel →', dashboardUrl)}
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.businessEmail,
      subject: `Tu semana en ${params.businessName}`,
      html: renderCardEmail({
        bodyHtml,
        footerText: 'Recibes este resumen semanal porque tienes un negocio activo en MaalCa.',
      }),
    });
    return true;
  } catch (err: unknown) {
    console.error('[Resend] Affiliate digest failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Reserva de mesa recién pedida desde la página pública (status "Requested"). Manda dos correos
 * independientes, cada uno best-effort: (1) aviso al restaurante (Affiliate.ContactEmail) con los
 * datos del comensal y botón al panel de reservas, (2) acuse de recibo al comensal si dejó correo
 * — dejando claro que está PENDIENTE de confirmación, no confirmada. Todo texto que viene del
 * comensal se escapa antes de entrar al HTML.
 */
export async function sendReservationRequestedEmail(params: {
  businessName: string
  businessEmail?: string | null
  slug?: string | null
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  date: string // YYYY-MM-DD
  time: string // HH:mm
  partySize: number
  notes?: string | null
}): Promise<{ businessSent: boolean; customerSent: boolean }> {
  const result = { businessSent: false, customerSent: false }
  if (!resend) {
    console.log('[Resend] Skipped reservation emails — RESEND_API_KEY not set')
    return result
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com').replace(/\/$/, '')
  const reservationsUrl = params.slug ? `${origin}/space/${params.slug}/reservations` : origin

  const when = (() => {
    const d = new Date(`${params.date}T00:00:00Z`)
    if (Number.isNaN(d.getTime())) return params.date
    const label = d.toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    return `${label} · ${params.time}`
  })()

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #5a5a5a;">${label}</td>
      <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a; font-weight: 600; text-align: right;">${value}</td>
    </tr>
  `

  const name = escapeHtml(params.customerName)
  const business = escapeHtml(params.businessName)

  if (params.businessEmail) {
    const bodyHtml = `
      <h2 style="font-size: 18px; margin: 0 0 4px 0;">Nueva reserva pendiente</h2>
      <p style="font-size: 13px; color: #a3a3a3; margin: 0 0 20px 0;">Entró desde tu página pública. Confírmala o cancélala desde tu panel.</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${row('Cuándo', escapeHtml(when))}
        ${row('Personas', String(params.partySize))}
        ${row('Nombre', name)}
        ${row('Teléfono', escapeHtml(params.customerPhone))}
        ${params.customerEmail ? row('Correo', escapeHtml(params.customerEmail)) : ''}
      </table>
      ${params.notes ? `<p style="font-size: 14px; line-height: 1.6; color: #5a5a5a; margin: 16px 0 0 0;"><strong>Nota:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      ${emailCtaButton('Ver reservas →', reservationsUrl)}
    `
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: params.businessEmail,
        subject: `Nueva reserva: ${params.customerName} · ${params.partySize} personas · ${when}`,
        html: renderCardEmail({
          bodyHtml,
          footerText: 'Recibes este aviso porque tienes reservas en línea activas en MaalCa.',
        }),
      })
      result.businessSent = true
    } catch (err: unknown) {
      console.error('[Resend] Reservation business email failed:', err instanceof Error ? err.message : String(err))
    }
  }

  if (params.customerEmail) {
    const bodyHtml = `
      <h2 style="font-size: 18px; margin: 0 0 4px 0;">Recibimos tu solicitud de reserva</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #5a5a5a; margin: 0 0 20px 0;">
        Hola ${name}, ${business} recibió tu solicitud. <strong>Todavía no está confirmada</strong>: el restaurante te contactará al teléfono que dejaste para confirmarla.
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${row('Cuándo', escapeHtml(when))}
        ${row('Personas', String(params.partySize))}
        ${row('Restaurante', business)}
      </table>
    `
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: params.customerEmail,
        subject: `Solicitud de reserva en ${params.businessName}`,
        html: renderCardEmail({
          bodyHtml,
          footerText: `Enviado porque pediste una reserva en ${business} a través de MaalCa.`,
        }),
      })
      result.customerSent = true
    } catch (err: unknown) {
      console.error('[Resend] Reservation customer email failed:', err instanceof Error ? err.message : String(err))
    }
  }

  return result
}
