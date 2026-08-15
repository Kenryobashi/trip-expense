/* 出張旅費 — オフラインでも開けるようにするだけの最小 Service Worker
   ファイルを直したら CACHE_NAME の番号を必ず上げること */
const CACHE_NAME = 'trip-expense-v10';
const ASSETS = [
  './',
  './index.html',
  './report.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ネットワーク優先・失敗したらキャッシュ（出先の電波が悪くても開ける） */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
