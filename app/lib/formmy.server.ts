/**
 * Formmy provisioning — auto-creates a Formmy chatbot agent for an Org and
 * wires the 3 public Denik tools (list_services, get_availability,
 * create_booking) as CustomTools that hit `/api/mcp/public` with the org's
 * `publicApiKey` in the X-Denik-Api-Key header.
 *
 * Triggered from:
 *   1. dash.chatbot.server.ts `activate` intent (manual button)
 *   2. landing-generator.ts when `landingChatbotEnabled` flips false → true
 *
 * Idempotent: if `org.chatbotAgentId` is already set, returns it without
 * calling Formmy.
 */
import { Formmy } from "@formmy.app/chat"
import type { Org } from "@prisma/client"
import { db } from "~/utils/db.server"

/**
 * SDK default base URL is `formmy.app`, but from Fly's runtime that apex host
 * fails the TLS handshake (ECONNRESET) — only `www.formmy.app` /
 * `formmy-v2.fly.dev` resolve cleanly. Default to the www host and let env
 * override.
 */
export function getFormmyClient() {
  const key = process.env.FORMMY_SECRET_KEY
  if (!key) throw new Error("FORMMY_SECRET_KEY not set")
  const baseUrl = process.env.FORMMY_BASE_URL || "https://www.formmy.app"
  return new Formmy({ secretKey: key, baseUrl })
}

export type ProvisionResult = {
  agentId: string
  alreadyProvisioned: boolean
}

export async function provisionFormmyAgent(org: Org): Promise<ProvisionResult> {
  if (org.chatbotAgentId) {
    return { agentId: org.chatbotAgentId, alreadyProvisioned: true }
  }

  const apiKey = org.publicApiKey
  if (!apiKey) {
    throw new Error(
      `Org ${org.id} missing publicApiKey — run backfill-public-api-keys.ts`,
    )
  }

  const baseUrl = process.env.APP_URL || "https://www.denik.me"
  const formmy = getFormmyClient()

  const { agent } = await formmy.agents.create({
    name: `Asistente — ${org.name}`,
    welcomeMessage: `¡Hola! Soy el asistente de ${org.name}. ¿En qué puedo ayudarte?`,
    instructions: [
      `Eres el asistente del negocio ${org.name}.`,
      "Puedes listar servicios, ver horarios disponibles y agendar citas.",
      "Para servicios gratuitos puedes crear la reserva directamente con el email del cliente — el cliente recibirá un email para confirmar antes de que quede agendada.",
      "Para servicios de pago NO crees la reserva — usa el `bookingUrl` que regresa list_services o el `checkoutUrl` que devuelve create_booking, y dáselo al cliente para que complete el pago en la página.",
      "Si no encuentras un servicio o slot que pida el cliente, sé honesto y ofrécele opciones cercanas.",
    ].join(" "),
    tools: [
      {
        name: "list_services",
        displayName: "Listar servicios",
        description:
          "Lista los servicios activos del negocio: nombre, slug, descripción, precio, duración y bookingUrl (link público para reservar). Úsalo al inicio para entender qué ofrece el negocio.",
        method: "GET",
        url: `${baseUrl}/api/mcp/public?intent=list_services`,
        authType: "api_key",
        authKey: "X-Denik-Api-Key",
        authValue: apiKey,
      },
      {
        name: "get_availability",
        displayName: "Ver horarios disponibles",
        description:
          "Devuelve los slots libres (HH:MM, en zona horaria del negocio) para un servicio en una fecha YYYY-MM-DD. Llámalo cuando el cliente quiera saber a qué hora puede agendar.",
        method: "GET",
        url: `${baseUrl}/api/mcp/public?intent=get_availability`,
        authType: "api_key",
        authKey: "X-Denik-Api-Key",
        authValue: apiKey,
        parametersSchema: {
          type: "object",
          required: ["serviceSlug", "date"],
          properties: {
            serviceSlug: { type: "string" },
            date: { type: "string", description: "YYYY-MM-DD" },
          },
        },
      },
      {
        name: "create_booking",
        displayName: "Agendar cita",
        description:
          "Crea una reserva. Servicio gratuito → crea la cita en estado pending y envía email de confirmación al cliente. Servicio de pago → NO agenda, devuelve checkoutUrl para que el cliente pague en la página. Slot ocupado → error 'slot already taken'.",
        method: "POST",
        url: `${baseUrl}/api/mcp/public`,
        authType: "api_key",
        authKey: "X-Denik-Api-Key",
        authValue: apiKey,
        parametersSchema: {
          type: "object",
          required: ["intent", "serviceSlug", "start", "customer"],
          properties: {
            intent: { type: "string", const: "create_booking" },
            serviceSlug: { type: "string" },
            start: {
              type: "string",
              description: "ISO 8601 con timezone (ej: 2026-05-20T14:30:00-06:00)",
            },
            customer: {
              type: "object",
              required: ["name", "email"],
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
    ],
  })

  await db.org.update({
    where: { id: org.id },
    data: {
      chatbotAgentId: agent.id,
      chatbotConfig: {
        name: "Asistente",
        avatarUrl: "",
        primaryColor: "#5158F6",
        greeting:
          agent.welcomeMessage ||
          `¡Hola! Soy el asistente de ${org.name}. ¿En qué puedo ayudarte?`,
        farewell: "¡Gracias por tu visita! Hasta pronto.",
        widgetStyle: "bubble",
      },
    },
  })

  return { agentId: agent.id, alreadyProvisioned: false }
}
