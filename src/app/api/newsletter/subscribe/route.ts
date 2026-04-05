import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/services/resend-service'

/**
 * Newsletter Subscription API
 *
 * POST /api/newsletter/subscribe
 * Body: { email: string, source?: string }
 *
 * Flow: validate → Resend (contact + welcome email) → n8n (async) → response
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'ecosystem' } = body

    // Validate
    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Resend: add contact + send welcome email
    const resendResult = await addSubscriber(normalizedEmail, source)

    console.log('[Newsletter] Subscription:', {
      email: normalizedEmail,
      source,
      resend: resendResult,
      timestamp: new Date().toISOString(),
    })

    // 2. Forward to n8n (non-blocking)
    import('@/lib/services/n8n-service')
      .then(({ n8nService }) => {
        n8nService
          .sendNewsletterSubscription('maalca', {
            email: normalizedEmail,
            source,
          })
          .catch((err: unknown) => {
            console.error('[Newsletter] n8n forwarding failed:', err)
          })
      })
      .catch(() => {
        // n8n service not available — that's fine
      })

    return NextResponse.json({
      message: '¡Suscripción exitosa! Revisa tu email.',
      email: normalizedEmail,
    })
  } catch (error) {
    console.error('[Newsletter] Subscription error:', error)
    return NextResponse.json(
      { error: 'Error al procesar suscripción. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// CORS preflight
export async function OPTIONS() {
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
  )
}
