// Service Worker for Ryan Little's Personal Website
// Provides basic caching and offline functionality

const CACHE_NAME = 'ryan-little-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/index-desktop.html',
    '/index-mobile.html',
    '/404.html',
    '/manifest.json',
    '/src/desktop.css',
    '/src/mobile.css',
    '/src/js/core.js',
    '/src/js/animations.js',
    '/src/js/minigame.js',
    '/src/js/content-manager.js',
    '/src/js/templates.js',
    '/src/js/components.js',
    '/src/js/desktop.js',
    '/src/js/mobile.js',
    '/src/js/main.js',
    '/src/data/content.json',
    '/assets/images_webp/earthsprite.webp',
    '/assets/images_webp/background.webp',
    '/assets/images_webp/background2.webp',
    '/assets/images_webp/satellite1.webp',
    '/assets/images_webp/satellite2.webp',
    '/assets/images_webp/satellite3.webp',
    '/assets/images_webp/shootingstar.webp',
    '/assets/images_webp/lhlhammer_transback.webp'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static resources...');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise, fetch from network
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        
                        // Return 404 page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/404.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
