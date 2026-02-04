import { type ReactNode } from "react"

export const RouteTitle = ({
  children,
  ...props
}: {
  props?: unknown
  children: ReactNode
}) => (
  <h1 className="text-3xl font-semibold mb-8" {...props}>
    {children}
  </h1>
)
