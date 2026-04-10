import { useState } from "react"
import { twMerge } from "tailwind-merge"

export const ClientAvatar = ({
  photoUrl,
  initials,
  size = "sm",
  className,
}: {
  photoUrl?: string | null
  initials: string
  size?: "sm" | "md"
  className?: string
}) => {
  const [imageError, setImageError] = useState(false)

  const dim = size === "md" ? "w-10 h-10 text-sm" : "w-11 h-11 text-sm"

  if (!photoUrl || imageError) {
    return (
      <div
        className={twMerge(
          "rounded-full bg-brand_blue text-white flex items-center justify-center font-semibold shrink-0",
          dim,
          className,
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={photoUrl}
      alt={initials}
      className={twMerge(
        "rounded-full object-cover shrink-0 border border-slate-200",
        dim,
        className,
      )}
      onError={() => setImageError(true)}
    />
  )
}
