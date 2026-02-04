import { Link, useLoaderData } from "react-router"
import { getServicefromSearchParams } from "~/.server/userGetters"
import { ServiceConfigForm } from "~/components/forms/services_model/ServiceConfigForm"

type ServiceConfigData = {
  id: string
  payment: boolean
  config: {
    confirmation?: boolean
    reminder?: boolean
    survey?: boolean
  } | null
}

export const loader = async ({ request }: { request: Request }) => {
  const serviceData = await getServicefromSearchParams(request, {
    select: {
      id: true,
      payment: true,
      config: true,
    },
  })
  const service = serviceData as unknown as ServiceConfigData
  return {
    service,
  }
}

export default function Page() {
  const { service } = useLoaderData<typeof loader>()
  const defaultConfig = {
    confirmation: service.config?.confirmation ?? false,
    reminder: service.config?.reminder ?? false,
    survey: service.config?.survey ?? false,
  }
  return (
    <main className="max-w-xl mx-auto pt-20 min-h-screen relative">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tus cobros y recordatorios
      </h2>
      <ServiceConfigForm
        defaultValues={{
          payment: service.payment,
          config: defaultConfig,
        }}
      />
      <div className="mt-4 text-center">
        <Link
          to={`/dash/servicios/horario?serviceId=${service.id}`}
          className="text-brand_blue hover:underline"
        >
          Volver al horario
        </Link>
      </div>
    </main>
  )
}
