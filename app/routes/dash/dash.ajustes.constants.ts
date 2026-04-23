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

export function getDefaultTermsAndConditions(cancellationWindowMinutes: string): string {
  const match = CANCELLATION_RANGES.find((r) => r.value === cancellationWindowMinutes)
  const windowLabel = match?.label ?? "el plazo establecido"
  return `Al reservar aceptas nuestra política de cancelación:

• Puedes cancelar o reagendar tu cita hasta ${windowLabel} antes del horario reservado. Pasado ese plazo, la cita no podrá cancelarse ni reagendarse.
• Las devoluciones y reembolsos se gestionan directamente con el negocio. Si realizaste un pago en línea y cancelaste con al menos ${windowLabel} de anticipación, contáctanos para coordinar la devolución.
• No presentarse a la cita (no-show) no genera derecho a reembolso.

Si tienes dudas, ponte en contacto con el negocio antes de reservar.`
}

export const DEFAULT_ORG_CONFIG = {
  country: "MX",
  calendarAvailability: "3m",
  simultaneousServices: false,
  minBookingAdvance: "60",
  rescheduleWindow: "240",
  maxReschedules: "2",
  cancellationWindow: "240",
  termsAndConditions: getDefaultTermsAndConditions("240"),
}

export const DEFAULT_ORG_TIMEZONE = "America/Mexico_City"
