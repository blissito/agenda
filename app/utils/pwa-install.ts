// Captura de `beforeinstallprompt` a nivel de módulo.
//
// Chrome dispara este evento UNA sola vez y muy temprano — normalmente antes de
// que React hidrate y monte los `useEffect` de las rutas. Si el listener se
// engancha en un componente, se pierde el evento (por eso aparecía el ícono ⊕
// del navegador pero no nuestro banner). Engancharlo en module-scope, importado
// desde root.tsx, lo captura apenas se evalúa el bundle del cliente y lo guarda
// para que el componente lo lea cuando monte.

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<(event: BeforeInstallPromptEvent) => void>()

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Evita el mini-infobar automático de Chrome; lo disparamos nosotros.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    for (const cb of listeners) cb(deferredPrompt)
  })
  // Si se instala, el prompt deja de ser válido.
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
  })
}

/** Devuelve el evento ya capturado (o null si aún no llegó / no aplica). */
export function getDeferredPrompt() {
  return deferredPrompt
}

/** Invalida el prompt tras consumirlo. */
export function clearDeferredPrompt() {
  deferredPrompt = null
}

/** Suscribe a futuras emisiones del evento. Devuelve la función para desuscribir. */
export function onInstallable(cb: (event: BeforeInstallPromptEvent) => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
