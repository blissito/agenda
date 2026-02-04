import { motion, useMotionTemplate, useSpring } from "motion/react"
import { type MouseEvent, type ReactNode } from "react"
import { cn } from "~/utils/cn"
import { useMeasure } from "~/utils/hooks/useMeasure"
import { useTimeout } from "../hooks/useTimeout"

export const BackgroundHighlight = ({
  className,
  children,
}: {
  children?: ReactNode
  className?: string
}) => {
  const {
    ref,
    state: { left, width },
  } = useMeasure()
  const percentage = useSpring(0, { bounce: 0.2 })

  const { placeTimeout } = useTimeout(1000)

  const handleMouseEnter = (event: MouseEvent<HTMLSpanElement>) => {
    const { clientX } = event
    const p = (clientX - left) / width
    percentage.set(p * 100)
  }
  const backgroundSize = useMotionTemplate`${percentage}% 100%`

  const handleMouseLeave = () => {
    placeTimeout(() => percentage.set(100))
  }

  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ delay: 1 }}
      ref={ref}
      onMouseMove={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundSize,
      }}
      className={cn("bg-gradient-to-l rounded px-1", className)}
      id="container"
    >
      {children}
    </motion.span>
  )
}
