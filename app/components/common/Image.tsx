import { type ChangeEvent, type SyntheticEvent, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

const TIGRIS_BUCKET = "easybits-public"

/**
 * Transforms an image source to the correct URL format
 * - If it's already a URL (starts with http, https, /, or data:), return as-is
 * - If it's a storage key (like "services/xxx/photo"), transform to public Tigris URL
 */
function resolveImageSrc(src?: string): string | undefined {
  if (!src) return undefined
  // Already a URL or data URI
  if (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:")) {
    return src
  }
  // It's a storage key - transform to public Tigris URL
  return `https://${TIGRIS_BUCKET}.fly.storage.tigris.dev/denik/${src}`
}

export const ImageInput = ({ src }: { src?: string }) => {
  const [imageSrc, setImageSrc] = useState(src)
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    setImageSrc(URL.createObjectURL(file))
    // @todo upload image & update DB
  }
  return (
    <section>
      <button
        onClick={() => {
          inputRef.current?.click()
        }}
      >
        <Image className="h-[200px] w-[400px] rounded-2xl" src={imageSrc} />
      </button>
      <input
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
        className="hidden"
        name="file"
      />
    </section>
  )
}

export const Image = ({
  src = "",
  className,
  alt = "illustration",

  ...props
}: {
  photoURL?: string
  className?: string
  src?: string
  props?: unknown
  alt?: string
}) => {
  const defaultSrc = "/images/serviceDefault.png"
  const resolvedSrc = resolveImageSrc(src) || defaultSrc

  return (
    <img
      alt={alt}
      {...props}
      className={twMerge("w-full h-[184px] object-cover object-top", className)}
      src={resolvedSrc}
      onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
        ;(e.target as HTMLInputElement).onerror = null // previene el loop
        ;(e.target as HTMLInputElement).src = defaultSrc
      }}
    />
  )
}
