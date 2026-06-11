import { useCallback, useEffect, useRef, useState } from "react"

// Nombre de la cookie con el estado del sidebar. Usamos cookie (no localStorage)
// para que el SERVIDOR pueda leer el estado y renderizar el HTML inicial con el
// ancho correcto → sin flash de "abierto → colapsa" al refrescar. El loader la
// parsea (ver `readSidebarOpenCookie`) y la siembra como estado inicial.
export const SIDEBAR_COOKIE = "denik_sidebar_open"

// Lee el estado del sidebar desde el header Cookie de una request (server-side).
// Default: abierto (true) si no hay cookie.
export function readSidebarOpenCookie(request: Request): boolean {
  const cookie = request.headers.get("Cookie")
  if (!cookie) return true
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SIDEBAR_COOKIE}=`))
  if (!match) return true
  return match.slice(SIDEBAR_COOKIE.length + 1) !== "false"
}

// Constantes centralizadas. En web el sidebar ya no se traslada fuera de
// pantalla al colapsar: pasa de `width.open` (320) a `width.rail` (88), un rail
// angosto que conserva los iconos. Solo cambia el ancho; el contenido se
// reposiciona con `content.{open,rail}`.
const SIDEBAR = {
  width: { open: 320, rail: 88 },
  // padding-left del contenido principal según el estado del sidebar
  content: { open: 360, rail: 116 },
  spring: { type: "spring" as const, bounce: 0.2 },
  swipe: {
    edgeThreshold: 30, // px desde el borde para detectar swipe
    minDistance: 50, // distancia mínima del swipe
    maxVertical: 50, // máximo movimiento vertical permitido
  },
} as const

export function useSidebarState(initialOpen = true) {
  // El estado inicial llega del servidor (cookie), así SSR y el primer render de
  // cliente coinciden → sin flash ni hydration mismatch.
  const [isOpen, setIsOpenState] = useState(initialOpen)

  const setIsOpen = useCallback(
    (updater: boolean | ((prev: boolean) => boolean)) => {
      setIsOpenState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        // Persistimos en cookie (1 año) para que el próximo SSR sepa el estado.
        // Preferencia de UI, no sensible: acotada a /dash (único consumidor) y
        // con Secure en HTTPS. SameSite=Lax evita envío cross-site innecesario.
        try {
          const secure =
            window.location.protocol === "https:" ? "; Secure" : ""
          document.cookie = `${SIDEBAR_COOKIE}=${
            next ? "true" : "false"
          }; path=/dash; max-age=31536000; SameSite=Lax${secure}`
        } catch {}
        return next
      })
    },
    [],
  )

  const toggle = useCallback(() => {
    setIsOpen((o) => !o)
  }, [setIsOpen])

  // Ref estable para listeners (swipe usa el valor actual sin recrear el efecto)
  const isOpenRef = useRef(isOpen)
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  // Keyboard shortcut: Cmd/Ctrl + B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  // Swipe desde el borde izquierdo para abrir / hacia la izquierda para colapsar
  useEffect(() => {
    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - startX
      const deltaY = Math.abs(endY - startY)
      const { edgeThreshold, minDistance, maxVertical } = SIDEBAR.swipe

      // Swipe horizontal desde borde izquierdo para abrir
      if (
        startX < edgeThreshold &&
        deltaX > minDistance &&
        deltaY < maxVertical &&
        !isOpenRef.current
      ) {
        toggle()
      }
      // Swipe hacia izquierda para colapsar (desde el área del sidebar)
      if (
        deltaX < -minDistance &&
        deltaY < maxVertical &&
        isOpenRef.current &&
        startX < SIDEBAR.width.open
      ) {
        toggle()
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [toggle])

  return {
    collapsed: !isOpen,
    isOpen,
    toggle,
    config: SIDEBAR,
  }
}
