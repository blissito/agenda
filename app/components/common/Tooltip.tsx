import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

type Side = "top" | "bottom" | "left" | "right"

const computePos = (rect: DOMRect, side: Side) => {
  switch (side) {
    case "bottom":
      return { top: rect.bottom + 8, left: rect.left + rect.width / 2, transform: "translate(-50%, 0)" }
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - 8, transform: "translate(-100%, -50%)" }
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + 8, transform: "translate(0, -50%)" }
    case "top":
    default:
      return { top: rect.top - 8, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" }
  }
}

export const Tooltip = ({
  label,
  side = "top",
  children,
  className = "",
}: {
  label: string
  side?: Side
  children: ReactNode
  className?: string
}) => {
  const triggerRef = useRef<HTMLElement>(null)
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; transform: string } | null>(null)

  const update = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    setPos(computePos(el.getBoundingClientRect(), side))
  }, [side])

  useLayoutEffect(() => {
    if (!show) return
    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [show, update])

  const handlers = {
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false),
  }

  // If the child is a single element, attach the ref + handlers directly to it
  // so the trigger box matches the visible target (no extra wrapper geometry).
  if (isValidElement(children)) {
    const child = children as ReactElement<any>
    const merged = {
      ...handlers,
      ref: (node: HTMLElement | null) => {
        ;(triggerRef as any).current = node
        const { ref: childRef } = child as any
        if (typeof childRef === "function") childRef(node)
        else if (childRef && typeof childRef === "object") childRef.current = node
      },
    }
    return (
      <>
        {cloneElement(child, merged)}
        {show && pos && typeof document !== "undefined" &&
          createPortal(
            <span
              role="tooltip"
              style={{ top: pos.top, left: pos.left, transform: pos.transform }}
              className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md bg-brand_dark text-white text-xs whitespace-nowrap shadow-lg"
            >
              {label}
            </span>,
            document.body,
          )}
      </>
    )
  }

  return (
    <span
      ref={triggerRef as any}
      className={`relative inline-flex ${className}`}
      {...handlers}
    >
      {children}
      {show && pos && typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: pos.top, left: pos.left, transform: pos.transform }}
            className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md bg-brand_dark text-white text-xs whitespace-nowrap shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}
