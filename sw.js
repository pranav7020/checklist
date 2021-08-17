const newCacheName = `Checklist-V0.0`;

const filesToCache = [
    `/`,
    `/index.html`,
    `/style.css`,
    `/app.js`,
    `/favicon.ico`
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(newCacheName).then(async cache => {
            await cache.addAll(filesToCache)
            return self.skipWaiting()
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== newCacheName)
                    .map(cacheName => caches.delete(cacheName))
            )
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(newCacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});