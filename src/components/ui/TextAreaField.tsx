import { forwardRef } from 'react';
interface TextAreaFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}
export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({
  label,
  name,
  error,
  required,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  rows = 4,
  maxLength,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  const hasValue = !!value;
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;
  const isOverLimit = maxLength && characterCount > maxLength;
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-text-primary"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {maxLength && (
          <span
            className={`text-xs transition-colors duration-200 ${
              isOverLimit
                ? 'text-red-500 font-bold'
                : isNearLimit
                  ? 'text-yellow-500'
                  : 'text-text-muted'
            }`}
          >
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 bg-surface-muted border rounded-xl
            focus:outline-none focus:ring-2 transition-all duration-200 text-text-primary
            resize-vertical min-h-[120px] max-h-[300px]
            ${hasError
              ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
              : hasValue && !isOverLimit
                ? 'border-green-500/50 focus:ring-brand-primary focus:border-brand-primary'
                : isOverLimit
                  ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-border focus:ring-brand-primary focus:border-brand-primary'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />
        {/* Success checkmark */}
        {hasValue && !hasError && !isOverLimit && (
          <div className="absolute right-3 top-3 transition-opacity duration-200">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {/* Error icon */}
        {(hasError || isOverLimit) && (
          <div className="absolute right-3 top-3 transition-opacity duration-200">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {/* Error message */}
      {(hasError || isOverLimit) && (
        <div
          id={`${name}-error`}
          className="mt-2"
        >
          <p className="text-sm text-red-500 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error || (isOverLimit && `El texto excede el límite de ${maxLength} caracteres`)}
          </p>
        </div>
      )}
    </div>
  );
});
TextAreaField.displayName = 'TextAreaField';
