// CHANGED: Updated version number so browser clears old cache
const CACHE_NAME = 'apk-store-cache-v2';  

// CHANGED: Made all paths RELATIVE ("./") instead of absolute ("/frontend/...")
// This ensures the files load correctly when opened in standalone PWA mode
const ASSETS_TO_CACHE = [
  './index.html',
  './style.css',
  './script.js',
  './profile.html',
  './admin.html',
  './developer.html',
  './login.html',
  './settings.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
