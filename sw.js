const CACHE_NAME = 'anime-shelf-shell-v27';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Never intercept external provider/video requests.
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, copy));

                return response;
            })
            .catch(() => caches.match(request))
    );
});

/* ===== Notifications ===== */

// Web Push from the server: works even when the app is closed.
// Expected payload (JSON): { title, body, aid, tag }
self.addEventListener('push', event => {
    let d = {};
    try {
        d = event.data ? event.data.json() : {};
    } catch (e) {
        try { d = { body: event.data.text() }; } catch (x) {}
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            // The app is open and in front: it shows its own toast, so no phone notification.
            if (list.some(c => c.visibilityState === 'visible' && c.focused)) return;
            return self.registration.showNotification(d.title || 'Anime Shelf', {
                body: d.body || '',
                tag: d.tag || undefined,
                icon: './icons/icon-192.png',
                data: { aid: d.aid || 0 }
            });
        })
    );
});

// Tapping a notification opens the app (and the anime, if it has one).
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const aid = (event.notification.data && event.notification.data.aid) || 0;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const c of list) {
                if ('focus' in c) {
                    if (aid) c.postMessage({ type: 'nb-open', aid: aid });
                    return c.focus();
                }
            }
            return self.clients.openWindow(aid ? './?nbopen=' + aid : './');
        })
    );
});
