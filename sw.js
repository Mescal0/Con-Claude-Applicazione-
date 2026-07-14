/* Service worker: rende l'app disponibile anche senza connessione. */
var CACHE = 'le-mie-attivita-v1';
var FILE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone/icona-180.png',
  './icone/icona-192.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(FILE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chiavi) {
      return Promise.all(chiavi.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (inCache) {
      var dallaRete = fetch(e.request).then(function (risposta) {
        if (risposta && risposta.ok) {
          var copia = risposta.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        }
        return risposta;
      }).catch(function () { return inCache; });
      return inCache || dallaRete;
    })
  );
});
