# ⚡ QUICKSTART - Editorial MaalCa

## 🎯 Get Up and Running in 5 Minutes

Editorial MaalCa is **already integrated** in your project. This guide will help you verify it works and start using it immediately.

---

## Step 1: Start Dev Server (30 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000/editorial**

✅ **Expected Result:** You should see:
- Hero section with "Editorial MaalCa" title
- 6 article cards in a grid
- Category filter buttons
- Books section with 3 books
- Newsletter subscription form

---

## Step 2: Test Features (2 minutes)

### Test 1: Article Reading
1. Click on any article card
2. Modal should open with full article content
3. Scroll through the article
4. Click X or outside modal to close

✅ **Pass:** Modal opens and closes smoothly

### Test 2: Category Filters
1. Click "Filosofía" filter
2. Only philosophy articles should show
3. Click "Todos" to show all again

✅ **Pass:** Filtering works correctly

### Test 3: Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test mobile, tablet, and desktop views

✅ **Pass:** Layout adapts to screen size

---

## Step 3: Verify Files (1 minute)

```bash
# Check all required files exist
ls src/app/editorial/page.tsx
ls src/data/editorialContent.ts
ls src/components/editorial/ProfessionalReader.tsx
ls src/hooks/useAnalytics.ts
```

✅ **Expected:** All 4 files should exist

---

## Step 4: Check for Errors (1 minute)

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build
```

✅ **Expected:** No errors in either command

---

## ✅ SUCCESS CHECKLIST

If all these are true, Editorial MaalCa is working perfectly:

- [ ] `/editorial` page loads
- [ ] 6 articles display
- [ ] Category filters work
- [ ] Article modal opens
- [ ] Modal shows full content
- [ ] Modal closes properly
- [ ] Books section renders
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## 🚀 NEXT STEPS

### Quick Wins (< 30 min each)

#### 1. Add Navigation Link
Find your navigation component and add:
```typescript
{ href: "/editorial", label: "Editorial" }
```

#### 2. Add One More Article
Edit `src/data/editorialContent.ts` and duplicate an existing article pattern.

#### 3. Customize Colors
All red colors use `text-red-600`, `bg-red-600`, `hover:bg-red-700`.
Change these if you want a different accent color.

---

### Medium Tasks (1-2 hours each)

#### 4. Implement Newsletter
Create `/api/newsletter/subscribe` route with Resend integration.

#### 5. Add Article Images
Replace emoji placeholders with real images in article cards.

#### 6. SEO Optimization
Add metadata to `src/app/editorial/page.tsx`:
```typescript
export const metadata = {
  title: "Editorial MaalCa | Filosofía y Cultura",
  description: "Exploramos la intersección entre filosofía, cultura y sociedad contemporánea."
};
```

---

### Larger Projects (1+ days)

#### 7. Dynamic Routes
Create `/editorial/articulos/[slug]` for individual article pages.

#### 8. CMS Integration
Connect to Notion API or Sanity for content management.

#### 9. Amazon KDP Publishing
Follow `docs/plan-2-semanas-kdp.md` to publish your first book.

---

## 🐛 Common Issues

### Issue: Page Not Found
**Problem:** Visiting `/editorial` shows 404

**Solution:**
```bash
# Verify file exists
ls src/app/editorial/page.tsx

# Restart dev server
npm run dev
```

---

### Issue: Modal Doesn't Open
**Problem:** Clicking articles does nothing

**Solution:**
Open browser console (F12) and check for errors. Common issues:
- ProfessionalReader component missing
- Import path wrong
- JavaScript error in console

```bash
# Verify component exists
ls src/components/editorial/ProfessionalReader.tsx
```

---

### Issue: Styles Look Wrong
**Problem:** Colors or layout don't match design

**Solution:**
Check that you're using direct Tailwind classes:
```bash
# Search for forbidden semantic classes
grep -r "text-brand-primary" src/app/editorial/

# Should return nothing
```

✅ Use: `text-red-600`, `bg-gray-900`, `text-white`
❌ Avoid: `text-brand-primary`, `bg-surface`, `text-text-primary`

---

## 📚 Learn More

### Documentation
- **START-HERE.md** - Full overview
- **INTEGRACION.md** - Detailed integration guide
- **ARQUITECTURA-ECOSISTEMA.md** - System architecture
- **CLAUDE.md** - Project guidelines

### Code References
- `src/app/(marketing)/page.tsx` - Homepage pattern
- `BRANDING.md` - Branding rules

---

## 💡 Pro Tips

### For Content Creators
All article content is in `src/data/editorialContent.ts`. You can edit articles directly there without touching any React code.

### For Developers
Follow the patterns in `src/app/(marketing)/page.tsx` for consistency. Don't create new patterns unless necessary.

### For Designers
All colors use Tailwind classes. To change branding:
1. Find/replace `red-600` with your color
2. Update `BRANDING.md` with new guidelines

---

## 🎉 You're Ready!

If you completed all steps above, Editorial MaalCa is working perfectly.

**What to do now:**
1. Choose a "Next Step" from above
2. Read relevant documentation
3. Start building!

Need help? Check **INTEGRACION.md** for detailed guides.

---

**Last Updated:** October 30, 2025
**Version:** 1.0
**Time to Complete:** ⏱️ 5 minutes
