// Cache the public app shell only. Never cache Auth, database requests or maps.
const CACHE = 'catch-conditions-shell-v5';
// Illustrations cache when viewed; do not download the entire gallery on install.
const IMAGES = ['kabeljo','red_roman','red_steenbras','miss_lucy','geelbek','haai','carpenter','santer','yellowbelly','musselcracker','hake'].map(id => './fish/'+id+'.png');
const FILES = ['./','./index.html','./style.css?v=5','./app.js?v=5','./config.js','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest','./vendor/supabase.js','./vendor/leaflet.js','./vendor/leaflet.css','./vendor/leaflet.markercluster.js','./vendor/MarkerCluster.css','./vendor/MarkerCluster.Default.css','./vendor/images/layers.png','./vendor/images/layers-2x.png','./vendor/images/marker-icon.png','./vendor/images/marker-icon-2x.png','./vendor/images/marker-shadow.png'];
self.addEventListener('install',event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate',event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('catch-conditions-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const root = new URL('./',self.location.href);
  if (url.origin !== root.origin || ![...FILES,...IMAGES].some(file => new URL(file,root).pathname === url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request,copy))); }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || new Response('Connect to the internet and reopen Catch and Conditions.',{status:503}))));
});
