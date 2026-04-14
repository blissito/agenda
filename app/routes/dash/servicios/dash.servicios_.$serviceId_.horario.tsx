import { useEffect, useRef } from "react"
import { useFetcher, useNavigate } from "react-router"
import {
  SimpleTimeSelector,
  type SchedulePayload,
  type Week,
} from "~/components/forms/services_model/SimpleTimeSelector"
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
  return {
    service: {
      ...service,
      duration: Number(service.duration),
      breakTime: service.breakTime ? Number(service.breakTime) : 0,
      price: Number(service.price),
      points: Number(service.points),
      seats: Number(service.seats),
    },
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const submittedRef = useRef(false)

  const handleSubmit = (payload: SchedulePayload) => {
    const data: Record<string, unknown> = {
      id: service.id,
      duration: payload.duration,
      breakTime: payload.breakTime,
    }
    if (payload.mode === "specific" && payload.weekDays) {
      data.weekDays = { set: payload.weekDays }
    } else {
      data.weekDays = { unset: true }
    }

    submittedRef.current = true
    fetcher.submit(
      { data: JSON.stringify(data), intent: "service_update" },
      { method: "post", action: "/api/services" },
    )
  }

  useEffect(() => {
    if (
      submittedRef.current &&
      fetcher.state === "idle" &&
      fetcher.data !== undefined
    ) {
      submittedRef.current = false
      navigate(`/dash/servicios/${service.id}?saved=horario`)
    }
  }, [fetcher.state, fetcher.data, navigate, service.id])

  const isLoading = fetcher.state !== "idle"
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
            <BreadcrumbLink href={`/dash/servicios/${service.id}/horario`}>
              Horario
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SimpleTimeSelector
        isLoading={isLoading}
        defaultValue={weekDaysForSelector ?? undefined}
        defaultDuration={service.duration || 60}
        defaultBreakTime={service.breakTime || 0}
        cancelHref={`/dash/servicios/${service.id}`}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
