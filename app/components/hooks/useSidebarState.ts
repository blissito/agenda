import { useAnimate, useMotionValue, useTransform } from "motion/react"
import { useCallback, useEffect, useRef } from "react"
import { useLocalStorage } from "./useLocalStorage"

// Constantes centralizadas
const SIDEBAR = {
  width: 320,
  closedX: -290,
  openX: 0,
  threshold: -180,
  spring: {
    open: { type: "spring" as const, bounce: 0.2 },
    close: { type: "spring" as const, bounce: 0.5 },
  },
  padding: { min: 60, mid: 360, max: 660 },
  swipe: {
    edgeThreshold: 30, // px desde el borde para detectar swipe
    minDistance: 50, // distancia mínima del swipe
    maxVertical: 50, // máximo movimiento vertical permitido
  },
} as const

export function useSidebarState() {
  const [hasVisited, setHasVisited] = useLocalStorage(
    "denik_sidebar_visited",
    false,
  )
  const [isOpen, setIsOpen] = useLocalStorage("denik_sidebar_open", false)

  const x = useMotionValue<number>(SIDEBAR.closedX)
  const [scope, animate] = useAnimate()
  const contentPadding = useTransform(
    x,
    [SIDEBAR.closedX - 10, SIDEBAR.openX, SIDEBAR.closedX * -1],
    [SIDEBAR.padding.min, SIDEBAR.padding.mid, SIDEBAR.padding.max],
  )

  // Hidratar posición después del mount
  useEffect(() => {
    // Primera visita: abrir y marcar como visitado
    const shouldOpen = !hasVisited || isOpen
    if (!hasVisited) {
      setHasVisited(true)
      setIsOpen(true)
    }
    const target = shouldOpen ? SIDEBAR.openX : SIDEBAR.closedX
    // Animar solo si hay diferencia y scope está listo
    if (scope.current && x.get() !== target) {
      animate(scope.current, { x: target }, SIDEBAR.spring.open)
    } else {
      x.set(target)
    }
  }, [hasVisited, isOpen, setHasVisited, setIsOpen, x, scope, animate])

  // Usar ref para toggle estable en listeners
  const isOpenRef = useRef(isOpen)
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const toggle = useCallback(() => {
    const opening = x.get() < SIDEBAR.threshold
    const target = opening ? SIDEBAR.openX : SIDEBAR.closedX
    const config = opening ? SIDEBAR.spring.open : SIDEBAR.spring.close

    animate(scope.current, { x: target }, config)
    setIsOpen(opening)
  }, [animate, scope, setIsOpen, x])

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

  // Swipe desde el borde izquierdo para abrir/cerrar
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
      // Swipe hacia izquierda para cerrar (desde el área del sidebar)
      if (
        deltaX < -minDistance &&
        deltaY < maxVertical &&
        isOpenRef.current &&
        startX < SIDEBAR.width
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

  const onDragEnd = useCallback(() => {
    const opening = x.get() >= SIDEBAR.threshold
    const target = opening ? SIDEBAR.openX : SIDEBAR.closedX
    const config = opening ? SIDEBAR.spring.open : SIDEBAR.spring.close

    animate(scope.current, { x: target }, config)
    setIsOpen(opening)
  }, [animate, scope, setIsOpen, x])

  return {
    x,
    scope,
    contentPadding,
    isOpen,
    toggle,
    onDragEnd,
    config: SIDEBAR,
  }
}
