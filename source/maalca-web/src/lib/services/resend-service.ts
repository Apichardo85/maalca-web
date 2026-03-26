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
