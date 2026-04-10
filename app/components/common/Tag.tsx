import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export const Tag = ({
  className,
  children = "activo",
}: {
  children?: ReactNode
  className?: string
}) => (
  <section
    className={twMerge(
      "bg-brand_cloud/20 text-cyan-600 rounded-[4px] h-5 w-fit flex justify-center items-center text-center px-2 text-sm font-satoshi capitalize",
      className,
    )}
  >
    {children}
  </section>
)
