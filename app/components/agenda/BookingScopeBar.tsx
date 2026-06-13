import { useNavigate } from "react-router"

type ServiceOption = { name: string; slug: string }
type BranchOption = {
  id: string
  name: string
  slug: string
  address?: string | null
}

/**
 * Barra superior del booking público (step 1). Permite:
 * - cambiar de servicio sin volver a la landing (navega a la URL canónica del
 *   servicio elegido), y
 * - elegir sucursal cuando el servicio se ofrece en >1 sede (setea `?sucursal=`).
 *
 * Es route-shape-agnóstica: el padre pasa `serviceUrlFor(slug)` que sabe armar la
 * URL correcta (subdominio en prod, path en localhost). Si solo hay 1 servicio y
 * ≤1 sede, no renderiza nada.
 */
export function BookingScopeBar({
  services,
  currentServiceSlug,
  serviceUrlFor,
  branches,
  activeBranchSlug,
}: {
  services: ServiceOption[]
  currentServiceSlug: string
  serviceUrlFor: (slug: string) => string
  branches: BranchOption[]
  activeBranchSlug?: string | null
}) {
  const navigate = useNavigate()
  const showServiceSwitcher = services.length > 1
  const showBranchPicker = branches.length > 1
  if (!showServiceSwitcher && !showBranchPicker) return null

  const onServiceChange = (slug: string) => {
    if (slug !== currentServiceSlug) navigate(serviceUrlFor(slug))
  }
  const onBranchChange = (slug: string) => {
    navigate(`${serviceUrlFor(currentServiceSlug)}?sucursal=${slug}`)
  }

  const activeBranch = branches.find((b) => b.slug === activeBranchSlug)

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end mb-6 w-full">
      {showServiceSwitcher && (
        <label className="flex flex-col gap-1 w-full md:max-w-[260px]">
          <span className="text-brand_gray text-xs font-medium">Servicio</span>
          <select
            value={currentServiceSlug}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full rounded-lg border border-brand_gray/20 bg-white px-3 py-2 text-sm text-brand_dark focus:border-brand_blue focus:outline-none"
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {showBranchPicker && (
        <label className="flex flex-col gap-1 w-full md:max-w-[260px]">
          <span className="text-brand_gray text-xs font-medium">Sucursal</span>
          <select
            value={activeBranchSlug ?? ""}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full rounded-lg border border-brand_gray/20 bg-white px-3 py-2 text-sm text-brand_dark focus:border-brand_blue focus:outline-none"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          {activeBranch?.address && (
            <span className="text-brand_gray text-xs truncate">
              {activeBranch.address}
            </span>
          )}
        </label>
      )}
    </div>
  )
}
