"use client";

import { useEffect } from "react";

// Google Analytics 4 Configuration
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'GA_MEASUREMENT_ID';

// Event types for better type safety
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  project?: 'ciriwhispers' | 'editorial' | 'catering' | 'ecosystem' | 'global';
}

// Predefined events for consistency
export const ANALYTICS_EVENTS = {
  // Newsletter events
  NEWSLETTER_SIGNUP: {
    action: 'newsletter_signup',
    category: 'engagement'
  },
  
  // Social sharing events  
  SOCIAL_SHARE: {
    action: 'share',
    category: 'social'
  },
  
  // Content interaction
  BOOK_EXPAND: {
    action: 'expand_book',
    category: 'content'
  },
  
  CHAPTER_READ: {
    action: 'read_chapter', 
    category: 'content'
  },
  
  ARTICLE_CLICK: {
    action: 'click_article',
    category: 'content'
  },
  
  // Navigation
  PAGE_VIEW: {
    action: 'page_view',
    category: 'navigation'
  },
  
  EXTERNAL_LINK: {
    action: 'click_external',
    category: 'navigation'
  },
  
  // Conversion goals
  AMAZON_CLICK: {
    action: 'amazon_click',
    category: 'conversion'
  },
  
  CONTACT_FORM: {
    action: 'contact_form',
    category: 'conversion'
  }
} as const;

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return;
  
  // Load gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);
  
  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        'custom_project': 'project'
      }
    });
  `;
  document.head.appendChild(script2);
};

// Track custom events
export const trackEvent = ({
  action,
  category,
  label,
  value,
  project = 'global'
}: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log(`[Analytics] ${action} - ${category} - ${label} (${project})`);
    return;
  }
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    project: project,
    custom_project: project
  });
};

// Track page views with project context
export const trackPageView = (page: string, project?: string) => {
  trackEvent({
    ...ANALYTICS_EVENTS.PAGE_VIEW,
    label: page,
    project: project as any
  });
};

// Convenience functions for common events
export const trackNewsletterSignup = (source: string, project?: string) => {
  trackEvent({
    ...ANALYTICS_EVENTS.NEWSLETTER_SIGNUP,
    label: source,
    project: project as any
  });
};

export const trackSocialShare = (platform: string, content: string, project?: string) => {
  trackEvent({
    ...ANALYTICS_EVENTS.SOCIAL_SHARE,
    label: `${platform}:${content}`,
    project: project as any
  });
};

export const trackBookInteraction = (bookId: string, action: 'expand' | 'chapter_read' | 'amazon_click' | 'reader_open' | 'reader_close') => {
  const eventMap = {
    expand: ANALYTICS_EVENTS.BOOK_EXPAND,
    chapter_read: ANALYTICS_EVENTS.CHAPTER_READ,
    amazon_click: ANALYTICS_EVENTS.AMAZON_CLICK,
    reader_open: { action: 'reader_open', category: 'engagement' },
    reader_close: { action: 'reader_close', category: 'engagement' }
  };
  
  trackEvent({
    ...eventMap[action],
    label: bookId,
    project: 'ciriwhispers'
  });
};

export const trackArticleClick = (articleId: string) => {
  trackEvent({
    ...ANALYTICS_EVENTS.ARTICLE_CLICK,
    label: articleId,
    project: 'editorial'
  });
};

export const trackExternalLink = (url: string, context: string) => {
  trackEvent({
    ...ANALYTICS_EVENTS.EXTERNAL_LINK,
    label: `${context}:${url}`
  });
};

// Custom hook for analytics initialization
export const useAnalytics = (project?: string) => {
  useEffect(() => {
    // Initialize analytics on first load
    if (typeof window !== 'undefined' && !window.gtag) {
      initializeAnalytics();
    }
    
    // Track page view with project context
    if (project) {
      trackPageView(window.location.pathname, project);
    }
  }, [project]);

  return {
    trackEvent,
    trackPageView,
    trackNewsletterSignup,
    trackSocialShare,
    trackBookInteraction,
    trackArticleClick,
    trackExternalLink
  };
};

// Global gtag type declaration
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}