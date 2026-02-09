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

  // Si cambias de cliente, actualiza el src
  React.useEffect(() => {
    setSrc(image || fallbackSrc)
  }, [image, fallbackSrc])

  return (
    <img
      alt="avatar"
      className={twMerge(
        "w-12 h-12 rounded-full object-cover border-[2px] border-white -ml-3",
        className,
      )}
      src={src}
      onError={() => {
        // Si la imagen de Google falla, usa el avatar local
        if (src !== fallbackSrc) setSrc(fallbackSrc)
      }}
    />
  )
}
