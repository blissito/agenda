import type { User } from "@prisma/client"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useFetcher, useNavigate } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { BasicInput } from "~/components/forms/BasicInput"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { assertServiceInOrg, requireRole } from "~/.server/userGetters"
import { cn } from "~/utils/cn"
import { db } from "~/utils/db.server"
import { serviceUpdateSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/dash.servicios_.$serviceId_.general"

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await requireRole(request, ["OWNER", "ADMIN"])
  const formData = await request.formData()
  const intent = formData.get("intent")
  if (intent === "update_service") {
    const form = Object.fromEntries(formData)
    // Handle empty string lat/lng as null
    const processedForm = {
      ...form,
      lat: form.lat === "" ? null : form.lat,
      lng: form.lng === "" ? null : form.lng,
      address: form.address === "" ? null : form.address,
    }
    const validData = serviceUpdateSchema.parse(processedForm)
    const { id, slug, orgId, ...updateData } = validData
    // Capacidad simultánea: solo aplica si allowMultiple (mínimo 2); si no, 1.
    // Mismo criterio que el alta de servicio (api/services → photo_form).
    if (updateData.allowMultiple !== undefined) {
      updateData.seats = updateData.allowMultiple
        ? Math.max(2, Math.floor(Number(updateData.seats ?? 2)))
        : 1
    }
    await assertServiceInOrg(id, org.id)
    await db.service.update({
      where: { id },
      data: updateData,
    })
    return { ok: true }
  }
  return null
}

// Edición full screen en mobile: ocultamos la bottom bar para dar espacio al form.
export const handle = { hideMobileNav: true }

