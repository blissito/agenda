import { useState } from "react"
import { useFetcher } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import {
  SimpleTimeSelector,
  type Week,
} from "~/components/forms/services_model/SimpleTimeSelector"
import { useToast } from "~/components/hooks/useToaster"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.servicios_.$serviceId_.horario"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const serviceId = params.serviceId
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Response(null, { status: 404 })
  return { service }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData
  const fetcher = useFetcher()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (weekDays: Week) => {
    if (Object.values(weekDays).length < 1) return

    fetcher.submit(
      {
        data: JSON.stringify({ weekDays, id: service.id }),
        intent: "service_update",
      },
      { method: "post", action: "/api/services" },
    )
    toast.success({ text: "Los horarios se guardarón con éxito " })
  }

  const isLoading = fetcher.state !== "idle"

  // Cast service.weekDays to Week type for SimpleTimeSelector
  const weekDaysForSelector = service.weekDays as Week | null

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
            <BreadcrumbLink href="/dash/servicios/serviceid/horario">
              Horario
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {weekDaysForSelector || showForm ? (
        <SimpleTimeSelector
          isLoading={isLoading}
          defaultValue={weekDaysForSelector ?? undefined}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
          <h2
            className="font-satoMiddle mb-8 text-xl
        "
          >
            Horario: Actualiza los días y horarios en los que ofreces servicio
          </h2>
          <section>
            <h2>
              Este servicio utiliza los mismos horarios que la organización
            </h2>
            {/* <TimesForm /> */}
            <nav className="flex gap-4">
              <PrimaryButton
                as="Link"
                to={`/dash/servicios/${service.id}`}
                className="my-4"
              >
                Volver
              </PrimaryButton>
              <PrimaryButton
                as="button"
                className="my-4 disabled:bg-yellow-500/40"
                onClick={() => setShowForm(true)}
              >
                Crear horarios específicos
              </PrimaryButton>
            </nav>
          </section>
        </div>
      )}
    </section>
  )
}
