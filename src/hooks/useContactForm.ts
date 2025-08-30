import { useState } from 'react';
import { useAnalytics } from './useAnalytics';

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  project: string;
  message: string;
}

export interface ContactFormResult {
  success: boolean;
  message: string;
}

export const useContactForm = (project: string = 'global') => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { trackEvent } = useAnalytics(project);

  const submitForm = async (formData: ContactFormData): Promise<ContactFormResult> => {
    setStatus('loading');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In demo mode, we'll simulate success
      // In production, this would be replaced with actual API call
      const result = await simulateFormSubmission(formData);
      
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
      
      const errorMessage = 'Error inesperado. Por favor intenta nuevamente.';
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

// Demo mode form submission simulator
async function simulateFormSubmission(formData: ContactFormData): Promise<ContactFormResult> {
  // Store in localStorage for demo purposes
  const timestamp = new Date().toISOString();
  const submissionData = {
    ...formData,
    timestamp,
    id: Math.random().toString(36).substr(2, 9)
  };
  
  // Store in localStorage (simulate database)
  const existingSubmissions = JSON.parse(localStorage.getItem('contact_form_submissions') || '[]');
  existingSubmissions.push(submissionData);
  localStorage.setItem('contact_form_submissions', JSON.stringify(existingSubmissions));
  
  console.log('📧 Formulario de contacto recibido (DEMO MODE):', submissionData);
  
  // Simulate different response scenarios based on email
  if (formData.email.includes('error')) {
    return {
      success: false,
      message: 'Error en el envío. Por favor verifica tu email e intenta nuevamente.'
    };
  }
  
  if (formData.email.includes('spam')) {
    return {
      success: false,
      message: 'Su mensaje ha sido marcado como spam. Por favor contacte directamente.'
    };
  }
  
  // Default success response
  const responses = [
    '¡Gracias por tu mensaje! Te contactaremos en las próximas 24-48 horas.',
    '¡Mensaje recibido! Nuestro equipo revisará tu solicitud y te responderá pronto.',
    '¡Perfecto! Hemos recibido tu consulta. Te escribiremos a la brevedad.',
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    success: true,
    message: randomResponse
  };
}

// Utility function to get stored submissions (for demo purposes)
export const getStoredSubmissions = (): ContactFormData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('contact_form_submissions') || '[]');
  } catch {
    return [];
  }
};