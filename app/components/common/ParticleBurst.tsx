import { useCallback, useState } from "react"

type Particle = {
  id: number
  angle: number
  distance: number
  color: string
  size: number
  duration: number
}

const DEFAULT_COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
]

let uid = 0

export function useParticleBurst({
  count = 14,
  colors = DEFAULT_COLORS,
  minDistance = 32,
  maxDistance = 60,
  minSize = 4,
  maxSize = 9,
  duration = 650,
  autoClearMs = 1200,
}: {
  count?: number
  colors?: string[]
  minDistance?: number
  maxDistance?: number
  minSize?: number
  maxSize?: number
  duration?: number
  autoClearMs?: number
} = {}) {
  const [particles, setParticles] = useState<Particle[]>([])

  const burst = useCallback(() => {
    const batch = Array.from({ length: count }, () => ({
      id: ++uid,
      angle: Math.random() * Math.PI * 2,
      distance: minDistance + Math.random() * (maxDistance - minDistance),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: minSize + Math.random() * (maxSize - minSize),
      duration: duration + Math.random() * 250,
    }))
    setParticles(batch)
    window.setTimeout(() => setParticles([]), autoClearMs)
  }, [
    count,
    colors,
    minDistance,
    maxDistance,
    minSize,
    maxSize,
    duration,
    autoClearMs,
  ])

  return { particles, burst }
}

export const ParticleLayer = ({
  particles,
  className = "",
}: {
  particles: Particle[]
  className?: string
}) => (
  <span
    className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
  >
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
            animation: `particleBurst ${p.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
            ["--tx" as any]: `${tx}px`,
            ["--ty" as any]: `${ty}px`,
          }}
        />
      )
    })}
    <style>{`
      @keyframes particleBurst {
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
  </span>
)

// Helper: sonido cálido tipo marimba (triangle + low-pass + soft decay)
export const playBurstSound = () => {
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime

    // Low-pass para quitar brillos filosos
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 2200
    filter.Q.value = 0.7
    filter.connect(ctx.destination)

    // Mini arpegio cálido: C5, E5, G5 (acorde mayor)
    const notes = [
      { freq: 523.25, start: 0.0, dur: 0.45 }, // C5
      { freq: 659.25, start: 0.06, dur: 0.45 }, // E5
      { freq: 783.99, start: 0.12, dur: 0.5 }, // G5
    ]

    for (const n of notes) {
      const osc = ctx.createOscillator()
      // Triangle + pequeño detune para sensación orgánica
      osc.type = "triangle"
      osc.frequency.value = n.freq
      osc.detune.value = (Math.random() - 0.5) * 6

      // Segundo armónico sutil (sine una octava arriba) para cuerpo
      const osc2 = ctx.createOscillator()
      osc2.type = "sine"
      osc2.frequency.value = n.freq * 2

      const gain = ctx.createGain()
      const gain2 = ctx.createGain()

      // Ataque muy suave, decay largo → sensación "pluck" acogedor
      gain.gain.setValueAtTime(0.0001, now + n.start)
      gain.gain.exponentialRampToValueAtTime(0.14, now + n.start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur)

      gain2.gain.setValueAtTime(0.0001, now + n.start)
      gain2.gain.exponentialRampToValueAtTime(0.035, now + n.start + 0.02)
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur * 0.7)

      osc.connect(gain).connect(filter)
      osc2.connect(gain2).connect(filter)

      osc.start(now + n.start)
      osc.stop(now + n.start + n.dur + 0.05)
      osc2.start(now + n.start)
      osc2.stop(now + n.start + n.dur * 0.7 + 0.05)
    }

    setTimeout(() => ctx.close().catch(() => {}), 900)
  } catch {
    /* silent */
  }
}
