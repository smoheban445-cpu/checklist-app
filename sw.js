const CACHE_NAME = 'checklist-v1';
const urlsToCache = [
  '/checklist-app/',
  '/checklist-app/index.html',
  '/checklist-app/manifest.json',
  '/checklist-app/icon-192.png',
  '/checklist-app/icon-512.png'
];

// نصب Service Worker و کش کردن فایل‌ها
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('کش باز شد');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی و پاکسازی کش‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف کش قدیمی:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// پاسخ به درخواست‌ها - ابتدا از کش، سپس از شبکه
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش بود، برگردون
        if (response) {
          return response;
        }
        // اگر نبود، از شبکه بگیر
        return fetch(event.request).then(
          response => {
            // اگر پاسخ معتبر نبود، برگردون
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // پاسخ رو کش کن برای دفعه بعد
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});