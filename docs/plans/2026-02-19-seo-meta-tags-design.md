# SEO Meta Tags — Design Doc

**Date:** 2026-02-19

## Overview

Add SEO meta tags, Open Graph, Twitter Card, JSON-LD Person schema, and email obfuscation to ryan-little.com.

## Changes

### 1. Standard Meta Tags (`index.html`)

Add to `<head>` after existing meta tags:

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

- OG image uses existing `/public/images/bigbendnp_headshot.webp` — no new assets needed
- `twitter:card` is `summary` (square crop) to suit a headshot

### 2. JSON-LD Person Schema (`index.html`)

Add before `</head>`:

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

- Email excluded from schema to avoid scraper exposure
- `sameAs` links LinkedIn and GitHub profiles for Google association

### 3. Email Obfuscation

**`index.html`** — replace mailto anchor with data attributes:

```html
<a data-email-user="ryan" data-email-domain="ryanpdlittle.com" aria-label="Email">
  <i class="fas fa-envelope"></i>
</a>
```

**`src/main.js`** — assemble href at runtime:

```js
const emailLink = document.querySelector('[data-email-user]');
if (emailLink) {
    const addr = emailLink.dataset.emailUser + '@' + emailLink.dataset.emailDomain;
    emailLink.href = 'mailto:' + addr;
}
```

Keeps the link fully functional for users while hiding the address from basic HTML scrapers.

## Files Changed

- `index.html` — meta tags, JSON-LD block, email anchor update
- `src/main.js` — email obfuscation JS
