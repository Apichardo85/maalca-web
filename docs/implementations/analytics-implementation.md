# 📊 Google Analytics Implementation Guide

## Overview

Enhanced Google Analytics 4 tracking system implemented across all MaalCa projects with custom event tracking, cross-project analytics, and conversion goals.

## Features

- ✅ **Google Analytics 4** integration
- ✅ **Custom Event Tracking** for all interactions
- ✅ **Cross-Project Analytics** with project-specific metrics
- ✅ **Conversion Goals** tracking
- ✅ **Demo Mode** with console logging
- ✅ **Type-Safe Events** with predefined constants

## Quick Start

### Environment Setup

1. **Create GA4 Property:**
   - Go to https://analytics.google.com/
   - Create new GA4 property
   - Copy Measurement ID (format: G-XXXXXXXXXX)

2. **Configure Environment:**
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Edit with your Measurement ID
   NEXT_PUBLIC_GA_TRACKING_ID=G-YOUR-ACTUAL-ID
   ```

### Basic Usage

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";

function MyComponent() {
  const { trackEvent, trackSocialShare } = useAnalytics('ciriwhispers');
  
  const handleShare = (platform: string) => {
    trackSocialShare(platform, 'My Article', 'ciriwhispers');
  };
  
  return <button onClick={() => handleShare('twitter')}>Share</button>;
}
```

## Tracked Events

### 📧 Newsletter Events
```typescript
// Automatic tracking in NewsletterSignup component
trackNewsletterSignup('CiriWhispers Newsletter', 'ciriwhispers');

// GA4 Event Data:
// - Event: newsletter_signup
// - Category: engagement  
// - Label: source name
// - Project: ciriwhispers/editorial/etc
```

### 🔗 Social Sharing Events  
```typescript
// Automatic tracking in SocialShare component
trackSocialShare('twitter', 'Article Title', 'editorial');

// GA4 Event Data:
// - Event: share
// - Category: social
// - Label: platform:content
// - Project: editorial/ciriwhispers/etc
```

### 📚 Content Interaction Events
```typescript
// Book interactions (CiriWhispers)
trackBookInteraction('amaranta', 'expand');      // User expands book
trackBookInteraction('amaranta', 'chapter_read'); // Reads first chapter
trackBookInteraction('amaranta', 'amazon_click'); // Clicks buy button

// Article interactions (Editorial)
trackArticleClick('filosofia-calle-2024');
```

### 🎯 Conversion Events
```typescript
// External link clicks
trackExternalLink('https://amazon.com/book', 'book_purchase');

// Contact form submissions
trackEvent({
  action: 'contact_form',
  category: 'conversion',
  label: 'catering_inquiry'
});
```

## Implementation by Project

### CiriWhispers Implementation

```tsx
// src/app/ciriwhispers/page.tsx
import { useAnalytics } from "@/hooks/useAnalytics";

function CiriWhispersContent() {
  const { trackBookInteraction } = useAnalytics('ciriwhispers');
  
  const handleBookExpand = (bookId: string) => {
    setSelectedBook(bookId);
    trackBookInteraction(bookId, 'expand');
  };
  
  return (
    // Component with tracked interactions
    <div onClick={() => handleBookExpand('amaranta')}>
      // Book content
    </div>
  );
}
```

**Tracked Events:**
- ✅ Page views with project context
- ✅ Book expansions  
- ✅ Chapter reads
- ✅ Amazon link clicks
- ✅ Social sharing
- ✅ Newsletter signups

### Editorial MaalCa Implementation

```tsx
// src/app/editorial/page.tsx  
import { useAnalytics } from "@/hooks/useAnalytics";

function EditorialPage() {
  const { trackArticleClick } = useAnalytics('editorial');
  
  return (
    <article onClick={() => trackArticleClick(article.id)}>
      // Article content
    </article>
  );
}
```

**Tracked Events:**
- ✅ Page views with project context
- ✅ Article clicks
- ✅ Social sharing per article
- ✅ Newsletter signups
- ✅ Category filter usage

## Analytics Hook API

### Core Functions

```typescript
const {
  trackEvent,              // Generic event tracking
  trackPageView,           // Page view tracking  
  trackNewsletterSignup,   // Newsletter subscriptions
  trackSocialShare,        // Social media shares
  trackBookInteraction,    // Book-specific events
  trackArticleClick,       // Article interactions
  trackExternalLink        // External link tracking
} = useAnalytics('project-name');
```

