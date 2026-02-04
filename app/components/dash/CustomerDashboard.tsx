import type { User } from "@prisma/client"

type CustomerEvent = {
  id: string
  start: string
  status: string
  serviceName?: string
  orgName?: string
}

type CustomerDashboardProps = {
  events: CustomerEvent[]
  user: User
}

export function CustomerDashboard({ events, user }: CustomerDashboardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Mis citas</h1>
      <p className="text-brand_gray mb-6">
        Hola {user.displayName || user.email}
      </p>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <img
            className="mx-auto w-24 mb-4 opacity-50"
            src="/images/no-files.svg"
            alt=""
          />
          <p className="text-brand_gray">No tienes citas próximas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-4 border border-brand_stroke"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-brand_dark">
                    {event.serviceName}
                  </h3>
                  <p className="text-sm text-brand_gray">{event.orgName}</p>
                  <p className="text-sm text-brand_blue mt-2">
                    {formatDate(event.start)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    event.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {event.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          ¿Tienes un negocio y quieres recibir citas?
        </p>
        <a
          href="/dash/bienvenida"
          className="text-brand_blue font-medium hover:underline"
        >
          Crear mi negocio →
        </a>
      </div>
    </div>
  )
}
