// This status is shared across the game hub and all laboratory pages.
(function () {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  const box = document.createElement('div');
  box.setAttribute('role', 'status');
  box.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:99999;background:#073c63;color:white;padding:9px 12px;border-radius:10px;font:14px Arial,sans-serif;max-width:min(90vw,420px);box-shadow:0 2px 8px #3338';
  const label = document.createElement('span');
  const button = document.createElement('button');
  button.textContent = 'Retry download';
  button.style.cssText = 'margin-left:10px;padding:6px;cursor:pointer';
  button.hidden = true;
  box.append(label, button);
  document.addEventListener('DOMContentLoaded', () => document.body.append(box));
  function show(message, retry) { label.textContent = message; button.hidden = !retry; }
  let worker;
  function start() {
    if (!navigator.onLine) { show(localStorage.getItem('sitc-offline-ready') || 'Offline download incomplete. Connect to Wi-Fi to prepare all files.', true); return; }
    show('Preparing games for offline use…');
    worker.postMessage('DOWNLOAD_OFFLINE');
  }
  button.addEventListener('click', start);
  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data;
    if (data.type === 'PROGRESS') show(`Downloading offline games: ${data.completed}/${data.total} files (${Math.ceil(data.bytes / 1048576)} MB total)`);
    if (data.type === 'READY') {
      const message = `Offline ready: all ${data.total} files saved on this tablet.`;
      localStorage.setItem('sitc-offline-ready', message);
      show(message);
    }
    if (data.type === 'FAILED') show(`Offline download incomplete: ${data.message}`, true);
  });
  navigator.serviceWorker.register(new URL('service-worker.js', document.currentScript.src), { scope: new URL('./', document.currentScript.src).pathname })
    .then(reg => { worker = reg.active || reg.waiting || reg.installing; if (worker.state === 'activated') start(); else worker.addEventListener('statechange', () => { if (worker.state === 'activated') start(); }); })
    .catch(err => show(`Offline setup failed: ${err.message}`, true));
})();
