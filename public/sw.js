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
