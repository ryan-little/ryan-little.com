# SEO Meta Tags Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add SEO meta tags, Open Graph, Twitter Card, JSON-LD Person schema, and email obfuscation to ryan-little.com.

**Architecture:** All changes are static — meta tags and JSON-LD go directly in `index.html`, email obfuscation is a small JS snippet added to `src/main.js`. No new files, no build changes.

**Tech Stack:** Vanilla HTML, vanilla JS (ES modules), Vite

**Design doc:** `docs/plans/2026-02-19-seo-meta-tags-design.md`

---

### Task 1: Add standard meta tags and JSON-LD to index.html

**Files:**
- Modify: `index.html:7-8` (after existing description and theme-color meta tags)

**Step 1: Add SEO, Open Graph, and Twitter Card meta tags**

In `index.html`, after line 8 (`<meta name="theme-color" content="#0a0a1a">`), insert:

```html
    <!-- SEO -->
    <meta name="author" content="Ryan Little">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://ryan-little.com">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ryan-little.com">
    <meta property="og:title" content="Ryan Little - Geospatial Analyst">
    <meta property="og:description" content="Ryan Little - Geospatial Analyst with expertise in GIS, Remote Sensing, and Spatial Analysis.">
    <meta property="og:image" content="https://ryan-little.com/images/bigbendnp_headshot.webp">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Ryan Little - Geospatial Analyst">
    <meta name="twitter:description" content="Ryan Little - Geospatial Analyst with expertise in GIS, Remote Sensing, and Spatial Analysis.">
    <meta name="twitter:image" content="https://ryan-little.com/images/bigbendnp_headshot.webp">
```

**Step 2: Add JSON-LD Person schema**

Immediately before `</head>` (currently line 13), insert:

```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Ryan Little",
      "jobTitle": "Geospatial Analyst",
      "url": "https://ryan-little.com",
      "sameAs": [
        "https://linkedin.com/in/rpdlittle",
        "https://github.com/ryan-little"
      ],
      "knowsAbout": ["GIS", "Remote Sensing", "Spatial Analysis", "Python", "ArcGIS"]
    }
    </script>
```

**Step 3: Verify in browser**

Run: `npm run dev`

Open browser devtools → Elements → `<head>`. Confirm all new tags are present.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add SEO meta tags, Open Graph, Twitter Card, and JSON-LD schema"
```

---

### Task 2: Obfuscate email address

**Files:**
- Modify: `index.html:27` (the email anchor)
- Modify: `src/main.js:55` (after `init()` call at bottom of file)

**Step 1: Update email anchor in index.html**

Replace line 27:
```html
            <a href="mailto:ryan@ryanpdlittle.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
```

With:
```html
            <a data-email-user="ryan" data-email-domain="ryanpdlittle.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
```

**Step 2: Add email assembly in main.js**

After `init();` at the bottom of `src/main.js` (currently line 55), add:

```js
// Assemble email href at runtime to avoid scraper exposure
const emailLink = document.querySelector('[data-email-user]');
if (emailLink) {
    const addr = emailLink.dataset.emailUser + '@' + emailLink.dataset.emailDomain;
    emailLink.href = 'mailto:' + addr;
}
```

**Step 3: Verify email link works**

Run: `npm run dev`

Click the email icon — confirm it opens the mail client with `ryan@ryanpdlittle.com` pre-filled.

Inspect element on the envelope icon — confirm the `<a>` tag has no `href` in the HTML source but the `href` attribute is present in the live DOM.

**Step 4: Commit**

```bash
git add index.html src/main.js
git commit -m "feat: obfuscate email address to reduce scraper exposure"
```

---

### Task 3: Build and verify

**Step 1: Run production build**

```bash
npm run build
```

Expected: Build completes with no errors. Bundle size stays under 150KB gzipped.

**Step 2: Validate meta tags with online tools**

With the site live at `https://ryan-little.com` (after deploy):
- Open Graph: https://developers.facebook.com/tools/debug/ — paste URL, verify title/image preview
- Twitter Card: https://cards-dev.twitter.com/validator — paste URL, verify card preview
- JSON-LD: https://search.google.com/test/rich-results — paste URL, verify Person schema detected

**Step 3: Commit build if any dist changes**

If `dist/` is tracked in git:
```bash
git add dist/
git commit -m "build: rebuild for SEO meta tags"
```
