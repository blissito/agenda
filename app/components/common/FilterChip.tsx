import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export const FilterChip = ({
  children,
  icon,
  active = false,
  onClick,
  className,
}: {
  children: ReactNode
  icon?: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={twMerge(
      "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-satoMedium transition-colors",
      active
        ? "border-brand_blue bg-brand_blue/10 text-brand_blue"
        : "border-brand_stroke bg-white text-brand_gray hover:bg-slate-50",
      className,
    )}
  >
    {icon && <span>{icon}</span>}
    {children}
  </button>
)
