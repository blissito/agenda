import { useState } from "react"
import { FaBolt, FaClipboardList, FaEnvelope } from "react-icons/fa6"
import { useFetcher } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Spinner } from "~/components/common/Spinner"
import { Switch } from "~/components/common/Switch"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { BasicInput } from "~/components/forms/BasicInput"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { cn } from "~/utils/cn"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.servicios_.$serviceId_.acciones"

type ActionType = "webhook" | "quiz" | "email"

type ActionConfig = {
  webhook: {
    url: string
    includeCustomer: boolean
    includeEvent: boolean
    includeService: boolean
  }
  quiz: {
    questions: string[]
  }
  email: {
    subject: string
    body: string
  }
}

type ActionState = {
  type: ActionType
  enabled: boolean
  config: ActionConfig[ActionType]
  id?: string
}

const ACTION_TYPES: {
  type: ActionType
  name: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    type: "webhook",
    name: "Webhook",
    description: "Envía datos a una URL externa cuando se crea una cita",
    icon: <FaBolt className="w-4 h-4" />,
  },
  {
    type: "quiz",
    name: "Encuesta",
    description: "Envía una encuesta al cliente después de la cita",
    icon: <FaClipboardList className="w-4 h-4" />,
  },
  {
    type: "email",
    name: "Email personalizado",
    description: "Envía un correo personalizado al cliente",
    icon: <FaEnvelope className="w-4 h-4" />,
  },
]

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response(null, { status: 401 })
  const serviceId = params.serviceId

  const service = await db.service.findUnique({
    where: { id: serviceId, orgId: org.id },
  })
  if (!service) throw new Response(null, { status: 404 })

  const actions = await db.serviceAction.findMany({
    where: { serviceId },
  })

  return { service, actions, org }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "update_action") {
    const data = JSON.parse(formData.get("data") as string)
    const { type, enabled, config, id } = data

    if (id) {
      // Update existing action
      await db.serviceAction.update({
        where: { id },
        data: { enabled, config },
      })
    } else {
      // Create new action
      await db.serviceAction.create({
        data: {
          serviceId: params.serviceId!,
          type,
          enabled,
          config,
        },
      })
    }
  }

  if (intent === "delete_action") {
    const id = formData.get("id") as string
    await db.serviceAction.delete({ where: { id } })
  }

  return null
}

function ActionCard({
  actionType,
  savedAction,
  serviceId,
}: {
  actionType: (typeof ACTION_TYPES)[number]
  savedAction?: { id: string; enabled: boolean; config: unknown }
  serviceId: string
}) {
  const fetcher = useFetcher()
  const [enabled, setEnabled] = useState(savedAction?.enabled ?? false)
  const [config, setConfig] = useState<ActionConfig["webhook"]>(
    (savedAction?.config as ActionConfig["webhook"]) ?? {
      url: "",
      includeCustomer: true,
      includeEvent: true,
      includeService: false,
    },
  )

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)

    // If disabling and has saved action, update it
    if (savedAction?.id) {
      fetcher.submit(
        {
          intent: "update_action",
          data: JSON.stringify({
            id: savedAction.id,
            type: actionType.type,
            enabled: checked,
            config,
          }),
        },
        { method: "post" },
      )
    }
  }

  const handleSave = () => {
    fetcher.submit(
      {
        intent: "update_action",
        data: JSON.stringify({
          id: savedAction?.id,
          type: actionType.type,
          enabled,
          config,
        }),
      },
      { method: "post" },
    )
  }

  const isWebhook = actionType.type === "webhook"
  const isExpanded = enabled && isWebhook

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border transition-all",
        enabled ? "border-brand_blue/30" : "border-brand_stroke/60",
        !enabled && "hover:border-brand_stroke",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl",
              enabled ? "bg-brand_blue/10" : "bg-neutral-100",
            )}
          >
            <span className={enabled ? "text-brand_blue" : "text-brand_gray"}>
              {actionType.icon}
            </span>
          </div>
          <div>
            <p className="font-satoMedium text-brand_dark">{actionType.name}</p>
            <p className="text-sm text-brand_gray">{actionType.description}</p>
          </div>
        </div>
        <Switch
          name={actionType.type}
          defaultChecked={enabled}
          onChange={handleToggle}
        />
      </div>

      {isExpanded && (
        <div className="mt-5 pl-12 space-y-4">
          <BasicInput
            name="webhookUrl"
            label="URL del webhook"
            placeholder="https://api.tucrm.com/webhooks/booking"
            defaultValue={config.url}
            onChange={(e) => setConfig({ ...config, url: e.target.value })}
          />

          <div>
            <p className="text-sm font-satoMedium text-brand_gray mb-3">
              Datos a incluir
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-brand_gray cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeCustomer}
                  onChange={(e) =>
                    setConfig({ ...config, includeCustomer: e.target.checked })
                  }
                  className="rounded border-gray-300 text-brand_blue focus:ring-brand_blue"
                />
                Cliente
              </label>
              <label className="flex items-center gap-2 text-sm text-brand_gray cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeEvent}
                  onChange={(e) =>
                    setConfig({ ...config, includeEvent: e.target.checked })
                  }
                  className="rounded border-gray-300 text-brand_blue focus:ring-brand_blue"
                />
                Cita
              </label>
              <label className="flex items-center gap-2 text-sm text-brand_gray cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeService}
                  onChange={(e) =>
                    setConfig({ ...config, includeService: e.target.checked })
                  }
                  className="rounded border-gray-300 text-brand_blue focus:ring-brand_blue"
                />
                Servicio
              </label>
            </div>
          </div>

          <div className="pt-2">
            <PrimaryButton
              onClick={handleSave}
              isDisabled={!config.url || fetcher.state !== "idle"}
              className="!min-w-0 !px-6"
            >
              {fetcher.state !== "idle" ? <Spinner /> : "Guardar"}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Coming soon for other action types */}
      {enabled && !isWebhook && (
        <div className="mt-4 pl-12">
          <p className="text-sm text-brand_iron italic">
            Esta funcionalidad estará disponible pronto
          </p>
        </div>
      )}
    </div>
  )
}

export default function ActionsPage({ loaderData }: Route.ComponentProps) {
  const { service, actions } = loaderData

  const getActionByType = (type: ActionType) =>
    actions.find((a) => a.type === type)

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
            <BreadcrumbLink href={`/dash/servicios/${service.id}/acciones`}>
              Acciones
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2 className="font-satoBold text-xl text-brand_dark">Acciones</h2>
        <p className="text-brand_gray mt-1 mb-6">
          Automatiza tareas después de cada agendamiento
        </p>

        <div className="space-y-4">
          {ACTION_TYPES.map((actionType) => (
            <ActionCard
              key={actionType.type}
              actionType={actionType}
              savedAction={getActionByType(actionType.type)}
              serviceId={service.id}
            />
          ))}
        </div>

        <div className="flex mt-10 justify-end">
          <SecondaryButton as="Link" to={`/dash/servicios/${service.id}`}>
            Volver al servicio
          </SecondaryButton>
        </div>
      </div>
    </section>
  )
}
