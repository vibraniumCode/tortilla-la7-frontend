const CACHE_NAME = "tortillas-al-paso-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/tortilla.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copia = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, copia));
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached ?? caches.match("/index.html")),
      ),
  );
});

self.addEventListener("push", (event) => {
  const datos = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(datos.titulo || "Parrilla La 7", {
      body: datos.cuerpo || "Tenés una actualización.",
      icon: "/tortilla.png",
      badge: "/tortilla.png",
      data: { url: datos.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
