import { useRef, useState } from "react"
import { FaCheck, FaLink } from "react-icons/fa6"
import { twMerge } from "tailwind-merge"

type Particle = {
  id: number
  angle: number
  distance: number
  color: string
  size: number
  duration: number
}

const COLORS = [
  "#8b5cf6", // brand purple
  "#a78bfa",
  "#c4b5fd",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
]

let uid = 0
const makeParticles = (n = 14): Particle[] =>
  Array.from({ length: n }, () => ({
    id: ++uid,
    angle: Math.random() * Math.PI * 2,
    distance: 32 + Math.random() * 28,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 5,
    duration: 550 + Math.random() * 250,
  }))

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
  const [particles, setParticles] = useState<Particle[]>([])
  const timeoutRef = useRef<number | null>(null)

  const handleClick = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setParticles(makeParticles())
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false)
      setParticles([])
    }, 1500)
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

      {/* Particles */}
      <span className="pointer-events-none absolute inset-0 overflow-visible">
        {particles.map((p) => {
          const tx = Math.cos(p.angle) * p.distance
          const ty = Math.sin(p.angle) * p.distance
          return (
            <span
              key={p.id}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                animation: `copyBurst ${p.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
                // CSS vars for keyframes
                ["--tx" as any]: `${tx}px`,
                ["--ty" as any]: `${ty}px`,
              }}
            />
          )
        })}
      </span>

      <style>{`
        @keyframes copyBurst {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          70% { opacity: 1; }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}
