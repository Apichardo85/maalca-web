"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface PropertyNewsletterSubscriptionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
  onSubscribe?: (subscriptionData: NewsletterSubscriptionData) => Promise<void>;
}

interface NewsletterSubscriptionData {
  email: string;
  name?: string;
  interests: string[];
  frequency: string;
  source: string;
}

const interestOptions = [
  { value: 'luxury-villas', label: 'Luxury Villas' },
  { value: 'penthouses', label: 'Penthouses' },
  { value: 'private-estates', label: 'Private Estates' },
  { value: 'marina-condos', label: 'Marina Condos' },
  { value: 'eco-retreats', label: 'Eco Retreats' },
  { value: 'investment-opportunities', label: 'Investment Opportunities' },
  { value: 'new-developments', label: 'New Developments' },
  { value: 'exclusive-deals', label: 'Exclusive Deals' }
];

const frequencyOptions = [
  { value: 'immediate', label: 'Immediate - As soon as new properties are listed' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
  { value: 'monthly', label: 'Monthly Newsletter' }
];

export default function PropertyNewsletterSubscription({
  title = "Exclusive Property Updates",
  description = "Receive notifications about new listings and exclusive investment opportunities",
  buttonText = "Subscribe",
  className = "",
  onSubscribe
}: PropertyNewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>(['investment-opportunities', 'exclusive-deals']);
  const [frequency, setFrequency] = useState('weekly');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{email?: string; name?: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {email?: string; name?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (isExpanded && !name.trim()) {
      newErrors.name = 'Name is required for personalized updates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickSubscribe = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const subscriptionData: NewsletterSubscriptionData = {
        email,
        interests: ['investment-opportunities', 'exclusive-deals'],
        frequency: 'weekly',
        source: 'maalca-properties-quick'
      };

      if (onSubscribe) {
        await onSubscribe(subscriptionData);
      } else {
        console.log('Quick newsletter subscription:', subscriptionData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      }

      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        setEmail('');
      }, 3000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvancedSubscribe = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const subscriptionData: NewsletterSubscriptionData = {
        email,
        name,
        interests,
        frequency,
        source: 'maalca-properties-advanced'
      };

      if (onSubscribe) {
        await onSubscribe(subscriptionData);
      } else {
        console.log('Advanced newsletter subscription:', subscriptionData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      }

      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        setEmail('');
        setName('');
        setIsExpanded(false);
      }, 3000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className={`bg-white rounded-3xl p-8 shadow-lg border border-slate-200 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">
          {title}
        </h3>
        <p className="text-slate-600">
          {description}
        </p>
      </div>

      {/* Quick Subscribe Form */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({...prev, email: undefined}));
                }}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={handleQuickSubscribe}
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                buttonText
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              ⚙️ Customize preferences
            </button>
          </div>
        </motion.div>
      )}

      {/* Advanced Subscribe Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({...prev, email: undefined}));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({...prev, name: undefined}));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="Your Name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Property Interests
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {interestOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      interests.includes(option.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={interests.includes(option.value)}
                      onChange={() => toggleInterest(option.value)}
                      className="text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Email Frequency
              </label>
              <div className="space-y-2">
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      frequency === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsExpanded(false);
                  setErrors({});
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back to Simple
              </Button>
              <Button
                variant="primary"
                onClick={handleAdvancedSubscribe}
                disabled={isSubmitting || submitStatus === 'success' || interests.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe with Preferences'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="text-green-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Successfully Subscribed!</h4>
                <p className="text-green-700 text-sm">You'll receive exclusive property updates based on your preferences.</p>
              </div>
            </div>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-red-900">Subscription Failed</h4>
                <p className="text-red-700 text-sm">There was an error processing your subscription. Please try again.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Notice */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          By subscribing, you agree to receive marketing emails from MaalCa Properties. 
          You can unsubscribe at any time. We respect your privacy and will never share your information.
        </p>
      </div>
    </div>
  );
}