// Only this app's caches and requests are handled; other Pages apps share the origin.
const VERSION = "bar-word-adventures-shell-86b0aabeb393";
const AUDIO = "bar-word-adventures-audio-v1";
const CORE = [
  "./",
  "./assets/bar/gestures-v1.png",
  "./assets/objects/animals.webp",
  "./assets/objects/extras.webp",
  "./assets/objects/food.webp",
  "./assets/objects/home.webp",
  "./assets/objects/nature.webp",
  "./assets/objects/objects.webp",
  "./assets/reactions/celebrating.webp",
  "./assets/reactions/happy.webp",
  "./assets/reactions/oops-sad.webp",
  "./assets/reactions/sad.webp",
  "./assets/reactions/surprised.webp",
  "./assets/reactions/thinking.webp",
  "./icons/bar-180.png",
  "./icons/bar-192.png",
  "./icons/bar-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./src/core/art.js",
  "./src/core/audio-manifest.js",
  "./src/core/audio-timing.js",
  "./src/core/audio.js",
  "./src/core/clues.js",
  "./src/core/content.js",
  "./src/core/guidance.js",
  "./src/core/helpers.js",
  "./src/core/i18n.js",
  "./src/core/language-settings.js",
  "./src/core/lessons.js",
  "./src/core/lifecycle.js",
  "./src/core/offline.js",
  "./src/core/pixel-art.js",
  "./src/core/rewards.js",
  "./src/core/scheduler.js",
  "./src/core/speech.js",
  "./src/core/storage.js",
  "./src/core/updates.js",
  "./src/games/describe.js",
  "./src/games/firstLetter.js",
  "./src/games/index.js",
  "./src/games/initialSet.js",
  "./src/games/language.js",
  "./src/games/letterOrder.js",
  "./src/games/listenChoose.js",
  "./src/games/memoryPairs.js",
  "./src/games/shared.js",
  "./src/locales/ar.js",
  "./src/locales/es.js",
  "./src/locales/ja.js",
  "./src/locales/tr.js",
  "./src/locales/zh.js",
  "./src/main.js",
  "./src/ui/bar.js",
  "./src/ui/parents.js",
  "./src/ui/reactions.js",
  "./src/ui/volume.js",
  "./styles.css"
];
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
