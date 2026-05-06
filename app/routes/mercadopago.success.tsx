import { Link, useLoaderData } from "react-router"
import { Success } from "~/components/agenda/success"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/mercadopago.success"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const paymentId = url.searchParams.get("payment_id")

  if (!paymentId) return { event: null }

  // Webhook may not have processed yet — retry briefly.
  for (let attempt = 0; attempt < 6; attempt++) {
    const event = await db.event.findFirst({
      where: { mp_payment_id: String(paymentId) },
      include: {
        customer: true,
        service: { include: { org: true } },
      },
    })
    if (event) return { event }
    await sleep(1000)
  }

  return { event: null }
}

export default function MPSuccess() {
  const { event } = useLoaderData<typeof loader>()

  if (event?.service && event.service.org) {
    return (
      <Success
        event={event}
        service={event.service}
        org={event.service.org}
        onFinish={() => {}}
      />
    )
  }

  return (
    <article className="flex h-screen flex-col items-center justify-center bg-[#f8f8f8] px-4 text-center text-brand_gray">
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto"
        src="/images/denik-markwater.png"
      />
      <div className="relative z-10 max-w-md">
        <h1 className="mb-4 text-2xl font-bold text-brand_dark">
          ¡Pago recibido!
        </h1>
        <p className="mb-8 text-lg">
          Estamos confirmando tu cita. En unos segundos recibirás el correo con
          los detalles.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-brand_blue px-6 py-3 text-white transition hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </article>
  )
}
