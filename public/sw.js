const CACHE_NAME = "kos-bunda-elin-v3";

const PRECACHE_URLS = ["/", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // API traffic must never be served from cache — NetworkOnly for all methods.
  // Matches both same-origin /api/* and cross-origin API_BASE_URL (e.g. http://localhost:8000/api/*).
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api")) return;

  if (event.request.method !== "GET") return;

  // Navigations must be network-first so deploys and code changes (e.g.
  // updated JS chunks) are always served, falling back to the cache offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) => cached || caches.match("/offline") || new Response("Offline", { status: 503 })
          )
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => cached || new Response("Offline", { status: 503 }));
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Kos Bunda Elin", body: "Pengingat pembayaran kos." };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});
