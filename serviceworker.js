// Cache version control
const CACHE_VERSION = 7;
const CURRENT_CACHE = `cache-storage-V${CACHE_VERSION}`;


// List of routes that are going to be cached
const cacheFiles = [
    // pages
    '/index.html',
    '/directions.html',
    // files
    '/static/style.css',
    '/static/img/app-icon.png',
    '/static/img/festival-map.jpg',
    '/static/js/idbop.js',
    '/static/patua-one-v20-latin-regular.woff2',
]


// activation event: clean up previously registered service workers
self.addEventListener('activate', event =>
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);


// Install event: cache the files
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CURRENT_CACHE).then(function(cache) {
        return cache.addAll(cacheFiles);
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith((async() => {

    const cache = await caches.open(CURRENT_CACHE);

    try {
        const cachedResponse = await cache.match(event.request);
        if(cachedResponse) {
            console.log('cachedResponse: ', event.request.url);
            return cachedResponse;
        }

        const fetchResponse = await fetch(event.request);
        if(fetchResponse) {
            console.log('fetchResponse: ', event.request.url);
            await cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
        }
    }   catch (error) {
        console.log('Fetch failed: ', error);
        const cachedResponse = await cache.match('/en/offline.html');
        return cachedResponse;
    }
  })());

});