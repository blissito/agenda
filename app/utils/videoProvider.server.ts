import type { Org, Service } from "@prisma/client"

export type VideoProvider = "meet" | "zoom" | "none"
export type VideoProviderSetting = VideoProvider | "auto"

export function hasMeet(org: Pick<Org, "googleCalendarToken">) {
  return !!org.googleCalendarToken
}

export function hasZoom(org: Pick<Org, "zoomToken">) {
  return !!org.zoomToken
}

// Resuelve "auto" contra las integraciones conectadas.
// Preferencia cuando ambas existen: meet (legacy compat).
export function resolveAuto(
  org: Pick<Org, "googleCalendarToken" | "zoomToken">,
): VideoProvider {
  if (hasMeet(org)) return "meet"
  if (hasZoom(org)) return "zoom"
  return "none"
}

// Decide el provider final al crear un Event.
// Prioridad: override explícito del form > default del servicio > auto por integraciones.
// Si el elegido no tiene integración conectada, cae a "none".
export function resolveVideoProvider({
  org,
  service,
  override,
}: {
  org: Pick<Org, "googleCalendarToken" | "zoomToken">
  service: Pick<Service, "videoProvider"> | null | undefined
  override?: string | null
}): VideoProvider {
  const raw = (override ||
    service?.videoProvider ||
    "auto") as VideoProviderSetting

  const picked: VideoProvider = raw === "auto" ? resolveAuto(org) : raw

  if (picked === "meet" && !hasMeet(org)) return "none"
  if (picked === "zoom" && !hasZoom(org)) return "none"
  return picked
}
