import { Formmy } from "@formmy.app/chat"
import { useEffect, useState } from "react"
import { data as json, useFetcher } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { ChatbotConfig } from "~/components/chatbot/ChatbotConfig"
import { ConversationHistory } from "~/components/chatbot/ConversationHistory"
import { db } from "~/utils/db.server"
import { getPutFileUrl } from "~/utils/lib/tigris.server"
import type { Route } from "./+types/dash.chatbot"

function getFormmyClient() {
  const key = process.env.FORMMY_SECRET_KEY
  if (!key) throw new Error("FORMMY_SECRET_KEY not set")
  return new Formmy({ secretKey: key })
}

export const loader = async ({ request }: Route.LoaderArgs) => {
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

  // If agent exists, fetch conversations server-side
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

export const action = async ({ request }: Route.ActionArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent") as string

  const formmy = getFormmyClient()

  switch (intent) {
    case "activate": {
      // Create agent in Formmy
      const { agent } = await formmy.agents.create({
        name: `Ghosty - ${org.name}`,
        welcomeMessage: `¡Hola! Soy el asistente de ${org.name}. ¿En qué puedo ayudarte?`,
        instructions: `Eres Ghosty, el asistente inteligente de agendamiento de ${org.name}. Ayudas a los clientes a agendar citas, resolver dudas sobre servicios y horarios.`,
      })

      // Save agentId to org
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

      // Also update agent name/welcome in Formmy
      if (org.chatbotAgentId) {
        try {
          await formmy.agents.update(org.chatbotAgentId, {
            name: config.name,
            welcomeMessage: config.greeting,
          })
        } catch (e) {
          console.error("Error updating Formmy agent:", e)
          return json({ success: true, warning: "Config guardada, pero no se pudo sincronizar con Formmy" })
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
      if (org.chatbotAgentId) {
        const result = await formmy.conversations.get(
          org.chatbotAgentId,
          conversationId,
        )
        return json({ conversation: result.conversation })
      }
      return json({ conversation: null })
    }

    default:
      return json({ error: "Unknown intent" }, { status: 400 })
  }
}

type Tab = "conversations" | "config"

export default function ChatbotPage({ loaderData }: Route.ComponentProps) {
  const {
    agentId,
    chatbotConfig,
    conversations: initialConversations,
    hasMore: initialHasMore,
    avatarPutUrl,
    avatarKey,
  } = loaderData
  const [activeTab, setActiveTab] = useState<Tab>("conversations")
  const fetcher = useFetcher()
  const saveFetcher = useFetcher()
  const messageFetcher = useFetcher()

  const isSaving = saveFetcher.state !== "idle"
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Show toast when save completes
  useEffect(() => {
    if (saveFetcher.state !== "idle" || !saveFetcher.data) return
    const data = saveFetcher.data as { success?: boolean; warning?: string }
    if (data.success) {
      setSaveMessage(data.warning || "Configuracion guardada")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [saveFetcher.state, saveFetcher.data])

  const [conversations, setConversations] = useState(initialConversations)
  useEffect(() => {
    setConversations(initialConversations)
  }, [initialConversations])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isActivating =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "activate"

  // If no agentId, show activation screen
  if (!agentId) {
    return (
      <section className="flex flex-col items-center justify-center h-[calc(100svh-120px)] text-center">
        <img
          src="/images/illustrations/ghosty-puzzle.svg"
          alt="Ghosty - asistente inteligente"
          className="mb-8 w-[304px] h-[206px]"
        />
        <h1 className="text-2xl font-satoBold text-brand_dark mb-2">
          Conoce a Ghosty: tu asistente inteligente de agendamiento
        </h1>
        <p className="text-base text-brand_gray max-w-2xl">
          Deník trabaja con FormmyApp para potenciar tu agenda digital con
          Inteligencia Artificial.
        </p>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="activate" />
          <button
            type="submit"
            disabled={isActivating}
            className="mt-8 bg-brand_blue text-white font-satoMedium text-base px-6 h-12 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isActivating ? "Activando..." : "Activar Ghosty"}
          </button>
        </fetcher.Form>
      </section>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "conversations", label: "Conversaciones" },
    { id: "config", label: "Configuración" },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-satoBold text-brand_dark">Chatbot</h1>
        <p className="text-sm text-brand_gray mt-1">
          Gestiona las conversaciones y configura tu asistente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-satoMedium transition-all ${
              activeTab === tab.id
                ? "bg-white text-brand_dark shadow-sm"
                : "text-gray-500 hover:text-brand_dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "conversations" && (
        <ConversationHistory
          conversations={
            searchQuery
              ? conversations.filter((c: any) =>
                  (c.name || c.sessionId || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
              : conversations
          }
          isLoading={false}
          hasMore={initialHasMore}
          onLoadMore={() => {}}
          selectedConversation={selectedConversation}
          onSelectConversation={async (id) => {
            if (!id) {
              setSelectedConversation(null)
              setMessages([])
              return
            }
            setIsLoadingMessages(true)
            try {
              const formData = new FormData()
              formData.set("intent", "get_messages")
              formData.set("conversationId", id)
              const response = await fetch("/dash/chatbot", {
                method: "POST",
                body: formData,
              })
              const data = await response.json()
              if (data.conversation) {
                setSelectedConversation(data.conversation)
                setMessages(data.conversation.messages || [])
              }
            } catch (e) {
              console.error("Error fetching messages:", e)
            } finally {
              setIsLoadingMessages(false)
            }
          }}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onDelete={async (id) => {
            const formData = new FormData()
            formData.set("intent", "delete_conversation")
            formData.set("conversationId", id)
            await fetch("/dash/chatbot", { method: "POST", body: formData })
            setConversations((prev: any[]) => prev.filter((c) => c.id !== id))
            if (selectedConversation?.id === id) {
              setSelectedConversation(null)
              setMessages([])
            }
          }}
          onToggleFavorite={async (id) => {
            const formData = new FormData()
            formData.set("intent", "toggle_favorite")
            formData.set("conversationId", id)
            const response = await fetch("/dash/chatbot", {
              method: "POST",
              body: formData,
            })
            const data = await response.json()
            setConversations((prev: any[]) =>
              prev.map((c) =>
                c.id === id ? { ...c, isFavorite: data.isFavorite } : c,
              ),
            )
            if (selectedConversation?.id === id) {
              setSelectedConversation((prev: any) =>
                prev ? { ...prev, isFavorite: data.isFavorite } : null,
              )
            }
          }}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
      )}

      {activeTab === "config" && (
        <ChatbotConfig
          initialConfig={chatbotConfig || undefined}
          onSave={(config) => {
            saveFetcher.submit(
              { intent: "save_config", config: JSON.stringify(config) },
              { method: "post" },
            )
          }}
          isSaving={isSaving}
          avatarPutUrl={avatarPutUrl || undefined}
          avatarKey={avatarKey}
        />
      )}

      {/* Toast */}
      {saveMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {saveMessage}
        </div>
      )}
    </div>
  )
}
