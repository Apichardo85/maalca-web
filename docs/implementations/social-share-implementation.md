# 🔗 Social Share Implementation Guide

## Overview

The `SocialShare` component provides functional sharing buttons for all MaalCa projects. It supports multiple platforms, variants, and automatically handles URL generation and clipboard operations.

## Features

- ✅ **6 Social Platforms:** Twitter, LinkedIn, Facebook, WhatsApp, Telegram, Copy Link
- ✅ **3 Visual Variants:** buttons, icons, minimal
- ✅ **Automatic URL Detection:** Uses current page URL if not provided
- ✅ **Copy to Clipboard:** With success feedback
- ✅ **Dark/Light Theme Support:** Adapts to global theme
- ✅ **Responsive Design:** Works on all screen sizes

## Quick Start

### Basic Usage

```tsx
import { SocialShare } from "@/components/ui";

// Minimal sharing with current page URL
<SocialShare />

// Custom configuration
<SocialShare
  title="My Article Title"
  description="A brief description of the content"
  platforms={["twitter", "linkedin", "facebook", "copy"]}
  variant="icons"
  className="justify-center"
/>
```

## Configuration

### Available Platforms

| Platform | Icon | Purpose |
|----------|------|---------|
| `twitter` | 🐦 | Share on Twitter/X |
| `linkedin` | 💼 | Share on LinkedIn |
| `facebook` | 👥 | Share on Facebook |
| `whatsapp` | 💬 | Share via WhatsApp |
| `telegram` | ✈️ | Share via Telegram |
| `copy` | 🔗 | Copy URL to clipboard |

### Visual Variants

#### 1. **Buttons** (Default)
```tsx
<SocialShare variant="buttons" />
```
- Full buttons with platform names
- Best for: Dedicated sharing sections
- Height: ~40px per button

#### 2. **Icons**  
```tsx
<SocialShare variant="icons" />
```
- Circular icons with hover effects
- Best for: Inline content, headers
- Size: 40x40px per icon

#### 3. **Minimal**
```tsx
<SocialShare variant="minimal" />
```
- Small icons in a row with "Compartir:" label
- Best for: Cards, compact spaces
- Height: ~24px

## Implementation Examples

### CiriWhispers Implementation

```tsx
// Main page sharing
<div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 rounded-xl border border-slate-700/50 mb-12">
  <SocialShare
    title="CiriWhispers - Palabras que susurran al alma"
    description="Literatura íntima, poesía y reflexiones nocturnas desde el laberinto de las emociones."
    platforms={["twitter", "linkedin", "facebook", "whatsapp", "copy"]}
    variant="icons"
    className="justify-center"
  />
</div>

// Individual book sharing
<div className="pt-3 border-t border-slate-700/30">
  <SocialShare
    title={`${book.title} - ${book.subtitle} | CiriWhispers`}
    description={book.synopsis}
    platforms={["twitter", "facebook", "whatsapp", "copy"]}
    variant="minimal"
  />
</div>
```

### Editorial MaalCa Implementation

```tsx
// Main page sharing
<section className="py-12 bg-surface">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-surface-elevated p-8 rounded-2xl border border-border shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          Comparte Editorial MaalCa
        </h3>
        <p className="text-text-secondary text-sm">
          Ayuda a difundir pensamiento crítico y análisis profundo
        </p>
      </div>
      <SocialShare
        title="Editorial MaalCa - Pensamiento crítico y análisis cultural"
        description="Exploramos filosofía, tecnología, cultura y sociedad desde una perspectiva caribeña contemporánea."
        platforms={["twitter", "linkedin", "facebook", "whatsapp", "copy"]}
        variant="icons"
        className="justify-center"
      />
    </div>
  </div>
</section>

// Individual article sharing
<div className="mb-4 pt-3 border-t border-border/50">
  <SocialShare
    title={`${article.title} | Editorial MaalCa`}
    description={article.excerpt}
    platforms={["twitter", "linkedin", "copy"]}
    variant="minimal"
  />
</div>
```

## Props Interface

```typescript
interface SocialShareProps {
  url?: string;              // Custom URL (defaults to current page)
  title?: string;            // Content title for sharing
  description?: string;      // Content description  
  platforms?: SocialPlatform[]; // Array of platforms to show
  className?: string;        // Additional CSS classes
  variant?: "buttons" | "icons" | "minimal"; // Visual style
}

type SocialPlatform = "twitter" | "linkedin" | "facebook" | "whatsapp" | "telegram" | "copy";
```

## Generated URLs

The component automatically generates proper sharing URLs for each platform:

### Twitter
```
https://twitter.com/intent/tweet?text=${title}&url=${url}
```

### LinkedIn  
```
https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${description}
```

### Facebook
```
https://www.facebook.com/sharer/sharer.php?u=${url}
```

### WhatsApp
```
https://wa.me/?text=${title} ${url}
```

### Telegram
```
https://t.me/share/url?url=${url}&text=${title}
```

## Styling & Themes

### Dark Theme (Default)
- Uses slate/red color palette
- Gradient backgrounds for platforms
- Subtle hover effects

### Light Theme (CiriWhispers)
- Automatically adapts using global CSS overrides
- Maintains platform brand colors
- Better contrast for readability

### Custom Styling
```tsx
<SocialShare
  className="my-custom-spacing justify-between"
  // Component handles platform colors automatically
/>
```

## Browser Compatibility

### Clipboard API
- ✅ Modern browsers: Uses `navigator.clipboard.writeText()`
- ✅ Fallback: Uses `document.execCommand('copy')` for older browsers
- ✅ Success feedback: Shows "¡Copiado!" for 2 seconds

### Share URLs
- ✅ All platforms open in new tab/window
- ✅ `noopener,noreferrer` security attributes
- ✅ Proper URL encoding for special characters

## Performance Notes

- **Bundle size:** ~1.5KB gzipped
- **Dependencies:** None (uses browser APIs only)
- **Rendering:** Client-side only (`"use client"`)
- **Memory usage:** Minimal state management

## Accessibility

- ✅ Proper button semantics
- ✅ Descriptive `title` attributes
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast colors

## Testing

### Manual Testing Checklist
- [ ] Twitter sharing opens with correct title/URL
- [ ] LinkedIn sharing includes description
- [ ] Facebook sharing works with URL only
- [ ] WhatsApp sharing combines title + URL
- [ ] Telegram sharing works correctly
- [ ] Copy button shows success feedback
- [ ] All variants render correctly
- [ ] Dark/light theme switching works
- [ ] Mobile responsiveness is maintained

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (desktop/mobile)
- [ ] Mobile browsers (iOS/Android)

---

**Status**: ✅ Implemented and functional  
**Demo URLs**: 
- http://localhost:3001/ciriwhispers (icons + minimal variants)
- http://localhost:3001/editorial (buttons + minimal variants)

**Last Updated**: December 2024