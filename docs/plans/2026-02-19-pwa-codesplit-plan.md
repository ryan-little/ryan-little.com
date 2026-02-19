# PWA + Code-Splitting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add manifest.json, a hybrid-caching service worker, and Three.js code-splitting to ryan-little.com.

**Architecture:** All new files go in `public/` (copied to `dist/` on build). The service worker pre-caches stable heavy assets and dynamically caches Vite's hashed bundles at runtime. Three.js is split into its own chunk via `vite.config.js` manualChunks.

**Tech Stack:** Vanilla JS, Vite 7, Three.js r182, GitHub Pages

**Design doc:** `docs/plans/2026-02-19-pwa-codesplit-design.md`

---

### Task 1: Copy earthsprite icon from v1

**Files:**
- Create: `public/images/earthsprite.webp` (extracted from v1 branch)

**Step 1: Extract earthsprite.webp from v1 branch**

```bash
git show v1:assets/images_webp/earthsprite.webp > public/images/earthsprite.webp
```

**Step 2: Verify the file exists and is non-empty**

```bash
ls -lh public/images/earthsprite.webp
```

Expected: File exists, size ~several KB.

**Step 3: Commit**

```bash
git add public/images/earthsprite.webp
git commit -m "feat: add earthsprite icon from v1 for PWA manifest"
```

---

### Task 2: Create manifest.json

**Files:**
- Create: `public/manifest.json`

**Step 1: Create the file**

Create `public/manifest.json` with this exact content:

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

**Step 2: Add manifest link to index.html**

In `index.html`, add this line after `<meta name="theme-color" ...>` (currently line 8):

```html
    <link rel="manifest" href="/manifest.json">
```

**Step 3: Verify in browser**

Run: `npm run dev`

Open DevTools → Application → Manifest. Confirm name, theme color, and icon are shown.

**Step 4: Commit**

```bash
git add public/manifest.json index.html
git commit -m "feat: add PWA manifest.json with earthsprite icon"
```

---

### Task 3: Create service worker

**Files:**
- Create: `public/sw.js`
- Modify: `index.html` (add SW registration script before `</body>`)

**Step 1: Create `public/sw.js`**

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

**Step 2: Register the SW in index.html**

Add this script just before `</body>` in `index.html`:

```html
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
            });
        }
    </script>
```

**Step 3: Verify in browser**

Run: `npm run dev`

Open DevTools → Application → Service Workers. Confirm the SW is registered and shows status "activated and is running".

Open DevTools → Application → Cache Storage. Confirm `ryan-little-v2-1` cache exists with the pre-cached URLs.

**Step 4: Commit**

```bash
git add public/sw.js index.html
git commit -m "feat: add hybrid-caching service worker"
```

---

### Task 4: Code-split Three.js

**Files:**
- Modify: `vite.config.js`

**Step 1: Update vite.config.js**

Replace the `rollupOptions` block in `vite.config.js`:

Current:
```js
rollupOptions: {
    input: resolve(__dirname, 'index.html'),
},
```

Replace with:
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

**Step 2: Run production build**

```bash
npm run build
```

Expected output — two JS chunks, both under 500KB:
```
dist/assets/threejs-[hash].js   ~350 kB │ gzip: ~120 kB
dist/assets/index-[hash].js     ~50 kB  │ gzip: ~20 kB
```

No chunk size warning should appear.

**Step 3: Verify SW precache still works**

Run: `npm run preview`

Open DevTools → Application → Service Workers. Confirm SW activates. Open Network tab, reload — confirm assets are served from ServiceWorker on second load.

**Step 4: Commit**

```bash
git add vite.config.js dist/
git commit -m "perf: code-split Three.js into separate chunk"
```

---

### Task 5: Push to origin

```bash
git push origin v2
```

Verify at `https://github.com/ryan-little/ryan-little.com/tree/v2` that all commits are present.