export const loader = async ({ params }: Route.LoaderArgs) => {
  const serviceId = params.serviceId
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Response(null, { status: 404 })
  const org = await db.org.findUnique({
    where: { id: service.orgId },
    select: {
      googleCalendarToken: true,
      zoomToken: true,
      loyaltyEnabled: true,
    },
  })
  const levelsCount = await db.loyaltyLevel.count({
    where: { orgId: service.orgId },
  })

  return {
    service,
    hasMeet: !!org?.googleCalendarToken,
    hasZoom: !!org?.zoomToken,
    loyaltyEnabled: !!org?.loyaltyEnabled && levelsCount > 0,
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service, hasMeet, hasZoom, loyaltyEnabled } = loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const handledRef = useRef<unknown>(null)
  const isFetching = fetcher.state !== "idle"

  // Si la org tiene más de un colaborador, dejamos elegir el encargado
  const employeesFetcher = useFetcher<{ employees?: User[] }>()
  useEffect(() => {
    employeesFetcher.load("/api/employees")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const employees = employeesFetcher.data?.employees ?? []
  const showEmployeeSelect = employees.length > 1

  // Toggles controlados: en un form plano los checkboxes sin marcar no se
  // envían, así que mandamos su estado vía inputs hidden ("true"/"false").
  const [isActive, setIsActive] = useState(service.isActive)
  const [allowMultiple, setAllowMultiple] = useState(service.allowMultiple)
  // El link de llamada solo aplica a servicios en línea; presencial/domicilio
  // no tienen videollamada.
  const [place, setPlace] = useState((service.place || "INPLACE").toUpperCase())

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      fetcher.data !== handledRef.current &&
      (fetcher.data as { ok?: boolean }).ok
    ) {
      handledRef.current = fetcher.data
      navigate(`/dash/servicios/${service.id}?saved=general`)
    }
  }, [fetcher.state, fetcher.data, navigate, service.id])

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dash/servicios/${service.id}`}>
              {service.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dash/servicios/${service.id}/general`}>
              General
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <fetcher.Form
        method="post"
        className="bg-white rounded-2xl max-w-3xl p-4 md:p-8 mt-4 md:mt-6"
      >
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="slug" value={service.slug} />
        <input type="hidden" name="orgId" value={service.orgId} />

        <h2
          className="font-satoBold mb-4 md:mb-8 text-xl
        "
        >
          Información General
        </h2>
        <div className="flex flex-col gap-4 md:gap-6">
          <BasicInput
            placeholder="Clase de piano"
            label="Nombre del servicio"
            name="name"
            defaultValue={service.name}
          />
          <BasicInput
            placeholder="$0.00"
            label="Precio"
            name="price"
            type="number"
            defaultValue={Number(service.price)}
          />
          {showEmployeeSelect && (
            <div className="w-full relative">
              <label
                htmlFor="employeeName"
                className="text-brand_dark font-satoMedium"
              >
                Encargado del servicio (opcional)
              </label>
              <div className="relative mt-1">
                <select
                  id="employeeName"
                  name="employeeName"
                  defaultValue={service.employeeName ?? ""}
                  className="text-brand_gray font-satoshi rounded-2xl border-gray-200 w-full h-12 bg-white px-4 focus:border-brand_blue focus:outline-none focus:ring-0"
                >
                  <option value="">Sin encargado asignado</option>
                  {employees.map((e) => {
                    const label = e.displayName || e.email || ""
                    return (
                      <option key={e.id} value={label}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          )}
          {loyaltyEnabled && (
            <BasicInput
              name="points"
              placeholder="100"
              label="¿A cuántos puntos de lealtad equivale el servicio?"
              defaultValue={Number(service.points)}
            />
          )}
          <BasicInput
            as="textarea"
            name="description"
            placeholder="Cuéntale a tus clientes sobre tu servicio"
            label="Descripción"
            defaultValue={service.description ?? undefined}
          />
          <div className="w-full relative">
            <label htmlFor="place" className="text-brand_dark font-satoMedium">
              ¿En dónde se realiza el servicio?
            </label>
            <div className="relative mt-1">
              <select
                id="place"
                name="place"
                value={place}
                onChange={(e) => setPlace(e.currentTarget.value)}
                className="text-brand_gray font-satoshi rounded-2xl border-gray-200 w-full h-12 bg-white px-4 focus:border-brand_blue focus:outline-none focus:ring-0"
              >
                <option value="INPLACE">En el negocio</option>
                <option value="ONLINE">En línea</option>
                <option value="ATHOME">A domicilio</option>
              </select>
            </div>
          </div>
          {place === "ONLINE" && (hasMeet || hasZoom) && (
            <div className="w-full relative">
              <label
                htmlFor="videoProvider"
                className="text-brand_dark font-satoMedium"
              >
                Link de llamada
              </label>
              <div className="relative mt-1">
                <select
                  id="videoProvider"
                  name="videoProvider"
                  defaultValue={service.videoProvider ?? "auto"}
                  className="text-brand_gray font-satoshi rounded-2xl border-gray-200 w-full h-12 bg-white px-4 focus:border-brand_blue focus:outline-none focus:ring-0"
                >
                  <option value="auto">Automático</option>
                  {hasMeet && <option value="meet">Google Meet</option>}
                  {hasZoom && <option value="zoom">Zoom</option>}
                  <option value="none">Sin link de llamada</option>
                </select>
              </div>
              <p className="text-xs text-brand_gray mt-1">
                Al reservar una cita se generará automáticamente el link
                elegido.
              </p>
            </div>
          )}

          <input
            type="hidden"
            name="isActive"
            value={isActive ? "true" : "false"}
          />
          <input
            type="hidden"
            name="allowMultiple"
            value={allowMultiple ? "true" : "false"}
          />
          <Toggle
            checked={isActive}
            onChange={setIsActive}
            title="Permitir que este servicio se agende en línea"
          />
          <Toggle
            checked={allowMultiple}
            onChange={setAllowMultiple}
            title="Permitir que 2 o más clientes agenden al mismo tiempo"
          />
          <AnimatePresence>
            {allowMultiple && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <label htmlFor="seats" className="text-brand_dark font-satoMedium">
                  ¿Cuántas personas pueden agendar al mismo tiempo?
                </label>
                <input
                  id="seats"
                  type="number"
                  min={2}
                  name="seats"
                  placeholder="2"
                  defaultValue={Math.max(2, Number(service.seats) || 2)}
                  className="rounded-2xl border-gray-200 h-12 w-full mt-1 text-brand_gray focus:border-brand_blue focus:outline-none focus:ring-0"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex mt-12 justify-end gap-6">
          <SecondaryButton
            as="Link"
            to={`/dash/servicios/${service.id}`}
            className="w-[120px]"
          >
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            isLoading={isFetching}
            name="intent"
            value="update_service"
            type="submit"
          >
            Guardar
          </PrimaryButton>
        </div>
      </fetcher.Form>
    </section>
  )
}

const Toggle = ({
  title,
  checked,
  onChange,
}: {
  title: string
  checked: boolean
  onChange: (next: boolean) => void
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex justify-between items-center w-full gap-4 text-left"
  >
    <p className="text-brand_dark font-satoMedium">{title}</p>
    <div
      className={cn("flex bg-gray-100 w-7 p-1 rounded-full shrink-0", {
        "justify-end bg-brand_blue/30 shadow": checked,
      })}
    >
      <motion.div
        layout
        transition={{ type: "spring" }}
        className={cn("bg-gray-300 h-3 w-3 rounded-full", {
          "bg-brand_blue": checked,
        })}
      />
    </div>
  </button>
)
