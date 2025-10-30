import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter Subscription API
 *
 * POST /api/newsletter/subscribe
 * Body: { email: string }
 *
 * Features:
 * - Email validation
 * - Duplicate check (future: DB)
 * - Welcome email via Resend (when configured)
 * - Rate limiting (future)
 */

interface SubscribeRequest {
  email: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SubscribeRequest = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // TODO: Check if email already exists in database
    // const exists = await db.newsletter.findUnique({ where: { email: normalizedEmail } });
    // if (exists) {
    //   return NextResponse.json(
    //     { error: 'Este email ya está suscrito' },
    //     { status: 409 }
    //   );
    // }

    // TODO: Save to database
    // await db.newsletter.create({
    //   data: {
    //     email: normalizedEmail,
    //     subscribedAt: new Date(),
    //     source: 'editorial',
    //     status: 'active'
    //   }
    // });

    // Log subscription (temporary until DB is set up)
    console.log('[Newsletter] New subscription:', {
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      source: 'editorial',
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // TODO: Send welcome email via Resend
    // if (process.env.RESEND_API_KEY) {
    //   const { Resend } = await import('resend');
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //
    //   await resend.emails.send({
    //     from: 'Editorial MaalCa <editorial@maalca.com>',
    //     to: normalizedEmail,
    //     subject: '¡Bienvenido a Editorial MaalCa!',
    //     html: `
    //       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    //         <h1 style="color: #DC2626;">¡Bienvenido a Editorial MaalCa!</h1>
    //         <p>Gracias por suscribirte a nuestro newsletter.</p>
    //         <p>Recibirás nuestros artículos más profundos sobre filosofía, cultura y sociedad contemporánea directamente en tu correo.</p>
    //         <p style="margin-top: 30px;">
    //           <strong>— Editorial MaalCa</strong><br/>
    //           <em>Filosofía desde el Caribe</em>
    //         </p>
    //       </div>
    //     `
    //   });
    // }

    // Success response
    return NextResponse.json(
      {
        message: '¡Suscripción exitosa! Revisa tu email.',
        email: normalizedEmail
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Newsletter] Subscription error:', error);

    return NextResponse.json(
      { error: 'Error al procesar suscripción. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
