// Newsletter configuration and utilities

export interface NewsletterConfig {
  formspreeId?: string;
  source: string;
  successMessage?: string;
  errorMessage?: string;
}

export const defaultNewsletterConfig: NewsletterConfig = {
  source: 'MaalCa Newsletter',
  successMessage: '¡Gracias! Te has suscrito exitosamente.',
  errorMessage: 'Hubo un error. Por favor intenta de nuevo.'
};

// Project-specific configurations
export const newsletterConfigs = {
  ciriwhispers: {
    source: 'CiriWhispers Newsletter',
    successMessage: '¡Gracias! Te has suscrito a las cartas de CiriWhispers.',
    formspreeId: 'xwperrry' // Replace with actual Formspree form ID
  },
  editorial: {
    source: 'Editorial MaalCa',
    successMessage: '¡Gracias! Recibirás nuestras últimas publicaciones.',
    formspreeId: 'xwperrry' // Replace with actual Formspree form ID
  },
  ecosystem: {
    source: 'MaalCa Ecosystem',
    successMessage: '¡Gracias! Te mantendremos al día sobre nuestros proyectos.',
    formspreeId: 'xwperrry' // Replace with actual Formspree form ID
  }
} as const;

export type NewsletterSource = keyof typeof newsletterConfigs;

export async function submitNewsletter(
  email: string, 
  config: NewsletterConfig = defaultNewsletterConfig
): Promise<{ success: boolean; message: string }> {
  
  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      message: 'Por favor ingresa un email válido'
    };
  }

  try {
    if (config.formspreeId) {
      // Real Formspree submission
      const response = await fetch(`https://formspree.io/f/${config.formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: config.source,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: config.successMessage || defaultNewsletterConfig.successMessage!
        };
      } else {
        throw new Error('Formspree submission failed');
      }
    } else {
      // Demo mode - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        // Store locally for demo
        const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
        subscribers.push({
          email,
          source: config.source,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        
        return {
          success: true,
          message: config.successMessage || defaultNewsletterConfig.successMessage!
        };
      } else {
        throw new Error('Simulated error');
      }
    }
  } catch (error) {
    return {
      success: false,
      message: config.errorMessage || defaultNewsletterConfig.errorMessage!
    };
  }
}

// Utility to get stored subscribers (demo mode only)
export function getStoredSubscribers(): Array<{
  email: string;
  source: string;
  timestamp: string;
}> {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
}