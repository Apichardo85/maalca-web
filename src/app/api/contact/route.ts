import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/services/resend-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de contacto general — usado por /contacto (via useContactForm) y por el form de
 * la home. Antes de esto, ambos formularios "simulaban" el envío en el navegador (localStorage)
 * y nunca llegaban a ningún lado. Ver resend-service.ts::sendContactFormEmail.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : null;
  const project = typeof body.project === 'string' ? body.project.trim() : null;
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'El correo no es válido.' }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'El mensaje es muy corto.' }, { status: 400 });
  }

  try {
    const result = await sendContactFormEmail({ name, email, company, project, message });
    if (!result.notified) {
      // No pudimos avisarle a MaalCa — esto sí es un fallo real, no lo escondemos como éxito.
      return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }, { status: 502 });
    }
    return NextResponse.json({ message: '¡Mensaje enviado! Te respondemos pronto.' });
  } catch (err) {
    console.error('[Contact] submission error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' }, { status: 500 });
  }
}
