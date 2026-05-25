import { useEffect, useState } from "react"
import { PrimaryButton } from "~/components/common/primaryButton"
import {
  type BeforeInstallPromptEvent,
  clearDeferredPrompt,
  getDeferredPrompt,
  onInstallable,
} from "~/utils/pwa-install"

const DISMISS_KEY = "denik-pwa-install-dismissed"

function getIsStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS expone esto cuando la PWA corre desde la pantalla de inicio.
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

function getIsIOS() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  // iPadOS 13+ se reporta como "MacIntel" con touch, hay que detectarlo aparte.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  return /iphone|ipad|ipod/i.test(ua) || iPadOS
}

/**
 * Banner de instalación de la PWA, pensado para vivir dentro del dashboard.
 * - Chrome/Android/desktop: captura `beforeinstallprompt` y dispara el diálogo
 *   nativo al click.
 * - iOS Safari: no existe prompt programático, así que mostramos el mini
 *   tutorial de "Compartir → Agregar a inicio de pantalla".
 * - Ya instalada (standalone) o descartada: no renderiza nada.
 */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  // Arranca oculto: solo decidimos mostrarlo tras evaluar en el cliente,
  // así no hay flash en SSR ni mismatch de hidratación.
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (getIsStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === "1") return

    setDismissed(false)

    if (getIsIOS()) {
      setShowIOS(true)
      return
    }

    // El evento pudo capturarse ya en module-scope (root) antes de montar.
    const existing = getDeferredPrompt()
    if (existing) setDeferred(existing)

    // ...y suscribirnos por si llega después.
    const unsubscribe = onInstallable((event) => setDeferred(event))
    const onInstalled = () => {
      setDeferred(null)
      setDismissed(true)
    }
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      unsubscribe()
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const close = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // localStorage puede fallar en modo privado; no es crítico.
    }
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    clearDeferredPrompt()
    close()
  }

  // No mostrar si está oculto, o si no hay nada accionable (ni iOS ni prompt).
  if (dismissed) return null
  if (!showIOS && !deferred) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl md:left-auto md:top-auto md:right-4 md:bottom-4 md:translate-x-0">
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      <div className="flex items-start gap-3 pr-4">
        <img
          src="/images/isotipo.png"
          alt=""
          className="h-10 w-10 rounded-xl"
        />
        <div className="flex-1">
          {showIOS ? (
            <>
              <p className="font-satoMiddle text-gray-800">
                Instala Denik en tu iPhone
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Toca <span className="font-semibold">Compartir</span> y luego{" "}
                <span className="font-semibold">
                  "Agregar a inicio de pantalla"
                </span>
                .
              </p>
            </>
          ) : (
            <>
              <p className="font-satoMiddle text-gray-800">
                Instala Denik como app
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Acceso rápido desde tu pantalla de inicio, sin barra del
                navegador.
              </p>
              <PrimaryButton
                onClick={install}
                className="mt-3 min-h-[40px] min-w-0 px-5"
              >
                Instalar app
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
