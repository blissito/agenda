import { AnimatePresence, motion, type PanInfo } from "motion/react"
import { useEffect, useState } from "react"
import { PrimaryButton } from "~/components/common/primaryButton"
import {
  type BeforeInstallPromptEvent,
  clearDeferredPrompt,
  getDeferredPrompt,
  onInstallable,
} from "~/utils/pwa-install"

const DISMISS_KEY = "denik-pwa-install-dismissed"

// Ícono nativo de "Compartir" de iOS (cuadrado con flecha hacia arriba).
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline-block h-4 w-4 align-text-bottom text-blue-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="ícono Compartir"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 12v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
    </svg>
  )
}

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

// En iOS todos los navegadores corren sobre WebKit, pero el botón "Compartir"
// vive en un lugar distinto según el navegador, así que ajustamos el tutorial.
function getIOSBrowser(): "safari" | "chrome" | "other" {
  if (typeof navigator === "undefined") return "safari"
  const ua = navigator.userAgent
  if (/CriOS/i.test(ua)) return "chrome"
  // Firefox (FxiOS) y Edge (EdgiOS) comparten el patrón del menú de Chrome.
  if (/FxiOS|EdgiOS/i.test(ua)) return "other"
  return "safari"
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
  const [iosBrowser, setIosBrowser] = useState<"safari" | "chrome" | "other">(
    "safari",
  )
  // Arranca oculto: solo decidimos mostrarlo tras evaluar en el cliente,
  // así no hay flash en SSR ni mismatch de hidratación.
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (getIsStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === "1") return

    setDismissed(false)

    if (getIsIOS()) {
      setIosBrowser(getIOSBrowser())
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

  // Cierra si el usuario arrastra la hoja hacia abajo lo suficiente (gesto
  // nativo de los bottom sheets).
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 600) close()
  }

  // Visible solo tras evaluar en cliente y si hay algo accionable.
  const visible = !dismissed && (showIOS || Boolean(deferred))

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim: oscurece el dash y permite cerrar tocando fuera. */}
          <motion.div
            key="pwa-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Hoja: ancho completo abajo en móvil; tarjeta centrada en desktop. */}
          <motion.div
            key="pwa-sheet"
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={onDragEnd}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-2xl md:bottom-4 md:rounded-3xl"
            style={{
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Grab handle (solo móvil). */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="h-1.5 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="px-5 pt-4">
              <div className="flex items-start gap-3">
                <img
                  src="/images/nik_pwa.svg"
                  alt="Nik, la mascota de Denik"
                  className="h-14 w-auto shrink-0"
                />
                <div className="flex-1">
                  {showIOS ? (
                    <>
                      <p className="font-satoMiddle text-gray-800">
                        Instala Denik en tu iPhone
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        1. Toca el botón <ShareIcon />{" "}
                        <span className="font-semibold">Compartir</span>{" "}
                        {iosBrowser === "safari"
                          ? "en la barra de abajo"
                          : "del navegador"}
                        .
                        <br />
                        2. Elige{" "}
                        <span className="font-semibold">
                          "Agregar a pantalla de inicio"
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
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {showIOS ? (
                  <PrimaryButton
                    onClick={close}
                    className="min-h-[44px] w-full min-w-0"
                  >
                    Entendido
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    onClick={install}
                    className="min-h-[44px] w-full min-w-0"
                  >
                    Instalar app
                  </PrimaryButton>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="min-h-[40px] text-sm text-gray-400 hover:text-gray-600"
                >
                  Ahora no
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
