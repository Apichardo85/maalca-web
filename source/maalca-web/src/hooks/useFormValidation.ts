import { useState, useCallback } from 'react';
import { useTranslation } from './useSimpleLanguage';

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules
) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      return t('validation.required');
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') return '';

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return t('validation.minLength').replace('{min}', rules.minLength.toString());
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return t('validation.maxLength').replace('{max}', rules.maxLength.toString());
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      if (name === 'email') {
        return t('validation.emailInvalid');
      }
      return t('validation.formatInvalid');
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [validationRules, t]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName] || '';
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid;
  }, [formData, validationRules, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  const getFieldProps = useCallback((name: string) => ({
    name,
    value: formData[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  }), [formData, handleChange, handleBlur, errors]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).every(key => !errors[key]),
    hasErrors: Object.keys(errors).some(key => errors[key])
  };
};

// Common validation rules
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[\+]?[\d\s\-\(\)]{10,}$/;
export const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s]{2,}$/;