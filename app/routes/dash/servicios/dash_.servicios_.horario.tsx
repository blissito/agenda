import { Link, useLoaderData } from "react-router"
import { getServicefromSearchParams } from "~/.server/userGetters"
import { ServiceTimesForm } from "~/components/forms/services_model/ServiceTimesForm"
import { normalizeWeekDays } from "~/utils/weekDays"

type ServiceTimesData = {
  id: string
  duration: number | bigint
  weekDays: unknown
}

export const loader = async ({ request }: { request: Request }) => {
  // will redirect when 404
  const serviceData = await getServicefromSearchParams(request, {
    select: {
      id: true,
      duration: true,
      weekDays: true,
    },
  })
  const service = serviceData as unknown as ServiceTimesData
  if (service.weekDays) {
    service.weekDays = normalizeWeekDays(service.weekDays as Record<string, any>)
  }
  return {
    service,
  }
}

export default function NewServiceTimetable() {
  const { service } = useLoaderData<typeof loader>()

  return (
    <main className="max-w-xl mx-auto py-20 min-h-screen relative">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tu horario
      </h2>
      <ServiceTimesForm
        defaultValues={{
          duration: Number(service.duration),
          weekDays:
            (service.weekDays as unknown as { monday?: [string, string][] }) ??
            null,
        }}
      />
      <div className="mt-4 text-center">
        <Link
          to={`/dash/servicios/fotos?serviceId=${service.id}`}
          className="text-brand_blue hover:underline"
        >
          Volver a fotos
        </Link>
      </div>
    </main>
  )
}
