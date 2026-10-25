// Only this app's caches and requests are handled; other Pages apps share the origin.
const VERSION = "bar-word-adventures-shell-development";
const AUDIO = "bar-word-adventures-audio-v1";
const CORE = []; // Filled by scripts/build.mjs.
async function installShell() {
  const cache = await caches.open(VERSION);
  const requests = CORE.map((path) => new Request(
    new URL(path, self.registration.scope), { cache: "reload" },
  ));
  // Retry transient deployment/network failures. Activate only a complete shell.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await cache.addAll(requests);
      await self.skipWaiting();
      return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}
self.addEventListener("install", (event) => event.waitUntil(installShell()));
self.addEventListener("message", (event) => {
  if (event.data?.type === "APP_VERSION") event.ports[0]?.postMessage({ version: VERSION });
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("bar-word-adventures-shell-") &&
                key !== VERSION,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url),
    scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname))
    return;
  if (url.pathname.includes("/audio/")) {
    event.respondWith(
      (async () => {
        let cache;
        try {
          cache = await caches.open(AUDIO);
          if (event.request.cache !== "reload") {
            const cached = await cache.match(event.request);
            if (cached) return cached;
          }
        } catch {
          /* Audio still works if storage is unavailable. */
        }
        // The new Hebrew voice is bundled with the release. A previously installed
        // app can play it offline immediately, even though its old audio cache
        // contains only recordings from an earlier voice.
        if (event.request.cache !== "reload") {
          try {
            const shell = await caches.open(VERSION);
            const bundled = await shell.match(event.request, { ignoreSearch: true });
            if (bundled) return bundled;
          } catch { /* Network playback can still work without storage. */ }
        }
        const response = await fetch(event.request);
        if (response.ok && cache) {
          try {
            await cache.put(event.request, response.clone());
          } catch {
            /* Full cache must not silence the response. */
          }
        }
        return response;
      })(),
    );
    return;
  }
  // A release is a coherent shell: its module graph comes from one versioned cache.
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      return cached || fetch(event.request);
    }),
  );
});
