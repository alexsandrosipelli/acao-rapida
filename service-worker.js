/* ================================
   SERVICE WORKER – AÇÃO RÁPIDA
   Offline-first | Cache versionado
================================ */

const CACHE_NAME = 'acao-rapida-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './state.js',
  './app.webmanifest',

  // Ícones
  './img/acao-rapida-192.png',
  './img/acao-rapida-512.png',
  './img/acao-rapida-maskable.png',
  './img/AcaoRapidaFav.jfif'
];

/* ================================
   INSTALL – Cache inicial
================================ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ================================
   ACTIVATE – Limpa caches antigos
================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

/* ================================
   FETCH – Estratégia híbrida
   - Cache first para estáticos
   - Network fallback
================================ */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Não cacheia respostas inválidas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, responseClone)
          );

          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

/* ================================
   MESSAGE – Atualização manual
================================ */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
