import type { Choice } from "~/components/ui/select"
import { SUPPORTED_TIMEZONES } from "~/utils/timezone"

export const COUNTRIES: Choice[] = [
  { value: "MX", label: "🇲🇽 México" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "ES", label: "🇪🇸 España" },
  { value: "PE", label: "🇵🇪 Perú" },
]

export const TIMEZONES: Choice[] = SUPPORTED_TIMEZONES.map((tz) => ({
  value: tz.value,
  label: tz.label,
}))

export const PERIOD: Choice[] = [
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 año" },
]

export const RANGES: Choice[] = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "1440", label: "24 horas" },
]

export const RESCHEDULE_RANGES: Choice[] = [
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "240", label: "4 horas" },
  { value: "1440", label: "24 horas" },
]

export const CANCELLATION_RANGES: Choice[] = [
  { value: "60", label: "1 hora" },
  { value: "240", label: "4 horas" },
  { value: "720", label: "12 horas" },
  { value: "1440", label: "24 horas" },
]

export const TIMES: Choice[] = [
  { value: "1", label: "1 vez" },
  { value: "2", label: "2 veces" },
  { value: "3", label: "3 veces" },
  { value: "unlimited", label: "Ilimitadas" },
]

export const ROLE_LABELS: Record<string, string> = {
  user: "Miembro",
  GUEST: "Miembro",
  ADMIN: "Administrador",
  OWNER: "Propietario",
}

export function getDefaultTermsAndConditions(params: {
  cancellationWindowMinutes?: string
  rescheduleWindowMinutes?: string
  maxReschedulesValue?: string
  orgName?: string
}): string {
  const rescheduleLabel =
    RESCHEDULE_RANGES.find((r) => r.value === params.rescheduleWindowMinutes)?.label ??
    "3 horas"
  const maxReschedulesLabel =
    TIMES.find((r) => r.value === params.maxReschedulesValue)?.label ?? "2 veces"
  const cancellationLabel =
    CANCELLATION_RANGES.find((r) => r.value === params.cancellationWindowMinutes)?.label ??
    "24 horas"
  const orgNameText = params.orgName ?? "el negocio"
  return `Para cambios en tu reserva tienes hasta ${rescheduleLabel} antes del servicio contratado un máximo de ${maxReschedulesLabel}. Para cancelaciones tienes hasta ${cancellationLabel} antes de la reserva, si tienes problemas con la devolución ponte en contacto directo con ${orgNameText}. Deník solo actúa como intermediario en la gestión y procesamiento de reservas.`
}

export const DEFAULT_ORG_CONFIG = {
  country: "MX",
  calendarAvailability: "3m",
  simultaneousServices: false,
  minBookingAdvance: "60",
  rescheduleWindow: "240",
  maxReschedules: "2",
  cancellationWindow: "1440",
  termsAndConditions: getDefaultTermsAndConditions({
    cancellationWindowMinutes: "1440",
    rescheduleWindowMinutes: "240",
    maxReschedulesValue: "2",
  }),
}

export const DEFAULT_ORG_TIMEZONE = "America/Mexico_City"
