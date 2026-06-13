import { useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"

/**
 * Toggle "se ofrece en esta sede" que se superpone sobre una ServiceCard cuando
 * hay una sucursal no-principal activa. Crea/elimina el ServiceBranch via el
 * action de /dash/servicios (intent `toggle_service_branch`). Optimista.
 */
export function BranchServiceToggle({
  serviceId,
  branchId,
  offered,
}: {
  serviceId: string
  branchId: string
  offered: boolean
}) {
  const fetcher = useFetcher()
  // Optimismo: si hay un submit en vuelo, refleja el valor enviado.
  const pending = fetcher.formData?.get("offered")
  const isOffered = pending != null ? pending === "true" : offered

  return (
    <fetcher.Form
      method="post"
      action="/dash/servicios"
      className="absolute top-2 left-2 z-10"
    >
      <input type="hidden" name="intent" value="toggle_service_branch" />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="offered" value={(!isOffered).toString()} />
      <button
        type="submit"
        aria-pressed={isOffered}
        title={
          isOffered
            ? "Se ofrece en esta sucursal — clic para desactivar"
            : "No se ofrece aquí — clic para activar"
        }
        className={twMerge(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-satoMedium shadow-sm border transition-colors",
          isOffered
            ? "bg-brand_blue text-white border-brand_blue"
            : "bg-white text-brand_gray border-gray-200 hover:border-brand_blue/40",
        )}
      >
        <span
          className={twMerge(
            "inline-block w-2 h-2 rounded-full",
            isOffered ? "bg-white" : "bg-gray-300",
          )}
        />
        {isOffered ? "En esta sede" : "No ofrecido"}
      </button>
    </fetcher.Form>
  )
}