### Custom Event Structure

```typescript
interface AnalyticsEvent {
  action: string;    // Event action (click, view, share, etc.)
  category: string;  // Event category (engagement, conversion, etc.)
  label?: string;    // Event label for additional context
  value?: number;    // Optional numeric value
  project?: string;  // Project context (ciriwhispers, editorial, etc.)
}
```

### Predefined Events

```typescript
import { ANALYTICS_EVENTS } from "@/hooks/useAnalytics";

// Available event constants:
ANALYTICS_EVENTS.NEWSLETTER_SIGNUP
ANALYTICS_EVENTS.SOCIAL_SHARE
ANALYTICS_EVENTS.BOOK_EXPAND
ANALYTICS_EVENTS.CHAPTER_READ
ANALYTICS_EVENTS.ARTICLE_CLICK
ANALYTICS_EVENTS.PAGE_VIEW
ANALYTICS_EVENTS.EXTERNAL_LINK
ANALYTICS_EVENTS.AMAZON_CLICK
ANALYTICS_EVENTS.CONTACT_FORM
```

## Demo Mode

### Console Logging
When GA4 is not configured, events are logged to console:
```
[Analytics] share - social - twitter:My Article (ciriwhispers)
[Analytics] newsletter_signup - engagement - CiriWhispers Newsletter (ciriwhispers)
[Analytics] expand_book - content - amaranta (ciriwhispers)
```

### Testing Events
```tsx
// Force demo mode for testing
const handleTestEvent = () => {
  trackEvent({
    action: 'test_event',
    category: 'testing',
    label: 'button_click',
    project: 'ciriwhispers'
  });
};
```

## GA4 Dashboard Setup

### Recommended Custom Dimensions

1. **Project Dimension:**
   - Name: `Project`
   - Parameter: `custom_project`
   - Scope: Event

2. **Content Type:**
   - Name: `Content Type` 
   - Parameter: `content_type`
   - Scope: Event

### Conversion Goals

Set up these events as conversions in GA4:

1. **Newsletter Signups:** `newsletter_signup`
2. **Book Purchases:** `amazon_click` 
3. **Contact Forms:** `contact_form`
4. **Social Shares:** `share`

### Custom Reports

**Project Performance Report:**
- Primary dimension: Project
- Metrics: Events, Users, Engagement Rate
- Secondary dimension: Event Name

**Content Engagement Report:**
- Primary dimension: Event Name  
- Metrics: Event Count, Users
- Filter: Project contains "ciriwhispers" OR "editorial"

## Integration Checklist

### Setup Phase
- [ ] Create GA4 property
- [ ] Configure environment variables
- [ ] Set up custom dimensions
- [ ] Configure conversion goals

### Implementation Phase  
- [ ] Initialize analytics in app layout
- [ ] Add project-specific tracking
- [ ] Test event firing in demo mode
- [ ] Verify events in GA4 Real-time reports

### Optimization Phase
- [ ] Set up custom reports and dashboards
- [ ] Configure automated insights
- [ ] Set up conversion tracking
- [ ] Implement cross-domain tracking (if needed)

## Troubleshooting

### Events Not Appearing
1. Check environment variable is set correctly
2. Verify GA4 Measurement ID format (G-XXXXXXXXXX)
3. Check browser console for errors
4. Use GA4 DebugView for real-time testing

### Demo Mode Testing
```typescript
// Temporarily override for testing
window.gtag = undefined; // Forces demo mode
trackEvent({ action: 'test', category: 'debug' });
```

### Cross-Project Analytics
Events are automatically tagged with project context:
- `ciriwhispers` - Literature and books
- `editorial` - Articles and analysis  
- `catering` - Food service events
- `ecosystem` - Cross-project interactions
- `global` - Site-wide events

## Performance Impact

- **Bundle size:** ~2KB gzipped
- **Runtime impact:** Minimal (asynchronous loading)
- **Privacy compliant:** Respects Do Not Track
- **GDPR ready:** Can be disabled based on consent

---

**Status:** ✅ Implemented and functional  
**Demo Mode:** Console logging active (until GA4 configured)  
**Production Setup:** Requires GA4 Measurement ID in environment  

**Test URLs:**
- http://localhost:3001/ciriwhispers (book interactions, social sharing)
- http://localhost:3001/editorial (article clicks, newsletter)

**Last Updated:** December 2024