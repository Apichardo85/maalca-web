# 📞 Contact Forms Implementation Guide

## Overview

Enhanced contact form system with client-side validation, real-time error feedback, and improved UX for the MaalCa ecosystem.

## Features

- ✅ **Client-side validation** with real-time feedback
- ✅ **Custom form components** with animated error states
- ✅ **Form submission handling** with success/error states
- ✅ **Analytics integration** for form tracking
- ✅ **Accessibility support** with ARIA labels and focus management
- ✅ **Demo mode** with localStorage simulation
- ✅ **TypeScript support** with full type safety

## Components

### 1. FormField Component
Enhanced input field with validation states:

```tsx
<FormField
  label="Nombre"
  name="name"
  type="text"
  required
  placeholder="Tu nombre completo"
  error={errors.name}
  value={formData.name}
  onChange={handleChange}
  onBlur={handleBlur}
/>
```

**Features:**
- Visual success/error indicators
- Animated error messages
- AutoComplete support
- ARIA accessibility

### 2. TextAreaField Component
Enhanced textarea with character counting:

```tsx
<TextAreaField
  label="Mensaje"
  name="message"
  required
  maxLength={1000}
  error={errors.message}
  value={formData.message}
  onChange={handleChange}
/>
```

**Features:**
- Character count with warnings
- Resizable with min/max height
- Visual feedback for character limits

### 3. SelectField Component
Enhanced select dropdown with validation:

```tsx
<SelectField
  label="Tipo de Proyecto"
  name="project"
  required
  options={projectOptions}
  error={errors.project}
  value={formData.project}
  onChange={handleChange}
/>
```

**Features:**
- Custom styled dropdown arrow
- Validation states
- Disabled options support

## Hooks

### 1. useFormValidation Hook
Comprehensive form validation management:

```tsx
const {
  formData,
  errors,
  touched,
  handleChange,
  handleBlur,
  validateAllFields,
  resetForm,
  getFieldProps
} = useFormValidation(initialData, validationRules);
```

**Validation Rules:**
```tsx
const validationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    pattern: NAME_PATTERN,
    custom: (value: string) => {
      if (value.trim().split(' ').length < 2) {
        return 'Por favor ingresa tu nombre completo';
      }
      return null;
    }
  },
  email: {
    required: true,
    pattern: EMAIL_PATTERN
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000
  }
};
```

### 2. useContactForm Hook
Form submission handling with analytics:

```tsx
const {
  status,
  message,
  submitForm,
  isLoading,
  isSuccess,
  isError
} = useContactForm('global');
```

**Features:**
- Demo mode simulation
- Analytics event tracking
- Auto-reset on success/error
- localStorage persistence for demo

## Form Implementation

### Main Contact Form (/contacto)
Full-featured contact form with all validations:

**Location:** `src/app/contacto/page.tsx`

**Fields:**
- Name (required, full name validation)
- Email (required, email format validation)
- Company (optional, max 100 chars)
- Project Type (required, dropdown selection)
- Message (required, 10-1000 chars)

**Validations:**
- Real-time field validation
- Form-level validation on submit
- Focus management for errors
- Animated error/success states

### Quick Contact (CTA Buttons)
Simplified contact initiation:

**Location:** `src/components/sections/CTASection.tsx`

**Actions:**
- "Solicitar Cotización" → `/contacto`
- "Ver Portafolio" → `/galeria`

## Demo Mode Features

### Form Submission Simulation
```typescript
// Different responses based on email patterns
if (formData.email.includes('error')) {
  return { success: false, message: 'Error message' };
}

if (formData.email.includes('spam')) {
  return { success: false, message: 'Spam detected' };
}

// Random success messages
const responses = [
  '¡Gracias por tu mensaje! Te contactaremos en las próximas 24-48 horas.',
  '¡Mensaje recibido! Nuestro equipo revisará tu solicitud...',
  '¡Perfecto! Hemos recibido tu consulta...'
];
```

### LocalStorage Integration
```typescript
// Stores form submissions for demo purposes
const submissionData = {
  ...formData,
  timestamp: new Date().toISOString(),
  id: Math.random().toString(36).substr(2, 9)
};

localStorage.setItem('contact_form_submissions', JSON.stringify(submissions));
```

## Analytics Tracking

### Form Events
```typescript
// Form submission success
trackEvent({
  action: 'contact_form_submit',
  category: 'conversion',
  label: `${formData.project}_inquiry`,
  project: 'global'
});

// Form validation errors
trackEvent({
  action: 'contact_form_error',
  category: 'error',
  label: 'validation_failed',
  project: 'global'
});
```

## Accessibility Features

### ARIA Support
- `aria-invalid` for error states
- `aria-describedby` linking to error messages
- Proper label associations
- Focus management

### Keyboard Navigation
- Tab order optimization
- Focus on first error field
- Enter key form submission
- Escape key handling

### Screen Reader Support
- Descriptive labels
- Error message announcements
- Form status updates
- Progress indicators

## Validation Patterns

### Built-in Patterns
```typescript
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
export const PHONE_PATTERN = /^[\+]?[\d\s\-\(\)]{10,}$/;
```

### Custom Validations
- Full name requirement (minimum 2 words)
- Professional email domain suggestions
- Business context validation
- Message quality checks

## Error Handling

### Client-side Errors
- Field validation errors
- Form submission errors
- Network connectivity issues
- Browser compatibility fallbacks

### User Feedback
- Animated error messages
- Success confirmation
- Progress indicators
- Retry mechanisms

## Future Enhancements

### Production Integration
- [ ] Replace localStorage with actual API
- [ ] Add Formspree/EmailJS integration
- [ ] Implement rate limiting
- [ ] Add captcha protection

### Advanced Features
- [ ] File upload support
- [ ] Multi-step forms
- [ ] Save draft functionality
- [ ] Form analytics dashboard

### Accessibility Improvements
- [ ] High contrast mode support
- [ ] Voice input compatibility
- [ ] Multi-language validation messages
- [ ] Enhanced screen reader support

## Testing

### Manual Testing Scenarios
1. **Happy Path:** Valid form submission with all fields
2. **Validation Errors:** Empty required fields, invalid email, long message
3. **Network Simulation:** Error emails (email containing "error")
4. **Success Variations:** Different email addresses for random responses
5. **Accessibility:** Tab navigation, screen reader testing

### Test Data
```typescript
// Success test
{
  name: "Juan Pérez García",
  email: "juan@empresa.com",
  company: "Mi Empresa",
  project: "editorial",
  message: "Necesito ayuda con mi proyecto editorial..."
}

// Error test  
{
  name: "Test User",
  email: "error@test.com", // Triggers error response
  project: "tech",
  message: "Testing error handling"
}
```

## File Structure
```
src/
├── components/ui/
│   ├── FormField.tsx           # Enhanced input component
│   ├── TextAreaField.tsx       # Enhanced textarea component
│   ├── SelectField.tsx         # Enhanced select component
│   └── index.ts               # Component exports
├── hooks/
│   ├── useFormValidation.ts    # Form validation logic
│   └── useContactForm.ts       # Form submission handling
└── app/contacto/
    └── page.tsx               # Main contact form page
```

---

**Status:** ✅ Implemented and functional  
**Demo Mode:** LocalStorage simulation with console logging  
**Production Ready:** Form validation and UX complete, awaiting backend integration  

**Test URL:** http://localhost:3001/contacto

**Last Updated:** December 2024