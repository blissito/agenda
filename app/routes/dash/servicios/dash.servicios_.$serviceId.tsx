import type { Service } from "@prisma/client"
import * as React from "react"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { formatRange } from "~/components/common/FormatRange"
import { Image } from "~/components/common/Image"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { Edit } from "~/components/icons/edit"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import { DAY_LABELS, WEEK_DAYS } from "~/utils/weekDays"
import type { Route } from "./+types/dash.servicios_.$serviceId"

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  // @TODO ensure is the owner
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }

  const service = await db.service.findUnique({
    where: { id: params.serviceId, orgId: org.id }, // @TODO: this can vary if multiple orgs
  })
  if (!service) throw new Response(null, { status: 404 })

  // Provide default config if none exists
  const defaultConfig = {
    confirmation: false,
    reminder: false,
    survey: false,
    whatsapp_confirmation: false,
    whatsapp_reminder: false,
    reminderHours: 4,
  }

  return {
    service: {
      ...service,
      config: service.config ? service.config : defaultConfig,
    },
    orgWeekDays: org.weekDays,
  }
}


export default function Page({ loaderData }: Route.ComponentProps) {
  const { service, orgWeekDays } = loaderData
  const [hasNewPhotos, setHasNewPhotos] = React.useState(false)

  return (
    <section className="pb-10 max-w-8xl mx-auto">
      <div className="relative">
        <Breadcrumb className="text-brand_gray">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dash/servicios/">
                {service.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {hasNewPhotos && (
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-brand_blue text-white font-satoMedium text-sm px-5 h-9 rounded-full hover:opacity-90 transition-opacity"
          >
            Guardar fotos
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <ServiceDetail
          service={service}
          orgWeekDays={orgWeekDays}
          onHasNewPhotos={setHasNewPhotos}
        />
      </div>
    </section>
  )
}

export const convertToMeridian = (hourString: string) => {
  const today = new Date()
  today.setHours(Number(hourString.split(":")[0]))
  today.setMinutes(Number(hourString.split(":")[1]))
  return today.toLocaleTimeString("es-MX", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  })
}

/**
 * ✅ Uploader LOCAL (sin BD / sin storage)
 * - NO duplica imágenes
 * - Animación en cada imagen nueva
 * - Scroll SOLO cuando ya hay 3 o más, y se mueve a la nueva
 */
function LocalFloatingGallery({
  coverSrc,
  onHasNewPhotos,
}: {
  coverSrc?: string | null
  onHasNewPhotos?: (has: boolean) => void
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [images, setImages] = React.useState<
    { id: string; url: string; file: File; key: string }[]
  >([])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [newIds, setNewIds] = React.useState<string[]>([])

  const getFileKey = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified}`

  React.useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url))
    }
  }, [images])

  const openPicker = () => inputRef.current?.click()

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setImages((prev) => {
      const usedKeys = new Set(prev.map((p) => p.key))
      const mapped: { id: string; url: string; file: File; key: string }[] = []

      for (const file of files) {
        const key = getFileKey(file)
        if (usedKeys.has(key)) continue
        usedKeys.add(key)

        mapped.push({
          id: `${key}-${Math.random().toString(16).slice(2)}`,
          url: URL.createObjectURL(file),
          file,
          key,
        })
      }

      if (mapped.length === 0) return prev

      const next = [...prev, ...mapped]
      onHasNewPhotos?.(true)

      if (!activeId && next.length > 0) setActiveId(next[0].id)

      const ids = mapped.map((m) => m.id)
      setNewIds(ids)
      window.setTimeout(() => setNewIds([]), 900)

      if (next.length >= 3) {
        const lastNewId = mapped[mapped.length - 1].id
        window.requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-thumb-id="${lastNewId}"]`,
          ) as HTMLElement | null
          el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" })
        })
      }

      return next
    })

    e.target.value = ""
  }

  const hasUploads = images.length > 0

  const mainLocal = hasUploads
    ? (images.find((x) => x.id === activeId) ?? images[0])
    : null

  const hasCover = Boolean(coverSrc)
  const showLocalMain = !hasCover && Boolean(mainLocal?.url)
  const hasAnyImage = hasCover || hasUploads

  const addButton = (
    <button
      type="button"
      onClick={openPicker}
      className={
        hasAnyImage
          ? "h-20 w-full shrink-0 rounded-xl border border-dashed border-brand_stroke/60 flex items-center justify-center px-2 text-center hover:bg-neutral-50 transition"
          : "w-full h-full rounded-2xl border border-dashed border-brand_stroke/60 flex items-center justify-center px-4 text-center hover:bg-neutral-50 transition"
      }
    >
      <div className="flex flex-col items-center justify-center gap-0">
        <div className="grid h-8 w-8 place-items-center rounded-2xl">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 4C2.90694 4 2 4.90694 2 6V18C2 19.0931 2.90694 20 4 20H12V18H4V6H20V12H22V6C22 4.90694 21.0931 4 20 4H4ZM14.5 11L11 15L8.5 12.5L5.77734 16H16V13L14.5 11ZM18 14V18H14V20H18V24H20V20H24V18H20V14H18Z"
              fill="#4B5563"
            />
          </svg>
        </div>
        <p className="font-satoMedium text-xs text-brand_gray leading-tight">
          Agregar fotos
        </p>
      </div>
    </button>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <style>{`
        .lg-scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .lg-scrollbar-hide::-webkit-scrollbar{ display:none; }

        @keyframes lg-thumb-pop {
          0%   { opacity: 0; transform: translateY(16px) scale(0.85); filter: blur(10px); }
          55%  { opacity: 1; transform: translateY(-8px) scale(1.08); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lg-thumb-pop { animation: lg-thumb-pop 700ms cubic-bezier(.2,.9,.2,1) both; }
      `}</style>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {!hasAnyImage ? (
        addButton
      ) : (
        <div className="flex gap-3 min-h-0 h-full">
          {/* Main image */}
          <div className="flex-1 min-w-0 overflow-hidden rounded-2xl bg-neutral-100 border border-brand_stroke/50">
            <div className="relative w-full h-full max-h-full">
              {showLocalMain ? (
                <img
                  src={mainLocal?.url}
                  alt="Imagen principal del servicio"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  <Image alt="Imagen principal del servicio" src={coverSrc ?? ""} />
                </div>
              )}
            </div>
          </div>
          {/* Thumbnails column */}
          <div className="w-24 shrink-0 min-h-0 overflow-y-auto lg-scrollbar-hide">
            <div className="flex flex-col gap-3">
              {addButton}
              {hasUploads &&
                images.map((img) => {
                  const isActive = img.id === (mainLocal?.id ?? "")
                  const isNew = newIds.includes(img.id)

                  return (
                    <button
                      key={img.id}
                      data-thumb-id={img.id}
                      type="button"
                      onClick={() => setActiveId(img.id)}
                      className={[
                        "h-20 w-full rounded-xl overflow-hidden border shrink-0",
                        isActive
                          ? "border-neutral-900/40"
                          : "border-brand_stroke/50",
                        isNew ? "lg-thumb-pop" : "",
                      ].join(" ")}
                      aria-label="Seleccionar imagen"
                    >
                      <img
                        src={img.url}
                        alt="Miniatura"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="font-satoMedium text-[14px] text-brand_gray">{label}</p>
    <p className="font-satoMedium  text-brand_dark">{value}</p>
  </div>
)

const WeekDayRow = ({
  day,
  schedule,
}: {
  day: string
  schedule: React.ReactNode
}) => (
  <div className="grid grid-cols-[110px_1fr] items-center gap-4">
    <p className="font-satoMedium text-brand_gray">{day}</p>
    <p className="font-satoMedium text-brand_dark">{schedule}</p>
  </div>
)

const EditButton = ({ to, label }: { to: string; label: string }) => (
  <SecondaryButton
    className="!h-10 !w-10 !min-w-0 !p-0 !rounded-full overflow-hidden flex items-center justify-center bg-brand_light_gray"
    as="Link"
    to={to}
    aria-label={label}
  >
    <Edit fill="currentColor" className="h-5 w-5 text-brand_gray" />
  </SecondaryButton>
)

const WEEK_DAYS_LIST = WEEK_DAYS.map((key) => ({
  key,
  label: DAY_LABELS[key],
}))

export const ServiceDetail = ({
  service,
  orgWeekDays,
  onHasNewPhotos,
}: {
  service: Service
  orgWeekDays: any
  onHasNewPhotos?: (has: boolean) => void
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="bg-white rounded-2xl p-6 lg:col-span-5 border border-brand_stroke/60 h-full flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-satoBold text-[24px]  text-brand_dark">
                {service.name}
              </h2>
            </div>

            <EditButton
              to={`/dash/servicios/${service.id}/general`}
              label="Editar"
            />
          </div>

          <p className="mt-4 max-w-[46ch] font-satoMedium text-brand_gray">
            {service.description}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <DetailItem label="Servicio" value={service.place || ""} />
            <DetailItem
              label="Agendamiento en línea"
              value={service.isActive ? "Activo" : "Desactivado"}
            />
            <DetailItem
              label="Agendamiento simultáneo"
              value={
                service.allowMultiple
                  ? `hasta ${service.limit?.bookings || 6} citas`
                  : "Desactivado"
              }
            />
          </div>

          <div className="mt-auto pt-10">
            <div className="grid grid-cols-2 gap-10 items-end">
              <div className="space-y-2">
                <p className=" text-[14px] font-satoMedium text-brand_dark">
                  Precio
                </p>
                <div className="inline-flex items-center  rounded-full border border-brand_stroke bg-white px-4 py-2  text-brand_gray">
                  ${service.price} MXN
                </div>
              </div>
              <div className="space-y-2">
                <p className=" text-[14px] font-satoMedium text-brand_dark">
                  Puntos
                </p>
                <div className="inline-flex items-center rounded-full border border-brand_stroke bg-white px-4 py-2  text-brand_gray">
                  {service.points} puntos
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 lg:col-span-7 border border-brand_stroke/60 flex flex-col lg:h-[480px] overflow-hidden">
          <LocalFloatingGallery
            coverSrc={(service as any)?.gallery?.[0]}
            onHasNewPhotos={onHasNewPhotos}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="bg-white rounded-2xl p-6 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="font-satoBold text-lg text-brand_dark">Horario</h3>
            <EditButton
              to={`/dash/servicios/${service.id}/horario`}
              label="Editar horario"
            />
          </div>

          <p className="-mt-2 font-satoMedium text-brand_gray">
            Sesiones de{" "}
            <span className="text-brand_dark">{service.duration} minutos</span>{" "}
            con <span className="text-brand_dark">0 minutos</span> de descanso.
          </p>

          <div className="mt-5 space-y-4">
            {WEEK_DAYS_LIST.map(({ key, label }) => (
              <WeekDayRow
                key={key}
                day={label}
                schedule={formatRange(orgWeekDays[key])}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="font-satoBold text-lg text-brand_dark">
              Recordatorios y pago
            </h3>
            <EditButton
              to={`/dash/servicios/${service.id}/cobros`}
              label="Editar cobros"
            />
          </div>

          <div className="mt-4 space-y-6">
            <DetailItem
              label="Pago"
              value={service.payment ? "Al agendar" : "Despues de la cita"}
            />

            <DetailItem
              label="Mail de confirmación"
              value={
                (service as any).config?.confirmation
                  ? "Lo enviaremos en cuanto se complete la reservación"
                  : "Desactivado"
              }
            />

            <DetailItem
              label="Whatsapp de confirmación"
              value={
                (service as any).config?.whatsapp_confirmation
                  ? "Lo enviaremos en cuanto se complete la reservación"
                  : "Desactivado"
              }
            />

            <DetailItem
              label="Mail de recordatorio"
              value={
                (service as any).config?.reminder
                  ? "Lo enviaremos 24 hrs antes de la sesión"
                  : "Desactivado"
              }
            />

            <DetailItem
              label="Whatsapp de recordatorio"
              value={
                (service as any).config?.whatsapp_reminder
                  ? "Lo enviaremos 24 hrs antes de la sesión"
                  : "Desactivado"
              }
            />

            <DetailItem
              label="Mail de evaluación"
              value={
                (service as any).config?.survey
                  ? "Lo enviaremos 10 min después de terminar la sesión"
                  : "Desactivado"
              }
            />
          </div>
        </div>
      </div>

      {/* <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="bg-white rounded-2xl p-6 lg:col-span-6 border border-brand_stroke/60">
          <div className="flex items-center justify-between">
            <h3 className="font-satoBold text-lg text-brand_dark">Acciones</h3>
            <EditButton
              to={`/dash/servicios/${service.id}/acciones`}
              label="Configurar acciones"
            />
          </div>

          <p className="mt-3 font-satoMedium text-brand_gray">
            Automatiza tareas después de cada agendamiento, como enviar datos a
            tu CRM o disparar webhooks.
          </p>
        </div>
      </div> */}
    </div>
  )
}
