import type { Service } from "@prisma/client"
import * as React from "react"
import * as ReactRouter from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { formatRange } from "~/components/common/FormatRange"
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
import { getPublicImageUrl } from "~/utils/urls"
import { DAY_LABELS, WEEK_DAYS } from "~/utils/weekDays"
import type { Route } from "./+types/dash.servicios_.$serviceId"

export const action = async ({ params, request }: Route.ActionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Organization not found", { status: 404 })

  const service = await db.service.findFirst({
    where: { id: params.serviceId, orgId: org.id },
    select: { id: true, gallery: true },
  })
  if (!service) throw new Response("Service not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "gallery_add") {
    const key = formData.get("key") as string
    if (!key) return Response.json({ error: "key required" }, { status: 400 })
    const gallery = [...(service.gallery || []), key]
    await db.service.update({
      where: { id: service.id },
      data: { gallery },
    })
    return Response.json({ ok: true, gallery })
  }

  if (intent === "gallery_remove") {
    const key = formData.get("key") as string
    if (!key) return Response.json({ error: "key required" }, { status: 400 })
    const gallery = (service.gallery || []).filter((k) => k !== key)
    await db.service.update({
      where: { id: service.id },
      data: { gallery },
    })
    return Response.json({ ok: true, gallery })
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 })
}

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

  // Convert gallery keys to public URLs
  const galleryImages = (service.gallery || []).map((key) => ({
    key,
    url: getPublicImageUrl(key) || "",
  }))

  return {
    service: {
      ...service,
      config: service.config ? service.config : defaultConfig,
    },
    galleryImages,
    orgWeekDays: org.weekDays,
  }
}


export default function Page({ loaderData }: Route.ComponentProps) {
  const { service, galleryImages, orgWeekDays } = loaderData

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
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <ServiceDetail
          service={service}
          galleryImages={galleryImages}
          orgWeekDays={orgWeekDays}
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
 * Gallery with persistence to DB via Tigris/S3.
 * - Uploads files to Tigris via presigned URL
 * - Saves keys to service.gallery[] in DB
 * - Loads existing images on mount
 */
function PersistentGallery({
  initialImages,
  serviceId,
}: {
  initialImages: { key: string; url: string }[]
  serviceId: string
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const fetcher = ReactRouter.useFetcher()

  const [images, setImages] = React.useState<
    { id: string; url: string; key: string; uploading?: boolean }[]
  >(
    initialImages.map((img) => ({
      id: img.key,
      url: img.url,
      key: img.key,
    })),
  )
  const [activeId, setActiveId] = React.useState<string | null>(
    initialImages.length > 0 ? initialImages[0].key : null,
  )
  const [newIds, setNewIds] = React.useState<string[]>([])

  const openPicker = () => inputRef.current?.click()

  const uploadFile = async (file: File) => {
    // Upload server-side via API (avoids CORS issues with presigned URLs)
    const formData = new FormData()
    formData.set("intent", "gallery_upload")
    formData.set("serviceId", serviceId)
    formData.set("file", file)
    const res = await fetch("/api/services", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[gallery upload] Server error:", res.status, text)
      throw new Error(`Upload failed: ${res.status}`)
    }
    const { key } = await res.json()
    return key
  }

  const onPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    for (const file of files) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const localUrl = URL.createObjectURL(file)

      // Add with uploading state
      setImages((prev) => {
        const next = [
          ...prev,
          { id: tempId, url: localUrl, key: "", uploading: true },
        ]
        if (prev.length === 0) setActiveId(tempId)
        return next
      })

      setNewIds((prev) => [...prev, tempId])
      window.setTimeout(
        () => setNewIds((prev) => prev.filter((id) => id !== tempId)),
        900,
      )

      try {
        const key = await uploadFile(file)
        // Replace temp entry with real one
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId ? { ...img, id: key, key, uploading: false } : img,
          ),
        )
        setActiveId((prev) => (prev === tempId ? key : prev))
      } catch (err) {
        console.error("Upload failed:", err)
        // Remove failed upload
        setImages((prev) => prev.filter((img) => img.id !== tempId))
        URL.revokeObjectURL(localUrl)
      }
    }

    e.target.value = ""
  }

  const removeImage = (key: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.key !== key)
      if (activeId === key) {
        setActiveId(next.length > 0 ? next[0].id : null)
      }
      return next
    })
    const formData = new FormData()
    formData.set("intent", "gallery_remove")
    formData.set("key", key)
    fetcher.submit(formData, { method: "POST" })
  }

  const hasImages = images.length > 0
  const mainImage = hasImages
    ? (images.find((x) => x.id === activeId) ?? images[0])
    : null

  const addButton = (
    <button
      type="button"
      onClick={openPicker}
      className={
        hasImages
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

      {!hasImages ? (
        addButton
      ) : (
        <div className="flex gap-3 min-h-0 h-full">
          {/* Main image */}
          <div className="flex-1 min-w-0 overflow-hidden rounded-2xl bg-neutral-100 border border-brand_stroke/50">
            <div className="relative w-full h-full max-h-full">
              {mainImage && (
                <img
                  src={mainImage.url}
                  alt="Imagen principal del servicio"
                  className={[
                    "absolute inset-0 h-full w-full object-cover",
                    mainImage.uploading ? "opacity-50" : "",
                  ].join(" ")}
                />
              )}
              {mainImage?.uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-brand_blue border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          {/* Thumbnails column */}
          <div className="w-24 shrink-0 min-h-0 overflow-y-auto lg-scrollbar-hide">
            <div className="flex flex-col gap-3">
              {addButton}
              {images.map((img) => {
                const isActive = img.id === (mainImage?.id ?? "")
                const isNew = newIds.includes(img.id)

                return (
                  <div key={img.id} className="relative group overflow-hidden rounded-xl">
                    <button
                      data-thumb-id={img.id}
                      type="button"
                      onClick={() => setActiveId(img.id)}
                      className={[
                        "h-20 w-full rounded-xl overflow-hidden border shrink-0",
                        isActive
                          ? "border-neutral-900/40"
                          : "border-brand_stroke/50",
                        isNew ? "lg-thumb-pop" : "",
                        img.uploading ? "opacity-50" : "",
                      ].join(" ")}
                      aria-label="Seleccionar imagen"
                    >
                      <img
                        src={img.url}
                        alt="Miniatura"
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {img.key && !img.uploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.key)}
                        className="absolute top-0.5 right-0.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none shadow"
                        aria-label="Eliminar imagen"
                      >
                        &times;
                      </button>
                    )}
                  </div>
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
    <div className="font-satoMedium text-brand_dark">{schedule}</div>
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
  galleryImages = [],
  orgWeekDays,
}: {
  service: Service
  galleryImages?: { key: string; url: string }[]
  orgWeekDays: any
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
          <PersistentGallery initialImages={galleryImages} serviceId={service.id} />
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
