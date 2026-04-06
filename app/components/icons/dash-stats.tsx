import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

const stats = [
  { title: "Ventas del mes", value: 12450, prefix: "$", color: "bg-[#64D0C5]", icon: "/images/chart.svg" },
  { title: "Nuevos clientes", value: 38, prefix: "", color: "bg-[#EEC446]", icon: "/images/profile.svg" },
  { title: "Citas agendadas", value: 124, prefix: "", color: "bg-[#FFAB61]", icon: "/images/agenda-dash.svg" },
  { title: "Citas canceladas", value: 5, prefix: "", color: "bg-[#91B870]", icon: "/images/cancel.svg" },
]

const AnimatedNumber = ({
  target,
  prefix,
  isHovering,
}: {
  target: number
  prefix: string
  isHovering: boolean
}) => {
  const [current, setCurrent] = useState(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isHovering) return

    setCurrent(0)
    const duration = 1200
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isHovering, target])

  const formatted =
    target >= 1000
      ? current.toLocaleString("es-MX")
      : String(current)

  return (
    <span>
      {prefix}
      {formatted}
    </span>
  )
}

export const DashStatsIllustration = ({
  className,
}: {
  className?: string
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const group = el.closest(".group")
    if (!group) return

    const enter = () => setIsHovering(true)
    const leave = () => setIsHovering(false)

    group.addEventListener("mouseenter", enter)
    group.addEventListener("mouseleave", leave)
    return () => {
      group.removeEventListener("mouseenter", enter)
      group.removeEventListener("mouseleave", leave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={twMerge("flex flex-row md:flex-col gap-3", className)}
    >
      {stats.map((s) => (
        <div
          key={s.title}
          className={twMerge(
            "rounded-2xl p-4 relative overflow-hidden flex flex-col justify-end h-[120px]",
            s.color
          )}
        >
          <img
            src={s.icon}
            className="absolute right-0 top-0 w-[56px]"
            alt=""
          />
          <p className="text-sm text-white/80">{s.title}</p>
          <p className="text-3xl font-satoMedium text-white leading-tight">
            <AnimatedNumber
              target={s.value}
              prefix={s.prefix}
              isHovering={isHovering}
            />
          </p>
        </div>
      ))}
    </div>
  )
}
