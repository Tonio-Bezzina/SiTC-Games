const CACHE = 'sitc-visited-v1';
const base = new URL('./', self.registration.scope);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Save the entry page before the new worker controls subsequent visits.
    const cache = await caches.open(CACHE);
    try { await cache.add(new URL('index.html', base)); } catch (_) { /* Retry on the next online visit. */ }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  if (url.pathname.endsWith('/service-worker.js')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fallbackURL = url.pathname.endsWith('/') ? new URL('index.html', url.href) : event.request;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        // Games preload assets when entered; case slides save when viewed.
        try { await cache.put(event.request, response.clone()); } catch (_) {}
        return response;
      }
    } catch (_) { /* Try locally saved files. */ }
    const saved = await cache.match(event.request, { ignoreSearch: true }) ||
      await cache.match(fallbackURL, { ignoreSearch: true });
    if (saved) return saved;
    // Keep older full downloads usable after this update.
    for (const name of (await caches.keys()).filter(key => key.startsWith('sitc-offline-')).reverse()) {
      const old = await caches.open(name);
      const match = await old.match(event.request, { ignoreSearch: true }) ||
        await old.match(fallbackURL, { ignoreSearch: true });
      if (match) return match;
    }
    return Response.error();
  })());
});
