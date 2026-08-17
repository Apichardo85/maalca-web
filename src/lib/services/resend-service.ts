import { Resend } from 'resend'

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
  const brandColor = '#DC2626'
  const greeting = sourceGreeting(source)

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">MaalCa</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">${greeting.title}</h2>
        <p style="color: #525252; line-height: 1.6; font-size: 15px;">${greeting.body}</p>
        <p style="color: #525252; line-height: 1.6; font-size: 15px;">
          Si tienes preguntas, responde a este email — estamos aquí.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #a3a3a3; font-size: 12px; margin: 0;">
          Recibes este email porque te suscribiste en <a href="https://maalca.com" style="color: ${brandColor};">maalca.com</a>.
          <br/>Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  `
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
  const brandColor = '#DC2626';
  const publicUrl = `https://maalca.com/${slug}`;
  const dashboardUrl = `https://maalca.com/space/${slug}`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">MaalCa</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">¡${businessName} está en línea! 🚀</h2>
        <p style="color: #525252; line-height: 1.6; font-size: 15px;">
          Tu espacio ya está creado y visible para tus clientes. Aquí están tus links:
        </p>
        <div style="margin: 24px 0;">
          <a href="${publicUrl}" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Ver mi página →
          </a>
        </div>
        <p style="color: #525252; line-height: 1.6; font-size: 14px;">
          <strong>Tu página pública:</strong> <a href="${publicUrl}" style="color: ${brandColor};">${publicUrl}</a><br/>
          <strong>Tu dashboard:</strong> <a href="${dashboardUrl}" style="color: ${brandColor};">${dashboardUrl}</a>
        </p>
        <p style="color: #525252; line-height: 1.6; font-size: 14px;">
          Próximos pasos: agrega tus productos, conecta WhatsApp y comparte tu link.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #a3a3a3; font-size: 12px; margin: 0;">
          Recibes este email porque creaste tu espacio en <a href="https://maalca.com" style="color: ${brandColor};">maalca.com</a>.
        </p>
      </div>
    </div>
  `;
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
  const brandColor = '#DC2626';
  const roleLabel = ROLE_LABELS_ES[params.role] ?? params.role;
  const signupUrl = `https://maalca.com/login`;
  const inviterLine = params.inviterEmail
    ? `<strong>${params.inviterEmail}</strong> te invitó`
    : 'Te invitaron';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">MaalCa</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Te invitaron a ${params.businessName} 🤝</h2>
        <p style="color: #525252; line-height: 1.6; font-size: 15px;">
          ${inviterLine} a ayudar a administrar <strong>${params.businessName}</strong> en MaalCa, con acceso de <strong>${roleLabel}</strong>.
        </p>
        <div style="margin: 24px 0;">
          <a href="${signupUrl}" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Iniciar sesión →
          </a>
        </div>
        <p style="color: #525252; line-height: 1.6; font-size: 14px;">
          Entra con este mismo correo (creando una cuenta si aún no tienes una) y verás el negocio automáticamente.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #a3a3a3; font-size: 12px; margin: 0;">
          Recibes este correo porque alguien te invitó a un negocio en <a href="https://maalca.com" style="color: ${brandColor};">maalca.com</a>.
        </p>
      </div>
    </div>
  `;
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

  const brandColor = '#DC2626';
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
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">MaalCa</h1>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Te invitaron al equipo de MaalCa 🤝</h2>
            <p style="color: #525252; line-height: 1.6; font-size: 15px;">
              ${inviterLine} a formar parte del equipo interno de MaalCa, con acceso de <strong>${roleLabel}</strong> al panel de operaciones.
            </p>
            <div style="margin: 24px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Iniciar sesión →
              </a>
            </div>
            <p style="color: #525252; line-height: 1.6; font-size: 14px;">
              Entra con este mismo correo (creando una cuenta si aún no tienes una) y tendrás acceso automáticamente a /ops.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
            <p style="color: #a3a3a3; font-size: 12px; margin: 0;">
              Recibes este correo porque alguien te invitó al equipo interno en <a href="https://maalca.com" style="color: ${brandColor};">maalca.com</a>.
            </p>
          </div>
        </div>
      `,
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
  const brandColor = '#DC2626';
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

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: ${brandColor}; font-size: 24px; margin: 0;">MaalCa</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
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
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
        <p style="color: #a3a3a3; font-size: 12px; margin: 0;">
          Recibes este correo porque hiciste un pedido a través de <a href="https://maalca.com" style="color: ${brandColor};">maalca.com</a>.
        </p>
      </div>
    </div>
  `;
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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Cita confirmada — ${params.businessName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
          <p style="font-size: 15px; line-height: 1.6;">Tu cita en <strong>${params.businessName}</strong> quedó confirmada:</p>
          <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
            <strong>${params.serviceName}</strong><br/>
            ${dateFmt} · ${params.time}${staffLine}
          </p>
          <p style="font-size: 13px; color: #737373;">Si necesitas cambiarla o cancelarla, contacta directamente al negocio.</p>
        </div>
      `,
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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Recordatorio: tu cita hoy en ${params.businessName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 15px; line-height: 1.6;">${greeting},</p>
          <p style="font-size: 15px; line-height: 1.6;">Recordatorio de tu cita en <strong>${params.businessName}</strong>:</p>
          <p style="font-size: 15px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px;">
            <strong>${params.serviceName}</strong><br/>
            ${dateFmt} · ${params.time}${staffLine}
          </p>
          <p style="font-size: 13px; color: #737373;">Si necesitas cambiarla o cancelarla, contacta directamente al negocio.</p>
        </div>
      `,
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
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h2 style="font-size: 18px;">Nuevo mensaje desde maalca.com</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 8px; font-weight: bold; width: 120px;">Nombre:</td><td style="padding: 6px 8px;">${params.name}</td></tr>
            <tr><td style="padding: 6px 8px; font-weight: bold;">Correo:</td><td style="padding: 6px 8px;">${params.email}</td></tr>
            ${params.company ? `<tr><td style="padding: 6px 8px; font-weight: bold;">Negocio:</td><td style="padding: 6px 8px;">${params.company}</td></tr>` : ''}
            ${params.project ? `<tr><td style="padding: 6px 8px; font-weight: bold;">Tipo:</td><td style="padding: 6px 8px;">${params.project}</td></tr>` : ''}
          </table>
          <p style="font-size: 14px; line-height: 1.6; background: #fafafa; border-radius: 8px; padding: 12px 16px; margin-top: 16px; white-space: pre-line;">${params.message}</p>
        </div>
      `,
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
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 15px; line-height: 1.6;">Hola ${params.name},</p>
          <p style="font-size: 15px; line-height: 1.6;">Recibimos tu mensaje y te respondemos pronto, normalmente en menos de 24 horas.</p>
          <p style="font-size: 13px; color: #737373;">Si necesitas algo urgente, responde directamente a este correo.</p>
        </div>
      `,
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
