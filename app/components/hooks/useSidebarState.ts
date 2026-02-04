import { useAnimate, useMotionValue, useTransform } from "motion/react"
import { useCallback, useEffect } from "react"
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

  const toggle = useCallback(() => {
    const opening = x.get() < SIDEBAR.threshold
    const target = opening ? SIDEBAR.openX : SIDEBAR.closedX
    const config = opening ? SIDEBAR.spring.open : SIDEBAR.spring.close

    animate(scope.current, { x: target }, config)
    setIsOpen(opening)
  }, [animate, scope, setIsOpen, x])

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
