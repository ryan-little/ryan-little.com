# PWA + Code-Splitting Design Doc

**Date:** 2026-02-19

## Overview

Three improvements to ryan-little.com: `manifest.json` for PWA metadata, a service worker for performance caching, and Three.js code-splitting to eliminate the Vite chunk size warning.

---

## 1. manifest.json

New file at `public/manifest.json`. Adapted from v1, updated for v2 paths and theme color.

```json
{
  "name": "Ryan Little - Geospatial Analyst",
  "short_name": "Ryan Little",
  "description": "Personal website of Ryan Little, Geospatial Analyst with expertise in GIS, Remote Sensing, and Spatial Analysis.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#0a0a1a",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/images/earthsprite.webp", "sizes": "192x192", "type": "image/webp", "purpose": "any" },
    { "src": "/images/earthsprite.webp", "sizes": "512x512", "type": "image/webp", "purpose": "any" }
  ],
  "categories": ["portfolio", "personal", "geospatial"],
  "lang": "en-US",
  "dir": "ltr"
}
```

- `earthsprite.webp` copied from v1 branch into `public/images/`
- `<link rel="manifest" href="/manifest.json">` added to `index.html`

---

## 2. Service Worker (`public/sw.js`)

Hybrid caching strategy: pre-cache stable heavy assets on install, dynamically cache everything else (including Vite's hashed bundles) on first request. Old caches cleared on activate.

```js
const CACHE_NAME = 'ryan-little-v2-1';
const SPA_ROUTES = ['/adventures', '/portfolio', '/trees', '/about'];

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/textures/earth-day.jpg',
    '/textures/earth-night.jpg',
    '/satellites/satellite1.webp',
    '/satellites/satellite2.webp',
    '/satellites/satellite3.webp',
    '/satellites/satellite4.webp',
    '/images/bigbendnp_headshot.webp',
    '/images/lhlhammer_transback.webp',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    const url = new URL(event.request.url);

    if (event.request.mode === 'navigate' && SPA_ROUTES.includes(url.pathname)) {
        event.respondWith(
            caches.match('/index.html').then(r => r || fetch('/index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
```

SW registered via inline script in `index.html` just before `</body>`. To bust cache after a deploy, increment `CACHE_NAME` (e.g. `v2-2`).

---

## 3. Code-Splitting Three.js (`vite.config.js`)

Add `manualChunks` to split Three.js into its own chunk:

```js
rollupOptions: {
    input: resolve(__dirname, 'index.html'),
    output: {
        manualChunks: {
            threejs: ['three'],
        },
    },
},
```

Splits bundle into two JS files — Three.js (~120KB gzipped) and app code (~20KB gzipped). Eliminates the chunk size warning. Three.js chunk is also independently cacheable, so return visitors don't re-download it when app code changes.

---

## Files Changed

- `public/manifest.json` — new file
- `public/images/earthsprite.webp` — copied from v1 branch
- `public/sw.js` — new file
- `index.html` — add manifest link tag + SW registration script
- `vite.config.js` — add manualChunks
