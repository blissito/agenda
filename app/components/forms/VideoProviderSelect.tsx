import { useEffect, useRef, useState } from "react"
import { FaChevronDown } from "react-icons/fa6"
import { twMerge } from "tailwind-merge"

export type VideoProviderValue = "meet" | "zoom" | "none"

type Option = {
  value: VideoProviderValue | "denik"
  label: string
  sublabel?: string
  icon: React.ReactNode
  disabled?: boolean
}

const NoneIcon = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-brand_stroke text-brand_gray text-[14px]">
    ∅
  </div>
)

const MeetIcon = () => (
  <img src="/images/google-meet.svg" alt="Google Meet" className="h-6 w-6" />
)

const ZoomIcon = () => (
  <img src="/images/zoom.svg" alt="Zoom" className="h-6 w-6" />
)

export const VideoProviderSelect = ({
  value,
  onChange,
  hasMeet,
  hasZoom,
  label = "Link de llamada",
  className,
}: {
  value: VideoProviderValue
  onChange: (v: VideoProviderValue) => void
  hasMeet?: boolean
  hasZoom?: boolean
  label?: string
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const options: Option[] = [
    ...(hasMeet
      ? [
          {
            value: "meet" as const,
            label: "Google Meet",
            sublabel: "Crea evento en Google Calendar",
            icon: <MeetIcon />,
          },
        ]
      : []),
    ...(hasZoom
      ? [
          {
            value: "zoom" as const,
            label: "Zoom",
            sublabel: "Crea reunión en Zoom",
            icon: <ZoomIcon />,
          },
        ]
      : []),
    {
      value: "none",
      label: "Sin link de llamada",
      sublabel: "Cita sin videollamada",
      icon: <NoneIcon />,
    },
    {
      value: "denik",
      label: "Denik Link",
      sublabel: "Próximamente",
      icon: (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand_blue/10 text-brand_blue text-[13px] font-satoBold">
          D
        </div>
      ),
      disabled: true,
    },
  ]

  const selected = options.find((o) => o.value === value) ?? options[0]

  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-satoMedium text-brand_dark">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 rounded-full border border-brand_stroke bg-white px-4 py-2.5 text-left transition-all hover:border-brand_blue focus:border-brand_blue focus:outline-none"
        >
          <span className="flex items-center gap-3 min-w-0">
            {selected.icon}
            <span className="flex flex-col min-w-0">
              <span className="text-[14px] font-satoMedium text-brand_dark truncate">
                {selected.label}
              </span>
              {selected.sublabel && (
                <span className="text-[11px] text-brand_gray truncate">
                  {selected.sublabel}
                </span>
              )}
            </span>
          </span>
          <FaChevronDown
            className={twMerge(
              "text-brand_gray text-xs transition-transform shrink-0",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 overflow-hidden rounded-2xl border border-brand_stroke bg-white shadow-lg">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange(opt.value as VideoProviderValue)
                    setOpen(false)
                  }}
                  className={twMerge(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    !opt.disabled && "hover:bg-brand_pale/50",
                    opt.disabled && "opacity-50 cursor-not-allowed",
                    isSelected && "bg-brand_pale/30",
                  )}
                >
                  {opt.icon}
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-[14px] font-satoMedium text-brand_dark truncate">
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span className="text-[11px] text-brand_gray truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </span>
                  {isSelected && !opt.disabled && (
                    <span className="text-brand_blue text-sm">✓</span>
                  )}
                  {opt.disabled && (
                    <span className="text-[10px] font-satoMedium uppercase tracking-wide text-brand_blue bg-brand_blue/10 rounded-full px-2 py-0.5">
                      Pronto
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
