import { useState } from 'react';
import { useAnalytics } from './useAnalytics';
import { useTranslation } from './useSimpleLanguage';

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  project: string;
  message: string;
  [key: string]: string;
}

export interface ContactFormResult {
  success: boolean;
  message: string;
}

export const useContactForm = (project: string = 'global') => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { trackEvent } = useAnalytics(project);

  const submitForm = async (formData: ContactFormData): Promise<ContactFormResult> => {
    setStatus('loading');

    try {
      const result = await submitToApi(formData, project, t);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        
        // Track successful form submission
        trackEvent({
          action: 'contact_form_submit',
          category: 'conversion',
          label: `${formData.project || 'general'}_inquiry`,
          project: project
        });
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
        
      } else {
        setStatus('error');
        setMessage(result.message);
        
        // Track form submission error
        trackEvent({
          action: 'contact_form_error',
          category: 'error',
          label: 'submission_failed',
          project: project
        });
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      }
      
      return result;
      
    } catch (error) {
      console.error('Form submission error:', error);

      const errorMessage = t('form.error.unexpected');
      setStatus('error');
      setMessage(errorMessage);

      trackEvent({
        action: 'contact_form_error',
        category: 'error',
        label: 'network_error',
        project: project
      });

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  return {
    status,
    message,
    submitForm,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
};

// Envío real — pega a /api/contact, que manda el email por Resend (ver resend-service.ts::
// sendContactFormEmail). Antes de esto, este archivo solo simulaba éxito con localStorage y
// el mensaje nunca llegaba a nadie.
async function submitToApi(
  formData: ContactFormData,
  project: string,
  t: (key: string) => string
): Promise<ContactFormResult> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        project: formData.project || project,
        message: formData.message,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.error || t('form.error.submission'),
      };
    }

    return {
      success: true,
      message: data?.message || t('form.success.message1'),
    };
  } catch {
    return {
      success: false,
      message: t('form.error.unexpected'),
    };
  }
}