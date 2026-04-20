import { type ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export const RouteTitle = ({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={twMerge("text-3xl font-satoBold mb-4 md:mb-8", className)}
    {...props}
  >
    {children}
  </h1>
)
