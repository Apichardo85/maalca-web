// Newsletter configuration and utilities

export interface NewsletterConfig {
  source: string
  successMessage: string
  errorMessage?: string
}

export const defaultNewsletterConfig: NewsletterConfig = {
  source: 'ecosystem',
  successMessage: '¡Gracias! Te has suscrito exitosamente.',
  errorMessage: 'Hubo un error. Por favor intenta de nuevo.',
}

// Project-specific configurations
export const newsletterConfigs = {
  ciriwhispers: {
    source: 'ciriwhispers',
    successMessage: '¡Gracias! Te has suscrito a las cartas de CiriWhispers.',
  },
  editorial: {
    source: 'editorial',
    successMessage: '¡Gracias! Recibirás nuestras últimas publicaciones.',
  },
  ecosystem: {
    source: 'ecosystem',
    successMessage: '¡Gracias! Te mantendremos al día sobre nuestros proyectos.',
  },
  properties: {
    source: 'properties',
    successMessage: '¡Gracias! Te enviaremos las mejores oportunidades.',
  },
  'dr-pichardo': {
    source: 'dr-pichardo',
    successMessage: '¡Suscripción confirmada! Recibirás actualizaciones.',
  },
} as const

export type NewsletterSource = keyof typeof newsletterConfigs

/**
 * Submit newsletter subscription to our API route.
 * Works for all sources — Resend handles welcome emails server-side.
 */
export async function submitNewsletter(
  email: string,
  config: NewsletterConfig = defaultNewsletterConfig
): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Por favor ingresa un email válido' }
  }

  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: config.source }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: config.successMessage || defaultNewsletterConfig.successMessage,
      }
    }

    // 409 = already subscribed
    if (response.status === 409) {
      return { success: false, message: data.error || 'Este email ya está suscrito.' }
    }

    return {
      success: false,
      message: data.error || config.errorMessage || defaultNewsletterConfig.errorMessage!,
    }
  } catch {
    return {
      success: false,
      message: config.errorMessage || defaultNewsletterConfig.errorMessage!,
    }
  }
}
