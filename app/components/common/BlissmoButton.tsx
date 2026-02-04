import { cn } from "~/utils/cn"

export const BlissmoButton = ({
  mode = "primary",
  className,
  isDisabled,
  isLoading,
  ...props
}: {
  isDisabled?: boolean
  isLoading?: boolean
  className?: string
  mode: "primary" | "secondary" | "ghost"
  [x: string]: unknown
}) => {
  return (
    <button
      className={cn(
        "bg-red-500 rounded-xl text-white border",
        {
          "animate-spin overflow-hidden w-4 h-4 border-t-indigo-500": isLoading,
          "pointer-events-none bg-gray-300 text-gray-400": isDisabled,
          "bg-green-500 rounded-lg text-gray-800": mode === "secondary",
          "bg-transparent rounded-full border-2 text-black": mode === "ghost",
        },
        className,
      )}
      {...props}
    />
  )
}
