import { useRef, useState } from "react"
import { FaCheck, FaLink } from "react-icons/fa6"
import { twMerge } from "tailwind-merge"
import { ParticleLayer, playBurstSound, useParticleBurst } from "./ParticleBurst"

export const CopyLinkButton = ({
  url,
  className,
  label = "Copiar link",
  copiedLabel = "¡Copiado!",
}: {
  url: string
  className?: string
  label?: string
  copiedLabel?: string
}) => {
  const [copied, setCopied] = useState(false)
  const { particles, burst } = useParticleBurst()
  const timeoutRef = useRef<number | null>(null)

  const handleClick = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    burst()
    playBurstSound()
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "relative mt-4 flex items-center gap-2 border border-brand_stroke rounded-full px-4 py-2 text-sm text-brand_dark hover:bg-gray-50 transition-all active:scale-95",
        copied && "border-brand_blue bg-brand_blue/5",
        className,
      )}
    >
      {copied ? (
        <FaCheck className="text-brand_blue w-3.5 h-3.5" />
      ) : (
        <FaLink className="w-3.5 h-3.5" />
      )}
      <span>{copied ? copiedLabel : label}</span>
      <ParticleLayer particles={particles} />
    </button>
  )
}
