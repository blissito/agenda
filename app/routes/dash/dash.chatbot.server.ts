import { Formmy } from "@formmy.app/chat"
import { data as json } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { db } from "~/utils/db.server"
import { getPutFileUrl } from "~/utils/lib/tigris.server"

function getFormmyClient() {
  const key = process.env.FORMMY_SECRET_KEY
  if (!key) throw new Error("FORMMY_SECRET_KEY not set")
  return new Formmy({ secretKey: key })
}

export const loader = async ({ request }: { request: Request }) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const agentId = org.chatbotAgentId || null
  const chatbotConfig =
    (org.chatbotConfig as {
      name: string
      avatarUrl: string
      primaryColor: string
      greeting: string
      farewell: string
      widgetStyle: "bubble" | "sidebar" | "bar"
    }) || null

  let conversations: any[] = []
  let hasMore = false
  let avatarPutUrl: string | null = null
  const avatarKey = `${org.id}/${Date.now()}`
  if (agentId) {
    try {
      const formmy = getFormmyClient()
      const [result, putUrl] = await Promise.all([
        formmy.conversations.list(agentId, { limit: 20 }),
        getPutFileUrl(`chatbot-avatars/${avatarKey}`),
      ])
      conversations = result.conversations
      hasMore = result.pagination.hasMore
      avatarPutUrl = putUrl
    } catch (e) {
      console.error("Error fetching conversations:", e)
    }
  }

  return {
    user,
    org,
    agentId,
    chatbotConfig,
    conversations,
    hasMore,
    avatarPutUrl,
    avatarKey,
  }
}

export const action = async ({ request }: { request: Request }) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  const formmy = getFormmyClient()

  switch (intent) {
    case "activate": {
      const { agent } = await formmy.agents.create({
        name: `Ghosty - ${org.name}`,
        welcomeMessage: `¡Hola! Soy el asistente de ${org.name}. ¿En qué puedo ayudarte?`,
        instructions: `Eres Ghosty, el asistente inteligente de agendamiento de ${org.name}. Ayudas a los clientes a agendar citas, resolver dudas sobre servicios y horarios.`,
      })

      await db.org.update({
        where: { id: org.id },
        data: {
          chatbotAgentId: agent.id,
          chatbotConfig: {
            name: `Ghosty`,
            avatarUrl: "",
            primaryColor: "#5158F6",
            greeting: agent.welcomeMessage || "¡Hola! ¿En qué puedo ayudarte?",
            farewell: "¡Gracias por tu visita! Hasta pronto.",
            widgetStyle: "bubble",
          },
        },
      })

      return json({ success: true })
    }

    case "save_config": {
      const config = JSON.parse(formData.get("config") as string)
      await db.org.update({
        where: { id: org.id },
        data: { chatbotConfig: config },
      })

      if (org.chatbotAgentId) {
        try {
          await formmy.agents.update(org.chatbotAgentId, {
            name: config.name,
            welcomeMessage: config.greeting,
          })
        } catch (e) {
          console.error("Error updating Formmy agent:", e)
          return json({
            success: true,
            warning: "Config guardada, pero no se pudo sincronizar con Formmy",
          })
        }
      }

      return json({ success: true })
    }

    case "delete_conversation": {
      const conversationId = formData.get("conversationId") as string
      if (org.chatbotAgentId) {
        await formmy.conversations.delete(org.chatbotAgentId, conversationId)
      }
      return json({ success: true })
    }

    case "toggle_favorite": {
      const conversationId = formData.get("conversationId") as string
      if (org.chatbotAgentId) {
        const result = await formmy.conversations.toggleFavorite(
          org.chatbotAgentId,
          conversationId,
        )
        return json({ success: true, isFavorite: result.isFavorite })
      }
      return json({ success: false })
    }

    case "get_messages": {
      const conversationId = formData.get("conversationId") as string
      if (!org.chatbotAgentId) return json({ conversation: null })
      try {
        const result: any = await formmy.conversations.get(
          org.chatbotAgentId,
          conversationId,
        )
        // SDK puede devolver { conversation } o directo la conversación
        const conversation = result?.conversation ?? result ?? null
        if (!conversation) {
          console.warn("[chatbot get_messages] empty result", {
            conversationId,
          })
        }
        return json({ conversation })
      } catch (e) {
        console.error("[chatbot get_messages] failed:", e)
        return json({ conversation: null, error: String(e) }, { status: 500 })
      }
    }

    default:
      return json({ error: "Unknown intent" }, { status: 400 })
  }
}
