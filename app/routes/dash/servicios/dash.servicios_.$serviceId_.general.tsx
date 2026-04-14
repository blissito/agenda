import { useEffect, useRef } from "react"
import { Link, useFetcher, useNavigate } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { AddressAutocomplete } from "~/components/forms/AddressAutocomplete"
import { BasicInput } from "~/components/forms/BasicInput"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import { serviceUpdateSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/dash.servicios_.$serviceId_.general"

export const action = async ({ request }: Route.ActionArgs) => {
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
    await db.service.update({
      where: { id },
      data: updateData,
    })
    return { ok: true }
  }
  return null
}

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
        className="bg-white rounded-2xl max-w-3xl p-8 mt-6"
      >
        <input type="hidden" name="id" value={service.id} />
        <input type="hidden" name="slug" value={service.slug} />
        <input type="hidden" name="orgId" value={service.orgId} />

        <h2
          className="font-satoBold mb-8 text-xl
        "
        >
          Información General
        </h2>
        <div className="flex flex-col gap-6">
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
          <BasicInput
            name="points"
            placeholder="100"
            isDisabled={!loyaltyEnabled}
            label={
              <>
                ¿A cuántos puntos de lealtad equivale el servicio?{" "}
                {!loyaltyEnabled && (
                  <span className="font-satoshi text-brand_gray text-sm">
                    <Link
                      to="/dash/lealtad"
                      className="text-brand_blue underline"
                    >
                      Activa el programa
                    </Link>{" "}
                    de lealtad para activar
                  </span>
                )}
              </>
            }
            defaultValue={Number(service.points)}
          />
          <BasicInput
            as="textarea"
            name="description"
            placeholder="Cuéntale a tus clientes sobre tu servicio"
            label="Descripción"
            defaultValue={service.description ?? undefined}
          />
          <AddressAutocomplete
            name="address"
            label="Dirección del servicio (opcional)"
            placeholder="Buscar dirección..."
            defaultValue={service.address ?? ""}
            defaultLat={service.lat}
            defaultLng={service.lng}
          />

          {(hasMeet || hasZoom) && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-satoMedium text-brand_dark">
                Link de llamada
              </label>
              <select
                name="videoProvider"
                defaultValue={service.videoProvider ?? "auto"}
                className="w-full rounded-full border border-brand_stroke bg-white px-4 py-3 text-brand_gray focus:outline-none focus:border-brand_blue"
              >
                <option value="auto">Automático</option>
                {hasMeet && <option value="meet">Google Meet</option>}
                {hasZoom && <option value="zoom">Zoom</option>}
                <option value="none">Sin link de llamada</option>
              </select>
              <p className="text-xs text-brand_gray">
                Al reservar una cita se generará automáticamente el link elegido.
              </p>
            </div>
          )}
        </div>

        <div className="flex mt-16 justify-end gap-6">
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
