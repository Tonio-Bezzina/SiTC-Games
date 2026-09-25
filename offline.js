// Register once from the Game Hub; the worker covers every laboratory page.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register(new URL('service-worker.js', document.currentScript.src), {
    scope: new URL('./', document.currentScript.src).pathname
  }).catch(error => console.error('Offline setup unavailable:', error));
}
