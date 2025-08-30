"use client";

import { useState } from "react";
import { Button } from "./buttons/button";
import { submitNewsletter, newsletterConfigs, type NewsletterSource } from "@/lib/utils/newsletter";
import { trackNewsletterSignup } from "@/hooks/useAnalytics";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  className?: string;
  source?: NewsletterSource;
}

export default function NewsletterSignup({ 
  title = "Suscríbete a mis Cartas",
  description = "Recibe nuevas cartas y reflexiones directamente en tu correo, como secretos susurrados entre amigos de alma.",
  className = "",
  source = "ciriwhispers"
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setStatus('loading');
    
    const config = newsletterConfigs[source];
    const result = await submitNewsletter(email, config);
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setEmail('');
      
      // Track successful newsletter signup
      trackNewsletterSignup(config.source, source);
      
      // Reset message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } else {
      setStatus('error');
      setMessage(result.message);
      
      // Reset error after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-red-800/20 ${className}`}>
      <h3 className="font-serif text-xl font-bold text-stone-100 mb-4">
        {title}
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        {description}
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-3 mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={status === 'loading'}
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-stone-100 disabled:opacity-50"
            required
          />
          <Button
            type="submit"
            variant="primary"
            disabled={status === 'loading'}
            className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100 disabled:opacity-50"
          >
            {status === 'loading' ? 'Enviando...' : 'Suscribirse'}
          </Button>
        </div>
        
        {/* Status Messages */}
        {message && (
          <div className={`text-sm text-center transition-opacity duration-300 ${
            status === 'success' 
              ? 'text-green-400' 
              : status === 'error' 
                ? 'text-red-400' 
                : 'text-slate-400'
          }`}>
            {message}
          </div>
        )}
      </form>

      <p className="text-xs text-slate-500 text-center mt-3">
        No spam. Solo contenido de calidad. Puedes cancelar en cualquier momento.
      </p>
    </div>
  );
}