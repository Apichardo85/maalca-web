"use client";
import { Button } from "@/components/ui/buttons";
import { FormField } from "@/components/ui/FormField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { useFormValidation, EMAIL_PATTERN, NAME_PATTERN, type ValidationRules } from "@/hooks/useFormValidation";
import { useContactForm, type ContactFormData } from "@/hooks/useContactForm";
import { useTranslation } from "@/hooks/useSimpleLanguage";
export default function ContactoPage() {
  const { t } = useTranslation();
  // Form validation rules
  const validationRules: ValidationRules = {
    name: {
      required: true,
      minLength: 2,
      pattern: NAME_PATTERN,
      custom: (value: string) => {
        if (value.trim().split(' ').length < 2) {
          return t('validation.fullName');
        }
        return null;
      }
    },
    email: {
      required: true,
      pattern: EMAIL_PATTERN
    },
    company: {
      maxLength: 100
    },
    project: {
      required: true
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    }
  };
  // Project type options
  const projectOptions = [
    { value: "editorial", label: t('contactPage.project.editorial') },
    { value: "tech", label: t('contactPage.project.tech') },
    { value: "content", label: t('contactPage.project.content') },
    { value: "real-estate", label: t('contactPage.project.realEstate') },
    { value: "catering", label: t('contactPage.project.catering') },
    { value: "consulting", label: t('contactPage.project.consulting') },
    { value: "collaboration", label: t('contactPage.project.collaboration') },
    { value: "other", label: t('contactPage.project.other') }
  ];
  const initialData: ContactFormData = {
    name: "",
    email: "",
    company: "",
    message: "",
    project: ""
  };
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
  const {
    status,
    message,
    submitForm,
    isLoading,
    isSuccess,
    isError
  } = useContactForm('global');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields
    const isValid = validateAllFields();
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }
    // Submit form
    const result = await submitForm(formData);
    if (result.success) {
      resetForm();
    }
  };
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                {t('contactPage.hero.title')}
                <span className="block text-brand-primary">{t('contactPage.hero.subtitle')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {t('contactPage.hero.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-fade-in-left">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('contactPage.form.title')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <FormField
                    label={t('contactPage.form.name')}
                    name="name"
                    type="text"
                    required
                    placeholder={t('contactPage.form.namePlaceholder')}
                    autoComplete="name"
                    error={errors.name}
                    {...getFieldProps('name')}
                  />
                  {/* Email */}
                  <FormField
                    label={t('contactPage.form.email')}
                    name="email"
                    type="email"
                    required
                    placeholder={t('contactPage.form.emailPlaceholder')}
                    autoComplete="email"
                    error={errors.email}
                    {...getFieldProps('email')}
                  />
                  {/* Company */}
                  <FormField
                    label={t('contactPage.form.company')}
                    name="company"
                    type="text"
                    placeholder={t('contactPage.form.companyPlaceholder')}
                    autoComplete="organization"
                    error={errors.company}
                    {...getFieldProps('company')}
                  />
                  {/* Project Type */}
                  <SelectField
                    label={t('contactPage.form.projectType')}
                    name="project"
                    required
                    placeholder={t('contactPage.form.projectPlaceholder')}
                    options={projectOptions}
                    error={errors.project}
                    {...getFieldProps('project')}
                  />
                  {/* Message */}
                  <TextAreaField
                    label={t('contactPage.form.message')}
                    name="message"
                    required
                    rows={6}
                    maxLength={1000}
                    placeholder={t('contactPage.form.messagePlaceholder')}
                    error={errors.message}
                    {...getFieldProps('message')}
                  />
                  {/* Form Status Messages */}
                  {message && (
                    <div
                      className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
                        isSuccess
                          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                          : isError
                            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                            : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isSuccess && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isError && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="font-medium">{message}</p>
                    </div>
                  )}
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {t('contactPage.form.submitting')}
                      </div>
                    ) : (
                      t('contactPage.form.submit')
                    )}
                  </Button>
                  {/* Form Footer */}
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-400">
                      {t('contactPage.form.disclaimer')}
                    </p>
                    {/* Social Links */}
                    <div className="flex justify-center gap-3 pt-2">
                      {[
                        { name: "Instagram", href: "https://www.instagram.com/maalca_llc", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.21 8.78 2.2 12 2.2Zm0 1.8c-3.17 0-3.54 0-4.78.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.04C2.46 8.84 2.45 9.21 2.45 12s0 3.16.07 4.4c.05 1.07.23 1.65.38 2.04.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.04.38 1.24.06 1.61.07 4.78.07s3.54 0 4.78-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.04.06-1.24.07-1.61.07-4.4s0-3.16-.07-4.4c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.82-1.26 3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.04-.38C15.54 4 15.17 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/></svg> },
                        { name: "YouTube", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1C4.4 20 12 20 12 20s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z"/></svg> },
                        { name: "Spotify", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.5-1.1a.75.75 0 0 1-.35-1.45c4.6-1.1 8.5-.65 11.6 1.25a.75.75 0 0 1 .25 1.05Zm1.5-3.4a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.4 1.55.45.25.6.85.35 1.35Zm.15-3.5C15.3 8 8.7 7.75 5.05 8.9a1.13 1.13 0 1 1-.65-2.15c4.2-1.3 11.5-1 15.8 1.55a1.13 1.13 0 1 1-1.15 1.95Z"/></svg> },
                        { name: "LinkedIn", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.3c0-1.27-.03-2.9-1.77-2.9-1.77 0-2.04 1.37-2.04 2.8V21H9V9Z"/></svg> },
                      ].map((s) => (
                        <a
                          key={s.name}
                          href={s.href}
                          target={s.href.startsWith('http') ? '_blank' : undefined}
                          rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          aria-label={s.name}
                          className="w-10 h-10 rounded-full border border-border bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-primary hover:border-brand-primary transition-all duration-200 hover:scale-110"
                        >
                          {s.svg}
                        </a>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* Contact Information */}
            <div className="animate-fade-in-right space-y-8">
              {/* Company Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('contactPage.info.title')}
                </h3>
                <div className="space-y-6">
                  {/* Company */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('contactPage.info.company')}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{t('contactPage.info.ecosystem')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('contactPage.info.location')}</p>
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('contactPage.info.emailLabel')}</h4>
                      <a href="mailto:hola@maalca.com" className="text-brand-primary hover:underline">
                        hola@maalca.com
                      </a>
                    </div>
                  </div>
                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('contactPage.info.responseTime')}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{t('contactPage.info.responseTimeValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Philosophy Quote */}
              <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
                <blockquote className="text-gray-900 dark:text-white">
                  <p className="text-lg font-medium italic mb-4">
                    &ldquo;{t('contactPage.quote.text')}&rdquo;
                  </p>
                  <cite className="text-sm text-gray-300">
                    — {t('contactPage.quote.author')}
                  </cite>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
