/**
 * Service Worker for ChipGemSort
 * 오프라인 지원 및 캐싱 전략
 */
const CACHE_VERSION = "chip-gem-sort-v1";
const STATIC_CACHE_NAME = CACHE_VERSION + "-static";
const DYNAMIC_CACHE_NAME = CACHE_VERSION + "-dynamic";

const STATIC_ASSETS = [
  "/ChipGemSort/",
  "/ChipGemSort/index.html",
  "/ChipGemSort/manifest.json",
  "/ChipGemSort/robots.txt",
  "/ChipGemSort/sitemap.xml",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (n) =>
                n !== STATIC_CACHE_NAME &&
                n !== DYNAMIC_CACHE_NAME &&
                n.startsWith("chip-gem-sort")
            )
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin || req.method !== "GET") return;
  if (
    url.hostname.includes("googlesyndication.com") ||
    url.hostname.includes("googleadservices.com")
  )
    return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (!res || res.status !== 200 || res.type !== "basic")
          return caches.match(req).then((c) => c || res);
        const clone = res.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          if (
            ["image", "font", "style", "script"].includes(req.destination) ||
            /\.(js|css|png|jpg|svg|ico)$/.test(url.pathname)
          )
            cache.put(req, clone);
        });
        return res;
      })
      .catch(() =>
        caches
          .match(req)
          .then(
            (c) =>
              c ||
              (req.destination === "document"
                ? caches.match("/ChipGemSort/index.html")
                : new Response("Offline", { status: 503 }))
          )
      )
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
