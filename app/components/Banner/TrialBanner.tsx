import * as React from "react"

type TrialStatus = "ending_soon" | "expired"

type TrialBannerProps = {
  open: boolean
  status: TrialStatus
  imageSrc?: string

  onPrimaryAction: () => void
  onDismiss?: () => void

  primaryLabel?: string
  secondaryLabel?: string

  className?: string
}

const COPY: Record<
  TrialStatus,
  { title: string; description: string; primaryLabel: string }
> = {
  ending_soon: {
    title: "Tu periodo de prueba está por terminar ⏳",
    description:
      "Actualiza tu plan para no perder acceso a las funcionalidades.",
    primaryLabel: "Actualizar plan",
  },
  expired: {
    title: "Vaya, tu periodo de prueba ha terminado 🚀",
    description:
      "Mejora tu plan ahora y obtén 20% de descuento en tu primer año.",
    primaryLabel: "Suscribirme",
  },
}

export default function TrialBanner({
  open,
  status,
  imageSrc,
  onPrimaryAction,
  onDismiss,
  primaryLabel,
  secondaryLabel = "En otro momento",
  className = "",
}: TrialBannerProps) {
  const copy = COPY[status]
  const titleId = React.useId()

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4 ${className}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="relative">
          {imageSrc ? (
            <img src={imageSrc} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="h-40 w-full bg-neutral-100" />
          )}

          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Cerrar"
              className="
                absolute right-3 top-3 grid h-9 w-9 place-items-center
                rounded-full bg-white/80 text-neutral-800 shadow
                hover:bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="px-6 py-6">
          <h2
            id={titleId}
            className="text-[18px] font-semibold text-neutral-900"
          >
            {copy.title}
          </h2>

          <p className="mt-2 text-sm text-neutral-600">{copy.description}</p>

          <div className="mt-6 flex items-center gap-3">
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="
                  h-10 flex-1 rounded-full border border-neutral-200
                  bg-white px-4 text-sm font-medium text-neutral-800
                  hover:bg-neutral-50
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              >
                {secondaryLabel}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onPrimaryAction}
              className="
                h-10 flex-1 rounded-full bg-indigo-600 px-4
                text-sm font-semibold text-white
                hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              {primaryLabel ?? copy.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
