import * as React from "react"
import { twMerge } from "tailwind-merge"

export const Avatar = ({
  className,
  image,
  fallbackSrc = "/images/avatar.svg",
}: {
  className?: string
  image?: string | null
  fallbackSrc?: string
}) => {
  const [src, setSrc] = React.useState<string>(image || fallbackSrc)

  React.useEffect(() => {
    setSrc(image || fallbackSrc)
  }, [image, fallbackSrc])

  return (
    <img
      alt="avatar"
      className={twMerge(
        // Base neutra (sin márgenes negativos)
        "rounded-full object-cover border-2 border-white shrink-0",
        className,
      )}
      src={src}
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc)
      }}
    />
  )
}
