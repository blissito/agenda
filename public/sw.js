// Denik PWA — Service Worker stub (Fase 1).
// Su único propósito es satisfacer el criterio de instalabilidad de Chrome
// (un SW registrado con un handler `fetch`). NO cachea nada todavía: el
// handler deja pasar la red sin tocarla. La caché del shell del dash llega
// en Fase 2 (vite-plugin-pwa), que reemplazará este archivo.

self.addEventListener("install", () => {
  // Activa de inmediato la nueva versión sin esperar a que cierren las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de los clientes abiertos en cuanto activa.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Handler intencionalmente vacío: sin `respondWith`, el navegador resuelve
  // cada request con su comportamiento de red por defecto. Solo existe para
  // que el SW cuente como "tiene fetch handler" (requisito de instalación).
});
