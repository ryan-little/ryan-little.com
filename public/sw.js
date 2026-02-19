const CACHE_NAME = 'ryan-little-v2-2';

const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/textures/earth-day.webp',
    '/textures/earth-night.webp',
    '/textures/earth-clouds.webp',
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

    // Network-first for navigation so index.html is always fresh after a deploy
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    const url = new URL(event.request.url);

    // Don't cache content images — they're not hashed and can change without a URL change
    if (url.pathname.startsWith('/images/')) {
        event.respondWith(fetch(event.request));
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
