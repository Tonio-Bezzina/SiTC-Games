const PREFIX = 'sitc-offline-';
const base = new URL('./', self.registration.scope);
const manifestURL = new URL('offline-files.json', base);

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  if (url.pathname === manifestURL.pathname || url.pathname.endsWith('/service-worker.js')) return;
  event.respondWith((async () => {
    const cachesInOrder = (await caches.keys()).filter(name => name.startsWith(PREFIX)).reverse();
    try {
      const response = await fetch(event.request);
      if (response.ok) return response;
    } catch (_) { /* Use an existing offline copy. */ }
    for (const name of cachesInOrder) {
      const match = await (await caches.open(name)).match(event.request, { ignoreSearch: true });
      if (match) return match;
    }
    return Response.error();
  })());
});

async function report(client, message) { client.postMessage(message); }

self.addEventListener('message', event => {
  if (event.data !== 'DOWNLOAD_OFFLINE') return;
  event.waitUntil((async () => {
    const client = event.source;
    try {
      const response = await fetch(manifestURL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load the file list');
      const manifest = await response.json();
      const cache = await caches.open(PREFIX + manifest.version);
      let completed = 0;
      for (const file of manifest.files) {
        const url = new URL(file, base).href;
        if (!(await cache.match(url))) {
          const asset = await fetch(url, { cache: 'no-store' });
          if (!asset.ok) throw new Error(`Download failed: ${decodeURIComponent(file)} (${asset.status})`);
          await cache.put(url, asset);
        }
        completed++;
        if (completed % 5 === 0 || completed === manifest.files.length)
          await report(client, { type: 'PROGRESS', completed, total: manifest.files.length, bytes: manifest.bytes });
      }
      // Remove older versions only after the full new version is available.
      for (const name of await caches.keys()) {
        if (name.startsWith(PREFIX) && name !== PREFIX + manifest.version) await caches.delete(name);
      }
      await report(client, { type: 'READY', total: completed, version: manifest.version });
    } catch (error) {
      await report(client, { type: 'FAILED', message: String(error.message || error) });
    }
  })());
});
