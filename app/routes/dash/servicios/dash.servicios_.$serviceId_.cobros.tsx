import { useEffect, useRef, useState } from "react"
import { FaWhatsapp } from "react-icons/fa6"
import { useFetcher, useNavigate } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { SecondaryButton } from "~/components/common/secondaryButton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.servicios_.$serviceId_.cobros"

export const loader = async ({ params }: Route.LoaderArgs) => {
  const serviceId = params.serviceId
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Response(null, { status: 404 })
  return { service }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")
  if (intent === "update_service") {
    const data = JSON.parse(formData.get("data") as string)
    const { id, config: newConfig, ...rest } = data

    if (newConfig) {
      const currentService = await db.service.findUnique({ where: { id } })
      const currentConfig = currentService?.config || {
        confirmation: false,
        reminder: false,
        survey: false,
        whatsapp_confirmation: null,
        whatsapp_reminder: null,
      }

      await db.service.update({
        where: { id },
        data: {
          ...rest,
          config: {
            set: {
              ...currentConfig,
              ...newConfig,
            },
          },
        },
      })
    } else {
      await db.service.update({
        where: { id },
        data: rest,
      })
    }
    return { ok: true }
  }
  return null
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const handledRef = useRef<unknown>(null)

  const [payment, setPayment] = useState<boolean>(!!service.payment)
  const [reminder, setReminder] = useState<boolean>(!!service.config?.reminder)
  const [whatsappReminder, setWhatsappReminder] = useState<boolean>(
    !!service.config?.whatsapp_reminder,
  )
  const [survey, setSurvey] = useState<boolean>(!!service.config?.survey)

  const isSaving = fetcher.state !== "idle"

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      fetcher.data !== handledRef.current &&
      (fetcher.data as { ok?: boolean }).ok
    ) {
      handledRef.current = fetcher.data
      navigate(`/dash/servicios/${service.id}?saved=cobros`)
    }
  }, [fetcher.state, fetcher.data, navigate, service.id])

  const handleSave = () => {
    fetcher.submit(
      {
        intent: "update_service",
        data: JSON.stringify({
          id: service.id,
          payment,
          config: {
            ...service.config,
            reminder,
            whatsapp_reminder: whatsappReminder,
            survey,
          },
        }),
      },
      { method: "post" },
    )
  }

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
            <BreadcrumbLink
              href={`/dash/servicios/${service.id}/cobros`}
            >
              Cobros y recordatorios
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-4 md:p-8 mt-6">
        <h2 className="font-satoBold mb-4 md:mb-8 text-xl">
          Actualiza tus cobros y recordatorios
        </h2>
        <div className="flex flex-col gap-4 md:gap-6">
          <Switch
            defaultChecked={payment}
            onChange={setPayment}
            name="payment"
            label="Pago al agendar"
            subtitle="Activar los pagos para este servicio"
          />
          <Switch
            defaultChecked={reminder}
            onChange={setReminder}
            name="reminder"
            label="Mail de recordatorio"
            subtitle="Lo enviaremos 12 hrs antes de la sesión"
          />
          <Switch
            defaultChecked={whatsappReminder}
            onChange={setWhatsappReminder}
            name="whatsapp_reminder"
            label="Whatsapp de recordatorio"
            subtitle="Lo enviaremos 4 hrs antes de la sesión"
            icon={<FaWhatsapp />}
          />
          <Switch
            defaultChecked={survey}
            onChange={setSurvey}
            name="survey"
            label="Mail de evaluación"
            subtitle="Lo enviaremos 10 min después de terminar la sesión"
          />
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
            as="button"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Guardar
          </PrimaryButton>
        </div>
      </div>
    </section>
  )
}
